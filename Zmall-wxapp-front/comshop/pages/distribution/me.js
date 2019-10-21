var app = getApp(), util = require("../../utils/util.js");

Page({
    data: {
        info: [],
        member_info: {}
    },
    onLoad: function(t) {
        util.check_login() ? (this.getUser(), this.getData()) : this.setData({
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
        var t = wx.getStorageSync("token"), e = this;
        app.util.request({
            url: "entry/wxapp/user",
            data: {
                controller: "distribution.get_commission_info",
                token: t
            },
            dataType: "json",
            success: function(t) {
                wx.hideLoading(), 0 == t.data.code ? e.setData({
                    info: t.data.data
                }) : wx.showModal({
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
    getUser: function() {
        var t = wx.getStorageSync("token"), a = this;
        app.util.request({
            url: "entry/wxapp/user",
            data: {
                controller: "user.get_user_info",
                token: t
            },
            dataType: "json",
            success: function(t) {
                if (wx.hideLoading(), 0 == t.data.code) {
                    var e = t.data.commiss_diy_name || "分销";
                    wx.setNavigationBarTitle({
                        title: "会员" + e
                    }), a.setData({
                        member_info: t.data.data
                    });
                } else a.setData({
                    needAuth: !0
                }), wx.setStorage({
                    key: "member_id",
                    data: null
                });
            }
        });
    },
    onShow: function() {}
});