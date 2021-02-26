var app = getApp();

Component({
  externalClasses: ["i-class", "i-class-mask"],
  properties: {
    visible: {
      type: Boolean,
      value: !1,
      observer: function(e) {
        var that = this;
        this.data.closeDelay ? setTimeout(function() {
          that.setData({
            isShow: e
          });
        }, this.data.closeDelay) : this.setData({
          isShow: e
        });
      }
    },
    maskClosable: {
      type: Boolean,
      value: true
    },
    scrollUp: {
      type: Boolean,
      value: true
    },
    closeDelay: {
      type: Number,
      value: 0
    }
  },
  data: {
    isIpx: false,
    isShow: false
  },
  attached: function() {
    this.setData({
      isIpx: app.globalData.isIpx
    });
  },
  methods: {
    stopMove: function() {},
    handleClickMask: function() {
      this.data.maskClosable && this.handleClickCancel();
    },
    handleClickCancel: function() {
      this.triggerEvent("cancel");
    }
  }
});