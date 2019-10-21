var util = require("../../utils/util.js"), status = require("../../utils/index.js"), a = require("../../utils/public"), app = getApp(), addFlag = 1;

Page({
    data: {
        allselect: !1,
        community_id: 0,
        allnum: 0,
        tablebar: 3,
        allcount: "0.00",
        recount: "0.00",
        carts: {},
        isEmpty: !1,
        needAuth: !1,
        cartNum: 0,
        isIpx: !1,
        disAmount: 0,
        totalAmount: 0,
        reduceNum: 0,
        tabIdx: 0,
        updateCart: 0
    },
    onLoad: function(t) {
        wx.hideTabBar(), wx.showLoading();
    },
    authSuccess: function() {
        wx.reLaunch({
            url: "/lionfish_comshop/pages/order/shopCart"
        });
    },
    authModal: function() {
        this.data.needAuth && this.setData({
            showAuthModal: !this.data.showAuthModal
        });
    },
    onShow: function() {
        var s = this;
        util.check_login_new().then(function(t) {
            if (console.log(t), t) {
                var a = wx.getStorageSync("community").communityId || "";
                s.setData({
                    needAuth: !1,
                    isEmpty: !1,
                    tabbarRefresh: !0,
                    community_id: a,
                    isIpx: app.globalData.isIpx
                }), (0, status.cartNum)("", !0).then(function(t) {
                    0 == t.code && s.setData({
                        cartNum: t.data
                    });
                }), s.showCartGoods();
            } else s.setData({
                needAuth: !0,
                isEmpty: !0
            }), wx.hideLoading();
        });
    },
    showCartGoods: function() {
        var f = this, t = wx.getStorageSync("community").communityId;
        console.log("onshow购物车里面的community_id:"), f.setData({
            community_id: t
        });
        var a = wx.getStorageSync("token");
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "car.show_cart_goods",
                token: a,
                community_id: t,
                buy_type: "dan"
            },
            dataType: "json",
            success: function(t) {
                if (wx.hideLoading(), 0 == t.data.code) {
                    var a = t.data.mult_carts || [], s = {}, e = f.data.tabIdx, r = !1;
                    if ("[object Array]" == Object.prototype.toString.call(a)) 1 < a.length ? (r = !0, 
                    s = a[e] || {}) : s = a[0] || {}; else {
                        var o = Object.keys(a).length;
                        1 < o && (r = !0), s = 1 < o ? a[e] || {} : a[1] || {};
                    }
                    var c = !0;
                    0 != Object.keys(s).length && (c = !1, s = f.sortCarts(s));
                    var i = t.data, n = i.man_free_tuanzshipping, d = i.delivery_tuanz_money, l = i.is_comunity_rest, u = i.open_man_orderbuy, h = i.man_orderbuy_money, p = i.is_show_guess_like, m = i.is_open_vipcard_buy, g = i.is_vip_card_member, _ = i.vipcard_save_money;
                    f.setData({
                        carts: s,
                        mult_carts: a,
                        showTab: r,
                        isEmpty: c,
                        is_comunity_rest: l,
                        open_man_orderbuy: u,
                        man_orderbuy_money: 1 * h,
                        is_show_guess_like: p,
                        man_free_tuanzshipping: n,
                        delivery_tuanz_money: d,
                        is_open_vipcard_buy: m,
                        is_vip_card_member: g,
                        vipcard_save_money: _
                    }), f.xuan_func();
                } else f.setData({
                    needAuth: !0,
                    isEmpty: !0
                }), wx.hideTabBar();
            }
        });
    },
    onHide: function() {
        this.setData({
            tabbarRefresh: !1
        }), console.log("onHide");
    },
    sortCarts: function(t) {
        var a = 0, s = 0, e = 0, r = 0;
        for (var o in t) {
            s = t[o].is_open_fullreduction, e = t[o].full_reducemoney, r = t[o].full_money;
            var c = t[o].shopcarts;
            c.forEach(function(t) {
                1 == t.can_man_jian && a++;
            }), c.sort(function(t, a) {
                return t.can_man_jian < a.can_man_jian ? 1 : t.can_man_jian > a.can_man_jian ? -1 : 0;
            });
        }
        return this.setData({
            reduceNum: a,
            is_open_fullreduction: s,
            full_reducemoney: e,
            full_money: r
        }), t;
    },
    xuan_func: function() {
        var t = 0, a = 0, s = 1, e = !1, r = 1, o = this.data;
        o.is_open_vipcard_buy, o.is_vip_card_member;
        for (var c in this.data.carts) {
            var i = 0;
            this.data.carts[c].goodstypeselect = 0, this.data.carts[c].goodstype = this.data.carts[c].shopcarts.length;
            for (var n = 0; n < this.data.carts[c].shopcarts.length; n++) {
                var d = this.data.carts[c].shopcarts[n];
                0 == d.isselect && 1 == d.can_buy && (s = 0), d.isselect && 1 == d.can_buy && (r = 0, 
                i = this.calcVipPrice(i, d), this.data.carts[c].goodstypeselect++, t = parseInt(t) + parseInt(d.goodsnum)), 
                0 == d.can_buy && (d.isselect = !1);
            }
            this.data.carts[c].count = i.toFixed(2), a += i;
        }
        1 == s && 0 == r && (e = !0), this.setData({
            allselect: e,
            allnum: t,
            allcount: a.toFixed(2),
            carts: this.data.carts
        }), this.calcAmount();
    },
    edit: function(t) {
        var a = parseInt(t.target.dataset.index);
        this.data.carts[a].caredit = "none", this.data.carts[a].finish = "inline";
        for (var s = 0; s < this.data.carts[a].shopcarts.length; s++) this.data.carts[a].shopcarts[s].edit = "none", 
        this.data.carts[a].shopcarts[s].finish = "inline", this.data.carts[a].shopcarts[s].description = "onedit-description", 
        this.data.carts[a].shopcarts[s].cartype = "block";
        this.setData({
            carts: this.data.carts
        });
    },
    finish: function(t) {
        var a = parseInt(t.target.dataset.index);
        this.data.carts[a].caredit = "inline", this.data.carts[a].finish = "none";
        for (var s = 0; s < this.data.carts[a].shopcarts.length; s++) this.data.carts[a].shopcarts[s].edit = "inline", 
        this.data.carts[a].shopcarts[s].finish = "none", this.data.carts[a].shopcarts[s].description = "description", 
        this.data.carts[a].shopcarts[s].cartype = "inline";
        this.setData({
            carts: this.data.carts
        });
    },
    goLink: function(t) {
        var a = t.currentTarget.dataset.link;
        wx.redirectTo({
            url: a
        });
    },
    goGoods: function(t) {
        var a = t.currentTarget.dataset.type;
        3 < getCurrentPages().length ? wx.redirectTo({
            url: "/Snailfish_shop/pages/goods/index?id=" + a
        }) : wx.navigateTo({
            url: "/Snailfish_shop/pages/goods/index?id=" + a
        });
    },
    shopselect: function(t) {
        var a = parseInt(t.target.dataset.index), s = this.data.allselect, e = 0, r = 0, o = 0;
        if (1 == this.data.carts[a].isselect) {
            s = this.data.carts[a].isselect = !1;
            for (var c = 0; c < this.data.carts[a].shopcarts.length; c++) 1 == this.data.carts[a].shopcarts[c].isselect && (this.data.carts[a].shopcarts[c].isselect = !1, 
            e = parseInt(e) + parseInt(this.data.carts[a].shopcarts[c].goodsnum), this.data.carts[a].goodstypeselect = this.data.carts[a].goodstypeselect - 1);
            e = this.data.allnum - e, r = parseFloat(this.data.allcount) - parseFloat(this.data.carts[a].count), 
            this.data.carts[a].count = "0.00", this.setData({
                carts: this.data.carts,
                allnum: e,
                allcount: r.toFixed(2),
                allselect: s
            });
        } else {
            var i = 0;
            this.data.carts[a].isselect = !0;
            for (c = 0; c < this.data.carts[a].shopcarts.length; c++) {
                var n = this.data.carts[a].shopcarts[c];
                0 == n.isselect && (n.isselect = !0, this.data.carts[a].goodstypeselect = this.data.carts[a].goodstypeselect + 1, 
                e = parseInt(e) + parseInt(n.goodsnum), i = this.calcVipPrice(i, n)), o = this.calcVipPrice(o, n);
            }
            e = this.data.allnum + e, r = parseFloat(this.data.allcount) + i, this.data.carts[a].count = o.toFixed(2);
            var d = 1;
            for (var c in this.data.carts) for (var l = 0; l < this.data.carts[c].shopcarts.length; l++) 0 == this.data.carts[c].shopcarts[l].isselect && (d = 0);
            1 == d && (s = !0), this.setData({
                carts: this.data.carts,
                allnum: e,
                allcount: r.toFixed(2),
                allselect: s
            });
        }
        this.go_record();
    },
    goodsselect: function(t) {
        var a = parseInt(t.target.dataset.parentid), s = parseInt(t.target.dataset.index), e = this.data.allselect, r = this.data.carts[a].shopcarts[s];
        if (1 == r.isselect) {
            r.isselect = !1, e && (e = !1), this.data.carts[a].goodstypeselect = parseInt(this.data.carts[a].goodstypeselect) - 1, 
            this.data.carts[a].goodstypeselect <= 0 && (this.data.carts[a].isselect = !1);
            var o = parseInt(this.data.allnum) - parseInt(r.goodsnum), c = this.calcVipPrice(this.data.allcount, r, "", "red"), i = this.calcVipPrice(this.data.carts[a].count, r, "", "red");
            this.data.carts[a].count = i.toFixed(2), this.setData({
                carts: this.data.carts,
                allnum: o,
                allcount: c.toFixed(2),
                allselect: e
            });
        } else {
            r.isselect = !0, this.data.carts[a].goodstypeselect = parseInt(this.data.carts[a].goodstypeselect) + 1, 
            0 < this.data.carts[a].goodstypeselect && (this.data.carts[a].isselect = !0);
            var n = 1;
            for (var d in this.data.carts) {
                console.log("in");
                for (var l = 0; l < this.data.carts[d].shopcarts.length; l++) 0 == this.data.carts[d].shopcarts[l].isselect && (n = 0);
            }
            1 == n && (e = !0);
            o = parseInt(this.data.allnum) + parseInt(r.goodsnum), c = this.calcVipPrice(this.data.allcount, r), 
            i = this.calcVipPrice(this.data.carts[a].count, r);
            this.data.carts[a].count = i.toFixed(2), this.setData({
                carts: this.data.carts,
                allnum: o,
                allcount: c.toFixed(2),
                allselect: e
            });
        }
        this.go_record();
    },
    allselect: function(t) {
        var a = this.data.allselect;
        this.data.carts;
        if (a) {
            a = !1;
            var s = 0, e = 0;
            for (var r in this.data.carts) for (var o in this.data.carts[r].count = "0.00", 
            this.data.carts[r].isselect = !1, this.data.carts[r].goodstypeselect = 0, this.data.carts[r].shopcarts) this.data.carts[r].shopcarts[o].isselect = !1;
            this.setData({
                carts: this.data.carts,
                allnum: s,
                allcount: e.toFixed(2),
                allselect: a
            });
        } else {
            a = !0;
            s = 0, e = 0;
            for (var r in this.data.carts) {
                var c = 0;
                this.data.carts[r].isselect = !0;
                var i = this.data.carts[r].shopcarts;
                for (var o in this.data.carts[r].goodstypeselect = i.length, i) 1 == i[o].can_buy && (c = this.calcVipPrice(c, i[o]), 
                s = parseInt(s) + parseInt(this.data.carts[r].shopcarts[o].goodsnum), i[o].isselect = !0);
                this.data.carts[r].count = c.toFixed(2), e += c;
            }
            this.setData({
                carts: this.data.carts,
                allnum: s,
                allcount: e.toFixed(2),
                allselect: a
            });
        }
        this.go_record();
    },
    regoodsnum: function(t) {
        var a = parseInt(t.currentTarget.dataset.parentid), s = parseInt(t.currentTarget.dataset.index), e = this.data.updateCart, r = this.data.carts[a].shopcarts[s], o = this;
        if (1 == r.goodsnum) o.cofirm_del(a, s); else if (1 == r.isselect) {
            var c = parseInt(this.data.allnum) - 1, i = this.calcVipPrice(o.data.allcount, r, 1, "red"), n = this.calcVipPrice(this.data.carts[a].count, r, 1, "red");
            o.data.carts[a].count = n.toFixed(2), r.goodsnum = r.goodsnum - 1, this.setData({
                carts: this.data.carts,
                allnum: c,
                allcount: i.toFixed(2)
            });
        } else r.goodsnum = parseInt(r.goodsnum) - 1, this.setData({
            carts: this.data.carts
        });
        if ("" == r.goodstype) {
            var d = 1 * r.goodsnum, l = t.currentTarget.dataset.gid;
            status.indexListCarCount(l, d), o.setData({
                updateCart: e + 1
            });
        }
        o.go_record();
    },
    cofirm_del: function(l, u) {
        2 < arguments.length && void 0 !== arguments[2] && arguments[2];
        var h = this, p = this.data.updateCart;
        wx.showModal({
            title: "提示",
            content: "确定删除这件商品吗？",
            confirmColor: "#FF0000",
            success: function(t) {
                if (t.confirm) {
                    var a = h.data.carts[l].shopcarts[u];
                    if ("" == a.goodstype) {
                        var s = a.id;
                        status.indexListCarCount(s, 0), h.setData({
                            updateCart: p + 1
                        });
                    }
                    var e = a.key, r = h.data.reduceNum;
                    if (1 == a.can_man_jian && (r--, h.setData({
                        reduceNum: r
                    }), console.log(r)), 1 == a.isselect) {
                        var o = h.data.allnum - 1, c = h.calcVipPrice(h.data.allcount, a, 1, "red"), i = h.calcVipPrice(h.data.carts[l].count, a, 1, "red");
                        if (h.data.carts[l].count = i.toFixed(2), h.data.carts[l].goodstype = h.data.carts[l].goodstype - 1, 
                        h.data.carts[l].goodstypeselect = h.data.carts[l].goodstypeselect - 1, 0 == h.data.carts[l].goodstype) {
                            var n = h.data.carts;
                            delete n[l], 0 == Object.keys(n).length && h.setData({
                                isEmpty: !0
                            });
                        } else h.data.carts[l].shopcarts.splice(u, 1), h.isAllSelect();
                        h.setData({
                            carts: h.data.carts,
                            allnum: o,
                            allcount: c.toFixed(2)
                        });
                    } else {
                        if (h.data.carts[l].goodstype = h.data.carts[l].goodstype - 1, 0 == h.data.carts[l].goodstype) {
                            var d = h.data.carts;
                            delete d[l], 0 == Object.keys(d).length && h.setData({
                                isEmpty: !0
                            });
                        } else h.data.carts[l].shopcarts.splice(u, 1);
                        h.setData({
                            carts: h.data.carts
                        });
                    }
                    h.del_car_goods(e), h.calcAmount();
                } else console.log("取消删除");
            }
        });
    },
    isAllSelect: function() {
        var t = 1, a = !1, s = this.data.carts, e = 0;
        for (var r in s) for (var o = 0; o < s[r].shopcarts.length; o++) 1 == s[r].shopcarts[o].can_buy && (e = 1), 
        0 == s[r].shopcarts[o].isselect && 1 == s[r].shopcarts[o].can_buy && (t = 0);
        1 == t && 1 == e && (a = !0), this.setData({
            allselect: a
        });
    },
    addgoodsnum: function(o) {
        if (0 != addFlag) {
            addFlag = 0;
            var c = parseInt(o.currentTarget.dataset.parentid), t = parseInt(o.currentTarget.dataset.index), i = this, n = this.data.carts[c].shopcarts[t], a = parseInt(n.max_quantity);
            if (1 == n.isselect) {
                var d = parseInt(this.data.allnum) + 1, s = this.calcVipPrice(this.data.allcount, n, 1), e = this.calcVipPrice(this.data.carts[c].count, n, 1);
                if (i.data.carts[c].count = e.toFixed(2), !(n.goodsnum < a)) {
                    n.goodsnum = a, d--;
                    var r = "最多购买" + a + "个";
                    return wx.showToast({
                        title: r,
                        icon: "none",
                        duration: 2e3
                    }), !1;
                }
                n.goodsnum = parseInt(n.goodsnum) + 1, this.setData({
                    carts: this.data.carts,
                    allnum: d,
                    allcount: s.toFixed(2)
                });
            } else {
                if (!(parseInt(n.goodsnum) < a)) {
                    r = "最多购买" + a + "个";
                    return wx.showToast({
                        title: r,
                        icon: "none",
                        duration: 2e3
                    }), !1;
                }
                n.goodsnum = parseInt(n.goodsnum) + 1;
            }
            var l = wx.getStorageSync("token"), u = [], h = [], p = (d = this.data.allnum, this.data.carts);
            for (var m in p) for (var g in p[m].shopcarts) u.push(p[m].shopcarts[g].key), h.push(p[m].shopcarts[g].key + "_" + p[m].shopcarts[g].goodsnum);
            var _ = this.data.updateCart || 0;
            app.util.request({
                url: "entry/wxapp/index",
                data: {
                    controller: "car.checkout_flushall",
                    token: l,
                    car_key: u,
                    community_id: i.data.community_id,
                    all_keys_arr: h
                },
                method: "POST",
                dataType: "json",
                success: function(t) {
                    if (0 == t.data.code) {
                        if (i.setData({
                            carts: i.data.carts
                        }), (0, status.cartNum)("", !0).then(function(t) {
                            0 == t.code && i.setData({
                                cartNum: t.data
                            });
                        }), "" == n.goodstype) {
                            var a = 1 * n.goodsnum, s = o.currentTarget.dataset.gid;
                            status.indexListCarCount(s, a), i.setData({
                                updateCart: _ + 1
                            });
                        }
                    } else {
                        if (n.goodsnum = parseInt(n.goodsnum) - 1, 1 == n.isselect) {
                            var e = i.calcVipPrice(i.data.allcount, n, 1, "red"), r = i.calcVipPrice(i.data.carts[c].count, n, 1, "red");
                            i.data.carts[c].count = r.toFixed(2), d--, i.setData({
                                allnum: d,
                                allcount: e.toFixed(2)
                            });
                        }
                        i.setData({
                            carts: i.data.carts
                        }), wx.showToast({
                            title: t.data.msg,
                            icon: "none",
                            duration: 2e3
                        });
                    }
                    addFlag = 1, i.calcAmount();
                }
            });
        }
    },
    changeNumber: function(t) {
        if (!(Object.keys(this.data.carts).length <= 0)) {
            wx.hideLoading();
            var e = this, r = parseInt(t.currentTarget.dataset.parentid), o = parseInt(t.currentTarget.dataset.index), a = t.detail.value, c = e.count_goods(r, o), s = this.data.carts[r].shopcarts[o], i = s.goodsnum;
            console.log(a);
            var n = this.data.updateCart || 0;
            if (0 < a) {
                var d = parseInt(s.max_quantity);
                d < a && (a = d, wx.showToast({
                    title: "不能购买更多啦",
                    icon: "none"
                })), s.goodsnum = a, 1 == e.data.carts[r].shopcarts[o].isselect && (c = e.count_goods(r, o)), 
                this.setData({
                    carts: this.data.carts,
                    allnum: c.allnum,
                    allcount: c.allcount
                });
                var l = wx.getStorageSync("token"), u = [], h = [], p = (this.data.allnum, this.data.carts);
                for (var m in p) for (var g in p[m].shopcarts) u.push(p[m].shopcarts[g].key), h.push(p[m].shopcarts[g].key + "_" + p[m].shopcarts[g].goodsnum);
                app.util.request({
                    url: "entry/wxapp/index",
                    data: {
                        controller: "car.checkout_flushall",
                        token: l,
                        car_key: u,
                        community_id: e.data.community_id,
                        all_keys_arr: h
                    },
                    method: "POST",
                    dataType: "json",
                    success: function(t) {
                        if (0 == t.data.code) {
                            if (e.setData({
                                carts: e.data.carts
                            }), (0, status.cartNum)("", !0).then(function(t) {
                                0 == t.code && e.setData({
                                    cartNum: t.data
                                });
                            }), "" == e.data.carts[r].shopcarts[o].goodstype) {
                                var a = 1 * e.data.carts[r].shopcarts[o].goodsnum, s = e.data.carts[r].shopcarts[o].id;
                                status.indexListCarCount(s, a), e.setData({
                                    updateCart: n + 1
                                });
                            }
                            e.go_record();
                        } else e.data.carts[r].shopcarts[o].goodsnum = i, 1 == e.data.carts[r].shopcarts[o].isselect && (c = e.count_goods(r, o)), 
                        e.setData({
                            carts: e.data.carts,
                            allnum: c.allnum,
                            allcount: c.allcount
                        }), wx.showToast({
                            title: t.data.msg,
                            icon: "none",
                            duration: 2e3
                        });
                    }
                });
            } else {
                wx.hideLoading(), (this.data.carts[r].shopcarts[o].goodsnum = 1) == e.data.carts[r].shopcarts[o].isselect && (c = e.count_goods(r, o)), 
                this.setData({
                    carts: this.data.carts,
                    allnum: c.allnum,
                    allcount: c.allcount
                });
                l = wx.getStorageSync("token"), u = [], h = [], this.data.allnum, p = this.data.carts;
                for (var m in p) for (var g in p[m].shopcarts) u.push(p[m].shopcarts[g].key), h.push(p[m].shopcarts[g].key + "_" + p[m].shopcarts[g].goodsnum);
                app.util.request({
                    url: "entry/wxapp/index",
                    data: {
                        controller: "car.checkout_flushall",
                        token: l,
                        car_key: u,
                        community_id: e.data.community_id,
                        all_keys_arr: h
                    },
                    method: "POST",
                    dataType: "json",
                    success: function(t) {
                        if (0 == t.data.code) {
                            if (e.setData({
                                carts: e.data.carts
                            }), (0, status.cartNum)("", !0).then(function(t) {
                                0 == t.code && e.setData({
                                    cartNum: t.data
                                });
                            }), "" == e.data.carts[r].shopcarts[o].goodstype) {
                                var a = 1 * e.data.carts[r].shopcarts[o].goodsnum, s = e.data.carts[r].shopcarts[o].id;
                                status.indexListCarCount(s, a), e.setData({
                                    updateCart: n + 1
                                });
                            }
                            e.go_record();
                        }
                    }
                }), e.cofirm_del(r, o);
            }
        }
    },
    count_goods: function(t, a) {
        var s = this, e = this.data.carts, r = 0, o = 0, c = !0, i = !1, n = void 0;
        try {
            for (var d, l = Object.keys(e)[Symbol.iterator](); !(c = (d = l.next()).done); c = !0) {
                e[d.value].shopcarts.forEach(function(t, a) {
                    t.isselect && (o = s.calcVipPrice(o, t), r += parseInt(t.goodsnum));
                });
            }
        } catch (t) {
            i = !0, n = t;
        } finally {
            try {
                !c && l.return && l.return();
            } finally {
                if (i) throw n;
            }
        }
        return {
            allnum: r,
            allcount: o.toFixed(2)
        };
    },
    delgoods: function(t) {
        var d = parseInt(t.target.dataset.parentid), l = parseInt(t.target.dataset.index), u = this;
        wx.showModal({
            title: "提示",
            content: "确定删除这件商品吗？",
            confirmColor: "#FF0000",
            success: function(t) {
                if (t.confirm) {
                    var a = u.data.carts[d].shopcarts[l], s = a.key;
                    if (1 == a.isselect) {
                        var e = parseInt(u.data.allnum) - parseInt(a.goodsnum), r = u.calcVipPrice(u.data.allcount, a, 1, "red"), o = u.calcVipPrice(u.data.carts[d].count, a, 1, "red");
                        u.data.carts[d].count = o.toFixed(2), u.data.carts[d].goodstype = u.data.carts[d].goodstype - 1, 
                        u.data.carts[d].goodstypeselect = u.data.carts[d].goodstypeselect - 1, 0 == u.data.carts[d].goodstype && console.log(d), 
                        u.data.carts[d].shopcarts.splice(l, 1);
                        for (var c = 0, i = 0; i < u.data.carts.length; i++) for (var n = 0; n < u.data.carts[i].shopcarts.length; n++) c += u.data.carts[i].shopcarts[n].goodsnum;
                        e == c && (u.data.allselect = !0), u.setData({
                            carts: u.data.carts,
                            allnum: e,
                            allcount: r.toFixed(2),
                            allselect: u.data.allselect
                        });
                    } else {
                        u.data.carts[d].goodstype = u.data.carts[d].goodstype - 1, u.data.carts[d].goodstype, 
                        u.data.carts[d].shopcarts.splice(l, 1);
                        for (c = 0, i = 0; i < u.data.carts.length; i++) for (n = 0; n < u.data.carts[i].shopcarts.length; n++) c += u.data.carts[i].shopcarts[n].goodsnum;
                        u.data.allnum == c && (u.data.allselect = !0), u.setData({
                            carts: u.data.carts,
                            allselect: u.data.allselect
                        });
                    }
                    0 == u.data.carts[d].shopcarts.length && (delete u.data.carts[d], 0 == Object.keys(u.data.carts).length && u.setData({
                        carts: []
                    })), u.del_car_goods(s);
                }
            }
        }), this.go_record();
    },
    del_car_goods: function(t) {
        var a = wx.getStorageSync("token"), s = this, e = this.data.updateCart;
        console.log("del_car_goods:开始");
        var r = wx.getStorageSync("community").communityId;
        console.log("缓存中的：" + r), console.log("使用中的：" + s.data.community_id), app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "car.del_car_goods",
                carkey: t,
                community_id: s.data.community_id,
                token: a
            },
            method: "POST",
            dataType: "json",
            success: function(t) {
                0 == t.data.code && (0, status.cartNum)("", !0).then(function(t) {
                    0 == t.code && s.setData({
                        cartNum: t.data,
                        updateCart: e + 1
                    });
                });
            }
        });
    },
    delete: function(t) {
        var e = parseInt(t.currentTarget.dataset.parentid), r = parseInt(t.currentTarget.dataset.index), o = this;
        wx.showModal({
            title: "提示",
            content: "确认删除这件商品吗？",
            confirmColor: "#FF0000",
            success: function(t) {
                if (t.confirm) {
                    var a = o.data.carts, s = a[e].shopcarts[r].key;
                    a[e].shopcarts.splice(r, 1), o.setData({
                        carts: a
                    }), 0 == a[e].shopcarts.length && (delete a[e], 0 == Object.keys(a).length && o.setData({
                        carts: {}
                    })), o.del_car_goods(s);
                }
            }
        });
    },
    clearlose: function() {
        var a = this;
        wx.showModal({
            title: "提示",
            content: "确认清空失效商品吗？",
            confirmColor: "#FF0000",
            success: function(t) {
                t.confirm && a.setData({
                    loselist: []
                });
            }
        });
    },
    go_record: function() {
        var a = this, t = wx.getStorageSync("token"), s = [], e = [], r = (this.data.allnum, 
        this.data.carts);
        for (var o in r) for (var c in r[o].shopcarts) r[o].shopcarts[c].isselect && s.push(r[o].shopcarts[c].key), 
        e.push(r[o].shopcarts[c].key + "_" + r[o].shopcarts[c].goodsnum);
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "car.checkout_flushall",
                token: t,
                car_key: s,
                community_id: a.data.community_id,
                all_keys_arr: e
            },
            method: "POST",
            dataType: "json",
            success: function(t) {
                0 == t.data.code ? (0, status.cartNum)("", !0).then(function(t) {
                    0 == t.code && a.setData({
                        cartNum: t.data
                    });
                }) : wx.showToast({
                    title: t.data.msg,
                    icon: "none",
                    duration: 2e3
                });
            }
        }), a.calcAmount();
    },
    toorder: function() {
        var t = wx.getStorageSync("token"), a = [], s = [];
        if (0 < this.data.allnum) {
            var e = this.data.carts;
            for (var r in e) for (var o in e[r].shopcarts) e[r].shopcarts[o].isselect && a.push(e[r].shopcarts[o].key), 
            s.push(e[r].shopcarts[o].key + "_" + e[r].shopcarts[o].goodsnum);
            app.util.request({
                url: "entry/wxapp/index",
                data: {
                    controller: "car.checkout_flushall",
                    token: t,
                    community_id: this.data.community_id,
                    car_key: a,
                    all_keys_arr: s
                },
                method: "POST",
                dataType: "json",
                success: function(t) {
                    if (0 == t.data.code) {
                        var a = t.data.data || 0;
                        wx.navigateTo({
                            url: "/lionfish_comshop/pages/order/placeOrder?type=dan&is_limit=" + a
                        });
                    } else wx.showToast({
                        title: t.data.msg,
                        icon: "none",
                        duration: 2e3
                    });
                }
            });
        } else wx.showModal({
            title: "提示",
            content: "请选择您要购买的商品",
            confirmColor: "#FF0000",
            success: function(t) {
                t.confirm;
            }
        });
    },
    goindex: function() {
        wx.switchTab({
            url: "/lionfish_comshop/pages/index/index"
        });
    },
    calcAmount: function() {
        var t = this.data, r = t.is_open_vipcard_buy, o = t.is_vip_card_member, c = t.carts, i = t.delivery_tuanz_money, n = t.man_free_tuanzshipping, a = t.vipcard_save_money, s = 0, e = 0, d = 0, l = Object.getOwnPropertyNames(c), u = [], h = 0, p = 0;
        l.forEach(function(t, a) {
            var s = c[t];
            if (0 == (s.is_open_fullreduction || 0)) return !1;
            var e = s.shopcarts;
            h = 1 * s.full_money, p = 1 * s.full_reducemoney, e.forEach(function(t) {
                t.isselect && t.can_man_jian && u.push(t), t.isselect && 0 < n && 0 < i && (1 == r && 1 == o && 1 == t.is_take_vipcard ? m += t.card_price * t.goodsnum * 1 : m += t.currntprice * t.goodsnum * 1);
            });
        });
        var m = 0;
        u.forEach(function(t) {
            t.isselect && t.can_man_jian && (1 == r && 1 == o && 1 == t.is_take_vipcard ? m += t.card_price * t.goodsnum * 1 : m += t.currntprice * t.goodsnum * 1);
        }), h <= m ? e += p : d = h - m, console.log("deliveryGoodsTot", 0);
        var g = 0;
        0 < 1 * n && (g = 1 * n - 0), s = (1 * this.data.allcount - e).toFixed(2), 1 == r && 1 == o && (s = (s - 1 * a).toFixed(2));
        var _ = 1 * (s = s <= 0 ? 0 : s) - this.data.man_orderbuy_money;
        console.log(s), this.setData({
            totalAmount: s,
            disAmount: e.toFixed(2),
            diffMoney: d.toFixed(2),
            canbuy_other: _.toFixed(2),
            diffDeliveryMoney: g.toFixed(2)
        });
    },
    calcVipPrice: function(t, a) {
        var s = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : 0, e = 3 < arguments.length && void 0 !== arguments[3] ? arguments[3] : "add", r = this.data, o = r.is_open_vipcard_buy, c = r.is_vip_card_member, i = 0 < s ? s : parseFloat(a.goodsnum);
        return "red" === e && (i *= -1), t = parseFloat(t), 1 == o && 1 == c && 1 == a.is_take_vipcard ? t + parseFloat(a.card_price) * i : t + parseFloat(a.currntprice) * i;
    },
    openSku: function(t) {
        var a = t.detail, s = a.actId, e = a.skuList;
        this.setData({
            addCar_goodsid: s
        });
        var r = e.list || [], o = [];
        if (0 < r.length) {
            for (var c = 0; c < r.length; c++) {
                var i = r[c].option_value[0], n = {
                    name: i.name,
                    id: i.option_value_id,
                    index: c,
                    idx: 0
                };
                o.push(n);
            }
            for (var d = "", l = 0; l < o.length; l++) l == o.length - 1 ? d += o[l].id : d = d + o[l].id + "_";
            var u = e.sku_mu_list[d];
            this.setData({
                sku: o,
                sku_val: 1,
                cur_sku_arr: u,
                skuList: a.skuList,
                visible: !0,
                showSku: !0
            });
        } else {
            var h = a.allData;
            this.setData({
                sku: [],
                sku_val: 1,
                skuList: [],
                cur_sku_arr: h
            });
            var p = {
                detail: {
                    formId: ""
                }
            };
            p.detail.formId = "the formId is a mock one", this.gocarfrom(p);
        }
    },
    gocarfrom: function(t) {
        wx.showLoading(), a.collectFormIds(t.detail.formId), this.goOrder();
    },
    goOrder: function() {
        var e = this;
        e.data.can_car && (e.data.can_car = !1);
        var t = wx.getStorageSync("token"), a = wx.getStorageSync("community"), r = e.data.addCar_goodsid, s = a.communityId, o = e.data.sku_val, c = e.data.cur_sku_arr, i = "", n = e.data.updateCart;
        c && c.option_item_ids && (i = c.option_item_ids), app.util.request({
            url: "entry/wxapp/user",
            data: {
                controller: "car.add",
                token: t,
                goods_id: r,
                community_id: s,
                quantity: o,
                sku_str: i,
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
                            needAuth: !0,
                            isEmpty: !0
                        });
                    }
                }); else if (6 == t.data.code) {
                    var a = t.data.max_quantity || "";
                    0 < a && e.setData({
                        sku_val: a,
                        updateCart: n + 1
                    });
                    var s = t.data.msg;
                    wx.showToast({
                        title: s,
                        icon: "none",
                        duration: 2e3
                    });
                } else e.closeSku(), e.showCartGoods(), status.indexListCarCount(r, t.data.cur_count), 
                (0, status.cartNum)(t.data.total), e.setData({
                    cartNum: t.data.total,
                    updateCart: n + 1
                }), wx.showToast({
                    title: "已加入购物车",
                    image: "../../images/addShopCart.png"
                });
            }
        });
    },
    selectSku: function(t) {
        var a = t.currentTarget.dataset.type.split("_"), s = this.data.sku, e = {
            name: a[3],
            id: a[2],
            index: a[0],
            idx: a[1]
        };
        s.splice(a[0], 1, e), this.setData({
            sku: s
        });
        for (var r = "", o = 0; o < s.length; o++) o == s.length - 1 ? r += s[o].id : r = r + s[o].id + "_";
        var c = this.data.skuList.sku_mu_list[r];
        this.setData({
            cur_sku_arr: c
        });
    },
    setNum: function(t) {
        var a = t.currentTarget.dataset.type, s = 1, e = 1 * this.data.sku_val;
        "add" == a ? s = e + 1 : "decrease" == a && 1 < e && (s = e - 1);
        var r = this.data.sku, o = this.data.skuList;
        if (0 < r.length) for (var c = "", i = 0; i < r.length; i++) i == r.length - 1 ? c += r[i].id : c = c + r[i].id + "_";
        0 < o.length ? s > o.sku_mu_list[c].canBuyNum && (s -= 1) : s > this.data.cur_sku_arr.canBuyNum && (s -= 1);
        this.setData({
            sku_val: s
        });
    },
    skuConfirm: function() {
        this.closeSku(), (0, status.cartNum)().then(function(t) {
            0 == t.code && that.setData({
                cartNum: t.data
            });
        });
    },
    closeSku: function() {
        this.setData({
            visible: 0,
            stopClick: !1
        });
    },
    changeTabs: function(t) {
        var a = this, s = t.currentTarget.dataset.idx || 0, e = this.data, r = e.tabIdx, o = e.carts, c = e.mult_carts;
        if (r != s) {
            c[r] = o, o = c[s];
            var i = !0;
            0 != Object.keys(o).length && (i = !1), this.setData({
                tabIdx: s,
                mult_carts: c,
                isEmpty: i,
                carts: o
            }, function() {
                a.xuan_func();
            });
        }
    }
});