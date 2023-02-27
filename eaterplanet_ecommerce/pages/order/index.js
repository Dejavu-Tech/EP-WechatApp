var app = getApp();
var util = require('../../utils/util.js');
var canpay = true;

Page({
  mixins: [require('../../mixin/globalMixin.js')],
  data: {
    tablebar: 4,
    page: 1,
    theme_type: '',
    order_status: -1,
    no_order: 0,
    hide_tip: true,
    order: [],
    tip: '正在加载',
    is_empty: false,
    tabs: [
      { id: -1, name: '全部' },
      { id: 3, name: '待付款' },
      { id: 1, name: '待配送' },
      { id: 14, name: '配送中' },
      { id: 4, name: '待提货' },
      { id: 6, name: '已提货' }
    ],
    hexiaoStatus: ['','','','待付款','待使用','','','','','','','已完成']
  },
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
    let { order_status, is_show_tip, isfail } = options;

    wx.showLoading();

    if (order_status == undefined) {
      order_status = -1;
    }
    this.setData({
      order_status: order_status,
    })

    if (is_show_tip != undefined && is_show_tip == 1) {
      wx.showToast({
        title: '支付成功',
      })
    } else if (isfail != undefined && isfail == 1) {
      wx.showToast({
        title: '支付失败',
        icon: 'none'
      })
    }
    this.getData();
  },

  getData: function() {
    this.setData({ isHideLoadMore: true })
    this.data.no_order = 1
    let that = this;
    var token = wx.getStorageSync('token');
    app.util.request({
      'url': 'entry/wxapp/index',
      'data': {
        controller: 'order.orderlist',
        token: token,
        page: that.data.page,
        order_status: that.data.order_status
      },
      dataType: 'json',
      success: function(res) {
        wx.hideLoading();
        if (res.data.code == 0) {
          let rushList = that.data.order.concat(res.data.data);
          that.setData({
            order: rushList,
            hide_tip: true,
            no_order: 0
          });
        } else {
          if(that.data.page == 1 && that.data.order.length <= 0) that.setData({is_empty: true});
          that.setData({
            isHideLoadMore: true
          })
          return false;
        }
      }
    })

  },

  goOrder: function(event) {
    let id = event.currentTarget.dataset.type;
    var pages_all = getCurrentPages();
    let delivery = event.currentTarget.dataset.delivery || '';
    let url = `/eaterplanet_ecommerce/pages/order/order?id=${id}&delivery=${delivery}`;
    if (pages_all.length > 3) {
      wx.redirectTo({ url })
    } else {
      wx.navigateTo({ url })
    }
  },

  receivOrder: function(event) {
    let id = event.currentTarget.dataset.type;
    let delivery = event.currentTarget.dataset.delivery;
    var token = wx.getStorageSync('token');
    if (delivery == "pickup") content = "确认提货";
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确认收货',
            confirmColor: "#4facfe",
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
                that.order(that.data.order_status);
              }
            }
          })
        }
      }
    })

  },
  cancelOrder: function(event) {
    let id = event.currentTarget.dataset.type;
    var token = wx.getStorageSync('token');
    var that = this;
    wx.showModal({
      title: '取消支付',
      content: '好不容易挑出来，确定要取消吗？',
            confirmColor: "#4facfe",
      success(res) {
        if (res.confirm) {
          app.util.request({
            'url': 'entry/wxapp/index',
            'data': {
              controller: 'order.cancel_order',
              token: token,
              order_id: id
            },
            dataType: 'json',
            success: function (res) {
              wx.showToast({
                title: '取消成功',
                icon: 'success',
                duration: 1000
              })
              that.order(that.data.order_status);
            }
          })
        }
      }
    })
  },

  getOrder: function(event) {
    this.setData({ is_empty: false })
    wx.showLoading();
    let starus = event.currentTarget.dataset.type;
    this.order(starus);
  },

  order: function(starus) {
    var that = this;
    that.setData({
      order_status: starus,
      order: [],
      no_order: 0,
      page: 1
    })
    this.getData();
  },

  /**
   * 支付防抖
   */
  preOrderPay: util.debounce(function(event) {
    canpay&&this.orderPay(event);
  }),

  orderPay: function(event) {
    canpay = false;
    let that = this;
    var token = wx.getStorageSync('token');
    let id = event[0].currentTarget.dataset.type;
    let delivery = event[0].currentTarget.dataset.delivery;

    app.util.request({
      'url': 'entry/wxapp/index',
      'data': {
        controller: 'car.wxpay',
        token: token,
        order_id: id,
        scene: app.globalData.scene
      },
      dataType: 'json',
      method: 'POST',
      success: function(res) {
        if(res.data.code ==0)
        {
          var is_pin = res.data.is_pin;
          // 交易组件
          if(res.data.isRequestOrderPayment==1) {
            wx.requestOrderPayment({
              orderInfo: res.data.order_info,
              timeStamp: res.data.timeStamp,
              nonceStr: res.data.nonceStr,
              package: res.data.package,
              signType: res.data.signType,
              paySign: res.data.paySign,
              success: function (wxres) {
                wx.redirectTo({
                  url: '/eaterplanet_ecommerce/pages/order/order?id=' + id + '&is_show=1&delivery='+delivery
                })
              },
              fail: function (res) {
                console.log(res);
              },
              complete: ()=>{
                canpay = true;
              }
            })
          } else {
            wx.requestPayment({
              appId: res.data.appId,
              timeStamp: res.data.timeStamp,
              nonceStr: res.data.nonceStr,
              package: res.data.package,
              signType: res.data.signType,
              paySign: res.data.paySign,
              success: function (wxres) {
                wx.redirectTo({
                  url: '/eaterplanet_ecommerce/pages/order/order?id=' + id + '&is_show=1&delivery='+delivery
                })
              },
              fail: function (res) {
                console.log(res);
              },
              complete: ()=>{
                canpay = true;
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
            icon:'none'
          })
          canpay = true;
          setTimeout(() => {
            that.setData({
              page: 1,
              no_order: 0,
              order: [],
              tip: '正在加载',
              is_empty: false
            }, ()=>{
              that.getData();
            })
          }, 1500);
        }
      },
      fail: ()=>{
        canpay = true;
      }
    })
  },

  onReachBottom: function() {
    if (this.data.no_order == 1) return false;
    this.data.page += 1;
    this.getData();
    this.setData({
      isHideLoadMore: false
    })
  },
  
  onPullDownRefresh: function () {
    this.setData({
      is_empty: false,
      page: 1,
      order: []
    })
    wx.showLoading();
    this.getData();
    wx.stopPullDownRefresh();
  }
})
