var app = getApp(), util = require("../../utils/util.js");

Page({
    data: {
        list: [],
        loadText: "加载中",
        loadMore: !1,
        noData: !1,
        state: [ "提现中", "提现成功", "提现失败" ]
    },
    page: 1,
    noMore: !1,
    onLoad: function(t) {
        this.getData();
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
                controller: "groupdo.tixian_record",
                token: t,
                page: this.page
            },
            dataType: "json",
            success: function(t) {
                if (wx.hideLoading(), 0 == t.data.code) {
                    var a = t.data.data;
                    a = e.data.list.concat(a), e.page++, e.setData({
                        list: a
                    });
                } else 1 == e.page && e.setData({
                    noData: !0
                }), e.noMore = !0, e.setData({
                    loadMore: !1
                });
            }
        });
    },
    onShow: function() {
        util.check_login_new().then(function(t) {
            t || wx.showModal({
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
    onPullDownRefresh: function() {},
    onReachBottom: function() {
        this.noMore || (this.setData({
            loadMore: !0
        }), this.getData());
    }
});