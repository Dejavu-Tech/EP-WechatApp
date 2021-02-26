var app = getApp();

Component({
  externalClasses: ["i-class"],
  properties: {
    defaultImage: String,
    imgType: {
      type: Number,
      value: 2
    },
    loadImage: {
      type: String,
      observer: function (val) {
        if (val) {
          var pixelRatio = Math.ceil(app.globalData.systemInfo.pixelRatio),
            img = val + "?imageView2/" + this.data.imgType + "/w/" + this.getPx(this.data.width) * pixelRatio + "/h/" + this.getPx(this.data.height) * pixelRatio + "/ignore-error/1";
          this.setData({
            img: img
          });
        }
      }
    },
    width: String,
    height: String,
    canPreview: {
      type: Boolean,
      value: false
    },
    isLazy: {
      type: Boolean,
      value: false
    }
  },
  methods: {
    imageLoad: function () {
      this.setData({
        isLoad: true
      });
    },
    bindError: function (error) {
      console.log(error);
    },
    getPx: function (e) {
      var sysInfo = wx.getSystemInfoSync();
      console.log()
      return Math.round(sysInfo.windowWidth / 375 * e);
    },
    preview: function () {
      this.data.canPreview && wx.previewImage({
        urls: [this.data.loadImage],
        fail: function (error) {
          wx.showToast({
            title: "预览图片失败，请重试",
            icon: "none"
          }), console.log(error);
        }
      });
    }
  }
});