var app = getApp(), util = require("../../utils/util.js");

Page({
    data: {},
    member_id: 0,
    onLoad: function(t) {
        var e = t.memberId || 0;
        if (!e) return wx.showToast({
            title: "参数错误",
            icon: "none"
        }), void setTimeout(function() {
            wx.redirectTo({
                url: "/lionfish_comshop/distributionCenter/pages/member"
            });
        }, 1e3);
        this.member_id = e;
    },
    onShow: function() {
        var e = this;
        util.check_login_new().then(function(t) {
            t ? e.getData() : wx.showModal({
                title: "提示",
                content: "您还未登录",
                showCancel: !1,
                success: function(t) {
                    t.confirm && wx.switchTab({
                        url: "/lionfish_comshop/pages/user/me"
                    });
                }
            });
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
                controller: "distribution.get_parent_agent_info_bymemberid",
                token: t,
                member_id: e.member_id
            },
            dataType: "json",
            success: function(t) {
                wx.hideLoading(), 0 == t.data.code ? (console.log(t.data.data), e.setData({
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
    }
});