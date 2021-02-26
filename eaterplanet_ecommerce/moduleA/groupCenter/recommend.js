var util = require('../../utils/util.js');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    qrcode: ''
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
    if (!util.check_login()) {
      wx.switchTab({
        url: '/eaterplanet_ecommerce/pages/user/me',
      })
    }
    wx.showLoading();
  },

  getData(){
    var token = wx.getStorageSync('token');
    var that = this;
    app.util.request({
      'url': 'entry/wxapp/user',
      'data': {
        controller: 'community.get_community_zhitui_qrcode',
        token: token
      },
      dataType: 'json',
      success: function (res) {
        wx.hideLoading();
        if (res.data.code == 0) {
          that.setData({ qrcode: res.data.qrcode })
        } else {
          wx.switchTab({
            url: '/eaterplanet_ecommerce/pages/user/me',
          })
        }
      }
    })
  },

  preImg: function (event) {
    var goodShareImg = this.data.qrcode;
    //图片预览
    wx.previewImage({
      current: goodShareImg, // 当前显示图片的http链接
      urls: [goodShareImg] // 需要预览的图片http链接列表
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getData();
  }
})
