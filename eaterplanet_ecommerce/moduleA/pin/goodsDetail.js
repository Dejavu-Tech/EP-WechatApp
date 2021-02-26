// eaterplanet_ecommerce/pages/goods/goodsDetail.js
var util = require('../../utils/util.js');
var status = require('../../utils/index.js');

var app = getApp();
var detailClearTime = null;

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
      days: fill_zero_prefix(daysRound),
      hours: fill_zero_prefix(hoursRound),
      minutes: fill_zero_prefix(minutesRound),
      seconds: fill_zero_prefix(seconds),
      show_detail: 1
    }
  });

  if (total_micro_second <= 0) {
    clearTimeout(detailClearTime);
    detailClearTime = null;
    if (that.data.goods.over_type == 0) {
      that.authSuccess();
    }
    that.setData({
      endtime: {
        days: "00",
        hours: "00",
        minutes: "00",
        seconds: "00",
      }
    });
    return;
  }

  detailClearTime = setTimeout(function () {
    total_micro_second -= 1000;
    count_down(that, total_micro_second);
  }, 1000)

}
// 位数不足补零
function fill_zero_prefix(num) {
  return num < 10 ? "0" + num : num
}

Page({
  mixins: [require('../../mixin/globalMixin.js')],
  data: {
    needAuth: false,
    goodsIndex: 1,
    goods_id: 0,
    endtime: {
      days: "00",
      hours: "00",
      minutes: "00",
      seconds: "00",
    },
    is_share_html: true,
    imageSize: {
      imageWidth: "100%",
      imageHeight: 600
    },
    cartNum: 0,
    noIns: false,
    index_bottom_image: '',
    hideModal: true,
    shareImgUrl: '',
    goods_details_middle_image: '',
    is_show_buy_record: 0,
    stopNotify: true,
    iconArr: {
      home: '',
      car: ''
    },
    canvasWidth: 375,
    canvasHeight: 300,
    fmShow: true,
    pinListCount: 0,
    pinList: [],
    needPosition: false,
    groupInfo: {
      group_name: '社区',
      owner_name: '团长'
    }
  },
  $data: {
    id: '',
    scene: ''
  },
  imageUrl: '',
  goodsImg: '',
  currentOptions: [],
  buy_type: 'pindan',
  canPreSub: true,
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.setShareConfig();
    app.globalData.navBackUrl = '';
    var that = this;
    status.setNavBgColor();
    status.setGroupInfo().then((groupInfo) => { that.setData({ groupInfo }) });
    status.setIcon().then(function (iconArr) {
      that.setData({ iconArr });
    });
    var scene = decodeURIComponent(options.scene);
    this.$data.id = options.id;
    this.$data.scene = options.scene;
    if (scene !== 'undefined') {
      var opt_arr = scene.split("_");
      options.id = opt_arr[0];
      options.share_id = opt_arr[1];
      options.community_id = opt_arr[2];
    }
    if (options.community_id !== 'undefined' && options.community_id > 0) {
      this.$data.community_id = options.community_id;
    }
    wx.showLoading();

    if (options.share_id != 'undefined' && options.share_id > 0) wx.setStorage({ key: "share_id", data: options.share_id })

    this.get_goods_details(options.id);
    this.get_instructions();
    this.setData({
      canvasWidth: app.globalData.systemInfo.windowWidth,
      canvasHeight: 0.8 * app.globalData.systemInfo.windowWidth,
      goods_id: options.id
    })
  },

  get_goods_details: function (id) {
    let that = this;
    if (!id) {
      wx.hideLoading();
      wx.showModal({
        title: '提示',
        content: '参数错误',
        showCancel: false,
        confirmColor: '#F75451',
        success(res) {
          if (res.confirm) {
            wx.redirectTo({
              url: '/eaterplanet_ecommerce/pages/index/index',
            })
          }
        }
      })
      return false;
    }
    this.getFujinTuan(id);
    let token = wx.getStorageSync('token');
    let community = wx.getStorageSync('community');
    let community_id = community.communityId || 0;

    app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'groupdo.get_goods_detail',
        token: token,
        id,
        community_id
      },
      dataType: 'json',
      success: function (res) {
        wx.hideLoading();
        let goods = (res.data.data && res.data.data.goods) || '';
        // 商品不存在
        if (!goods || goods.length == 0 || Object.keys(goods) == '') {
          wx.showModal({
            title: '提示',
            content: '该商品不存在，回首页',
            showCancel: false,
            confirmColor: '#F75451',
            success(res) {
              if (res.confirm) {
                wx.redirectTo({
                  url: '/eaterplanet_ecommerce/moduleA/pin/index',
                })
              }
            }
          })
        }
        let comment_list = res.data.comment_list;
        comment_list.map(function (item) {
          14 * item.content.length / app.globalData.systemInfo.windowWidth > 3 && (item.showOpen = true), item.isOpen = true;
        })

        // 幻灯片预览数组
        let goods_images = res.data.data.goods_image;
        let prevImgArr = [];
        goods_images.forEach(function (item) { prevImgArr.push(item.image); })

        that.currentOptions = res.data.data.options;
        let pin_info = res.data.data.pin_info || {};

        // 开启社区
        let pintuan_model_buy = res.data.pintuan_model_buy || 0;
        let is_comunity_rest = res.data.is_comunity_rest || 0;
        let needPosition = false;
        if (pintuan_model_buy==1) {
          needPosition = true;
          // 团长休息
          if (is_comunity_rest==1) {
            wx.showModal({
              title: '温馨提示',
              content: '团长休息中，欢迎下次光临!',
              showCancel: false,
              confirmColor: '#F75451',
              confirmText: '好的',
              success(res) { }
            })
          }
          that.needCommunity();
        }

        that.setData({
          needPosition,
          pintuan_model_buy,
          is_comunity_rest,
          order_comment_count: res.data.order_comment_count,
          comment_list: comment_list,
          goods: goods,
          options: res.data.data.options,
          order: {
            goods_id: res.data.data.goods.goods_id,
            pin_id: res.data.data.pin_id,
          },
          share_title: goods.share_title,
          buy_record_arr: res.data.data.buy_record_arr,
          goods_image: res.data.data.goods_image,
          goods_image_length: res.data.data.goods_image.length,
          service: goods.tag,
          showSkeleton: false,
          is_comunity_rest: res.data.is_comunity_rest,
          prevImgArr,
          open_man_orderbuy: res.data.open_man_orderbuy,
          man_orderbuy_money: res.data.man_orderbuy_money,
          goodsdetails_addcart_bg_color: res.data.goodsdetails_addcart_bg_color || 'linear-gradient(270deg, #f9c706 0%, #feb600 100%)',
          goodsdetails_buy_bg_color: res.data.goodsdetails_buy_bg_color || 'linear-gradient(90deg, #ff5041 0%, #ff695c 100%)',
          pin_info,
          pintuan_close_stranger: res.data.pintuan_close_stranger,
          is_need_subscript: res.data.is_need_subscript,
          need_subscript_template: res.data.need_subscript_template
        }, () => {
          let goods_share_image = goods.goods_share_image;
          if (goods_share_image) {
            console.log('draw分享图');
            status.download(goods_share_image + "?imageView2/1/w/500/h/400").then(function (a) {
              that.goodsImg = a.tempFilePath, that.drawImgNoPrice();
            });
          } else {
            console.log('draw价格');
            let shareImg = goods.image_thumb;
            status.download(shareImg + "?imageView2/1/w/500/h/400").then(function (a) {
              that.goodsImg = a.tempFilePath, that.drawImg();
            });
          }
        })
        let over_type = goods.over_type;
        var seconds = 0;
        if (over_type == 0) {
          seconds = (goods.begin_time - res.data.data.cur_time) * 1000;
        } else {
          seconds = (goods.end_time - res.data.data.cur_time) * 1000;
        }
        if (seconds > 0) {
          count_down(that, seconds);
        }
      }
    })
  },

  /**
   * 需要社区
   * 判断是否已绑定
   */
  needCommunity: function () {
    let that = this;
    console.log('需要社区')
    let token = wx.getStorageSync('token');
    //当前社区
    let currentCommunity = wx.getStorageSync('community');
    let currentCommunityId = (currentCommunity && currentCommunity.communityId) || '';
    let shareCommunityId = this.$data.community_id;
    console.log('shareCommunityId', shareCommunityId)

    // 单社区
    util.getCommunityById(shareCommunityId).then(res => {
      if (res.open_danhead_model == 1) {
        let default_head_info = res.default_head_info;
        app.globalData.community = default_head_info;
        app.globalData.changedCommunity = true;
        wx.setStorage({ key: "community", data: default_head_info })
        that.setData({ community: default_head_info })
        token && that.addhistory(default_head_info);
      } else {
        // 社区是否存在
        if (currentCommunityId != '') {
          // 存在并且不相同
          console.log('currentCommunityId存在 比较社区')
          if (currentCommunityId != shareCommunityId) {
            console.log('currentCommunityId存在 社区不同')
            if (res.data) {
              that.setData({
                showChangeCommunity: true,
                changeCommunity: res.data,
                community: currentCommunity
              })
            }
          }
        } else {
          // 不存在社区id
          //token 是否存在
          if (token) {
            util.getCommunityInfo().then(function (ret) {
              //比较社区
              console.log('token存在 比较社区')
              if (ret.community_id && ret.community_id != shareCommunityId) {
                that.setData({
                  showChangeCommunity: true,
                  changeCommunity: res.data,
                  community: currentCommunity
                })
              }
            }).catch((param) => {
              console.log('step4 新人')
              if (Object.keys(param) != '') that.addhistory(param, true);
            });
          } else {
            console.log('token不存在 存社区')
            // 直接存本地
            app.globalData.community = res.data;
            app.globalData.changedCommunity = true;
            wx.setStorage({ key: "community", data: res.data })
            that.setData({ community: res.data })
          }
        }
      }
    })
  },

  /**
   * 切换提示
   */
  confrimChangeCommunity: function () {
    let community = this.data.changeCommunity;
    let token = wx.getStorageSync('token');
    app.globalData.community = community;
    app.globalData.changedCommunity = true;
    wx.setStorage({
      key: "community",
      data: community
    })
    token && this.addhistory(community);

    this.setData({ community, showChangeCommunity: false })
    this.get_goods_details(this.data.goods_id, community, community.communityId);
    console.log('用户点击确定')
  },

  /**
   * 历史社区
   */
  addhistory: function (community, isNew = false) {
    var community_id = community.communityId;
    console.log('addhistory');
    var token = wx.getStorageSync('token');
    app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'index.addhistory_community',
        community_id: community_id,
        token: token
      },
      dataType: 'json',
      success: function (res) {
        if (isNew) {
          console.log('新人 社区')
          app.util.request({
            'url': 'entry/wxapp/index',
            'data': {
              controller: 'index.get_community_info',
              community_id: community_id
            },
            dataType: 'json',
            success: function (result) {
              if (result.data.code == 0) {
                let community = result.data.data;
                app.globalData.community = community;
                app.globalData.changedCommunity = true;
                wx.setStorage({ key: "community", data: community })
              }
            }
          })
        }
      }
    })
  },

  /**
   * 授权成功回调
   */
  authSuccess: function () {
    var id = this.$data.id;
    var scene = this.$data.scene;
    let url = '/eaterplanet_ecommerce/moduleA/pin/goodsDetail?id=' + id + '&scene=' + scene;
    app.globalData.navBackUrl = url;
    wx.redirectTo({ url })
  },

  authModal: function () {
    if (this.data.needAuth) {
      this.setData({ showAuthModal: !this.data.showAuthModal });
      return false;
    }
    return true;
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    util.check_login_new().then((res) => {
      if (!res) {
        that.setData({
          needAuth: true
        })
      } else {
        (0, status.cartNum)('', true).then((res) => {
          res.code == 0 && that.setData({
            cartNum: res.data
          })
        });
      }
    })
    this.setData({
      stopNotify: false
    });
  },

  /**
   * 图片信息
   */
  imageLoad: function (e) {
    var imageSize = util.imageUtil(e)
    this.setData({
      imageSize
    })
  },

  /**
   * 获取服务信息
   */
  get_instructions: function () {
    let that = this;
    app.util.request({
      'url': 'entry/wxapp/index',
      'data': {
        controller: 'goods.get_instructions'
      },
      dataType: 'json',
      success: function (res) {
        if (res.data.code == 0) {
          var instructions = res.data.data.value;
          if (instructions == '') that.setData({ noIns: true })
          that.setData({
            instructions,
            index_bottom_image: res.data.data.index_bottom_image,
            goods_details_middle_image: res.data.data.goods_details_middle_image,
            is_show_buy_record: res.data.data.is_show_buy_record,
            order_notify_switch: res.data.data.order_notify_switch,
            is_show_comment_list: res.data.data.is_show_comment_list,
            goods_details_price_bg: res.data.data.goods_details_price_bg,
            isShowContactBtn: res.data.data.index_service_switch || 0,
            goods_industrial_switch: res.data.data.goods_industrial_switch || 0,
            goods_industrial: res.data.data.goods_industrial || '',
            is_show_ziti_time: res.data.data.is_show_ziti_time || 0,
            hide_community_change_btn: res.data.data.hide_community_change_btn || 0,
            is_show_goodsdetails_communityinfo: res.data.data.is_show_goodsdetails_communityinfo || 0
          })
        }
      }
    })
  },

  getFujinTuan: function (goods_id){
    let that = this;
    let community = wx.getStorageSync('community');
    let head_id = community.communityId || 0;

    app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'groupdo.get_goods_fujin_tuan',
        goods_id,
        limit: 4,
        head_id
      },
      dataType: 'json',
      success: function (res) {
        if (res.data.code == 0) {
          let { list, count } = res.data;
          if (list.length) {
            let timestamp = Date.parse(new Date());
            list.forEach((item, index)=>{
              list[index].seconds = (item.end_time - item.cur_interface_time)*1000 + timestamp;
              console.log((item.end_time - item.cur_interface_time))
            })
          }
          that.setData({
            pinList: list || [],
            pinListCount: count || 0
          })
        }
      }
    })
  },

  /**
   * 打开购物车
   */
  openSku: function (t) {
    if (!this.authModal()) return;
    this.canPreSub = true;
    var that = this;
    var is_just_addcar = 0;
    var goods_id = this.data.goods_id;
    var options = this.currentOptions;
    that.setData({ addCar_goodsid: goods_id })
    let list = options.list || [];
    let arr = [];
    if (list.length > 0) {
      for (let i = 0; i < list.length; i++) {
        let sku = list[i]['option_value'][0];
        let temp = {
          name: sku['name'],
          id: sku['option_value_id'],
          index: i,
          idx: 0
        };
        arr.push(temp);
      }
      //把单价剔除出来begin
      var id = '';
      for (let i = 0; i < arr.length; i++) {
        if (i == arr.length - 1) {
          id = id + arr[i]['id'];
        } else {
          id = id + arr[i]['id'] + "_";
        }
      }
      var cur_sku_arr = options.sku_mu_list[id];
      that.setData({
        sku: arr,
        sku_val: 1,
        cur_sku_arr: cur_sku_arr,
        skuList: options,
        visible: true,
        showSku: true,
        is_just_addcar
      });
    } else {
      let goods = this.data.goods;
      let danprice = this.data.pin_info.danprice || 0;
      let cur_sku_arr = {
        canBuyNum: goods.total,
        spuName: goods.goodsname,
        // actPrice: goods.actPrice,
        marketPrice: goods.marketPrice,
        stock: goods.total,
        skuImage: goods.image_thumb,
        pinprice: goods.actPrice,
        actPrice: danprice.split(".")
      }
      that.setData({
        sku: [],
        sku_val: 1,
        cur_sku_arr: cur_sku_arr,
        skuList: [],
        visible: true,
        showSku: true
      })
    }
  },

  /**
   * 确认购物车
   */
  gocarfrom: function (e) {
    var that = this;
    wx.showLoading();
    var token = wx.getStorageSync('token');

    app.util.request({
      'url': 'entry/wxapp/user',
      'data': {
        controller: 'user.get_member_form_id',
        'token': token,
        "from_id": e.detail.formId
      },
      dataType: 'json',
      success: function (res) { }
    })

    that.goOrder();
  },

  /**
   * 关闭购物车
   */
  closeSku: function () {
    this.setData({
      visible: 0,
      stopClick: false,
    });
  },

  goOrder: function () {
    var that = this;
    if (that.data.can_car) {
      that.data.can_car = false;
    }

    let open_man_orderbuy = this.data.open_man_orderbuy;
    if (open_man_orderbuy == 1) {
      let man_orderbuy_money = this.data.man_orderbuy_money * 1;
      let sku_val = this.data.sku_val;
      let cur_sku_arr = this.data.cur_sku_arr;
      let actPrice = cur_sku_arr.actPrice[0] + '.' + cur_sku_arr.actPrice[1];
      console.log(actPrice * 1 * sku_val);
      if (actPrice * 1 * sku_val < man_orderbuy_money) {
        wx.showToast({
          title: '满' + man_orderbuy_money + '元可下单！',
          icon: 'none'
        })
        return false;
      }
    }

    var goods_id = that.data.addCar_goodsid;
    var quantity = that.data.sku_val;
    var cur_sku_arr = that.data.cur_sku_arr;
    var sku_str = '';
    var is_just_addcar = 0;
    let buy_type = this.buy_type;
    let community = wx.getStorageSync('community');
    let community_id = community.communityId || 0;

    if (cur_sku_arr && cur_sku_arr.option_item_ids) {
      sku_str = cur_sku_arr.option_item_ids;
    }

    let data = {
      goods_id,
      community_id,
      quantity,
      sku_str,
      buy_type,
      pin_id: 0,
      is_just_addcar
    }

    util.addCart(data).then(res=>{
      if(res.showVipModal==1) {
        let { pop_vipmember_buyimage } = res.data;
        wx.hideLoading();
        that.setData({ pop_vipmember_buyimage, showVipModal: true, visible: false })
      } else if (res.data.code == 3 || res.data.code == 7) {
        wx.showToast({
          title: res.data.msg,
          icon: 'none',
          duration: 2000
        })
      } else if (res.data.code == 4) {
        wx.hideLoading();
        that.setData({ needAuth: true, showAuthModal: true, visible: false })
      } else if (res.data.code == 6) {
        var msg = res.data.msg;
        let max_quantity = res.data.max_quantity || '';
        (max_quantity > 0) && that.setData({ sku_val: max_quantity })
        wx.showToast({
          title: msg,
          icon: 'none',
          duration: 2000
        })
      } else {
        var is_limit = res.data.is_limit_distance_buy;
        var pages_all = getCurrentPages();
        if (pages_all.length > 3) {
          wx.redirectTo({
            url: `/eaterplanet_ecommerce/pages/order/placeOrder?type=${buy_type}&is_limit=${is_limit}`
          })
        } else {
          wx.navigateTo({
            url: `/eaterplanet_ecommerce/pages/order/placeOrder?type=${buy_type}&is_limit=${is_limit}`
          })
        }
      }
    }).catch(res=>{
      app.util.message(res||'请求失败', '', 'error');
    })
  },

  selectSku: function (event) {
    var that = this;
    let str = event.currentTarget.dataset.type;
    let obj = str.split("_");
    let arr = that.data.sku;
    let temp = {
      name: obj[3],
      id: obj[2],
      index: obj[0],
      idx: obj[1]
    };
    arr.splice(obj[0], 1, temp);
    that.setData({
      sku: arr
    })
    var id = '';
    for (let i = 0; i < arr.length; i++) {
      if (i == arr.length - 1) {
        id = id + arr[i]['id'];
      } else {
        id = id + arr[i]['id'] + "_";
      }
    }
    var options = this.data.skuList;
    var cur_sku_arr = options.sku_mu_list[id];

    that.setData({
      cur_sku_arr: cur_sku_arr
    });

    console.log(id);
  },

  submit: function (e) {
    var from_id = e.detail.formId;
    var token = wx.getStorageSync('token');
    app.util.request({
      'url': 'entry/wxapp/user',
      'data': {
        controller: 'user.get_member_form_id',
        'token': token,
        "from_id": from_id
      },
      dataType: 'json',
      success: function (res) { }
    })
  },

  /**
   * 开团订阅
   */
  preBalance: function(e){
    if (!this.authModal()) return;
    let that = this;
    if(!this.canPreSub) return;
    this.canPreSub = false;
    let is_need_subscript = this.data.is_need_subscript;
    let buy_type = e.currentTarget.dataset.type;
    this.buy_type = buy_type;
    this.setData({ buy_type })

    if(is_need_subscript==1) {
      //弹出订阅消息
      this.subscriptionNotice().then(()=>{
        that.openSku(buy_type);
      }).catch(()=>{
        that.openSku(buy_type);
      });
    } else {
      that.openSku(buy_type);
    }
  },

  /**
   * 订阅消息
   */
  subscriptionNotice: function() {
    console.log('subscriptionNotice')
    let that = this;
    return new Promise((resolve, reject)=>{
      let obj = that.data.need_subscript_template;
      let tmplIds =  Object.keys(obj).map(key => obj[key]); // 订阅消息模版id
      if (wx.requestSubscribeMessage) {
        tmplIds.length && wx.requestSubscribeMessage({
          tmplIds: tmplIds,
          success(res) {
            let is_need_subscript = 1;
            let acceptId = [];
            Object.keys(obj).forEach(item=>{
              if (res[obj[item]] == 'accept') {
                //用户同意了订阅，添加进数据库
                acceptId.push(item);
              } else {
                //用户拒绝了订阅或当前游戏被禁用订阅消息
                is_need_subscript = 0;
              }
            })

            if(acceptId.length) {
              that.addAccept(acceptId);
            }
            that.setData({ is_need_subscript })
            resolve();
          },
          fail() {
            reject();
          }
        })
      } else {
        // 兼容处理
        reject();
      }
    })
  },

  // 用户点击订阅添加到数据库
  addAccept: function (acceptId) {
    let token = wx.getStorageSync('token');
    let type = acceptId.join(',');
    app.util.request({
      url: 'entry/wxapp/user',
      data: {
        controller: 'user.collect_subscriptmsg',
        token,
        type
      },
      dataType: 'json',
      method: 'POST',
      success: function () {}
    })
  },

  balance: function (e) {
    if (!this.authModal()) return;
    let that = this;
    let buy_type = e.currentTarget.dataset.type;
    // let isZreo = e.currentTarget.dataset.zero || 0;
    this.buy_type = buy_type;
    this.setData({ buy_type })
    // if (isZreo == 1) {
    //   this.zeroModal(()=>{
    //     that.openSku(buy_type);
    //   });
    // } else {
    that.openSku(buy_type);
    // }
  },

  /**
   * 数量加减
   */
  setNum: function (event) {
    let types = event.currentTarget.dataset.type;
    var that = this;
    var num = 1;
    let sku_val = this.data.sku_val * 1;
    if (types == 'add') {
      num = sku_val + 1;
    } else if (types == 'decrease') {
      if (sku_val > 1) {
        num = sku_val - 1;
      }
    }

    let arr = that.data.sku;
    var options = this.data.skuList;
    if (arr.length > 0) {
      var id = '';
      for (let i = 0; i < arr.length; i++) {
        if (i == arr.length - 1) {
          id = id + arr[i]['id'];
        } else {
          id = id + arr[i]['id'] + "_";
        }
      }
    }
    if (options.length > 0) {
      var cur_sku_arr = options.sku_mu_list[id];
      if (num > cur_sku_arr['canBuyNum']) {
        num = num - 1;
      }
    } else {
      let cur_sku_arr = this.data.cur_sku_arr;
      if (num > cur_sku_arr['canBuyNum']) {
        num = num - 1;
      }
    }
    this.setData({
      sku_val: num
    })
  },

  scrollImagesChange: function (t) {
    this.videoContext.pause();
    this.setData({
      fmShow: true,
      goodsIndex: t.detail.current + 1
    });
  },

  share_handler: function () {
    this.setData({
      is_share_html: !this.data.is_share_html
    })
  },

  share_quan: function () {
    if (!this.authModal()) return;
    wx.showLoading({
      title: '获取中',
    })
    var token = wx.getStorageSync('token');
    var community = wx.getStorageSync('community');
    var goods_id = this.data.order.goods_id;
    var community_id = community.communityId;
    var that = this;
    app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'goods.get_user_goods_qrcode',
        token: token,
        community_id: community_id,
        goods_id: goods_id
      },
      dataType: 'json',
      success: function (res) {
        if (res.data.code == 0) {
          setTimeout(function () {
            wx.hideLoading()
          }, 2000)
          var image_path = res.data.image_path;
          wx.getImageInfo({
            src: image_path,
            success: function (res) {
              var real_path = res.path;
              wx.saveImageToPhotosAlbum({
                filePath: real_path,
                success(res) {
                  wx.showToast({
                    title: '图片保存成功，可以分享了',
                    icon: 'none',
                    duration: 2000
                  })
                  that.setData({
                    is_share_html: true
                  });
                }
              })
            }
          })
        } else {
          that.setData({
            needAuth: true
          })
        }
      }
    })
  },

  onReady: function (res) {
    this.videoContext = wx.createVideoContext('myVideo');
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.setData({ stopNotify: true })
    console.log('详情页hide', this.data.stopNotify)
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log('onUnload')
    this.setData({ stopNotify: true })
    console.log('详情页unload', this.data.stopNotify);
    detailClearTime = null;
    clearTimeout(detailClearTime);
  },

  /**
   * 获取分享图并显示
   * 20181225 新形式
   */
  get_share_img: function () {
    if (!this.authModal()) return;
    wx.showLoading();
    let shareImgUrl = this.data.shareImgUrl;
    if (shareImgUrl != '') {
      wx.hideLoading();
      this.setData({
        hideModal: false,
        is_share_html: true
      })
    } else {
      var token = wx.getStorageSync('token');
      var community = wx.getStorageSync('community');
      var goods_id = this.data.goods_id;
      var community_id = community.communityId;

      var that = this;
      app.util.request({
        url: 'entry/wxapp/index',
        data: {
          controller: 'goods.get_user_goods_qrcode',
          token: token,
          community_id: community_id,
          goods_id: goods_id
        },
        dataType: 'json',
        success: function (res) {
          if (res.data.code == 0) {
            wx.hideLoading();
            var image_path = res.data.image_path;
            wx.previewImage({
              current: image_path, // 当前显示图片的http链接
              urls: [image_path] // 需要预览的图片http链接列表
            })
          } else {
            that.setData({
              needAuth: true
            })
          }
        }
      })
    }
  },

  closeShareModal: function () {
    this.setData({ hideModal: true })
  },

  /**
   * 展开收起
   */
  bindOpen: function (t) {
    var idx = t.currentTarget.dataset.idx;
    console.log(idx)
    if (this.data.comment_list[idx].isOpen) {
      this.data.comment_list[idx].isOpen = false;
      var comment_list = this.data.comment_list;
      this.setData({
        comment_list: comment_list
      });
    } else {
      this.data.comment_list[idx].isOpen = true;
      var comment_list = this.data.comment_list;
      this.setData({
        comment_list: comment_list
      });
    }
  },

  /**
   * 保存分享图并显示
   * 20181225 新形式
   */
  saveThumb: function (e) {
    wx.showLoading();
    let that = this;
    var image_path = this.data.shareImgUrl;
    wx.getImageInfo({
      src: image_path,
      success: function (res) {
        var real_path = res.path;
        real_path && wx.saveImageToPhotosAlbum({
          filePath: real_path,
          success(res) {
            console.log(res)
            wx.hideLoading();
            wx.showToast({
              title: '已保存相册',
              icon: 'none',
              duration: 2000
            })
            that.setData({
              hideModal: true
            });
          },
          fail: function (res) {
            wx.hideLoading();
            console.log(res)
            if (res.errMsg === "saveImageToPhotosAlbum:fail:auth denied") {
              wx.openSetting({
                success(settingdata) {
                  if (settingdata.authSetting["scope.writePhotosAlbum"]) {
                    console.log("获取权限成功，再次点击图片保存到相册")
                  } else {
                    console.log("获取权限失败")
                  }
                }
              })
            }
          }
        })
      }
    })
  },

  drawImgNoPrice: function () {
    var t = this;
    wx.createSelectorQuery().select(".canvas-img").boundingClientRect(function () {
      const context = wx.createCanvasContext("myCanvas");
      context.drawImage(t.goodsImg, 0, 0, status.getPx(375), status.getPx(300));
      if (t.data.goods.video) context.drawImage("../../images/play.png", status.getPx(127.5), status.getPx(90), status.getPx(120), status.getPx(120));
      context.save();
      context.restore(), context.draw(false, t.checkCanvasNoPrice());
    }).exec();
  },

  checkCanvasNoPrice: function () {
    var that = this;
    setTimeout(() => {
      wx.canvasToTempFilePath({
        canvasId: "myCanvas",
        success: function (res) {
          res.tempFilePath ? that.imageUrl = res.tempFilePath : that.drawImgNoPrice();
          console.log('我画完了')
        },
        fail: function (a) {
          that.drawImgNoPrice();
        }
      })
    }, 500)
  },

  drawImg: function () {
    let endtime = this.data.endtime;
    let shareTime = (endtime.days > 0 ? endtime.days + '天' : '') + endtime.hours + ':' + endtime.minutes + ':' + endtime.seconds;
    var t = this;
    wx.createSelectorQuery().select(".canvas-img").boundingClientRect(function () {
      const context = wx.createCanvasContext("myCanvas");
      context.font = "28px Arial";
      var e = context.measureText("￥").width + 2;
      var o = context.measureText(t.data.goods.price_front + "." + t.data.goods.price_after).width;
      context.font = "17px Arial";
      var s = context.measureText("￥" + t.data.goods.productprice).width + 3,
        n = context.measureText("累计销售 " + t.data.goods.seller_count).width,
        u = context.measureText("· 剩余" + t.data.goods.total + " ").width + 10;
      context.font = "18px Arial";
      let over_type_text = t.data.goods.over_type == 0 ? '距开始' : '距结束';
      var r = context.measureText(over_type_text).width;
      var d = context.measureText(shareTime).width + 10;
      context.drawImage(t.goodsImg, 0, 0, status.getPx(375), status.getPx(300));
      context.drawImage("../../images/shareBottomBg.png", status.getPx(0), status.getPx(225), status.getPx(375), status.getPx(75));
      if (t.data.goods.video) context.drawImage("../../images/play.png", status.getPx(127.5), status.getPx(70), status.getPx(120), status.getPx(120));
      context.save();
      status.drawText(context, { color: "#ffffff", size: 28, textAlign: "left" }, "￥", status.getPx(6), status.getPx(267), status.getPx(e));
      status.drawText(context, { color: "#ffffff", size: 28, textAlign: "left" }, t.data.goods.price_front + "." + t.data.goods.price_after,
        status.getPx(e), status.getPx(267), status.getPx(o));
      context.restore();
      context.save();
      context.restore(),
        context.save(),
        (0, status.drawText)(context,
          { color: "#ffffff", size: 15, textAlign: "left" },
          "￥" + t.data.goods.productprice,
          (0, status.getPx)(e + o + 10),
          (0, status.getPx)(267),
          (0, status.getPx)(s)
        ),
        context.restore(),
        context.save(),
        (0, status.drawText)(
          context,
          { color: "#ffffff", size: 17, textAlign: "left" },
          "累计销售" + t.data.goods.seller_count,
          (0, status.getPx)(10),
          (0, status.getPx)(290),
          (0, status.getPx)(n)
        ),
        context.restore(),
        context.save(),
        (0, status.drawText)(context,
          { color: "#ffffff", size: 17, textAlign: "left" },
          "· 剩余" + t.data.goods.total,
          (0, status.getPx)(n + 10),
          (0, status.getPx)(290),
          (0, status.getPx)(u)
        ),
        context.restore(),
        context.save(),
        context.beginPath(),
        context.setStrokeStyle("white"),
        context.moveTo((0, status.getPx)(e + o + 10),
          (0, status.getPx)(261)),
        context.lineTo((0, status.getPx)(e + o + s + 15),
          (0, status.getPx)(261)),
        context.stroke(),
        context.restore(),
        context.save(),
        (0, status.drawText)(context,
          { color: "#F8E71C", size: 18, textAlign: "center" },
          over_type_text,
          (0, status.getPx)(318),
          (0, status.getPx)(260),
          (0, status.getPx)(r)
        ),
        context.restore(),
        context.save(),
        (0, status.drawText)(context, { color: "#F8E71C", size: 18, textAlign: "center" },
          shareTime,
          (0, status.getPx)(315),
          (0, status.getPx)(288),
          (0, status.getPx)(d)
        ),
        context.restore();
      context.draw(false, t.checkCanvas());
    }).exec();
  },

  checkCanvas: function () {
    var that = this;
    setTimeout(() => {
      wx.canvasToTempFilePath({
        canvasId: "myCanvas",
        success: function (res) {
          res.tempFilePath ? that.imageUrl = res.tempFilePath : that.drawImg();
          console.log('我画完了')
        },
        fail: function (a) {
          that.drawImg();
        }
      })
    }, 500)
  },

  previewImg: function (e) {
    let idx = e.currentTarget.dataset.idx || 0;
    let prevImgArr = this.data.prevImgArr;
    wx.previewImage({
      current: prevImgArr[idx],
      urls: prevImgArr
    })
  },

  /**
   * 播放视频隐藏封面图
   */
  btnPlay: function () {
    this.setData({
      fmShow: false
    })
    this.videoContext.play();
  },

  videEnd: function () {
    this.videoContext.exitFullScreen();
    this.setData({
      fmShow: true
    })
  },

  endPlay: function () {
    this.videoContext.pause();
    this.setData({
      fmShow: true
    })
  },

  goLink: function (e) {
    var pages_all = getCurrentPages();
    var url = e.currentTarget.dataset.link;
    if (pages_all.length > 3) {
      wx.redirectTo({ url })
    } else {
      wx.navigateTo({ url })
    }
  },

  /**
   * 0元开团提示
   */
  zeroModal: function(fn){
    let pin_info = this.data.pin_info;
    let notice = pin_info.pintuan_newman_notice || '';
    if (notice) {
      wx.showModal({
        title: '温馨提示',
        content: notice,
        confirmColor: '#ff5041',
        success(res) {
          if (res.confirm) {
            fn()
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    } else {
      fn()
    }
  },

  /**
   * 0元开团
   */
  zeroTuanSub: function() {
    if (!this.authModal()) return;
    let that = this;
    this.zeroModal(()=>{
      that.zeroCartAdd()
    });
  },

  zeroCartAdd: function(){
    let goods_id = this.data.goods_id || '';
    var token = wx.getStorageSync('token');
    let community = wx.getStorageSync('community');
    let community_id = community.communityId || 0;
    goods_id && app.util.request({
      url: 'entry/wxapp/user',
      data: {
        controller: 'car.add_newcar',
        token: token,
        goods_id: goods_id,
        community_id
      },
      dataType: 'json',
      success: function (res) {
        if(res.data.code==0) {
          let order_id = res.data.order_id;
          wx.navigateTo({
            url: `/eaterplanet_ecommerce/moduleA/pin/share?id=${order_id}`
          })
        } else {
          wx.showToast({
            title: res.data.msg || '开团失败',
            icon: 'none'
          })
        }
      }
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let { goods_id, share_title, goods } = this.data;
    var community = wx.getStorageSync('community');
    var community_id = community.communityId;
    var share_id = wx.getStorageSync('member_id');
    var share_path = `eaterplanet_ecommerce/moduleA/pin/goodsDetail?id=${goods_id}&share_id=${share_id}&community_id=${community_id}`;
    let shareImg = goods.goods_share_image;
    // if(pin_info.is_zero_open!=1 && pin_info.pin_price) share_title = pin_info.pin_price + '元' + share_title;

    var that = this;
    that.setData({ is_share_html: true, hideModal: true });
    return {
      title: share_title,
      path: share_path,
      imageUrl: shareImg ? shareImg : that.imageUrl,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },

  onShareTimeline: function() {
    let { goods_id, share_title, goods } = this.data;
    var community = wx.getStorageSync('community');
    var community_id = community.communityId;
    var share_id = wx.getStorageSync('member_id');
    let shareImg = goods.goods_share_image;
    this.setData({ is_share_html: true, hideModal: true });

    var query= `id=${goods_id}&share_id=${share_id}&community_id=${community_id}`;
    return {
      title: share_title,
      imageUrl: shareImg ? shareImg : this.imageUrl,
      query,
      success: function() {},
      fail: function() {}
    };
  }
})
