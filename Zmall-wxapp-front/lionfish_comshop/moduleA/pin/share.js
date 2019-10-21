var app = getApp(), util = require("../../utils/util.js");

Page({
    data: {
        seconds: 0,
        surplus: 0,
        likeList: []
    },
    orderId: "",
    onLoad: function(t) {
        var e = t.id, a = t.share_id;
        "undefined" != a && 0 < t.share_id && wx.setStorageSync("share_id", a), console.log(e);
        var i = decodeURIComponent(t.scene);
        if ("undefined" != i && "" != i && (e = i), void 0 === e) return wx.showModal({
            title: "提示",
            content: "参数错误",
            showCancel: !1,
            confirmColor: "#F75451",
            success: function(t) {
                t.confirm && wx.redirectTo({
                    url: "/lionfish_comshop/pages/index/index"
                });
            }
        }), !1;
        this.orderId = e, this.getData(), this.getLikeList();
    },
    onShow: function() {
        var e = this;
        util.check_login_new().then(function(t) {
            t ? e.setData({
                needAuth: !1
            }) : e.setData({
                needAuth: !0
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
    authModal: function() {
        return !this.data.needAuth || (this.setData({
            showAuthModal: !this.data.showAuthModal
        }), !1);
    },
    getData: function() {
        wx.showLoading();
        var k = this, t = wx.getStorageSync("token"), e = this.orderId;
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "groupdo.group_info",
                token: t,
                order_id: e
            },
            dataType: "json",
            success: function(t) {
                if (wx.hideLoading(), 0 == t.data.code) {
                    var e = t.data.data, a = e.order_goods, i = e.goods_info, o = e.options, s = e.pin_info, r = e.share_title, n = e.pin_order_arr, d = e.me_take_in, u = e.is_me, c = e.interface_get_time, _ = e.order_id, l = e.order_type;
                    i.goods_id = a.goods_id;
                    var h = {
                        goods_id: a.goods_id,
                        pin_id: s.pin_id
                    }, g = Date.parse(new Date()), p = 1e3 * (s.end_time - c) + g, f = i.pin_count - n.length;
                    k.setData({
                        seconds: 0 < p ? p : 0,
                        order: h,
                        order_goods: a,
                        goods_info: i,
                        options: o,
                        pin_info: s,
                        share_title: r,
                        pin_order_arr: n,
                        me_take_in: d,
                        is_me: u,
                        interface_get_time: c,
                        order_id: _,
                        surplus: f,
                        order_type: l
                    });
                } else wx.showModal({
                    title: "提示",
                    content: "无数据",
                    showCancel: !1,
                    confirmColor: "#F75451",
                    success: function(t) {
                        t.confirm && wx.switchTab({
                            url: "/lionfish_comshop/pages/index/index"
                        });
                    }
                });
            }
        });
    },
    getLikeList: function() {
        var o = this, t = (wx.getStorageSync("token"), this.orderId);
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "group.pintuan_like_list",
                order_id: t
            },
            dataType: "json",
            success: function(t) {
                if (console.log(t), 0 == t.data.code) {
                    var e = t.data, a = e.is_show_order_guess_like, i = e.list;
                    o.setData({
                        is_show_order_guess_like: a,
                        likeList: i || []
                    });
                } else console.log("猜你喜欢无数据");
            }
        });
    },
    goLink: function(t) {
        var e = getCurrentPages(), a = t.currentTarget.dataset.link;
        6 < e.length ? wx.redirectTo({
            url: a
        }) : wx.navigateTo({
            url: a
        });
    },
    openSku: function() {
        if (this.authModal()) {
            var t = this, e = t.data, a = e.order, i = e.options;
            a.buy_type = "pintuan", a.quantity = 1, t.setData({
                order: a
            });
            a.goods_id;
            var o = i.list || [], s = [];
            if (0 < o.length) {
                for (var r = 0; r < o.length; r++) {
                    var n = o[r].option_value[0], d = {
                        name: n.name,
                        id: n.option_value_id,
                        index: r,
                        idx: 0
                    };
                    s.push(d);
                }
                for (var u = "", c = 0; c < s.length; c++) c == s.length - 1 ? u += s[c].id : u = u + s[c].id + "_";
                var _ = i.sku_mu_list[u];
                t.setData({
                    sku: s,
                    sku_val: 1,
                    cur_sku_arr: _,
                    skuList: i,
                    visible: !0,
                    showSku: !0,
                    is_just_addcar: 0
                });
            } else t.setData({
                sku: [],
                sku_val: 1,
                cur_sku_arr: {},
                skuList: []
            }, function() {
                t.goOrder();
            });
        }
    },
    goOrder: function() {
        var s = this;
        s.data.can_car && (s.data.can_car = !1);
        var t = this.data, e = t.order, a = t.cur_sku_arr, i = t.sku_val, o = wx.getStorageSync("token"), r = e.goods_id, n = i, d = "", u = e.buy_type, c = e.pin_id;
        a && a.option_item_ids && (d = a.option_item_ids), app.util.request({
            url: "entry/wxapp/user",
            data: {
                controller: "car.add",
                token: o,
                goods_id: r,
                community_id: 0,
                quantity: n,
                sku_str: d,
                buy_type: u,
                pin_id: c,
                is_just_addcar: 0
            },
            dataType: "json",
            method: "POST",
            success: function(t) {
                if (3 == t.data.code) wx.showToast({
                    title: t.data.msg,
                    icon: "none",
                    duration: 2e3
                }); else if (4 == t.data.code) wx.hideLoading(), s.setData({
                    needAuth: !0,
                    showAuthModal: !0,
                    visible: !1
                }); else if (6 == t.data.code) {
                    var e = t.data.msg, a = t.data.max_quantity || "";
                    0 < a && s.setData({
                        sku_val: a
                    }), wx.showToast({
                        title: e,
                        icon: "none",
                        duration: 2e3
                    });
                } else {
                    var i = getCurrentPages(), o = "/lionfish_comshop/pages/order/placeOrder?type=" + u;
                    3 < i.length ? wx.redirectTo({
                        url: o
                    }) : wx.navigateTo({
                        url: o
                    });
                }
            }
        });
    },
    selectSku: function(t) {
        var e = t.currentTarget.dataset.type.split("_"), a = this.data.sku, i = {
            name: e[3],
            id: e[2],
            index: e[0],
            idx: e[1]
        };
        a.splice(e[0], 1, i), this.setData({
            sku: a
        });
        for (var o = "", s = 0; s < a.length; s++) s == a.length - 1 ? o += a[s].id : o = o + a[s].id + "_";
        var r = this.data.skuList.sku_mu_list[o];
        this.setData({
            cur_sku_arr: r
        }), console.log(o);
    },
    setNum: function(t) {
        var e = t.currentTarget.dataset.type, a = 1, i = 1 * this.data.sku_val;
        "add" == e ? a = i + 1 : "decrease" == e && 1 < i && (a = i - 1);
        var o = this.data.sku, s = this.data.skuList;
        if (0 < o.length) for (var r = "", n = 0; n < o.length; n++) n == o.length - 1 ? r += o[n].id : r = r + o[n].id + "_";
        0 < s.length ? a > s.sku_mu_list[r].canBuyNum && (a -= 1) : a > this.data.cur_sku_arr.canBuyNum && (a -= 1);
        this.setData({
            sku_val: a
        });
    },
    gocarfrom: function(t) {
        wx.showLoading();
        var e = wx.getStorageSync("token");
        app.util.request({
            url: "entry/wxapp/user",
            data: {
                controller: "user.get_member_form_id",
                token: e,
                from_id: t.detail.formId
            },
            dataType: "json",
            success: function(t) {}
        }), this.goOrder();
    },
    closeSku: function() {
        this.setData({
            visible: 0,
            stopClick: !1
        });
    },
    onShareAppMessage: function() {
        var t = wx.getStorageSync("member_id") || "", e = "lionfish_comshop/moduleA/pin/share?id=" + this.data.order_id + "&share_id=" + t, a = this.data, i = a.surplus, o = a.order_goods;
        return {
            title: 0 < i ? "还差" + i + "人！我" + o.price + "元团了" + o.name : "我" + o.price + "元团了" + o.name,
            path: e,
            success: function(t) {},
            fail: function(t) {}
        };
    }
});