var app = getApp();

Page({
  onLoad: function (options) {
    let type = options.type || "";
    if (!type) {
      wx.showModal({
        title: '提示',
        content: '参数错误',
        showCancel: false,
        confirmColor: '#F75451',
        success(res) {
          if (res.confirm) {
            wx.navigateBack()
          }
        }
      })
      return false;
    }
    let navTitle = {
      vipcard: '权益规则',
      pintuan: '拼团规则',
      signin: '活动规则',
      solitaire: '接龙规则'
    }
    wx.setNavigationBarTitle({
      title: navTitle[type] || '规则'
    })
    wx.showLoading();
    this.getData(type);
  },

  getData: function (type) {
    wx.showLoading();
    let urls = {
      vipcard: 'vipcard.get_vipcard_baseinfo',
      pintuan: 'group.pintuan_slides',
      signin: 'signinreward.get_signinreward_baseinfo',
      solitaire: 'solitaire.get_rule'
    }
    var token = wx.getStorageSync('token');
    let that = this;
    app.util.request({
      url: 'entry/wxapp/user',
      data: {
        controller: urls[type],
        token: token
      },
      dataType: 'json',
      success: function (res) {
        wx.hideLoading();
        if (res.data.code == 0) {
          let article = '';
          if (type == 'vipcard') {
            let { vipcard_buy_pagenotice } = res.data.data;
            article = vipcard_buy_pagenotice;
          } else if (type == 'pintuan') {
            let { pintuan_publish } = res.data;
            article = pintuan_publish;
          } else if (type == 'signin') {
            let { signinreward_pagenotice } = res.data.data;
            article = signinreward_pagenotice;
          } else if (type == 'solitaire') {
            let { solitaire_notice } = res.data;
            article = solitaire_notice;
          }
          that.setData({ article })
        }
      }
    })
  }
})