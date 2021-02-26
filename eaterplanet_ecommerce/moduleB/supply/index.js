var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isIpx: app.globalData.isIpx,
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
    this.getData();
  },

  getData: function(){
    let that = this;
    const token = wx.getStorageSync('token');
    wx.showLoading();
    app.util.request({
      url: 'entry/wxapp/user',
      data: {
        controller: 'supplymobile.supplyindex_info',
        token
      },
      dataType: 'json',
      success: function(res) {
        wx.hideLoading();
        if (res.data.code == 0) {
          let {
            supply_info,
            wait_send_count,
            wait_refund_count,
            today_order_count,
            yestday_order_count,
            total_order_count,
            wait_statement_money,
            has_statement_money,
            has_get_money
          } = res.data.data;

          that.setData({
            supply_info,
            wait_send_count,
            wait_refund_count,
            today_order_count,
            yestday_order_count,
            total_order_count,
            wait_statement_money,
            has_statement_money,
            has_get_money
          });
        } else {
          app.util.message(res.data.msg, 'switchTo:/eaterplanet_ecommerce/pages/user/me', 'error');
        }
      }
    })
  },

  goLink: function (event) {
    let link = event.currentTarget.dataset.link;
    var pages_all = getCurrentPages();
    if (pages_all.length > 3) {
      wx.redirectTo({
        url: link
      })
    } else {
      wx.navigateTo({
        url: link
      })
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  }
})
