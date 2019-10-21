var app = getApp(), util = require("../../utils/util.js");

Page({
    data: {
        loadText: "正在加载",
        LoadingComplete: !0,
        currentTab: 1,
        no_order: 0,
        page: 1,
        hide_tip: !0,
        order: [],
        tip: "正在加载"
    },
    onLoad: function(t) {
        var a = t.type;
        this.setData({
            currentTab: a
        }), this.getData();
    },
    getData: function() {
        wx.showLoading({
            title: "加载中...",
            mask: !0
        }), this.setData({
            isHideLoadMore: !0
        }), this.data.no_order = 1;
        var e = this, t = (this.data.chooseDate, wx.getStorageSync("token")), a = this.data.currentTab, o = 1;
        1 == a ? o = 1 : 2 == a && (o = 2), app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "community.headorderlist",
                token: t,
                page: e.data.page,
                order_status: o
            },
            method: "post",
            dataType: "json",
            success: function(t) {
                if (0 != t.data.code) return e.setData({
                    isHideLoadMore: !0
                }), wx.hideLoading(), !1;
                console.log(e.data.page);
                var a = e.data.order.concat(t.data.data);
                e.setData({
                    order: a,
                    hide_tip: !0,
                    no_order: 0
                }), wx.hideLoading();
            }
        });
    },
    onReady: function() {},
    onShow: function() {},
    switchTab: function(t) {
        var a = t.currentTarget.dataset.type || 1;
        this.setData({
            currentTab: a,
            page: 1,
            order: []
        }), this.getData();
    },
    onHide: function() {},
    onUnload: function() {},
    onPullDownRefresh: function() {},
    onReachBottom: function() {
        if (1 == this.data.no_order) return !1;
        this.data.page += 1, this.getData(), this.setData({
            isHideLoadMore: !1
        });
    },
    onShareAppMessage: function() {}
});