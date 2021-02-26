var app = getApp();
var status = require('../../utils/index.js');

Page({
  data: {
    list: []
  },
  coupon_id: '',
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
    let coupon_id = options.id || '';
    this.coupon_id = coupon_id;
  },

  onShow: function () {
    this.getData();
  },

  getData: function () {
    let coupon_id = this.coupon_id;
    let token = wx.getStorageSync('token');
    app.util.ProReq('user.collect_voucher', {
      token,
      coupon_id,
    }).then(res => {
      let list = res.list;
      this.setData({ list })
    })
      .catch(err => {})
  },

  receiveCoupon: function (event) {
    let idx = event.currentTarget.dataset.idx;
    var token = wx.getStorageSync('token');
    var list = this.data.list;
    var that = this;

    app.util.request({
      url: 'entry/wxapp/index',
      data: { controller: 'goods.getQuan', token, quan_id: list[idx].id },
      dataType: 'json',
      success: function (msg) {
        //1 被抢光了 2 已领过  3  领取成功
        if (msg.data.code == 0) {
          wx.showToast({
            title: msg.data.msg || '被抢光了',
            icon: 'none'
          })
        } else if (msg.data.code == 1) {
          list[idx].is_nomore = 1;
          list[idx].is_use = 1;
          that.setData({ list })
          wx.showToast({
            title: '被抢光了',
            icon: 'none'
          })
        } else if (msg.data.code == 2) {
          wx.showToast({
            title: '已领取',
            icon: 'none'
          })
          that.getData();
        }
        else if (msg.data.code == 4) {
          wx.showToast({
            title: '新人专享',
            icon: 'none'
          })
        }
        else if (msg.data.code == 3) {
          that.getData();
          wx.showToast({
            title: '领取成功',
          })
        } else if (msg.data.code == 4) {
          // 未登录
          app.util.message('请先登录', '/eaterplanet_ecommerce/pages/user/me', 'error');
        }
      }
    })
  }
})
