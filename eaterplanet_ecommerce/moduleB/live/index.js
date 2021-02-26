var app = getApp();
var util = require('../../utils/util.js');
var status = require('../../utils/index.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    roomInfo: [],
    loadText: "加载中...",
    noData: false,
    loadMore: true,
    live_status_tip: {
      101: '直播中',
      102: '未开始',
      103: '已结束',
      104: '禁播',
      105: '暂停中',
      106: '异常',
      107: '已过期'
    }
  },
  page: 1,
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
    app.setShareConfig();
    status.setNavBgColor();
    this.getData();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    util.check_login_new().then((res) => {
      if (!res) {
        that.setData({
          needAuth: true
        })
      } else {
        (0, status.cartNum)('', true).then((res) => {
          that.setData({
            cartNum: res.data
          })
        });
      }
    })
  },

  getData: function(){
    let that = this;
    wx.showLoading();
    app.util.request({
      'url': 'entry/wxapp/user',
      'data': {
        controller: 'livevideo.get_roominfo',
        page: this.page
      },
      dataType: 'json',
      success: function(res) {
        wx.hideLoading();
        if (res.data.code == 0) {
          let list = res.data.data || [];
          let h = {};
          h.share = res.data.share;
          if(h.share && h.share.name) wx.setNavigationBarTitle({ title: h.share.name })
          h.showTabbar = res.data.showTabbar;
          if(list.length<5) h.noMore = true, h.loadMore = false;
          let roomInfo = that.data.roomInfo;
          roomInfo = roomInfo.concat(list);
          h.roomInfo = roomInfo;
          that.page++;
          that.setData(h);
        } else {
          let h = {};
          if(that.page==1) h.noData = true;
          h.showTabbar = res.data.showTabbar;
          h.loadMore = false;
          that.setData(h);
        }
      }
    })
  },

  goLive: function(e){
    let roomid = e.currentTarget.dataset.roomid;
    // let idx = e.currentTarget.dataset.idx;
    // let roomInfo = this.data.roomInfo;
    // if(idx>=0 && roomInfo && roomInfo[idx] && roomInfo[idx]['has_replay']) {
    //   roomid && wx.navigateTo({
    //     url: `/eaterplanet_ecommerce/moduleB/live/replay?room_id=${roomid}`,
    //   })
    //   return;
    // }
    roomid && wx.navigateTo({
      url: `plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id=${roomid}`,
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.data.loadMore && this.getData();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let share = this.data.share || '';
    let title = share.title || '';
    let imageUrl = share.img || '';
    let share_path = 'eaterplanet_ecommerce/moduleB/live/index';
    return {
      title,
      imageUrl,
      path: share_path,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },

  onShareTimeline: function () {
    let share = this.data.share || '';
    let title = share.title || '';
    let imageUrl = share.img || '';
    return {
      title,
      imageUrl,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
})
