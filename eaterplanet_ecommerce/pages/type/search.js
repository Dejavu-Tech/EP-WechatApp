var app = getApp();
var util = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    is_login: true,
    wxSearchData: []
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

    onLoad: function(e) {
        wx.showLoading(), this.getHisKeys();
    },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.showLoading();
    this.getHisKeys();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    wx.hideLoading()
  },

  goResult: function(e){
    let keyword = e.detail.value.replace(/\s+/g, '');
    if (!keyword) {
      wx.showToast({
        title: '请输入关键词',
        icon: 'none'
      })
      return;
    }
    this.wxSearchAddHisKey(keyword);
    wx.navigateTo({
      url: '/eaterplanet_ecommerce/pages/type/result?keyword=' + keyword,
    })
  },

  goResultName: function (e) {
    console.log(e)
    let keyword = e.currentTarget.dataset.name;
    if (!keyword) {
      wx.showToast({
        title: '请输入关键词',
        icon: 'none'
      })
      return;
    }
    this.wxSearchAddHisKey(keyword);
    wx.navigateTo({
      url: '/eaterplanet_ecommerce/pages/type/result?keyword=' + keyword,
    })
  },

  // 获取记录
  getHisKeys: function() {
    var value = [];
    let that = this;
    try {
      value = wx.getStorageSync('wxSearchHisKeys')
      if (value) {
        that.setData({
          wxSearchData: value
        });
      }
    } catch (e) {
      // Do something when catch error
    }

  },

  // 清空历史记录
  clearHis: function() {
    var that = this;
    wx.removeStorage({
      key: 'wxSearchHisKeys',
      success: function(res) {
        var value = [];
        that.setData({
          wxSearchData: value
        });
      }
    })
  },

  // 添加搜索记录
  wxSearchAddHisKey: function (keyword) {
    var text = {}
    let that = this;
    text.name = keyword;
    if (typeof(text) == "undefined" || text.length == 0) {
      return;
    }
    var value = wx.getStorageSync('wxSearchHisKeys');
    if (value) {
      if (JSON.stringify(value).indexOf(JSON.stringify(text)) < 0) {
        if (value.length > 4) {
          value.pop();
        }
        value.unshift(text);
      }
      wx.setStorage({
        key: "wxSearchHisKeys",
        data: value,
        success: function() {
          that.getHisKeys();
        }
      })
    } else {
      value = [];
      value.push(text);
      wx.setStorage({
        key: "wxSearchHisKeys",
        data: value,
        success: function() {
          that.getHisKeys();
        }
      })
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  }
})
