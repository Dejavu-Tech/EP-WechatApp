var t = getApp();

Component({
  data: {
    isIpx: false
  },
  attached: function () {
    t.globalData.isIpx && this.setData({
      isIpx: true
    });
  }
});