var page = 1;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    containerHeight: "",
    LoadingComplete: !1,
    loadText: "没有更多订单了~",
    orderDetail: {},
    rewardList: []
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
    var sysInfo = wx.getSystemInfoSync();
    this.setData({
      containerHeight: sysInfo.windowHeight,
      orderDetail: options
    })
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
    page = 1, wx.showLoading({
      title: "加载中...",
      mask: true
    }), this.data.rewardList = [], this.getDetailInfo();
  },

  /**
   * 获取订单详情
   */
  getDetailInfo: function(){
    console.log(211)
    wx.hideLoading();
  },

  getMoreList: function () {
    wx.showLoading({
      title: "加载中...",
      mask: true
    }), this.data.LoadingComplete ? (page += 1, this.getDetailInfo()) : wx.hideLoading();
  }
})
