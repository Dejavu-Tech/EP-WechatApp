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
    app.setShareConfig();
    status.setNavBgColor();
    let that = this;
    app.util.request({
      'url': 'entry/wxapp/index',
      'data': {
        controller: 'supply.get_apply_page'
      },
      dataType: 'json',
      success: function (res) {
        let supply_diy_name = res.data.supply_diy_name || '商户';
        wx.setNavigationBarTitle({
          title: supply_diy_name,
        })
        that.setData({ supply_diy_name })
        if (res.data.code == 0) {
          console.log(res)
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

  /**
   * 授权成功回调
   */
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

  },

  onShareTimeline: function () {

  }
})
