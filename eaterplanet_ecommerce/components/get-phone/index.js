var app = getApp();

Component({
  properties: {
    visible: {
      type: Boolean,
      value: false
    }
  },
  methods: {
    close: function() {
      this.triggerEvent("cancel");
    },
    getPhoneNumber: function(res) {
      var that = this;
      wx.checkSession({
        success: function() {
          console.log("session:", 1), that.getMobile(res);
        },
        fail: function() {
          console.log("session:", 2), wx.removeStorageSync("token");
          that.triggerEvent("cancel");
          that.triggerEvent("needAuth");
        }
      });
    },
    getMobile: function(e) {
      var that = this;
      if ("getPhoneNumber:ok" === e.detail.errMsg) {
        var token = wx.getStorageSync('token');
        this.setData({
          loading: true
        });
        wx.checkSession({
          success() {
            console.log("session_key有效");
            app.util.request({
              'url': 'entry/wxapp/user',
              'data': {
                controller: 'user.getPhoneNumber',
                token: token,
                encryptedData: e.detail.encryptedData,
                iv: e.detail.iv
              },
              method: 'post',
              dataType: 'json',
              success: function (res) {
                if (res.data.code == 0) {
                  let phoneNumber = res.data.phoneNumber;
                  wx.setStorage({
                    key: "mobile",
                    data: phoneNumber
                  });
                  that.triggerEvent("confirm", phoneNumber);
                } else {
                  that.setData({
                    visible: false
                  });
                  wx.showToast({
                    title: "授权失败",
                    icon: "none"
                  });
                }
              }
            })
          },
          fail() {
            console.log("session_key 已经失效");
            wx.removeStorageSync("token");
            that.triggerEvent("needAuth");
          }
        })
      } else {
        that.setData({
          visible: false
        });
        wx.showToast({
          title: "授权失败",
          icon: "none"
        });
      }
    }
  }
});