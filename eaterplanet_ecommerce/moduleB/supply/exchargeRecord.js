var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    loadText: '加载中',
    loadMore: false,
    noData: false
  },
  page: 1,
  noMore: false,
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
  onLoad: function(options) {
    this.getData();
  },

  getData: function() {
    wx.showLoading();
    var token = wx.getStorageSync('token');
    app.util.ProReq('supplymobile.supply_apply_flowlist', { token, page: this.page }).then(res => {
      let list = res.data;
      let oldList = this.data.list;
      list = oldList.concat(list);
      this.page++;
      this.setData({ list })
    }).catch(err => {
      console.log(err)
      if(err.code==1) {
        let h = {};
        if (this.page == 1) h.noData=true;
        this.noMore = true;
        h.loadMore = false;
        this.setData(h)
      } else {
        app.util.message(err.msg || '请求出错', '', 'error');
      }
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    this.noMore || (this.setData({ loadMore: true }), this.getData());
  }
})