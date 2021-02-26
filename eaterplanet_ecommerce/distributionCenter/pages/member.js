var page = 1;
var app = getApp();
var util = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    queryData: {
      createTime: null,
      communityId: null,
      order: [],
      page: page,
      pageSize: 20
    },
    searchKey: "",
    containerHeight: 0,
    showLoadMore: false,
    no_order: 0,
    page: 1,
    hide_tip: true,
    order: [],
    tip: '正在加载',
    levelName: ['', '1级粉丝', '2级粉丝', '3级粉丝']
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
    var sysInfo = wx.getSystemInfoSync();
    this.setData({
      containerHeight: sysInfo.windowHeight - Math.round(sysInfo.windowWidth / 375 * 125)
    });
    page = 1;
    this.data.queryData.communityId = app.globalData.disUserInfo.communityId;
    this.data.queryData.createTime = null;
    wx.setNavigationBarTitle({
      title: '我的粉丝',
    })
    this.getData();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var is_show_on = this.data.is_show_on;
    if (is_show_on > 0) {
      this.setData({
        page: 1,
        order: []
      })
      this.getData();
    } else {
      this.setData({
        is_show_on: is_show_on + 1
      })
    }
  },

  /**
   * 获取数据
   */
  getData: function () {
    wx.showLoading({
      title: "加载中...",
      mask: true
    });

    this.setData({
      isHideLoadMore: true
    })

    this.data.no_order = 1
    let that = this;
    var token = wx.getStorageSync('token');
    app.util.request({
      'url': 'entry/wxapp/index',
      'data': {
        controller: 'distribution.get_head_child_headlist',
        keyword: that.data.searchKey,
        token: token,
        page: that.data.page
      },
      dataType: 'json',
      success: function (res) {
        if (res.data.code == 0) {
          let rushList = that.data.order.concat(res.data.data);
          that.setData({
            order: rushList,
            hide_tip: true,
            no_order: 0
          });
          wx.hideLoading();
        } else {
          that.setData({
            isHideLoadMore: true
          })
          wx.hideLoading();
          return false;
        }

      }
    })

  },

  /**
   * 监控输入框
   */
  bindSearchChange: function (e) {
    this.setData({
      searchKey: e.detail.value
    });
  },

  /**
   * 搜索
   */
  searchByKey: function () {
    page = 1;
    this.setData({
      order: [],
      no_order: 0,
      page: 1
    });
    this.data.queryData.memberNickName = this.data.searchKey;
    this.getData();
  },

  /**
   * 取消
   */
  cancel: function () {
    page = 1;
    this.setData({
      searchKey: "",
      order: []
    });
    this.data.queryData.memberNickName = null;
    this.getData();
  },

  /**
   * 获取更多
   */
  getMore: function () {
    if (this.data.no_order == 1) return false;
    this.data.page += 1;
    this.getData();
    this.setData({
      isHideLoadMore: false
    })
  }
})