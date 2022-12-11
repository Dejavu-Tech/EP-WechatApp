var app = getApp();
var util = require('../../utils/util.js');
var status = require('../../utils/index.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    rushList: [],
    loadText: "加载中...",
    noData: 0,
    loadMore: true,
    shareInfo: ''
  },
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
  onLoad: function(options) {
    app.setShareConfig();
    status.setNavBgColor();
    this.getData();
    this.getInfo();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    const that = this;
    util.check_login_new().then((res) => {
      let needAuth = !res;
      that.setData({ needAuth })
      if (res) {
        (0, status.cartNum)('', true).then((res) => {
          res.code == 0 && that.setData({
            cartNum: res.data
          })
        });
      }
    })
  },

  getInfo: function() {
    let that = this;
    app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'goods.get_video_list_share'
      },
      dataType: 'json',
      success: function(res) {
        if (res.data.code == 0) {
          wx.setNavigationBarTitle({
            title: res.data.data.nav_title || '详情',
          })
          that.setData({ shareInfo: res.data.data })
        }
      }
    })
  },

  /**
   * 获取商品列表
   */
  getData: function() {
    var token = wx.getStorageSync('token');
    var that = this;
    var cur_community = wx.getStorageSync('community');
    wx.showLoading();

    app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'index.load_gps_goodslist',
        token: token,
        pageNum: that.pageNum,
        head_id: cur_community.communityId,
        per_page: 12,
        is_video: 1
      },
      dataType: 'json',
      success: function(res) {
        if (res.data.code == 0) {
          let rushList = '';
          let h = {};
          let rdata = res.data;
          if (rdata.list.length < 12) h.noMore = true;
          let oldRushList = that.data.rushList;
          rushList = oldRushList.concat(rdata.list);
          that.pageNum++;
          that.setData({
            rushList: rushList,
            tip: '',
            ...h
          });
        } else if (res.data.code == 1) {
          if (that.pageNum == 1) that.setData({ noData: 1 })
          that.setData({ loadMore: false, noMore: false, loadText: "没有更多记录了~" })
        } else if (res.data.code == 2) {
          //no login
          that.setData({
            needAuth: true
          })
        }
      },
      complete: function() {
        wx.hideLoading();
      }
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if (!this.data.loadMore) return false;
    this.getData();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    let shareInfo = this.data.shareInfo;
    let share_title = shareInfo.share_title || '视频';
    let shareImg = shareInfo.share_poster || '';
    var share_id = wx.getStorageSync('member_id');
    var share_path = `eaterplanet_ecommerce/moduleA/video/index?share_id=${share_id}`;

    return {
      title: share_title,
      path: share_path,
      imageUrl: shareImg,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },

  onShareTimeline: function(res) {
    let shareInfo = this.data.shareInfo;
    let title = shareInfo.share_title || '视频';
    let imageUrl = shareInfo.share_poster || '';
    var share_id = wx.getStorageSync('member_id');

    var query= `share_id=${share_id}`;
    return {
      title,
      query,
      imageUrl,
      success: function() {},
      fail: function() {}
    };
  }
})
