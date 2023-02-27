var util = require('../../utils/util.js');
var app = getApp();
var status = require('../../utils/index.js');
var location = require("../../utils/Location");
var canpay = true;

function count_down(that, total_micro_second) {
  var second = Math.floor(total_micro_second / 1000);
  var days = second / 3600 / 24;
  var daysRound = Math.floor(days);
  var hours = second / 3600 - (24 * daysRound);
  var hoursRound = Math.floor(hours);
  var minutes = second / 60 - (24 * 60 * daysRound) - (60 * hoursRound);
  var minutesRound = Math.floor(minutes);
  var seconds = second - (24 * 3600 * daysRound) - (3600 * hoursRound) - (60 * minutesRound);

  that.setData({
    endtime: {
      days: daysRound,
      hours: fill_zero_prefix(hoursRound),
      minutes: fill_zero_prefix(minutesRound),
      seconds: fill_zero_prefix(seconds),
      show_detail: 1
    }
  });

  if (total_micro_second <= 0) {
    that.setData({
      changeState: 1,
      endtime: {
        days: "00",
        hours: "00",
        minutes: "00",
        seconds: "00",
      }
    });
    return;
  }

  setTimeout(function() {
    total_micro_second -= 1000;
    count_down(that, total_micro_second);
  }, 1000)

}
// 位数不足补零
function fill_zero_prefix(num) {
  return num < 10 ? "0" + num : num
}

Page({
  mixins: [require('../../mixin/compoentCartMixin.js'), require('../../mixin/globalMixin.js')],
  data: {
    endtime: {
      days: "00",
      hours: "00",
      minutes: "00",
      seconds: "00",
    },
    cancelOrderVisible: false,
    orderSkuResps: [],
    tablebar: 4,
    navState: 0,
    theme_type: '',
    loadover: false,
    pingtai_deal: 0,
    is_show: false,
    order: {},
    common_header_backgroundimage: '',
    isShowModal: false,
    userInfo: {},
    groupInfo: {
      group_name: '社区',
      owner_name: '团长',
      delivery_ziti_name: '社区自提',
      delivery_tuanzshipping_name: '团长配送',
      delivery_express_name: '快递配送',
      localtown_modifypickingname: '包装费'
    },
    is_show_guess_like: 1,
    showRefundModal: false,
    order_hexiao_type: 0, //0订单，1按次，2混合
    salesroomIdx: 0,
    order_goods_list: '',
    hx_receive_info: '',
    salesroom_list: '',
    goodsHexiaoIdx: 0,
    share_title: '',
    presale_info: '',
    presalePickup: {
      pickup: '自提', localtown_delivery:'配送', express:'发货', hexiao: '核销', tuanz_send: '配送'
    },
    showPresalePayModal: false
  },
  is_show_tip: '',
  timeOut: function() {
    console.log('计时完成')
  },
  options: '',
  canCancel: true,
  isFirst: 1,
    handlerGobackClick(delta) {
    const pages = getCurrentPages();
    if (pages.length >= 2) {
      wx.navigateBack({
        delta: delta
      });
    } else {
      wx.switchTab({
        url: '/eaterplanet_ecommerce/pages/index/index'
      });
    }
  },
  handlerGohomeClick(url) {
    wx.switchTab({
      url: '/eaterplanet_ecommerce/pages/index/index'
    });
  },
  onLoad: function(options) {
    var that = this;
    that.options = options;
    
    var userInfo = wx.getStorageSync('userInfo');
    userInfo && (userInfo.shareNickName = userInfo.nickName.length > 3 ? userInfo.nickName.substr(0, 3) + "..." : userInfo.nickName);
    status.setGroupInfo().then((groupInfo) => {
      that.setData({
        groupInfo
      })
    });
    util.check_login() ? this.setData({
      needAuth: false
    }) : this.setData({
      needAuth: true
    });
    let delivery = options.delivery || '';
    that.setData({
      userInfo,
      delivery
    });

    // wx.showLoading();
    var is_show_tip = options && options.is_show || 0;
    let isfail = options && options.isfail || '';
    this.is_show_tip = is_show_tip;

    if (isfail != undefined && isfail == 1) {
      wx.showToast({
        title: '支付失败',
        icon: 'none'
      })
    }

    let latitude = wx.getStorageSync('latitude2') || '';
    let longitude = wx.getStorageSync('longitude2') || '';
    if(delivery=='hexiao'&&!latitude) {
      this.getMyLocal().then(res=>{
        this.getData(options.id, res.latitude, res.longitude, is_show_tip, delivery);
      }).catch(()=>{
        this.getData(options.id, latitude, longitude, is_show_tip, delivery);
      });
    } else {
      console.log('step2')
      this.getData(options.id, latitude, longitude, is_show_tip, delivery);
    }
  },

  getData: function(id, latitude="", longitude="", is_show_tip='', delivery=''){
    if (is_show_tip != undefined && is_show_tip == 1) {
      //todo 弹出分享 
    } else {
      wx.showLoading();
    }
    var that = this;
    var token = wx.getStorageSync('token');

    app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'order.order_info',
        token,
        id,
        latitude,
        longitude
      },
      dataType: 'json',
      method: 'POST',
      success: function(res) {
        setTimeout(() => {
          wx.hideLoading();
        }, 1000);
        if(res.data.code==0){
          let order_info = res.data.data.order_info;
          if (is_show_tip != undefined && is_show_tip == 1 && order_info.type == 'integral') {
            wx.showToast({
              title: '兑换成功'
            })
          } else if (is_show_tip != undefined && is_show_tip == 1) {
            if (res.data.order_pay_after_share == 1) {
              let share_img = res.data.data.share_img;
              let share_title = res.data.data.share_title;
              that.setData({
                share_title,
                share_img,
                isShowModal: true
              })
            } else {
              wx.showToast({
                title: '支付成功'
              })
            }
          }

          if (order_info.order_status_id == 3) {
            var seconds = (order_info.over_buy_time - order_info.cur_time) * 1000;
            if (seconds > 0) {
              count_down(that, seconds);
            } else {
              order_info.open_auto_delete == 1 && that.setData({
                changeState: 1
              })
            }
          }
          let { 
            pingtai_deal,
            order_refund,
            order_can_del_cancle,
            is_hidden_orderlist_phone,
            is_show_guess_like,
            user_service_switch,
            common_header_backgroundimage,
            order_can_shen_refund,
            order_note_open,
            order_note_name,
            open_comment_gift,
            presale_info,
            virtualcard_info
          } = res.data;
          let order = res.data.data || {order_info: {}};
          order.order_info.order_note_open = order_note_open || '';
          order.order_info.order_note_name = order_note_name || '';
          let markers = [];
          // if(delivery=='hexiao'&&order.order_info.salesroom_list) {
          //   let marker = that.createMarker(order.order_info.salesroom_list[0].lat, order.order_info.salesroom_list[0].lon);
          //   markers.push(marker)
          // }

          let order_goods_list = order.order_goods_list || '';
          let hx_receive_info = order.order_info.hx_receive_info || '';
          let salesroom_list =  order.salesroom_list || '';

          // 预售订单
          presale_info = Object.keys(presale_info).length>0 ? presale_info : '';
          if(presale_info) {
            if(presale_info.presale_type==0) {
              let goodsTot = 0;
              order_goods_list.forEach(goodsItem=>{ goodsTot += goodsItem.price*goodsItem.quantity; });
              let { presale_deduction_money, presale_ding_money } = presale_info;
              presale_deduction_money = presale_deduction_money>0?presale_deduction_money:presale_ding_money;
              let payTot = order.order_info.total*1-presale_deduction_money*1;
              presale_info.payTot = payTot>0?payTot.toFixed(2):0;
              let weikuan = goodsTot - presale_deduction_money*1;
              presale_info.weikuan = weikuan>0?weikuan.toFixed(2):0;
              presale_info.presale_deduction_money = presale_deduction_money;
            }
          }

          // 礼品卡
          virtualcard_info = Object.keys(virtualcard_info).length>0 ? virtualcard_info : '';

          that.setData({
            order,
            order_goods_list,
            hx_receive_info,
            salesroom_list,
            pingtai_deal: pingtai_deal,
            order_refund: order_refund,
            order_can_del_cancle: order_can_del_cancle,
            loadover: true,
            is_show: 1,
            hide_lding: true,
            is_hidden_orderlist_phone: is_hidden_orderlist_phone || 0,
            is_show_guess_like: is_show_guess_like || 0,
            user_service_switch: user_service_switch || 1,
            common_header_backgroundimage,
            order_can_shen_refund,
            open_comment_gift,
            latitude,
            longitude,
            markers,
            presale_info,
            virtualcard_info
          })
          that.caclGoodsTot(res.data.data);
          that.hide_lding();
        } else if(res.data.code==2){
          that.setData({ needAuth: true })
        }
      }
    })
  },

  onShow: function(){
    console.log(this.isFirst, 'onShow', this.options.id);
    if (this.isFirst>1) this.reload_data();
    this.isFirst++;
  },

  onHide: function(){
    console.log('order Hide');
  },

  getMyLocal: function() {
    let that = this;
    return new Promise((resovle, reject)=>{
      location.getGps().then(ret=>{
        console.log('step1')
        wx.getLocation({
          type: 'wgs84',
          success: (res) => {
            resovle(res)
            that.setData({
              scale: 12,
              longitude: res.longitude,
              latitude: res.latitude
            })
          },
          fail: ()=>{
            reject();
          }
        });
      }).catch(()=>{
        console.log('step3')
        reject();
        app.util.message('地图功能开启失败,部分功能受影响', '', 'error');
      })
    })
  },

  caclGoodsTot: function(order){
    if(order && order.order_goods_list) {
      let order_goods_list = order.order_goods_list;
      let goodsTot = 0;
      Object.keys(order_goods_list).forEach(k=>{
        if(order_goods_list[k].is_vipcard_buy==1 || order_goods_list[k].is_level_buy) {
          goodsTot += order_goods_list[k].total;
        } else {
          goodsTot += order_goods_list[k].real_total;
        }
      })
      this.setData({ goodsTot: goodsTot.toFixed(2) })
    }
  },

  /**
   * 授权成功回调
   */
  authSuccess: function() {
    this.onLoad(this.options);
  },

  reload_data: function() {
    console.log('reload_data--', this.options.id);
    var that = this;
    var token = wx.getStorageSync('token');
    let id = this.options.id || '';
    let latitude = wx.getStorageSync('latitude2');
    let longitude = wx.getStorageSync('longitude2');
    // this.getData(id, latitude, longitude, '', this.data.delivery)

    id && app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'order.order_info',
        token,
        id,
        latitude,
        longitude
      },
      dataType: 'json',
      method: 'POST',
      success: function(res) {
        let order_info = res.data.data.order_info;
        if (order_info.order_status_id == 3) {
          var seconds = (order_info.over_buy_time - order_info.cur_time) * 1000;
          if (seconds > 0) {
            count_down(that, seconds);
          } else {
            that.setData({
              changeState: 1
            })
          }
        }
        that.setData({
          order: res.data.data,
          pingtai_deal: res.data.pingtai_deal,
          order_refund: res.data.order_refund,
          loadover: true,
          is_show: 1,
          hide_lding: true
        })
      }
    })
  },
  
  receivOrder: function(event) {
    let id = event.currentTarget.dataset.type || '';
    var token = wx.getStorageSync('token');
    var that = this;
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确认收货',
      confirmColor: '#4facfe',
      success(res) {
        if (res.confirm) {
          app.util.request({
            'url': 'entry/wxapp/index',
            'data': {
              controller: 'order.receive_order',
              token: token,
              order_id: id
            },
            dataType: 'json',
            success: function(res) {
              if (res.data.code == 0) {
                wx.showToast({
                  title: '收货成功',
                  icon: 'success',
                  duration: 1000
                })
                that.reload_data();
              } else {
                app.util.message(res.data.msg||'收货失败', '', 'error');
              }
            }
          })
        }
      }
    })
  },

  callDialog: function(e) {
    var order_id = e.currentTarget.dataset.type || '';
    var token = wx.getStorageSync('token');
    wx.showModal({
      title: '取消支付',
      content: '好不容易挑出来，确定要取消吗？',
      confirmColor: '#F75451',
      success(res) {
        if (res.confirm) {
          app.util.request({
            'url': 'entry/wxapp/index',
            'data': {
              controller: 'order.cancel_order',
              token: token,
              order_id: order_id
            },
            dataType: 'json',
            success: function(res) {
              wx.showToast({
                title: '取消成功',
                icon: 'success',
                complete: function() {
                  wx.redirectTo({
                    url: '/eaterplanet_ecommerce/pages/order/index'
                  })
                }
              })
            }
          })
        }
      }
    })
  },

  applyForService: function(e) {
    var order_id = e.currentTarget.dataset.type || '';
    var order_goods_id = e.currentTarget.dataset.order_goods_id;

    order_id && wx.redirectTo({
      url: '/eaterplanet_ecommerce/pages/order/refund?id=' + order_id + '&order_goods_id=' + order_goods_id + '&delivery=' + this.data.delivery
    })

  },

  /**
   * 支付防抖
   */
  // preOrderPay: util.debounce(function(event) {
  //   canpay && this.payNow(event);
  // }),
  preOrderPay: function(event) {
    canpay && this.payNow(event);
  },

  payNow: function(e) {
    canpay = false;
    let that = this;
    var order_id = e.currentTarget.dataset.type || '';
    var token = wx.getStorageSync('token');

    order_id && app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'car.wxpay',
        token,
        order_id,
        scene: app.globalData.scene
      },
      dataType: 'json',
      method: 'POST',
      success: function(res) {
        if (res.data.code == 0) {
          // 交易组件
          if(res.data.isRequestOrderPayment==1) {
            wx.requestOrderPayment({
              orderInfo: res.data.order_info,
              timeStamp: res.data.timeStamp,
              nonceStr: res.data.nonceStr,
              package: res.data.package,
              signType: res.data.signType,
              paySign: res.data.paySign,
              success: function(wxres) {
                canpay = true;
                wx.redirectTo({
                  url: '/eaterplanet_ecommerce/pages/order/order?id=' + order_id + '&is_show=1&delivery='+that.data.delivery
                })
              },
              'fail': function(res) {
                canpay = true;
                console.log(res);
              }
            })
          } else {
            wx.requestPayment({
              "appId": res.data.appId,
              "timeStamp": res.data.timeStamp,
              "nonceStr": res.data.nonceStr,
              "package": res.data.package,
              "signType": res.data.signType,
              "paySign": res.data.paySign,
              'success': function(wxres) {
                canpay = true;
                wx.redirectTo({
                  url: '/eaterplanet_ecommerce/pages/order/order?id=' + order_id + '&is_show=1&delivery='+that.data.delivery
                })
              },
              'fail': function(res) {
                canpay = true;
                console.log(res);
              }
            })
          }
        } else if (res.data.code == 1) {
          wx.showToast({
            title: res.data.RETURN_MSG || '支付错误',
            icon: 'none'
          })
          canpay = true;
        } else if (res.data.code == 2) {
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
          setTimeout(() => {
            canpay = true;
            that.reload_data();
          }, 1500);
        }
      },
      fail: ()=>{
        canpay = true;
      }
    })
  },

  hide_lding: function() {
    wx.hideLoading();
    this.setData({
      is_show: true
    })
  },

  call_mobile: function(event) {
    let mobile = event.currentTarget.dataset.mobile;
    wx.makePhoneCall({
      phoneNumber: mobile
    })
  },

  goComment: function(event) {
    let id = event.currentTarget.dataset.type;
    let order_goods_id = event.currentTarget.dataset.order_goods_id;
    var goods_id = event.currentTarget.dataset.goods_id;

    var pages_all = getCurrentPages();
    if (pages_all.length > 3) {
      wx.redirectTo({
        url: '/eaterplanet_ecommerce/pages/order/evaluate?id=' + id + '&goods_id=' + goods_id + '&order_goods_id=' + order_goods_id
      })
    } else {
      wx.navigateTo({
        url: '/eaterplanet_ecommerce/pages/order/evaluate?id=' + id + '&goods_id=' + goods_id + '&order_goods_id=' + order_goods_id
      })
    }

  },

  gokefu: function(event) {
    let id = event.currentTarget.dataset.s_id;
    var pages_all = getCurrentPages();
    if (pages_all.length > 3) {
      wx.redirectTo({
        url: '/pages/im/index?id=' + id
      })
    } else {
      wx.navigateTo({
        url: '/pages/im/index?id=' + id
      })
    }


  },

  goRefund: function(event) {
    let id = event.currentTarget.dataset.id || 0;
    if(id) {
      var pages_all = getCurrentPages();
      if (pages_all.length > 3) {
        wx.redirectTo({
          url: `/eaterplanet_ecommerce/pages/order/refunddetail?id=${id}`
        })
      } else {
        wx.navigateTo({
          url: `/eaterplanet_ecommerce/pages/order/refunddetail?id=${id}`
        })
      }
    }
  },

  closeModal: function(event) {
    let h = {};
    let type = event.currentTarget.dataset.type || 0;
    if(type==1) {
      h.showRefundModal = false;
    } else {
      h.isShowModal = false;
    }
    this.setData(h)
  },

  //取消订单
  cancelOrder: function(e){
    let that = this;
    this.canCancel && wx.showModal({
      title: '取消订单并退款',
      content: '取消订单后，款项将原路退回到您的支付账户；详情请查看退款进度。',
      confirmText: '取消订单',
      confirmColor: '#ff5344',
      cancelText: '再等等',
      cancelColor: '#666666',
      success(res) {
        if (res.confirm) {
          that.canCancel = false;
          let order_id = e.currentTarget.dataset.type;
          let token = wx.getStorageSync('token');
          app.util.request({
            'url': 'entry/wxapp/index',
            'data': {
              controller: 'order.del_cancle_order',
              token,
              order_id
            },
            dataType: 'json',
            method: 'POST',
            success: function (res) {
              if(res.data.code==0){
                //提交成功
                wx.showModal({
                  title: '提示',
                  content: '取消订单成功',
                  showCancel: false,
                  confirmColor: '#ff5344',
                  success(ret) {
                    if(ret.confirm) {
                      wx.redirectTo({
                        url: '/eaterplanet_ecommerce/pages/order/index'
                      })
                    }
                  }
                })
              } else {
                that.canCancel = true;
                wx.showToast({
                  title: res.data.msg || '取消订单失败',
                  icon: 'none'
                })
              }
            }
          })
          console.log('用户点击确定')
        } else if (res.cancel) {
          that.canCancel = true;
          console.log('用户点击取消')
        }
      }
    })
  },

  /**
   * 弹窗显示退款信息
   * @param {*} res 
   */
  showRefundInfo: function(e) {
    let idx = e.currentTarget.dataset.idx;
    let hasrefund = e.currentTarget.dataset.hasrefund;
    if(hasrefund>0) {
      let order = this.data.order;
      let refundGoodsInfo = order.order_goods_list[idx];
      this.setData({
        showRefundModal: true,
        refundGoodsInfo
      })
    }
  },

  /**
    * 查看地图
    */
  gotoMap: function (e) {
    let tot = e.currentTarget.dataset.tot || '';
    let longitude = '';
    let latitude = '';
    let name = '';
    let address = '';
    if(tot==1) {
      let salesroom_list = this.data.order.order_info.salesroom_list;
      let salesroomIdx = this.data.salesroomIdx;
      longitude = salesroom_list[salesroomIdx].lon;
      latitude = salesroom_list[salesroomIdx].lat;
      name = salesroom_list[salesroomIdx].room_name;
      address = salesroom_list[salesroomIdx].room_address;
    } else {
      longitude = e.currentTarget.dataset.lon;
      latitude = e.currentTarget.dataset.lat;
      name = e.currentTarget.dataset.name;
      address = e.currentTarget.dataset.address;
    }
    
    wx.openLocation({
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      name,
      address,
      scale: 28
    })
  },

  createMarker: function(latitude, longitude){
    let marker = {
      iconPath: "../../images/location-red.png",
      id: '',
      title: '门店',
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      label:{
        anchorX: -12,
        anchorY: 0,
        content: '门店'
      },
      width: 30,
      height: 30
    };
    return marker;
  },

  handleHexiaoModal: function() {
    this.setData({
      showHexiaoModal: !this.data.showHexiaoModal
    })
  },

  changeMendian: function(e) {
    let salesroomIdx = e.currentTarget.dataset.idx;
    this.setData({ salesroomIdx, showHexiaoModal: !this.data.showHexiaoModal })
  },

  handleHexiaoGoodsModal: function() {
    this.setData({
      showHexiaoGoodsModal: !this.data.showHexiaoGoodsModal
    })
  },

  handleGoodsHexiao: function(e) {
    let goodsHexiaoIdx = e.currentTarget.dataset.idx;
    this.setData({ goodsHexiaoIdx, showHexiaoGoodsModal: true })
  },

  hanlePresaleModal: function(e) {
    this.setData({
      showPresaleDesc: !this.data.showPresaleDesc
    })
  },

  hanlePresalePayModal: function(){
    console.log(this.data.showPresalePayModal)
    this.setData({
      showPresalePayModal: !this.data.showPresalePayModal
    })
  },

  copyCont: function(e) {
    let data = e.currentTarget.dataset.code || "";
    data&&wx.setClipboardData({
      data,
      success:function (res) {
        wx.showToast({
          title: '复制成功',
        })
      }
    })
  },

  goLink: function(event) {
    let url = event.currentTarget.dataset.link;
    let needauth = event.currentTarget.dataset.needauth || '';
    if(needauth){ if (!this.authModal()) return; }
    url && wx.redirectTo({ url })
  },

  showFanliView: function() {
    let pin_rebate = this.data.order.pin_rebate || '';
    console.log(pin_rebate)
    let text = "";
    if(pin_rebate&&pin_rebate.rebate_reward==1) {
      text = "拼团返利赠送"+ pin_rebate.reward_amount +"积分";
    } else {
      text = "拼团返利赠送余额：+"+ pin_rebate.reward_amount;
    }
    pin_rebate&&wx.showModal({
      title: "返利详情",
      content: text,
      showCancel: false,
      confirmText: "我知道了"
    })
  },
  
  onShareAppMessage: function(res) {
    var order_id = this.data.order.order_info.order_id || '';
    let goods_share_image = this.data.order.order_goods_list[0].goods_share_image;
    let share_img = this.data.share_img;
    let share_title = this.data.share_title;
    share_title = share_title?share_title:`@${this.data.order.order_info.ziti_name}${this.data.groupInfo.owner_name}，我是${this.data.userInfo.shareNickName}，刚在你这里下单啦！！！`;
    if (order_id && this.is_show_tip == 1) {
      return {
        title: share_title,
        path: "eaterplanet_ecommerce/pages/order/shareOrderInfo?order_id=" + order_id,
        imageUrl: share_img ? share_img : goods_share_image
      };
    }
  }
})
