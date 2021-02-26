var app = getApp();

Page({
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

  getData: function(){
    let token = wx.getStorageSync('token');
    app.util.ProReq('supplymobile.supply_managemoney_panel', {token}).then(res=>{
     console.log(res)
     let { member_info, supply_commiss } = res.data;
     this.setData({ member_info, supply_commiss })
    }).catch(err=>{
      app.util.message(err.msg || '请求出错', '', 'error');
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
  }
})