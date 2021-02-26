const app = getApp()
var util = require('../../utils/util.js');

Page({
  data: {
    loadMore: true,
    classification: {
      tabs: [],
      activeIndex: 0
    }
  },
  pageNum: 1,

  onLoad: function () {
    this._doRefreshMasonry();
  },

  onShow: function () {
    util.check_login_new().then((res) => {
      this.setData({
        needAuth: !res
      });
    })
  },

  noLogin: function () {
    this.setData({
      needAuth: true,
      showAuthModal: true
    })
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
   * 授权成功回调
   */
  authSuccess: function () {
    const that = this;
    this.pageNum = 1;
    this.setData({
      loadMore: true,
      showEmpty: 0,
      needAuth: false,
      showAuthModal: false
    }, () => {
      that._doRefreshMasonry()
    })
  },

  authModal: function () {
    if (this.data.needAuth) {
      this.setData({ showAuthModal: !this.data.showAuthModal });
      return false;
    }
    return true;
  },

  onPullDownRefresh: function () {
    const that = this;
    this.pageNum = 1;
    this.setData({
      loadMore: true,
      showEmpty: 0
    }, () => {
      that.getInfo();
      that._doRefreshMasonry()
    })
  },

  onReachBottom: function () {
    this.data.loadMore && this._doAppendMasonry()
  },

  _doRefreshMasonry() {
    let that = this;
    this.masonryListComponent = this.selectComponent('#masonry');
    this.getData().then(res => {
      that.masonryListComponent.start(res).then(() => { })
    }).catch(() => {
      that.masonryListComponent.start([]).then(() => { })
    })
  },

  _doAppendMasonry() {
    let that = this;
    this.masonryListComponent = this.selectComponent('#masonry')
    // 获取接口数据后使用瀑布流组件append方法，当append完成后调用then，是否可触底价在的标志位可以在这里处理
    this.getData().then(res => {
      that.masonryListComponent.append(res).then(() => {
        console.log('refresh completed')
      })
    }).catch(() => {
      console.log('没有更多了')
    })
  },

  /**
   * 获取列表
   */
  getData: function () {
    return new Promise((resolve, reject) => {
      let that = this;
      let token = wx.getStorageSync('token');
      let gid = that.data.classificationId;

      wx.showLoading();
      app.util.request({
        'url': 'entry/wxapp/index',
        'data': {
          controller: 'recipe.get_fav_recipelist',
          token: token,
          pageNum: this.pageNum
        },
        dataType: 'json',
        success: function (res) {
          wx.stopPullDownRefresh();
          if (res.data.code == 0) {
            let list = res.data.data;
            that.pageNum++;
            resolve(list);
          } else {
            // 无数据
            let h = {
              loadMore: false
            }
            if (that.pageNum == 1) h.showEmpty = 1;
            that.setData(h);
            reject('');
          }
          wx.hideLoading();
        }
      })
    })
  }

})
