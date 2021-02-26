// pages/order/goods_express.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {

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
  onLoad: function (options) {
    var that = this;
    var token = wx.getStorageSync('token');
    var order_id = options.id;
    wx.showLoading();
    app.util.request({
      'url': 'entry/wxapp/index',
      'data': {
        controller: 'user.goods_express',
        token: token,
        order_id: order_id
      },
      dataType: 'json',
      success: function (res) {
        wx.hideLoading();
        if (res.data.code == 2) {
          wx.redirectTo({
            url: '/eaterplanet_ecommerce/pages/index/index',
          })
        } else if (res.data.code == 0) {
          let order_info = res.data.order_info;
          let shipping_traces = order_info.shipping_traces;
          if(shipping_traces) {
            shipping_traces = shipping_traces.reverse();
          }

          that.setData({
            seller_express: res.data.seller_express,
            goods_info: res.data.goods_info,
            order_info,
            shipping_traces
          })

        }
      }
    })

  }
})
