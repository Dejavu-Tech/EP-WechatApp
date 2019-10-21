var app = getApp();

Component({
    properties: {
        visible: {
            type: Boolean,
            value: !1
        }
    },
    methods: {
        close: function() {
            this.triggerEvent("cancel");
        },
        getPhoneNumber: function(e) {
            var t = this;
            wx.checkSession({
                success: function() {
                    console.log("session:", 1), t.getMobile(e);
                },
                fail: function() {
                    console.log("session:", 2), wx.removeStorageSync("token"), this.triggerEvent("cancel"), 
                    t.triggerEvent("needAuth");
                }
            });
        },
        getMobile: function(e) {
            var o = this;
            if ("getPhoneNumber:ok" === e.detail.errMsg) {
                var t = wx.getStorageSync("token");
                this.setData({
                    loading: !0
                }), wx.checkSession({
                    success: function() {
                        console.log("session_key有效"), app.util.request({
                            url: "entry/wxapp/user",
                            data: {
                                controller: "user.getPhoneNumber",
                                token: t,
                                encryptedData: e.detail.encryptedData,
                                iv: e.detail.iv
                            },
                            method: "post",
                            dataType: "json",
                            success: function(e) {
                                if (0 == e.data.code) {
                                    var t = e.data.phoneNumber;
                                    wx.setStorage({
                                        key: "mobile",
                                        data: t
                                    }), o.triggerEvent("confirm", t);
                                } else o.setData({
                                    visible: !1
                                }), wx.showToast({
                                    title: "授权失败",
                                    icon: "none"
                                });
                            }
                        });
                    },
                    fail: function() {
                        console.log("session_key 已经失效"), wx.removeStorageSync("token"), o.triggerEvent("needAuth");
                    }
                });
            } else o.setData({
                visible: !1
            }), wx.showToast({
                title: "授权失败",
                icon: "none"
            });
        }
    }
});