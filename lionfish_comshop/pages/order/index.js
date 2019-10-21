var util = require("../../utils/util.js"), app = getApp();

Page({
    data: {
        tablebar: 4,
        page: 1,
        theme_type: "",
        loadover: !1,
        order_status: -1,
        no_order: 0,
        hide_tip: !0,
        order: [],
        tip: "正在加载",
        is_empty: !1
    },
    onLoad: function(t) {
        wx.getStorageSync("token");
        var e = t.order_status, a = t.is_show, r = t.isfail;
        wx.showLoading(), this.setData({
            loadover: !0
        }), null == e && (e = -1), this.setData({
            order_status: e
        }), null != a && 1 == a ? wx.showToast({
            title: "支付成功"
        }) : null != r && 1 == r && wx.showToast({
            title: "支付失败",
            icon: "none"
        }), this.getData();
    },
    onReachBottom: function() {
        if (1 == this.data.no_order) return !1;
        this.data.page += 1, this.getData(), this.setData({
            isHideLoadMore: !1
        });
    },
    goGoods: function(t) {
        var e = t.currentTarget.dataset.type;
        3 < getCurrentPages().length ? wx.redirectTo({
            url: "/Snailfish_shop/pages/goods/index?id=" + e
        }) : wx.navigateTo({
            url: "/Snailfish_shop/pages/goods/index?id=" + e
        });
    },
    getData: function() {
        this.setData({
            isHideLoadMore: !0
        }), this.data.no_order = 1;
        var a = this, t = wx.getStorageSync("token");
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "order.orderlist",
                token: t,
                page: a.data.page,
                order_status: a.data.order_status
            },
            dataType: "json",
            success: function(t) {
                if (wx.hideLoading(), 0 != t.data.code) return 1 == a.data.page && a.data.order.length <= 0 && a.setData({
                    is_empty: !0
                }), a.setData({
                    isHideLoadMore: !0
                }), !1;
                var e = a.data.order.concat(t.data.data);
                a.setData({
                    order: e,
                    hide_tip: !0,
                    no_order: 0
                });
            }
        });
    },
    expressOrder: function(t) {
        var e = t.currentTarget.dataset.type;
        wx.navigateTo({
            url: "/Snailfish_shop/pages/order/goods_express?id=" + e
        });
    },
    goLink2: function(t) {
        var e = t.currentTarget.dataset.link;
        3 < getCurrentPages().length ? wx.redirectTo({
            url: e
        }) : wx.navigateTo({
            url: e
        });
    },
    goLink: function(t) {
        var e = t.currentTarget.dataset.link;
        wx.reLaunch({
            url: e
        });
    },
    goOrder: function(t) {
        var e = t.currentTarget.dataset.type;
        3 < getCurrentPages().length ? wx.redirectTo({
            url: "/lionfish_comshop/pages/order/order?id=" + e
        }) : wx.navigateTo({
            url: "/lionfish_comshop/pages/order/order?id=" + e
        });
    },
    receivOrder: function(t) {
        var e = t.currentTarget.dataset.type, a = t.currentTarget.dataset.delivery, r = wx.getStorageSync("token");
        var o = this;
        wx.showModal({
            title: "提示",
            content: "确认收到",
            confirmColor: "#F75451",
            success: function(t) {
                t.confirm && app.util.request({
                    url: "entry/wxapp/index",
                    data: {
                        controller: "order.receive_order",
                        token: r,
                        order_id: e
                    },
                    dataType: "json",
                    success: function(t) {
                        0 == t.data.code && (wx.showToast({
                            title: "收货成功",
                            icon: "success",
                            duration: 1e3
                        }), o.order(o.data.order_status));
                    }
                });
            }
        });
    },
    cancelOrder: function(t) {
        var e = t.currentTarget.dataset.type, a = wx.getStorageSync("token"), r = this;
        wx.showModal({
            title: "取消支付",
            content: "好不容易挑出来，确定要取消吗？",
            confirmColor: "#F75451",
            success: function(t) {
                t.confirm && app.util.request({
                    url: "entry/wxapp/index",
                    data: {
                        controller: "order.cancel_order",
                        token: a,
                        order_id: e
                    },
                    dataType: "json",
                    success: function(t) {
                        wx.showToast({
                            title: "取消成功",
                            icon: "success",
                            duration: 1e3
                        }), r.order(r.data.order_status);
                    }
                });
            }
        });
    },
    getOrder: function(t) {
        this.setData({
            is_empty: !1
        }), wx.showLoading();
        var e = t.currentTarget.dataset.type;
        this.order(e);
    },
    order: function(t) {
        wx.getStorageSync("token");
        this.setData({
            order_status: t,
            order: [],
            no_order: 0,
            page: 1
        }), this.getData();
    },
    guess_goods: function() {
        var e = this;
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "index.load_index_pintuan",
                store_id: 1,
                per_page: 8,
                is_index_show: 1,
                orderby: "rand",
                page: 1
            },
            dataType: "json",
            success: function(t) {
                t.data.data && 0 < t.data.data.length && e.setData({
                    showguess: !1,
                    guessdata: t.data.data
                });
            }
        });
    },
    orderComment: function(t) {
        wx.getStorageSync("token");
        var e = t.currentTarget.dataset.type;
        3 < getCurrentPages().length ? wx.redirectTo({
            url: "/Snailfish_shop/pages/order/comment?id=" + e
        }) : wx.navigateTo({
            url: "/Snailfish_shop/pages/order/comment?id=" + e
        });
    },
    orderPay: function(t) {
        var e = wx.getStorageSync("token"), a = t.currentTarget.dataset.type;
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "car.wxpay",
                token: e,
                order_id: a
            },
            dataType: "json",
            method: "POST",
            success: function(t) {
                if (0 == t.data.code) {
                    t.data.is_pin;
                    wx.requestPayment({
                        appId: t.data.appId,
                        timeStamp: t.data.timeStamp,
                        nonceStr: t.data.nonceStr,
                        package: t.data.package,
                        signType: t.data.signType,
                        paySign: t.data.paySign,
                        success: function(t) {
                            wx.redirectTo({
                                url: "/lionfish_comshop/pages/order/order?id=" + a + "&is_show=1"
                            });
                        },
                        fail: function(t) {
                            console.log(t);
                        }
                    });
                } else 2 == t.data.code && wx.showToast({
                    title: t.data.msg,
                    icon: "none"
                });
            }
        });
    },
    onPullDownRefresh: function() {
        this.setData({
            is_empty: !1,
            page: 1,
            order: []
        }), wx.showLoading(), this.getData(), wx.stopPullDownRefresh();
    }
});