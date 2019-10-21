var a = require("../utils/public"), app = getApp(), status = require("../utils/index.js");

module.exports = {
    data: {
        visible: !1,
        stopClick: !1
    },
    authModal: function() {
        return !this.data.needAuth || (this.setData({
            showAuthModal: !this.data.showAuthModal
        }), !1);
    },
    openSku: function(t) {
        if (console.log(t), this.authModal()) {
            var a = this, o = t.currentTarget.dataset.idx, s = this.data.list[o], e = s.actId, i = s.skuList;
            a.setData({
                addCar_goodsid: e
            });
            var d = i.list || [], n = [];
            if (0 < d.length) {
                for (var u = 0; u < d.length; u++) {
                    var r = d[u].option_value[0], c = {
                        name: r.name,
                        id: r.option_value_id,
                        index: u,
                        idx: 0
                    };
                    n.push(c);
                }
                for (var l = "", _ = 0; _ < n.length; _++) _ == n.length - 1 ? l += n[_].id : l = l + n[_].id + "_";
                var m = i.sku_mu_list[l];
                a.setData({
                    sku: n,
                    sku_val: 1,
                    cur_sku_arr: m,
                    skuList: s.skuList,
                    visible: !0,
                    showSku: !0
                });
            } else {
                var h = s;
                a.setData({
                    sku: [],
                    sku_val: 1,
                    skuList: [],
                    cur_sku_arr: h
                });
                var g = {
                    detail: {
                        formId: ""
                    }
                };
                g.detail.formId = "the formId is a mock one", a.gocarfrom(g, o);
            }
        }
    },
    gocarfrom: function(t) {
        var o = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : 0;
        wx.showLoading(), a.collectFormIds(t.detail.formId), this.goOrder(o);
    },
    goOrder: function(s) {
        var e = this, t = e.data;
        t.can_car && (t.can_car = !1);
        var a = wx.getStorageSync("token"), o = wx.getStorageSync("community").communityId, i = t.addCar_goodsid, d = t.sku_val, n = t.cur_sku_arr, u = t.list, r = "";
        n && n.option_item_ids && (r = n.option_item_ids), app.util.request({
            url: "entry/wxapp/user",
            data: {
                controller: "car.add",
                token: a,
                goods_id: i,
                community_id: o,
                quantity: d,
                sku_str: r,
                buy_type: "dan",
                pin_id: 0,
                is_just_addcar: 1
            },
            dataType: "json",
            method: "POST",
            success: function(t) {
                if (3 == t.data.code) wx.showToast({
                    title: t.data.msg,
                    icon: "none",
                    duration: 2e3
                }); else if (4 == t.data.code) wx.showToast({
                    title: "您未登录",
                    duration: 2e3,
                    success: function() {
                        e.setData({
                            needAuth: !0
                        });
                    }
                }); else if (6 == t.data.code) {
                    var a = t.data.max_quantity || "";
                    0 < a && e.setData({
                        sku_val: a
                    });
                    var o = t.data.msg;
                    wx.showToast({
                        title: o,
                        icon: "none",
                        duration: 2e3
                    });
                } else {
                    u[s].car_count = t.data.cur_count || 0, e.setData({
                        cartNum: t.data.total || 0,
                        list: u
                    }), e.closeSku(), status.indexListCarCount(i, t.data.cur_count), wx.showToast({
                        title: "已加入购物车",
                        image: "../../images/addShopCart.png"
                    });
                }
            }
        });
    },
    changeCartNum: function(t) {
        var a = t.detail || 0;
        a && this.setData({
            cartNum: a
        });
    },
    closeSku: function() {
        this.setData({
            visible: !1,
            stopClick: !1
        });
    },
    changeNumber: function(t) {
        var a = t.detail;
        a && this.addCart(a);
    },
    outOfMax: function(t) {
        console.log(t), wx.showToast({
            title: "不能购买更多啦",
            icon: "none"
        });
    },
    addCart: function(t) {
        var e = t.idx, i = this.data.list, a = wx.getStorageSync("token"), o = wx.getStorageSync("community"), d = i[e].actId, s = o.communityId, n = this;
        "plus" == t.type ? app.util.request({
            url: "entry/wxapp/user",
            data: {
                controller: "car.add",
                token: a,
                goods_id: d,
                community_id: s,
                quantity: 1,
                sku_str: "",
                buy_type: "dan",
                pin_id: 0,
                is_just_addcar: 1
            },
            dataType: "json",
            method: "POST",
            success: function(t) {
                if (3 == t.data.code) {
                    var a = t.data.max_quantity || "";
                    0 < (i[e].car_count = a) && n.setData({
                        list: i
                    }), wx.showToast({
                        title: t.data.msg,
                        icon: "none",
                        duration: 2e3
                    });
                } else if (6 == t.data.code) {
                    var o = t.data.max_quantity || "";
                    0 < (i[e].car_count = o) && n.setData({
                        cartNum: t.data.total || 0,
                        list: i
                    });
                    var s = t.data.msg;
                    wx.showToast({
                        title: s,
                        icon: "none",
                        duration: 2e3
                    });
                } else i[e].car_count = t.data.cur_count, n.setData({
                    cartNum: t.data.total || 0,
                    list: i
                }), wx.showToast({
                    title: "已加入购物车",
                    image: "../../images/addShopCart.png"
                }), status.indexListCarCount(d, t.data.cur_count);
            }
        }) : app.util.request({
            url: "entry/wxapp/user",
            data: {
                controller: "car.reduce_car_goods",
                token: a,
                goods_id: d,
                community_id: s,
                quantity: 1,
                sku_str: "",
                buy_type: "dan",
                pin_id: 0,
                is_just_addcar: 1
            },
            dataType: "json",
            method: "POST",
            success: function(t) {
                3 == t.data.code ? wx.showToast({
                    title: t.data.msg,
                    icon: "none",
                    duration: 2e3
                }) : (i[e].car_count = t.data.cur_count, n.setData({
                    list: i,
                    cartNum: t.data.total || 0
                }), status.indexListCarCount(d, t.data.cur_count));
            }
        });
    }
};