function _defineProperty(e, t, a) {
    return t in e ? Object.defineProperty(e, t, {
        value: a,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[t] = a, e;
}

var app = getApp(), util = require("../../utils/util.js");

Page({
    mixins: [ require("../../mixin/commonMixin.js") ],
    data: _defineProperty({
        info: [],
        member_info: {
            username: "",
            member_id: 1,
            avatar: "../../images/head-bitmap.png"
        }
    }, "info", {
        total_money: 0,
        share_name: "无"
    }),
    onLoad: function(e) {},
    onShow: function() {
        var t = this;
        util.check_login_new().then(function(e) {
            e ? (t.setData({
                needAuth: !1
            }), t.getUser(), t.getData()) : t.setData({
                needAuth: !0
            });
        });
    },
    authSuccess: function() {
        var e = this;
        this.setData({
            needAuth: !1
        }, function() {
            e.getUser(), e.getData();
        });
    },
    getData: function() {
        wx.showLoading();
        var e = wx.getStorageSync("token"), t = this;
        app.util.request({
            url: "entry/wxapp/user",
            data: {
                controller: "distribution.get_commission_info",
                token: e
            },
            dataType: "json",
            success: function(e) {
                wx.hideLoading(), 0 == e.data.code ? t.setData({
                    info: e.data.data
                }) : wx.showModal({
                    title: "提示",
                    content: e.data.msg,
                    showCancel: !1,
                    success: function(e) {
                        e.confirm && (console.log("用户点击确定"), wx.reLaunch({
                            url: "/lionfish_comshop/pages/user/me"
                        }));
                    }
                });
            }
        });
    },
    getUser: function() {
        var e = wx.getStorageSync("token"), a = this;
        app.util.request({
            url: "entry/wxapp/user",
            data: {
                controller: "user.get_user_info",
                token: e
            },
            dataType: "json",
            success: function(e) {
                if (wx.hideLoading(), 0 == e.data.code) {
                    var t = e.data.commiss_diy_name || "分销";
                    wx.setNavigationBarTitle({
                        title: "会员" + t
                    }), a.setData({
                        member_info: e.data.data
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
    goLink: function(e) {
        if (this.authModal()) {
            var t = e.currentTarget.dataset.link;
            3 < getCurrentPages().length ? wx.redirectTo({
                url: t
            }) : wx.navigateTo({
                url: t
            });
        }
    }
});