var app = getApp();
var util = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: []
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
    if(!util.check_login()){
      wx.redirectTo({
        url: '/eaterplanet_ecommerce/pages/user/me',
      })
    }
    this.getList();
  },

  getList: function(){
    wx.showLoading();
    var that = this;
    var token = wx.getStorageSync('token');

    app.util.request({
      'url': 'entry/wxapp/index',
      'data': {
        controller: 'community.get_community_hexiao_memberlist',
        token: token
      },
      dataType: 'json',
      success: function (res) {
        console.log(res)
        if(res.data.code==0){
          that.setData({ list: res.data.member_list })
        } else {
          console.log(res.data.log)
        }
        wx.hideLoading();
      }
    })
  },

  goQrcode: function(){
    wx.navigateTo({
      url: '/eaterplanet_ecommerce/moduleA/groupCenter/addHexiao'
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  }
})
