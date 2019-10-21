var util = require("../../utils/util.js"), location = require("../../utils/Location.js"), app = getApp();

Component({
    properties: {
        needAuth: {
            type: Boolean,
            value: !1
        },
        needPosition: {
            type: Boolean,
            value: !0
        },
        navBackUrl: {
            type: String,
            value: "",
            observer: function(t) {
                t && (app.globalData.navBackUrl = t);
            }
        }
    },
    attached: function() {
        this.getBg();
    },
    data: {
        btnLoading: !1,
        canIUse: wx.canIUse("button.open-type.getUserInfo")
    },
    methods: {
        getBg: function() {
            var o = this;
            app.util.request({
                url: "entry/wxapp/index",
                data: {
                    controller: "index.get_newauth_bg"
                },
                dataType: "json",
                success: function(t) {
                    if (o.setData({
                        loaded: !0
                    }), 0 == t.data.code) {
                        var e = t.data.data, a = e.newauth_bg_image, n = e.newauth_confirm_image, i = e.newauth_cancel_image;
                        o.setData({
                            newauth_bg_image: a,
                            newauth_confirm_image: n,
                            newauth_cancel_image: i
                        });
                    }
                }
            });
        },
        close: function() {
            this.triggerEvent("cancel");
        },
        bindGetUserInfo: function(t) {
            var e = this;
            if (!this.data.btnLoading) {
                var a = t.detail;
                this.setData({
                    btnLoading: !0
                }), "getUserInfo:ok" === a.errMsg ? util.login_prosime(e.data.needPosition).then(function() {
                    console.log("授权成功"), e.setData({
                        btnLoading: !1
                    }), wx.showToast({
                        title: "登录成功",
                        icon: "success",
                        duration: 2e3
                    }), e.triggerEvent("authSuccess"), app.globalData.changedCommunity = !0, e.data.needPosition && location.getGps();
                }).catch(function() {
                    e.triggerEvent("cancel"), console.log("授权失败");
                }) : (wx.showToast({
                    title: "授权失败，为了完整体验，获取更多优惠活动，需要您的授权。",
                    icon: "none"
                }), this.triggerEvent("cancel"), this.setData({
                    btnLoading: !1
                }));
            }
        }
    }
});