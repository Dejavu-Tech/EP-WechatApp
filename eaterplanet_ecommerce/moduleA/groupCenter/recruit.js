var app = getApp();
var util = require('../../utils/util.js');
var status = require('../../utils/index.js');

Page({
  mixins: [require('../../mixin/globalMixin.js')],
  data: {

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

  onLoad: function (options) {
    status.setNavBgColor();
    status.setGroupInfo().then((groupInfo) => {
      wx.setNavigationBarTitle({
        title: groupInfo.owner_name || '团长',
      })
    });

    let that = this;
    app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'community.get_apply_page'
      },
      dataType: 'json',
      success: function (res) {
        if (res.data.code == 0) {
          let article = res.data.data || '';
          that.setData({ article })
        }
      }
    })
  },

  onShow: function () {
    let that = this;
    util.check_login_new().then((res) => {
      that.setData({ needAuth: !res });
    })
  },

  authModal: function () {
    if (this.data.needAuth) {
      this.setData({ showAuthModal: !this.data.showAuthModal });
      return false;
    }
    return true;
  },

  authSuccess: function () {
    this.setData({
      needAuth: false,
      showAuthModal: false
    })
  },

  goLink: function (event) {
    if (!this.authModal()) return;
    let url = event.currentTarget.dataset.link;
    var pages_all = getCurrentPages();
    if (pages_all.length > 3) {
      wx.redirectTo({ url })
    } else {
      wx.navigateTo({ url })
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
