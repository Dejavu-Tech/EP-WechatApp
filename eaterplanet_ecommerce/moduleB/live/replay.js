var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    replayInfo: '',
    roominfo: ''
  },
  room_id: '',
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
    let room_id = options.room_id || 0;
    this.room_id = room_id;
    this.getData(room_id);

    let showBackBtn = false;
    let pages_all = getCurrentPages();
    if (pages_all.length > 1) {
      showBackBtn = true;
    }
    this.setData({ showBackBtn })
  },

  getData: function(room_id){
    let that = this;
    wx.showLoading();
    app.util.request({
      url: 'entry/wxapp/user',
      data: {
        controller: 'livevideo.get_replay',
        room_id
      },
      dataType: 'json',
      success: function(res) {
        wx.hideLoading();
        if (res.data.code == 0) {
          let replayInfo = res.data.data || '';
          let roominfo = res.data.roominfo || '';
          that.setData({ replayInfo, roominfo });
        } else {
          app.util.message('回放内容不存在', 'redirect:/eaterplanet_ecommerce/moduleB/live/index', 'error', '知道了');
        }
      }
    })
  },

  goDetails: function(e) {
    let url = e.currentTarget.dataset.link;
    url = url.replace(".html", "");
    if(!url) return;
    var pages_all = getCurrentPages();
    if (pages_all.length > 3) {
      wx.redirectTo({ url })
    } else {
      wx.navigateTo({ url })
    }
  },

  clickStore: function() {
    this.setData({ showStore: !this.data.showStore })
  },

  _backhome: function() {
    wx.switchTab({
      url: '/eaterplanet_ecommerce/pages/index/index',
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let roominfo = this.data.roominfo;
    let share_title = roominfo.name;
    let imageUrl = roominfo.share_img;
    let room_id = this.room_id;
    var share_path = `eaterplanet_ecommerce/moduleB/live/replay?room_id=${room_id}`;
    console.log('回放分享地址：', share_path);
    return {
      title: share_title,
      path: share_path,
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
