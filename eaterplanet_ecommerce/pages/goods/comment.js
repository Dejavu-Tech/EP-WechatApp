// pages/goods/comment.js
var util = require('../../utils/util.js');
var app = getApp();
var buyClearTime = null;
var status = require('../../utils/index.js');

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
    clearTimeout(buyClearTime);
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

  buyClearTime = setTimeout(function() {
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
    showData: 1,
    cartNum: 0,
    needAuth: false,
    iconArr: {
      home: '',
      car: ''
    },
    list: [],
    loadMore: true,
    tip: '加载中'
  },
  page: 1,
  hasRefeshin: false,
  goodId: 0,
  community_id: 0,
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
  onLoad: function(options) {
    var that = this;
    var token = wx.getStorageSync('token');
    status.setNavBgColor();
    status.setIcon().then(function(iconArr) {
      that.setData({iconArr});
    });

    this.goodId = options.id;
    this.community_id = options.community_id;
    let currentCommunity = wx.getStorageSync('community');
    let currentCommunity_id = (currentCommunity && currentCommunity.communityId) || '';
    if (!currentCommunity_id) {
      let community = {};
      if (options.community_id !== void 0 && options.community_id > 0) {
        community.communityId = options.community_id;
      }
      util.getCommunityInfo(community).then(function (res) {
        console.log('step1')
        paramHandle();
        get_goods_details(res);
      }).catch((param) => {
        console.log('step4 新人')
        if (Object.keys(param) != '') {
          that.addhistory(param, true);
        }
      });
    } else {
      console.log('step3')
      paramHandle();
      get_goods_details();
    }

    if (options.share_id != 'undefined' && options.share_id > 0) wx.setStorage({ key: "share_id", data: options.share_id })

    function paramHandle() {
      console.log('step2')
      if (options.community_id != 'undefined' && options.community_id > 0) {
        app.util.request({
          'url': 'entry/wxapp/index',
          'data': {
            controller: 'index.get_community_info',
            'community_id': options.community_id
          },
          dataType: 'json',
          success: function (res) {
            if (res.data.code == 0) {
              var community = res.data.data;
              let hisCommunity = currentCommunity;
              let community_id = currentCommunity_id;
              if (options.community_id != community_id) {
                wx.showModal({
                  title: '温馨提示',
                  content: '是否切换为分享人所在小区“' + community.communityName,
                  confirmColor: '#F75451',
                  success(res) {
                    if (res.confirm) {
                      app.globalData.community = community;
                      app.globalData.changedCommunity = true;
                      wx.setStorage({
                        key: "community",
                        data: community
                      })
                      token && that.addhistory(community);
                      get_goods_details(community);
                      console.log('用户点击确定')
                    } else if (res.cancel) {
                      that.showNoBindCommunity();
                      console.log('用户点击取消')
                    }
                  }
                })
              }
            }
          }
        })
      }

      that.setData({
        goods_id: options.id
      }, ()=>{
        that.load_comment_list();
      })
    }

    function get_goods_details(communityInfo) {
      if (communityInfo) currentCommunity_id = communityInfo.communityId;
      app.util.request({
        'url': 'entry/wxapp/index',
        'data': {
          controller: 'goods.get_goods_detail',
          'token': token,
          'id': options.id,
          community_id: currentCommunity_id
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
                  wx.switchTab({
                    url: '/eaterplanet_ecommerce/pages/index/index',
                  })
                }
              }
            })
          }
          let comment_list = res.data.comment_list;
          comment_list.map(function (item) {
            14 * item.content.length / app.globalData.systemInfo.windowWidth > 3 && (item.showOpen = true), item.isOpen = true;
          })
          that.setData({
            order_comment_count: res.data.order_comment_count,
            order_comment_images: res.data.order_comment_images,
            comment_list: comment_list,
            loadover: true,
            goods: goods,
            buy_record_arr: res.data.data.buy_record_arr,
            site_name: res.data.data.site_name,
            share_title: goods.share_title,
            options: res.data.data.options,
            goods_image: res.data.data.goods_image,
            goods_image_length: res.data.data.goods_image.length,
            service: goods.tag,
            favgoods: goods.favgoods,
            cur_time: res.data.data.cur_time,
            order: {
              goods_id: res.data.data.goods.goods_id,
              pin_id: res.data.data.pin_id,
            },
            showSkeleton: false,
            is_comunity_rest: res.data.is_comunity_rest,
            goodsdetails_addcart_bg_color: res.data.goodsdetails_addcart_bg_color || 'linear-gradient(270deg, #f9c706 0%, #feb600 100%)',
            goodsdetails_buy_bg_color: res.data.goodsdetails_buy_bg_color || 'linear-gradient(90deg, #ff5041 0%, #ff695c 100%)'
          })
          if (res.data.is_comunity_rest == 1) {
            wx.showModal({
              title: '温馨提示',
              content: '团长休息中，欢迎下次光临!',
              showCancel: false,
              confirmColor: '#F75451',
              confirmText: '好的',
              success(res) { }
            })
          }
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
    }
  },

  //未绑定提示
  showNoBindCommunity: function () {
    wx.showModal({
      title: '提示',
      content: '您未绑定该小区，请切换后下单！',
      showCancel: false,
      confirmColor: '#F75451',
      success(res) {
        if (res.confirm) {
          wx.redirectTo({
            url: '/eaterplanet_ecommerce/pages/position/community',
          })
        }
      }
    })
  },

  /**
   * 历史社区
   */
  addhistory: function (community, isNew = false) {
    var community_id = community.communityId;
    console.log('addhistory');
    var token = wx.getStorageSync('token');
    app.util.request({
      'url': 'entry/wxapp/index',
      'data': {
        controller: 'index.addhistory_community',
        community_id: community_id,
        'token': token
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
                wx.setStorage({
                  key: "community",
                  data: community
                })
              }
            }
          })
        }
      }
    })
  },

  load_comment_list: function(){
    let goods_id = this.data.goods_id;
    let token = wx.getStorageSync('token');
    let that = this;
    
    !this.hasRefeshin && (that.hasRefeshin = true, that.setData({ loadMore: true, tip: '加载中' }), app.util.request({
      'url': 'entry/wxapp/index',
      'data': {
        controller: 'goods.comment_info',
        token: token,
        goods_id: goods_id,
        page: that.page
      },
      dataType: 'json',
      success: function (res) {
        if(res.data.code==0){
          let commentList = res.data.list;
          commentList.map(function (item) {
            14 * item.content.length / app.globalData.systemInfo.windowWidth > 3 && (item.showOpen = true), item.isOpen = true;
          })
          let list = that.data.list.concat(commentList);
          that.page++;
          that.hasRefeshin = false;
          that.setData({ list, loadMore: false, tip: '' })
        } else if (res.data.code == 1) {
          // 无数据
          if (that.page == 1) that.setData({ showData:0 })
          that.setData({
            loadMore: false,
            tip: '^_^已经到底了'
          })
        } else if(res.data.code == 2) {
          //no login
        } else {
          //其他
        }
      }
    }))
  },

  /**
   * 授权成功回调
   */
  authSuccess: function () {
    var id = this.goodId;
    let currentCommunity = wx.getStorageSync('community');
    let community_id = (currentCommunity && currentCommunity.communityId) || (this.community_id || '');
    wx.redirectTo({
      url: '/eaterplanet_ecommerce/pages/goods/comment?id=' + id + '&community_id=' + community_id,
    })
  },

  authModal: function () {
    if (this.data.needAuth) {
      this.setData({ showAuthModal: !this.data.showAuthModal });
      return false;
    }
    return true;
  },

  onShow: function() {
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
  },

  //加入购物车
  addToCart: function(e) {
    if (!this.authModal()) return;
    var that = this;
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
      success: function(res) {}
    })
    that.setData({
      is_just_addcar: 1
    })

    //加入购物车
    that.openSku();
  },

  // 打开选框
  openSku: function() {
    var that = this;
    var goods_id = this.data.goods_id;
    var options = this.data.options;

    that.setData({
      addCar_goodsid: goods_id
    })

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
        showSku: true
      });
    } else {
      let goods = this.data.goods;
      let cur_sku_arr = {
        canBuyNum: goods.total,
        spuName: goods.goodsname,
        actPrice: goods.actPrice,
        marketPrice: goods.marketPrice,
        stock: goods.total,
        skuImage: goods.image_thumb
      }
      that.setData({
        sku: [],
        sku_val: 1,
        cur_sku_arr: cur_sku_arr,
        skuList: []
      })
      let formIds = {
        detail: {
          formId: ""
        }
      };
      formIds.detail.formId = "the formId is a mock one";
      that.gocarfrom(formIds);
      //todo...addcart
    }
  },

  gocarfrom: function(e) {
    var that = this;
    var is_just_addcar = this.data.is_just_addcar;
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
      success: function(res) {}
    })

    that.goOrder();
  },

  closeSku: function() {
    this.setData({
      visible: 0,
      stopClick: false,
    });
  },

  goOrder: function() {
    var that = this;
    if (that.data.can_car) {
      that.data.can_car = false;
    }
    var token = wx.getStorageSync('token');
    var community = wx.getStorageSync('community');
    var goods_id = that.data.goods_id;
    var community_id = community.communityId;
    var quantity = that.data.sku_val;
    var cur_sku_arr = that.data.cur_sku_arr;
    var sku_str = '';
    var is_just_addcar = that.data.is_just_addcar;
    if (cur_sku_arr && cur_sku_arr.option_item_ids) {
      sku_str = cur_sku_arr.option_item_ids;
    }

    let data = {
      goods_id,
      community_id,
      quantity,
      sku_str,
      buy_type: 'dan',
      pin_id: 0,
      is_just_addcar
    }
    util.addCart(data).then(res=>{
      if(res.showVipModal==1) {
        let { pop_vipmember_buyimage } = res.data;
        wx.hideLoading();
        that.setData({ pop_vipmember_buyimage, showVipModal: true, visible: false })
      } else {
        if (res.data.code == 3 || res.data.code == 7) {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 2000
          })
        } else if (res.data.code == 4) {
          wx.showToast({
            title: '您未登录',
            duration: 2000,
          })
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
          if (is_just_addcar == 1) {
            that.closeSku();
            wx.showToast({
              title: "已加入购物车",
              image: "../../images/addShopCart.png"
            })
            app.globalData.cartNum = res.data.total
            that.setData({
              cartNum: res.data.total
            });
            status.indexListCarCount(goods_id);
          } else {
            var pages_all = getCurrentPages();
            if (pages_all.length > 3) {
              wx.redirectTo({
                url: '/eaterplanet_ecommerce/pages/order/placeOrder?type=dan'
              })
            } else {
              wx.navigateTo({
                url: '/eaterplanet_ecommerce/pages/order/placeOrder?type=dan'
              })
            }
          }
        }
      }
    }).catch(res=>{
      app.util.message(res||'请求失败', '', 'error');
    })

  },

  selectSku: function(event) {
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

  submit: function(e) {
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
      success: function(res) {}
    })
  },

  balance: function(e) {
    if (!this.authModal()) return;
    this.setData({
      is_just_addcar: 0
    })
    //加入购物车
    this.openSku();
  },

  //加减商品数量
  setNum: function(event) {
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


    var id = '';
    for (let i = 0; i < arr.length; i++) {
      if (i == arr.length - 1) {
        id = id + arr[i]['id'];
      } else {
        id = id + arr[i]['id'] + "_";
      }
    }
    var cur_sku_arr = options.sku_mu_list[id];
    if (num > cur_sku_arr['canBuyNum']) {
      num = num - 1;
    }

    this.setData({
      sku_val: num
    })
  },

  /**
   * 图片预览
   */
  preview: function(t) {
    var a = t.currentTarget.dataset.index,
      e = t.currentTarget.dataset.idx;
    wx.previewImage({
      urls: this.data.list[a].images,
      current: this.data.list[a].images[e],
      fail: function(t) {
        wx.showToast({
          title: "预览图片失败，请重试",
          icon: "none"
        }), console.log(t);
      }
    });
  },

  /**
   * 复制内容
   */
  copy: function(t) {
    wx.setClipboardData({
      data: t.currentTarget.dataset.val,
      success: function() {
        wx.showToast({
          title: "内容复制成功！",
          icon: "none"
        });
      }
    });
  },

  /**
   * 展开收起
   */
  bindOpen: function(t) {
    var idx = t.currentTarget.dataset.idx;
    if (this.data.list[idx].isOpen) {
      this.data.list[idx].isOpen = false;
      var list = this.data.list;
      this.setData({
        list: list
      });
    } else {
      this.data.list[idx].isOpen = true;
      var list = this.data.list;
      this.setData({
        list: list
      });
    }
  },

  onReachBottom: function () {
    console.log('我是底线');
    this.load_comment_list();
  }
})
