var page = 1;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    settlementList: [{
      id: "1",
      disSettleNo: "111111111111",
      settleNum: "111",
      totalAmount: "2222",
      payNo: "4444",
      createTime: "2018-12-16"
    }],
    loadText: "没有更多记录了~",
    LoadingComplete: !1,
    scrollTop: 0,
    containerHeight: 0,
    chooseDate: "",
    chooseDateTime: "",
    data: "",
    settle: "",
    communnityId: ""
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
  onLoad: function(options) {
    var sysInfo = wx.getSystemInfoSync();
    this.setData({
      containerHeight: sysInfo.windowHeight
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    page = 1, wx.showLoading({
      title: "加载中...",
      mask: true
    });
    var dayTime = new Date(),
      year = dayTime.getFullYear(),
      mon = dayTime.getMonth() + 1,
      dateTime = Date.parse(dayTime);
    this.setData({
      chooseDate: year + "年" + mon + "月",
      chooseDateTime: dateTime
    }), this.data.settlementList = [], this.getData();
  },

  /**
   * 获取数据
   */
  getData: function() {
    console.log(111)
    wx.hideLoading();
  },

  /**
   * 获取列表
   */
  getSettlementList: function() {
    console.log(222)
  },

  /**
   * 获取更多
   */
  getMoreList: function() {
    wx.showLoading({
      title: "加载中...",
      mask: true
    }), this.data.LoadingComplete ? (page += 1, this.getSettlementList()) : wx.hideLoading();
  },

  /**
   * 日期监控
   */
  bindDateChange: function(t) {
    page = 1, console.log("picker发送选择改变，携带值为", t.detail.value), this.setData({
      date: t.detail.value
    });
    var e = this.data.date.split("-"),
      a = Date.parse(this.data.date);
    this.setData({
      chooseDate: e[0] + "年" + e[1] + "月",
      chooseDateTime: a
    }), this.getData();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})
