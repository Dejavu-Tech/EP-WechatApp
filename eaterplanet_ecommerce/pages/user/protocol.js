// eaterplanet_ecommerce/pages/user/protocol.js
var util = require('../../utils/util.js');
var status = require('../../utils/index.js');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    noMore: false
  },
  token: '',
  pageNum: 1,
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
    status.setNavBgColor();
    var token = wx.getStorageSync('token');
    this.token = token;
    this.get_list();
  },

  /**
   * 获取列表
   */
  get_list: function(){
    let that = this;
    wx.showLoading();
    app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'article.get_article_list',
        token: this.token,
        page: this.pageNum
      },
      dataType: 'json',
      success: function (res) {
        wx.hideLoading();
        if (res.data.code == 0) {
          let oldList = that.data.list;
          let list = res.data.data;
          let h = {};
          if(list.length < 30) h.noMore = true;
          list = list.concat(oldList);
          h.list = list;
          that.pageNum++;
          that.setData(h)
        } else {
          let h = {};
          h.noMore = true;
          if(that.pageNum == 1) h.noData = true;
          that.setData(h)
        }
      }
    })
  },

  onReachBottom: function() {
    this.data.noMore || this.get_list();
  }
})
