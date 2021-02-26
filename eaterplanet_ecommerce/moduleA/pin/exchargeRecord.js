var app = getApp();
var util = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    loadText: '加载中',
    loadMore: false,
    noData: false,
    state: ['提现中', '提现成功', '提现失败']
  },
  page: 1,
  noMore: false,
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
    this.getData();
  },

  /**
   * 授权成功回调
   */
  authSuccess: function() {
    let that = this;
    this.setData({
      needAuth: false
    }, () => {
      that.getData();
    })
  },

  getData: function() {
    wx.showLoading();
    var token = wx.getStorageSync('token');
    let that = this;
    app.util.request({
      url: 'entry/wxapp/user',
      data: {
        controller: 'groupdo.tixian_record',
        token: token,
        page: this.page
      },
      dataType: 'json',
      success: function (res) {
        wx.hideLoading();
        if (res.data.code == 0) {
          let list = res.data.data;
          let oldList = that.data.list;
          list = oldList.concat(list);
          that.page++;
          that.setData({ list })
        } else {
          // 无数据
          if (that.page == 1) that.setData({ noData: true })
          that.noMore = true;
          that.setData({ loadMore: false })
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let that = this;
    util.check_login_new().then((res) => {
      if (!res) {
        wx.showModal({
          title: '提示',
          content: '您还未登录',
          showCancel: false,
          success(res) {
            if (res.confirm) {
              wx.switchTab({
                url: '/eaterplanet_ecommerce/pages/user/me',
              })
            }
          }
        })
      }
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    this.noMore || (this.setData({ loadMore: true }), this.getData());
  }
})
