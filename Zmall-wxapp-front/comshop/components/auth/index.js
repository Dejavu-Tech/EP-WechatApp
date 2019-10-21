var util = require("../../utils/util.js"), wcache = require("../../utils/wcache.js"), app = getApp(), flag = !0;

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
    data: {
        btnLoading: !1,
        isIpx: !1,
        auth_bg: "",
        loaded: !1
    },
    attached: function() {
        this.getBg(), app.globalData.isIpx && this.setData({
            isIpx: !0
        });
    },
    methods: {
        getBg: function() {
            var a = this, t = wcache.get("auth_bg", !1);
            t ? a.setData({
                auth_bg: t,
                loaded: !0
            }) : app.util.request({
                url: "entry/wxapp/index",
                data: {
                    controller: "index.get_auth_bg"
                },
                dataType: "json",
                success: function(t) {
                    a.setData({
                        loaded: !0
                    }), 0 == t.data.code && (wcache.put("auth_bg", t.data.data, 600), t.data.data && a.setData({
                        auth_bg: t.data.data
                    }));
                }
            });
        },
        bindGetUserInfo: function(t) {
            var a = this;
            if (!this.data.btnLoading) {
                var e = t.detail;
                this.setData({
                    btnLoading: !0
                }), "getUserInfo:ok" === e.errMsg ? util.login_prosime(a.data.needPosition).then(function() {
                    console.log("授权成功"), a.setData({
                        btnLoading: !1
                    }), wx.showToast({
                        title: "登录成功",
                        icon: "success",
                        duration: 2e3
                    }), a.triggerEvent("authSuccess");
                }).catch(function() {
                    console.log("授权失败");
                }) : (wx.showToast({
                    title: "授权失败，为了完整体验，获取更多优惠活动，需要您的授权。",
                    icon: "none"
                }), this.setData({
                    btnLoading: !1
                }));
            }
        },
        bindGetUserInfoTwo: function(t) {
            var a = this;
            (wx.showLoading({
                title: "授权中"
            }), flag) && (flag = !1, "getUserInfo:ok" === t.detail.errMsg ? util.login_prosime().then(function() {
                console.log("授权成功"), wx.hideLoading(), flag = !0, wx.showToast({
                    title: "登录成功",
                    icon: "success",
                    duration: 2e3
                }), a.triggerEvent("authSuccess");
            }).catch(function() {
                flag = !0, wx.hideLoading(), console.log("授权失败");
            }) : (wx.hideLoading(), wx.showToast({
                title: "授权失败，为了完整体验，获取更多优惠活动，需要您的授权。",
                icon: "none"
            }), flag = !0));
        }
    }
});