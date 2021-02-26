var app = getApp();
var util = require('../../utils/util.js');
var status = require('../../utils/index.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    noData: 0,
    tip: '加载中',
    isHideLoadMore: true,
    level: '',
    groupInfo: {
      owner_name: '团长'
    }
  },
  page: 1,
  hasMore: true,
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
    let level = options.level || '';
    this.setData({ level });
    let that = this;
    status.setGroupInfo().then((groupInfo) => {
      let owner_name = groupInfo && groupInfo.owner_name || '团长';
      wx.setNavigationBarTitle({
        title: `${owner_name}列表`,
      })
      that.setData({ groupInfo })
    });
    if (!util.check_login()) {
      wx.redirectTo({
        url: '/eaterplanet_ecommerce/pages/user/me',
      })
    }
    wx.showLoading();
    this.getList();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  getList() {
    var token = wx.getStorageSync('token');
    var that = this;
    if (!that.hasMore) { return; }
    this.setData({ isHideLoadMore: false })
    app.util.request({
      'url': 'entry/wxapp/user',
      'data': {
        controller: 'community.get_head_child_headlist',
        token: token,
        page: that.page,
        level: that.data.level
      },
      dataType: 'json',
      success: function (res) {
        wx.hideLoading();
        if (res.data.code == 0) {
          let oldList = that.data.list;
          let list = oldList.concat(res.data.data);
          that.setData({ list, isHideLoadMore: true })
        } else {
          if (that.data.list.length == 0 && that.page == 1) that.setData({ noData: 1 })
          that.hasMore = false;
        }
      }
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.page++;
    this.getList();
  }
})
