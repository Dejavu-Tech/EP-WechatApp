var a = require("../utils/public"), app = getApp(), status = require("../utils/index.js");

module.exports = {
    data: {
        visible: !1,
        stopClick: !1,
        updateCart: 0
    },
    authModal: function() {
        return !this.data.needAuth || (this.setData({
            showAuthModal: !this.data.showAuthModal
        }), !1);
    },
    openSku: function(t) {
        if (this.authModal()) {
            var a = this, s = t.detail, o = s.actId, e = s.skuList;
            a.setData({
                addCar_goodsid: o
            });
            var i = e.list || [], d = [];
            if (0 < i.length) {
                for (var u = 0; u < i.length; u++) {
                    var n = i[u].option_value[0], r = {
                        name: n.name,
                        id: n.option_value_id,
                        index: u,
                        idx: 0
                    };
                    d.push(r);
                }
                for (var c = "", l = 0; l < d.length; l++) l == d.length - 1 ? c += d[l].id : c = c + d[l].id + "_";
                var _ = e.sku_mu_list[c];
                a.setData({
                    sku: d,
                    sku_val: 1,
                    cur_sku_arr: _,
                    skuList: s.skuList,
                    visible: !0,
                    showSku: !0
                });
            } else {
                var m = s.skuList;
                a.setData({
                    sku: [],
                    sku_val: 1,
                    skuList: [],
                    cur_sku_arr: m
                });
                var h = {
                    detail: {
                        formId: ""
                    }
                };
                h.detail.formId = "the formId is a mock one", a.gocarfrom(h);
            }
        }
    },
    gocarfrom: function(t) {
        wx.showLoading(), a.collectFormIds(t.detail.formId), this.goOrder();
    },
    goOrder: function() {
        var o = this, t = o.data;
        t.can_car && (t.can_car = !1);
        var a = wx.getStorageSync("token"), s = wx.getStorageSync("community").communityId, e = t.addCar_goodsid, i = t.sku_val, d = t.cur_sku_arr, u = "", n = o.data.updateCart || 0;
        d && d.option_item_ids && (u = d.option_item_ids), app.util.request({
            url: "entry/wxapp/user",
            data: {
                controller: "car.add",
                token: a,
                goods_id: e,
                community_id: s,
                quantity: i,
                sku_str: u,
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
                        o.setData({
                            needAuth: !0
                        });
                    }
                }); else if (6 == t.data.code) {
                    var a = t.data.max_quantity || "";
                    0 < a && o.setData({
                        sku_val: a
                    });
                    var s = t.data.msg;
                    wx.showToast({
                        title: s,
                        icon: "none",
                        duration: 2e3
                    });
                } else {
                    o.closeSku(), status.indexListCarCount(e, t.data.cur_count), o.setData({
                        cartNum: t.data.total || 0,
                        updateCart: n + 1
                    }), wx.showToast({
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
        console.log(t);
        t.detail;
        var a = this.data.spuItem.spuCanBuyNum;
        this.data.number >= a && wx.showToast({
            title: "不能购买更多啦",
            icon: "none"
        });
    },
    addCart: function(t) {
        var e = t.idx, i = this.data.list, a = wx.getStorageSync("token"), s = wx.getStorageSync("community"), d = i[e].actId, o = s.communityId, u = this;
        "plus" == t.type ? app.util.request({
            url: "entry/wxapp/user",
            data: {
                controller: "car.add",
                token: a,
                goods_id: d,
                community_id: o,
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
                    0 < (i[e].car_count = a) && u.setData({
                        list: i
                    }), wx.showToast({
                        title: t.data.msg,
                        icon: "none",
                        duration: 2e3
                    });
                } else if (6 == t.data.code) {
                    var s = t.data.max_quantity || "";
                    0 < (i[e].car_count = s) && u.setData({
                        cartNum: t.data.total || 0,
                        list: i
                    });
                    var o = t.data.msg;
                    wx.showToast({
                        title: o,
                        icon: "none",
                        duration: 2e3
                    });
                } else i[e].car_count = t.data.cur_count, u.setData({
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
                community_id: o,
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
                }) : (i[e].car_count = t.data.cur_count, u.setData({
                    list: i,
                    cartNum: t.data.total || 0
                }), status.indexListCarCount(d, t.data.cur_count));
            }
        });
    }
};