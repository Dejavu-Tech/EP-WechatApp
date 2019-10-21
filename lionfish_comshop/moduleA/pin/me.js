var app = getApp(), util = require("../../utils/util.js");

Page({
    data: {
        tabs: [ {
            id: 0,
            name: "全部"
        }, {
            id: 1,
            name: "拼团中"
        }, {
            id: 2,
            name: "拼团成功"
        }, {
            id: 3,
            name: "拼团失败"
        } ],
        order_status: 0,
        showEmpty: !1,
        list: [],
        loadMore: !0,
        loadText: "加载中...",
        loadOver: !1
    },
    pageNum: 1,
    onLoad: function(t) {
        this.getData();
    },
    changeTabs: function(t) {
        var a = this, e = t.currentTarget.dataset.type || 0;
        this.pageNum = 1, this.setData({
            order_status: e,
            list: [],
            showEmpty: !1,
            loadMore: !0,
            loadOver: !1
        }, function() {
            a.getData();
        });
    },
    onShow: function() {
        var a = this;
        util.check_login_new().then(function(t) {
            t ? a.setData({
                needAuth: !1
            }) : a.setData({
                needAuth: !0
            });
        });
    },
    authSuccess: function() {
        var t = this;
        this.pageNum = 1, this.setData({
            needAuth: !1,
            showEmpty: !1,
            list: [],
            loadMore: !0,
            loadText: "加载中...",
            loadOver: !1
        }, function() {
            t.getData();
        });
    },
    authModal: function() {
        return !this.data.needAuth || (this.setData({
            showAuthModal: !this.data.showAuthModal
        }), !1);
    },
    getData: function() {
        wx.showLoading();
        var r = this, t = wx.getStorageSync("token"), s = (this.orderId, this.pageNum);
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "user.group_orders",
                token: t,
                page: s,
                type: this.data.order_status
            },
            dataType: "json",
            success: function(t) {
                if (wx.hideLoading(), wx.stopPullDownRefresh(), 0 == t.data.code) {
                    var a = t.data.data, e = {};
                    1 == s && 0 == a.length && (e.showEmpty = !0);
                    var o = r.data.list;
                    a = a.concat(o), e.list = a, e.loadOver = !0, e.loadText = r.data.loadMore ? "加载中..." : "没有更多商品了~", 
                    r.setData(e, function() {
                        r.pageNum += 1;
                    });
                } else {
                    var n = {
                        loadMore: !1
                    };
                    1 == s && (n.showEmpty = !0), r.setData(n);
                }
            }
        });
    },
    goLink: function(t) {
        var a = getCurrentPages(), e = t.currentTarget.dataset.link, o = t.currentTarget.dataset.type || "";
        if ("ignore" == o) {
            var n = t.currentTarget.dataset.id;
            "ignore" == o && (e = "/lionfish_comshop/moduleA/pin/share?id=" + n);
        }
        3 < a.length ? wx.redirectTo({
            url: e
        }) : wx.navigateTo({
            url: e
        });
    },
    cancelOrder: function(t) {
        var a = t.currentTarget.dataset.type, e = wx.getStorageSync("token"), o = this;
        wx.showModal({
            title: "取消支付",
            content: "好不容易挑出来，确定要取消吗？",
            confirmColor: "#F75451",
            success: function(t) {
                t.confirm && app.util.request({
                    url: "entry/wxapp/index",
                    data: {
                        controller: "order.cancel_order",
                        token: e,
                        order_id: a
                    },
                    dataType: "json",
                    success: function(t) {
                        wx.showToast({
                            title: "取消成功",
                            icon: "success",
                            duration: 1e3
                        }), o.order();
                    }
                });
            }
        });
    },
    order: function(t) {
        var a = this;
        wx.getStorageSync("token");
        this.pageNum = 1, this.setData({
            showEmpty: !1,
            list: [],
            loadMore: !0,
            loadText: "加载中..."
        }, function() {
            a.getData();
        });
    },
    orderPay: function(t) {
        var a = wx.getStorageSync("token"), e = t.currentTarget.dataset.type;
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "car.wxpay",
                token: a,
                order_id: e
            },
            dataType: "json",
            method: "POST",
            success: function(t) {
                0 == t.data.code ? wx.requestPayment({
                    appId: t.data.appId,
                    timeStamp: t.data.timeStamp,
                    nonceStr: t.data.nonceStr,
                    package: t.data.package,
                    signType: t.data.signType,
                    paySign: t.data.paySign,
                    success: function(t) {
                        wx.redirectTo({
                            url: "/lionfish_comshop/moduleA/pin/share?id=" + e
                        });
                    },
                    fail: function(t) {
                        console.log(t);
                    }
                }) : 2 == t.data.code && wx.showToast({
                    title: t.data.msg,
                    icon: "none"
                });
            }
        });
    },
    onPullDownRefresh: function() {
        var t = this;
        this.pageNum = 1, this.setData({
            showEmpty: !1,
            list: [],
            loadMore: !0,
            loadText: "加载中..."
        }, function() {
            t.getData();
        });
    },
    onReachBottom: function() {
        console.log("这是我的底线"), this.data.loadMore && (this.setData({
            loadOver: !1
        }), this.getData());
    }
});