var app = getApp(), util = require("../../utils/util.js"), memberId = "";

Page({
    data: {
        checkedAll: !0,
        checkedCount: 0,
        is_check_all: !1,
        needAuth: !1,
        memberId: 0,
        order: [],
        param: [],
        isIpx: !1
    },
    onLoad: function(e) {
        if (app.globalData.isIpx && this.setData({
            isIpx: !0
        }), null != e.scene) {
            var t = decodeURIComponent(e.scene);
            "undefined" != t && (e.memberId = t);
        }
        memberId = e.memberId, this.setData({
            memberId: memberId
        }), util.check_login() ? (console.log("peding login in "), this.getData()) : this.setData({
            needAuth: !0
        });
    },
    authSuccess: function() {
        this.setData({
            needAuth: !1
        }), this.getData();
    },
    getData: function() {
        wx.showLoading({
            title: "加载中...",
            mask: !0
        });
        var a = this, e = wx.getStorageSync("token");
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "community.get_member_ziti_order",
                memberId: a.data.memberId,
                token: e
            },
            dataType: "json",
            success: function(e) {
                if (0 == e.data.code) {
                    var t = a.data.order.concat(e.data.data).filter(function(e) {
                        return "express" != e.delivery;
                    });
                    0 < t.length && a.setData({
                        order: t,
                        checkedCount: t.length,
                        checkedAll: !0,
                        is_check_all: !0
                    });
                } else 1 == e.data.code ? a.setData({
                    order: []
                }) : e.data.code;
                wx.hideLoading();
            }
        });
    },
    transformOrderStatus: function(e) {
        switch (Number(e)) {
          case 1:
            return "待提货";

          case 4:
            return "待配送";

          default:
            return "";
        }
    },
    checkboxChange: function(e) {
        var t = e.currentTarget.dataset.type, a = e.currentTarget.dataset.index, o = this.data.order, n = (e.detail.value, 
        this.data.checkedAll, this.data.is_check_all);
        if ("all" === t) n ? o.forEach(function(e) {
            e.checked = 0;
        }) : o.forEach(function(e) {
            e.checked = 1;
        }), this.setData({
            checkedCount: o.length,
            order: o,
            is_check_all: !n,
            checkedAll: !n
        }); else if ("order" === t) {
            o.forEach(function(e, t) {
                a == t && (e.checked ? e.checked = 0 : e.checked = 1);
            });
            var i = 0;
            o.forEach(function(e) {
                e.checked && i++;
            }), this.setData({
                checkedCount: i,
                order: o,
                is_check_all: i == o.length,
                checkedAll: i == o.length
            });
        }
    },
    sign: function(e) {
        var t = this;
        e.target.dataset.orderno, e.target.dataset.orderskuid;
        wx.showModal({
            title: "商品提货确认",
            content: "请确认买家已收到货，再进行提货确认哦！",
            confirmText: "确定",
            confirmColor: "#FF673F",
            success: function(e) {
                if (e.confirm) {
                    wx.showLoading({
                        title: "加载中...",
                        mask: !0
                    });
                    t.getData(), wx.showToast({
                        title: "商品提货成功",
                        icon: "none"
                    });
                } else wx.hideLoading();
            }
        });
    },
    signOrder: function(e) {
        wx.showLoading({
            title: "加载中...",
            mask: !0
        });
        var t = this;
        e.target.dataset.orderid;
        wx.showModal({
            title: "订单提货确认",
            content: "请确认买家已收改订单的所有商品，再进行提货确认哦！",
            confirmText: "确定",
            confirmColor: "#FF673F",
            success: function(e) {
                if (e.confirm) {
                    wx.hideLoading();
                    t.getData(), wx.showToast({
                        title: "订单提货成功",
                        icon: "none"
                    });
                } else wx.hideLoading();
            }
        });
    },
    signAll: function() {
        var t = this, e = this.data.order, a = [];
        if (e.forEach(function(e) {
            e.checked && a.push(e.order_id);
        }), a.length <= 0) return wx.showToast({
            title: "请选择签收商品"
        }), !1;
        var o = wx.getStorageSync("token");
        wx.showModal({
            title: "订单提货确认",
            content: "请确认买家已收选中的商品，再进行提货确认哦！",
            confirmText: "确定",
            confirmColor: "#FF673F",
            success: function(e) {
                e.confirm && (wx.showLoading({
                    title: "加载中...",
                    mask: !0
                }), app.util.request({
                    url: "entry/wxapp/index",
                    data: {
                        controller: "order.receive_order_list",
                        order_data: a,
                        token: o
                    },
                    method: "post",
                    dataType: "json",
                    success: function(e) {
                        wx.hideLoading(), 0 == e.data.code ? (t.setData({
                            order: []
                        }), t.getData(), console.log("iniinin"), wx.showToast({
                            title: "订单提货成功",
                            icon: "none"
                        })) : wx.showToast({
                            title: "订单提货失败",
                            icon: "none"
                        });
                    }
                }));
            }
        });
    },
    copyGoodsMsg: function() {
        if (0 !== this.data.checkedCount) {
            var t = "";
            this.data.list.forEach(function(e) {
                e.skuRspS.forEach(function(e) {
                    e.checked && (t += ",【" + e.skuName + "】" + e.spec + "*" + e.skuNum);
                });
            }), wx.setClipboardData({
                data: t.substring(1),
                success: function() {
                    wx.showToast({
                        title: "复制成功",
                        icon: "none"
                    });
                },
                fail: function(e) {
                    wx.showToast({
                        title: "复制失败，请重试",
                        icon: "none"
                    }), console.log(e);
                }
            });
        } else wx.showToast({
            title: "请选择商品",
            icon: "none"
        });
    }
});