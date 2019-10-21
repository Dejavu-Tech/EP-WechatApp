var app = getApp(), util = require("../../utils/util.js");

Page({
    data: {
        community_id: "",
        name: "",
        mobile: "",
        is_login: !0
    },
    onLoad: function(t) {
        util.check_login() ? this.setData({
            is_login: !0
        }) : this.setData({
            is_login: !1
        });
        var e = decodeURIComponent(t.scene);
        if ("undefined" != e) {
            var o = e;
            this.setData({
                community_id: o
            });
        } else wx.showModal({
            title: "提示",
            content: "无效二维码，请重新获取！",
            showCancel: !1,
            success: function(t) {
                t.confirm && wx.redirectTo({
                    url: "/lionfish_comshop/pages/index/index"
                });
            }
        });
    },
    authSuccess: function() {
        this.setData({
            is_login: !0
        });
    },
    bindInfo: function() {
        var t = wx.getStorageSync("token"), e = this.data.name, o = this.data.mobile, i = this.data.community_id;
        return "" == e ? (wx.showToast({
            title: "请输入姓名！",
            icon: "none"
        }), !1) : "" != o && /^1(3|4|5|6|7|8|9)\d{9}$/.test(o) ? (wx.showLoading(), void app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "community.bind_community_member_do",
                token: t,
                community_id: i,
                name: e,
                mobile: o
            },
            dataType: "json",
            success: function(t) {
                0 == t.data.code && wx.showToast({
                    title: "绑定成功",
                    icon: "none"
                }, function() {
                    wx.redirectTo({
                        url: "/lionfish_comshop/pages/user/me"
                    });
                });
            }
        })) : (wx.showToast({
            title: "手机号码有误",
            icon: "none"
        }), !1);
    },
    getName: function(t) {
        console.log(t);
        var e = t.detail.value;
        this.setData({
            name: e
        });
    },
    getMobile: function(t) {
        console.log(t);
        var e = t.detail.value;
        this.setData({
            mobile: e
        });
    },
    onShow: function() {}
});