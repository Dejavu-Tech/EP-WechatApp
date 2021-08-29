var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    needAuth: false,
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

  },

  authSuccess: function() {
    this.setData({ showAuthModal: false, needAuth: false });
  },

  formSubmit(e) {
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
    let code_sn = e.detail.value.code_sn || "";
    if(!code_sn) {
      wx.showToast({
        title: '请输入卡密',
        icon: "none"
      })
      return;
    }
    wx.showLoading();
    let token = wx.getStorageSync('token');
    app.util.ProReq('virtualcard.subOfflineCode', {
      token,
      code_sn
    }).then(res => {
      wx.hideLoading();
      wx.showModal({
        title: "提示",
        content: "您已成功充值"+res.money+"元",
        showCancel: false
      })
    }).catch(err => {
      wx.hideLoading();
      if(err.code==1) {
        //未登录
        this.setData({ showAuthModal: !this.data.showAuthModal, needAuth: true });
      } else {
        wx.showModal({
          title: "提示",
          content: err.message || "充值失败，请重试",
          showCancel: false
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  }
})