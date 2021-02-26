var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    total_getorder_count: 0,
    system_send_ordercount: 0,
    has_send_count: 0,
    total_commiss_money: 0
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

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getData();
  },

  getData: function () {
    let token = wx.getStorageSync('token');
    app.util.ProReq('localtown.get_distribution_statics', { token }).then(res => {
      console.log(res)
      let { total_getorder_count, system_send_ordercount, has_send_count, total_commiss_money } = res.data;
      this.setData({
        total_getorder_count, system_send_ordercount, has_send_count, total_commiss_money
      })
    }).catch(err => {
      console.log(err)
      app.util.message(err.msg || '请求出错', 'switchTo:/eaterplanet_ecommerce/pages/user/me', 'error');
    })
  }

})
