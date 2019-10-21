var app = getApp(), util = require("../../utils/util.js");

Page({
    data: {},
    onLoad: function(t) {
        util.check_login() ? this.getData() : this.setData({
            needAuth: !0
        });
    },
    authSuccess: function() {
        var t = this;
        this.setData({
            needAuth: !1
        }, function() {
            t.getData();
        });
    },
    getData: function() {
        wx.showLoading();
        var t = wx.getStorageSync("token"), a = this;
        app.util.request({
            url: "entry/wxapp/user",
            data: {
                controller: "distribution.get_parent_agent_info",
                token: t
            },
            dataType: "json",
            success: function(t) {
                wx.hideLoading(), 0 == t.data.code ? (console.log(t.data.data), a.setData({
                    info: t.data.data
                })) : wx.showModal({
                    title: "提示",
                    content: t.data.msg,
                    showCancel: !1,
                    success: function(t) {
                        t.confirm && (console.log("用户点击确定"), wx.reLaunch({
                            url: "/lionfish_comshop/pages/user/me"
                        }));
                    }
                });
            }
        });
    },
    onShow: function() {}
});