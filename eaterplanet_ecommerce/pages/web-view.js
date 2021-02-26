function prop(e, a, t) {
  return a in e ? Object.defineProperty(e, a, {
    value: t,
    enumerable: !0,
    configurable: !0,
    writable: !0
  }) : e[a] = t, e;
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    url: "",
    shareMessage: {
      title: "",
      path: "",
      imageUrl: ""
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // let url = decodeURIComponent(options.url) + "?" + Math.random();
    let url = decodeURIComponent(options.url);
    options.url && this.setData(prop({
      url: url
    }, "shareMessage.path", "/eaterplanet_ecommerce/pages/web-view?url=" + url));
    console.log("webviewUrl", this.data.url);
  },

  getPostMessage: function (e) {
    var a = e.detail;
    console.log("收到的信息", a);
    var shareMessage = Object.assign({}, this.data.shareMessage, a.data[0]);
    this.setData({
      shareMessage: shareMessage
    }), wx.showShareMenu({
      withShareTicket: !0,
      success: function () {
        console.log("成功");
      },
      fail: function () {
        console.log("失败");
      }
    }), wx.updateShareMenu();
  },

  onPageLoad: function (e) {
    e.detail;
  },

  onPageError: function (e) {
    e.detail;
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return console.log(this.data.shareMessage), Object.assign({}, this.data.shareMessage, {
      success: function () {
        console.log("share succeed");
      },
      error: function () {
        console.log("share failed");
      }
    });
  }
})
