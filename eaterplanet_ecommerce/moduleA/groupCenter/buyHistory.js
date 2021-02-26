var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    recordList: [{
      memberHeadPic: "../../images/head-bitmap.png",
      receiverName: "名字",
      orderNum: "111",
      createTime: "2018-09-12"
    }],
    refundList: [{
      userAvatar: "",
            orderUserName: "吃货星球",
      returnOrderCount: "222",
      createTime: "2018-09-12"
    }],
    currentTab: 0,
    navList: [{
      name: "购买记录",
      status: "0"
    }, {
      name: "退单记录",
      status: "1"
    }],
    LoadingComplete: !1,
    loadText: "没有更多了~",
    groupOrderStatus: "",
    containerHeight: 0,
    scrollTop: 0
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
    this.setData({
      recordList: this.data.recordList.map(function (t) {
        return t.isHide = false, t;
      }),
      groupOrderNo: options.groupOrderNo,
      skuId: options.skuId,
      containerHeight: app.globalData.systemInfo.windowHeight - Math.round(app.globalData.systemInfo.windowHeight / 375 * 10),
      groupOrderStatus: options.groupOrderStatus
    }), this.getList(this.data.currentTab);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 监控切换
   */
  bindChange: function (t) {
    this.setData({
      currentTab: 1 * t.detail.current
    }), this.getList(this.data.currentTab);
  },

  /**
   * 获取数据
   */
  getList: function (currentTab) {
    var a = this;
    wx.showLoading({
      title: "加载中...",
      mask: true
    })
    if ( 0 === currentTab ){
      console.log(222)
      wx.hideLoading()
    }
  },

  /**
   * 导航切换
   */
  switchNav: function (t) {
    if (this.data.currentTab === 1 * t.currentTarget.dataset.current) return !1;
    this.setData({
      currentTab: 1 * t.currentTarget.dataset.current
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})