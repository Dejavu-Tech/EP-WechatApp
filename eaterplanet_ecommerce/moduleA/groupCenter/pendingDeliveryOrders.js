var app = getApp();
var util = require('../../utils/util.js');
var memberId = "";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    checkedAll: true,
    checkedCount: 0,
    is_check_all: false,
    needAuth: false,
    memberId: 0,
    order: [],
    param: [],
    isIpx: false
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    app.globalData.isIpx && this.setData({
      isIpx: true
    });
    if (options.scene != undefined) {
      var scene = decodeURIComponent(options.scene);
      if (scene != 'undefined') {
        options.memberId = scene;
      }
    }

    memberId = options.memberId;
    this.setData({
      memberId: memberId
    })

    if (!util.check_login()) {
      this.setData({
        needAuth: true
      })
    } else {
      console.log('peding login in ');
      this.getData();
    }

  },

  /**
   * 授权成功回调
   */
  authSuccess: function() {
    this.setData({
      needAuth: false
    })
    this.getData();
  },

  /**
   * 获取数据
   */
  getData: function() {
    wx.showLoading({
      title: "加载中...",
      mask: true
    });
    var that = this;
    var token = wx.getStorageSync('token');

    //currentTab
    app.util.request({
      'url': 'entry/wxapp/index',
      'data': {
        controller: 'community.get_member_ziti_order',
        memberId: that.data.memberId,
        token: token
      },
      dataType: 'json',
      success: function(res) {
        if (res.data.code == 0) {
          let rushList = that.data.order.concat(res.data.data);
          var order = rushList.filter(function (item) {
            return item.delivery != 'express';
          });
          if (order.length>0){
            that.setData({
              order: order,
              checkedCount: order.length,
              checkedAll: true,
              is_check_all: true
            });
          }
        } else if (res.data.code == 1) {
          that.setData({
            order: []
          });
        } else if (res.data.code == 2) {
          // no login
        }
        wx.hideLoading();
      }
    })
    // 成功

  },

  /**
   * 状态改变
   */
  transformOrderStatus: function(e) {
    switch (Number(e)) {
      case 1:
        return "待提货";
      case 4:
        return "待配送";
      default:
        return "";
    }
  },

  /**
   * 勾选
   */
  checkboxChange: function(e) {
    var t = e.currentTarget.dataset.type,
      o = e.currentTarget.dataset.index,
      n = this.data.order,
      a = [],
      i = e.detail.value,
      r = this.data.checkedAll,
      s = false,
      c = 0;
    var is_check_all = this.data.is_check_all;


    if ("all" === t) {
      if (is_check_all) {
        n.forEach(function(e) {
          e.checked = 0;
        })
      } else {
        n.forEach(function(e) {
          e.checked = 1;
        })
      }
      this.setData({
        checkedCount: n.length,
        order: n,
        is_check_all: !is_check_all,
        checkedAll: !is_check_all
      })
    } else if ("order" === t) {
      n.forEach(function(e, t) {
        // e.checked = 0;

        if (o == t) {
          if (e.checked) {
            e.checked = 0
          } else {
            e.checked = 1
          }
        }
      })

      var ck = 0;
      n.forEach(function(e) {
        if (e.checked) {
          ck++;
        }
      })

      this.setData({
        checkedCount: ck,
        order: n,
        is_check_all: ck == n.length ? true : false,
        checkedAll: ck == n.length ? true : false
      })
    }

  },

  /**
   * 商品提货确认
   */
  sign: function(e) {
    var t = this;
    var orderno = e.target.dataset.orderno,
      orderskuid = e.target.dataset.orderskuid;
    wx.showModal({
      title: "商品提货确认",
      content: "请确认买家已收到货，再进行提货确认哦！",
      confirmText: "确定",
      confirmColor: "#FF673F",
      success: function(e) {
        if (e.confirm) {
          wx.showLoading({
            title: "加载中...",
            mask: true
          });
          var data = {
            orderNo: orderno,
            orderSkuId: orderskuid
          }
          // 发送请求
          //成功
          t.getData();
          wx.showToast({
            title: "商品提货成功",
            icon: "none"
          });
        } else {
          wx.hideLoading();
        }
      }
    });
  },

  /**
   * 订单提货确认
   */
  signOrder: function(e) {
    var t = this;
    wx.showLoading({
      title: "加载中...",
      mask: true
    });
    var that = this;
    var orderid = e.target.dataset.orderid;
    wx.showModal({
      title: "订单提货确认",
      content: "请确认买家已收改订单的所有商品，再进行提货确认哦！",
      confirmText: "确定",
      confirmColor: "#FF673F",
      success: function(e) {
        if (e.confirm) {
          wx.hideLoading();
          let data = {
            orderId: orderid
          }
          // 发送请求
          // 成功
          that.getData();
          wx.showToast({
            title: "订单提货成功",
            icon: "none"
          });
        } else {
          wx.hideLoading();
        }
      }
    });
  },

  /**
   * 批量订单提货确认
   */
  signAll: function() {
    var that = this;
    var n = this.data.order;

    var sub_order_arr = [];
    let is_cashon_delivery = false;

    n.forEach(function(e) {
      if (e.checked) {
        sub_order_arr.push(e.order_id)
      }
      if(e.payment_code=="cashon_delivery") {
        is_cashon_delivery = true;
      }
    })

    if (sub_order_arr.length <= 0) {
      wx.showToast({
        title: '请选择签收商品',
      })
      return false;
    }

    var token = wx.getStorageSync('token');
    wx.showModal({
      title: "订单提货确认",
      content: is_cashon_delivery?"所选商品含货到付款，请再次确认是否已收款":"请确认买家已收选中的商品，再进行提货确认哦！",
      confirmText: "确定",
      confirmColor: "#FF673F",
      success: function(t) {
        if (t.confirm) {
          wx.showLoading({
            title: "加载中...",
            mask: true
          });

          // 请求成功
          app.util.request({
            'url': 'entry/wxapp/index',
            'data': {
              controller: 'order.receive_order_list',
              order_data: sub_order_arr,
              token: token
            },
            method: 'post',
            dataType: 'json',
            success: function(res) {
              wx.hideLoading();
              if (res.data.code == 0) {
                that.setData({
                  order: []
                })
                that.getData();

                console.log('iniinin');
                wx.showToast({
                  title: "订单提货成功",
                  icon: "none"
                });
              } else {
                wx.showToast({
                  title: "订单提货失败",
                  icon: "none"
                });
              }
            }
          })
        }
      }
    });
  },

  /**
   * 复制信息
   */
  copyGoodsMsg: function() {
    if (0 !== this.data.checkedCount) {
      var info = "";
      this.data.list.forEach(function(items) {
          items.skuRspS.forEach(function(item) {
            item.checked && (info += ",【" + item.skuName + "】" + item.spec + "*" + item.skuNum);
          });
        }),
        wx.setClipboardData({
          data: info.substring(1),
          success: function() {
            wx.showToast({
              title: "复制成功",
              icon: "none"
            });
          },
          fail: function(error) {
            wx.showToast({
              title: "复制失败，请重试",
              icon: "none"
            }), console.log(error);
          }
        });
    } else {
      wx.showToast({
        title: "请选择商品",
        icon: "none"
      });
    }
  }
})