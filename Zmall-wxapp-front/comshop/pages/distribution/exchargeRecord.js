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
        var t = wx.getStorageSync("token"), e = this;
        app.util.request({
            url: "entry/wxapp/user",
            data: {
                controller: "distribution.tixian_record",
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
    onShow: function() {},
    onPullDownRefresh: function() {},
    onReachBottom: function() {
        this.noMore || (this.setData({
            loadMore: !0
        }), this.getData());
    }
});