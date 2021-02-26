var app = getApp();

Page({

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    wx.showLoading();
    this.get_article();
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
   * 获取列表
   */
  get_article: function () {
    let that = this;
    app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'group.pintuan_slides'
      },
      dataType: 'json',
      success: function (res) {
        wx.hideLoading();
        if (res.data.code == 0) {
          let { pintuan_publish } = res.data;
          that.setData({ pintuan_publish })
        }
      }
    })
  }
})