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
        var m = this, t = wx.getStorageSync("community").communityId;
        console.log("onshow购物车里面的community_id:"), m.setData({
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
                    var a = t.data.mult_carts || [], s = {}, r = m.data.tabIdx, e = !1;
                    if (console.log("mult_carts", a), "[object Array]" == Object.prototype.toString.call(a)) 1 < a.length ? (e = !0, 
                    s = a[r] || {}) : s = a[0] || {}; else {
                        var o = Object.keys(a).length;
                        1 < o && (e = !0), s = 1 < o ? a[r] || {} : a[1] || {};
                    }
                    var c = !0;
                    0 != Object.keys(s).length && (c = !1, s = m.sortCarts(s));
                    var n = t.data, i = n.man_free_tuanzshipping, d = n.delivery_tuanz_money, l = n.is_comunity_rest, u = n.open_man_orderbuy, h = n.man_orderbuy_money, p = n.is_show_guess_like;
                    m.setData({
                        carts: s,
                        mult_carts: a,
                        showTab: e,
                        isEmpty: c,
                        is_comunity_rest: l,
                        open_man_orderbuy: u,
                        man_orderbuy_money: 1 * h,
                        is_show_guess_like: p,
                        man_free_tuanzshipping: i,
                        delivery_tuanz_money: d
                    }), m.xuan_func();
                } else m.setData({
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
        var a = 0, s = 0, r = 0, e = 0;
        for (var o in t) {
            s = t[o].is_open_fullreduction, r = t[o].full_reducemoney, e = t[o].full_money;
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
            full_reducemoney: r,
            full_money: e
        }), t;
    },
    xuan_func: function() {
        var t = 0, a = 0, s = 1, r = !1, e = 1;
        for (var o in this.data.carts) {
            var c = 0;
            this.data.carts[o].goodstypeselect = 0, this.data.carts[o].goodstype = this.data.carts[o].shopcarts.length;
            for (var n = 0; n < this.data.carts[o].shopcarts.length; n++) {
                var i = this.data.carts[o].shopcarts[n];
                0 == i.isselect && 1 == i.can_buy && (s = 0), i.isselect && 1 == i.can_buy && (e = 0, 
                c += parseFloat(i.currntprice) * parseFloat(i.goodsnum), this.data.carts[o].goodstypeselect++, 
                t = parseInt(t) + parseInt(i.goodsnum)), 0 == i.can_buy && (i.isselect = !1);
            }
            this.data.carts[o].count = c.toFixed(2), a += c;
        }
        1 == s && 0 == e && (r = !0), this.setData({
            allselect: r,
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
        var a = parseInt(t.target.dataset.index), s = this.data.allselect, r = 0, e = 0, o = 0;
        if (1 == this.data.carts[a].isselect) {
            s = this.data.carts[a].isselect = !1;
            for (var c = 0; c < this.data.carts[a].shopcarts.length; c++) 1 == this.data.carts[a].shopcarts[c].isselect && (this.data.carts[a].shopcarts[c].isselect = !1, 
            r = parseInt(r) + parseInt(this.data.carts[a].shopcarts[c].goodsnum), this.data.carts[a].goodstypeselect = this.data.carts[a].goodstypeselect - 1);
            r = this.data.allnum - r, e = parseFloat(this.data.allcount) - parseFloat(this.data.carts[a].count), 
            this.data.carts[a].count = "0.00", this.setData({
                carts: this.data.carts,
                allnum: r,
                allcount: e.toFixed(2),
                allselect: s
            });
        } else {
            var n = 0;
            this.data.carts[a].isselect = !0;
            for (c = 0; c < this.data.carts[a].shopcarts.length; c++) 0 == this.data.carts[a].shopcarts[c].isselect && (this.data.carts[a].shopcarts[c].isselect = !0, 
            this.data.carts[a].goodstypeselect = this.data.carts[a].goodstypeselect + 1, r = parseInt(r) + parseInt(this.data.carts[a].shopcarts[c].goodsnum), 
            n += parseFloat(this.data.carts[a].shopcarts[c].currntprice) * this.data.carts[a].shopcarts[c].goodsnum), 
            o += parseFloat(this.data.carts[a].shopcarts[c].currntprice) * this.data.carts[a].shopcarts[c].goodsnum;
            r = this.data.allnum + r, e = parseFloat(this.data.allcount) + n, this.data.carts[a].count = o.toFixed(2);
            var i = 1;
            for (var c in this.data.carts) for (var d = 0; d < this.data.carts[c].shopcarts.length; d++) 0 == this.data.carts[c].shopcarts[d].isselect && (i = 0);
            1 == i && (s = !0), this.setData({
                carts: this.data.carts,
                allnum: r,
                allcount: e.toFixed(2),
                allselect: s
            });
        }
        this.go_record();
    },
    goodsselect: function(t) {
        var a = parseInt(t.target.dataset.parentid), s = parseInt(t.target.dataset.index), r = this.data.allselect;
        if (1 == this.data.carts[a].shopcarts[s].isselect) {
            this.data.carts[a].shopcarts[s].isselect = !1, r && (r = !1), this.data.carts[a].goodstypeselect = parseInt(this.data.carts[a].goodstypeselect) - 1, 
            this.data.carts[a].goodstypeselect <= 0 && (this.data.carts[a].isselect = !1);
            var e = parseInt(this.data.allnum) - parseInt(this.data.carts[a].shopcarts[s].goodsnum), o = parseFloat(this.data.allcount) - parseFloat(this.data.carts[a].shopcarts[s].currntprice) * this.data.carts[a].shopcarts[s].goodsnum, c = parseFloat(this.data.carts[a].count) - parseFloat(this.data.carts[a].shopcarts[s].currntprice) * this.data.carts[a].shopcarts[s].goodsnum;
            this.data.carts[a].count = c.toFixed(2), this.setData({
                carts: this.data.carts,
                allnum: e,
                allcount: o.toFixed(2),
                allselect: r
            });
        } else {
            this.data.carts[a].shopcarts[s].isselect = !0, this.data.carts[a].goodstypeselect = parseInt(this.data.carts[a].goodstypeselect) + 1, 
            0 < this.data.carts[a].goodstypeselect && (this.data.carts[a].isselect = !0);
            var n = 1;
            for (var i in this.data.carts) {
                console.log("in");
                for (var d = 0; d < this.data.carts[i].shopcarts.length; d++) 0 == this.data.carts[i].shopcarts[d].isselect && (n = 0);
            }
            1 == n && (r = !0);
            e = parseInt(this.data.allnum) + parseInt(this.data.carts[a].shopcarts[s].goodsnum), 
            o = parseFloat(this.data.allcount) + parseFloat(this.data.carts[a].shopcarts[s].currntprice) * this.data.carts[a].shopcarts[s].goodsnum, 
            c = parseFloat(this.data.carts[a].count) + parseFloat(this.data.carts[a].shopcarts[s].currntprice) * this.data.carts[a].shopcarts[s].goodsnum;
            this.data.carts[a].count = c.toFixed(2), this.setData({
                carts: this.data.carts,
                allnum: e,
                allcount: o.toFixed(2),
                allselect: r
            });
        }
        this.go_record();
    },
    allselect: function(t) {
        var a = this.data.allselect;
        this.data.carts;
        if (a) {
            a = !1;
            var s = 0, r = 0;
            for (var e in this.data.carts) for (var o in this.data.carts[e].count = "0.00", 
            this.data.carts[e].isselect = !1, this.data.carts[e].goodstypeselect = 0, this.data.carts[e].shopcarts) this.data.carts[e].shopcarts[o].isselect = !1;
            this.setData({
                carts: this.data.carts,
                allnum: s,
                allcount: r.toFixed(2),
                allselect: a
            });
        } else {
            a = !0;
            s = 0, r = 0;
            for (var e in this.data.carts) {
                var c = 0;
                this.data.carts[e].isselect = !0;
                var n = this.data.carts[e].shopcarts;
                for (var o in this.data.carts[e].goodstypeselect = n.length, n) 1 == n[o].can_buy && (c += parseFloat(n[o].currntprice) * parseFloat(n[o].goodsnum), 
                s = parseInt(s) + parseInt(this.data.carts[e].shopcarts[o].goodsnum), n[o].isselect = !0);
                this.data.carts[e].count = c.toFixed(2), r += c;
            }
            this.setData({
                carts: this.data.carts,
                allnum: s,
                allcount: r.toFixed(2),
                allselect: a
            });
        }
        this.go_record();
    },
    regoodsnum: function(t) {
        var a = parseInt(t.currentTarget.dataset.parentid), s = parseInt(t.currentTarget.dataset.index), r = this.data.updateCart, e = this;
        if (1 == this.data.carts[a].shopcarts[s].goodsnum) e.cofirm_del(a, s); else if (1 == this.data.carts[a].shopcarts[s].isselect) {
            var o = parseInt(this.data.allnum) - 1, c = parseFloat(this.data.allcount) - parseFloat(this.data.carts[a].shopcarts[s].currntprice), n = parseFloat(this.data.carts[a].count) - parseFloat(this.data.carts[a].shopcarts[s].currntprice);
            e.data.carts[a].count = n.toFixed(2), this.data.carts[a].shopcarts[s].goodsnum = this.data.carts[a].shopcarts[s].goodsnum - 1, 
            this.setData({
                carts: this.data.carts,
                allnum: o,
                allcount: c.toFixed(2)
            });
        } else this.data.carts[a].shopcarts[s].goodsnum = parseInt(this.data.carts[a].shopcarts[s].goodsnum) - 1, 
        this.setData({
            carts: this.data.carts
        });
        if ("" == this.data.carts[a].shopcarts[s].goodstype) {
            var i = 1 * e.data.carts[a].shopcarts[s].goodsnum, d = t.currentTarget.dataset.gid;
            status.indexListCarCount(d, i), e.setData({
                updateCart: r + 1
            });
        }
        e.go_record();
    },
    cofirm_del: function(d, l) {
        2 < arguments.length && void 0 !== arguments[2] && arguments[2];
        var u = this, h = this.data.updateCart;
        wx.showModal({
            title: "提示",
            content: "确定删除这件商品吗？",
            confirmColor: "#4facfe",
            success: function(t) {
                if (t.confirm) {
                    if ("" == u.data.carts[d].shopcarts[l].goodstype) {
                        var a = u.data.carts[d].shopcarts[l].id;
                        status.indexListCarCount(a, 0), u.setData({
                            updateCart: h + 1
                        });
                    }
                    var s = u.data.carts[d].shopcarts[l].key, r = u.data.reduceNum;
                    if (1 == u.data.carts[d].shopcarts[l].can_man_jian && (r--, u.setData({
                        reduceNum: r
                    }), console.log(r)), 1 == u.data.carts[d].shopcarts[l].isselect) {
                        var e = u.data.allnum - 1, o = parseFloat(u.data.allcount) - parseFloat(u.data.carts[d].shopcarts[l].currntprice), c = parseFloat(u.data.carts[d].count) - parseFloat(u.data.carts[d].shopcarts[l].currntprice);
                        if (u.data.carts[d].count = c.toFixed(2), u.data.carts[d].goodstype = u.data.carts[d].goodstype - 1, 
                        u.data.carts[d].goodstypeselect = u.data.carts[d].goodstypeselect - 1, 0 == u.data.carts[d].goodstype) {
                            var n = u.data.carts;
                            delete n[d], 0 == Object.keys(n).length && u.setData({
                                isEmpty: !0
                            });
                        } else u.data.carts[d].shopcarts.splice(l, 1), u.isAllSelect();
                        u.setData({
                            carts: u.data.carts,
                            allnum: e,
                            allcount: o.toFixed(2)
                        });
                    } else {
                        if (u.data.carts[d].goodstype = u.data.carts[d].goodstype - 1, 0 == u.data.carts[d].goodstype) {
                            var i = u.data.carts;
                            delete i[d], 0 == Object.keys(i).length && u.setData({
                                isEmpty: !0
                            });
                        } else u.data.carts[d].shopcarts.splice(l, 1);
                        u.setData({
                            carts: u.data.carts
                        });
                    }
                    u.del_car_goods(s), u.calcAmount();
                } else console.log("取消删除");
            }
        });
    },
    isAllSelect: function() {
        var t = 1, a = !1, s = this.data.carts, r = 0;
        for (var e in s) for (var o = 0; o < s[e].shopcarts.length; o++) 1 == s[e].shopcarts[o].can_buy && (r = 1), 
        0 == s[e].shopcarts[o].isselect && 1 == s[e].shopcarts[o].can_buy && (t = 0);
        1 == t && 1 == r && (a = !0), this.setData({
            allselect: a
        });
    },
    addgoodsnum: function(o) {
        if (0 != addFlag) {
            addFlag = 0;
            var c = parseInt(o.currentTarget.dataset.parentid), n = parseInt(o.currentTarget.dataset.index), i = this, t = parseInt(this.data.carts[c].shopcarts[n].max_quantity);
            if (1 == this.data.carts[c].shopcarts[n].isselect) {
                var d = parseInt(this.data.allnum) + 1, a = parseFloat(this.data.allcount) + parseFloat(this.data.carts[c].shopcarts[n].currntprice), s = parseFloat(this.data.carts[c].count) + parseFloat(this.data.carts[c].shopcarts[n].currntprice);
                if (i.data.carts[c].count = s.toFixed(2), !(this.data.carts[c].shopcarts[n].goodsnum < t)) {
                    this.data.carts[c].shopcarts[n].goodsnum = t, d--;
                    var r = "最多购买" + t + "个";
                    return wx.showToast({
                        title: r,
                        icon: "none",
                        duration: 2e3
                    }), !1;
                }
                this.data.carts[c].shopcarts[n].goodsnum = parseInt(this.data.carts[c].shopcarts[n].goodsnum) + 1, 
                this.setData({
                    carts: this.data.carts,
                    allnum: d,
                    allcount: a.toFixed(2)
                });
            } else {
                if (!(parseInt(this.data.carts[c].shopcarts[n].goodsnum) < t)) {
                    r = "最多购买" + t + "个";
                    return wx.showToast({
                        title: r,
                        icon: "none",
                        duration: 2e3
                    }), !1;
                }
                this.data.carts[c].shopcarts[n].goodsnum = parseInt(this.data.carts[c].shopcarts[n].goodsnum) + 1;
            }
            var e = wx.getStorageSync("token"), l = [], u = [], h = (d = this.data.allnum, this.data.carts);
            for (var p in h) for (var m in h[p].shopcarts) l.push(h[p].shopcarts[m].key), u.push(h[p].shopcarts[m].key + "_" + h[p].shopcarts[m].goodsnum);
            var g = this.data.updateCart || 0;
            app.util.request({
                url: "entry/wxapp/index",
                data: {
                    controller: "car.checkout_flushall",
                    token: e,
                    car_key: l,
                    community_id: i.data.community_id,
                    all_keys_arr: u
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
                        }), "" == i.data.carts[c].shopcarts[n].goodstype) {
                            var a = 1 * i.data.carts[c].shopcarts[n].goodsnum, s = o.currentTarget.dataset.gid;
                            status.indexListCarCount(s, a), i.setData({
                                updateCart: g + 1
                            });
                        }
                    } else {
                        if (i.data.carts[c].shopcarts[n].goodsnum = parseInt(i.data.carts[c].shopcarts[n].goodsnum) - 1, 
                        1 == i.data.carts[c].shopcarts[n].isselect) {
                            var r = parseFloat(i.data.allcount) - parseFloat(i.data.carts[c].shopcarts[n].currntprice), e = parseFloat(i.data.carts[c].count) - parseFloat(i.data.carts[c].shopcarts[n].currntprice);
                            i.data.carts[c].count = e.toFixed(2), d--, i.setData({
                                allnum: d,
                                allcount: r.toFixed(2)
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
            var r = this, e = parseInt(t.currentTarget.dataset.parentid), o = parseInt(t.currentTarget.dataset.index), a = t.detail.value, c = r.count_goods(e, o), n = this.data.carts[e].shopcarts[o].goodsnum;
            console.log(a);
            var i = this.data.updateCart || 0;
            if (0 < a) {
                var s = parseInt(this.data.carts[e].shopcarts[o].max_quantity);
                s < a && (a = s, wx.showToast({
                    title: "不能购买更多啦",
                    icon: "none"
                })), this.data.carts[e].shopcarts[o].goodsnum = a, 1 == r.data.carts[e].shopcarts[o].isselect && (c = r.count_goods(e, o)), 
                this.setData({
                    carts: this.data.carts,
                    allnum: c.allnum,
                    allcount: c.allcount
                });
                var d = wx.getStorageSync("token"), l = [], u = [], h = (this.data.allnum, this.data.carts);
                for (var p in h) for (var m in h[p].shopcarts) l.push(h[p].shopcarts[m].key), u.push(h[p].shopcarts[m].key + "_" + h[p].shopcarts[m].goodsnum);
                app.util.request({
                    url: "entry/wxapp/index",
                    data: {
                        controller: "car.checkout_flushall",
                        token: d,
                        car_key: l,
                        community_id: r.data.community_id,
                        all_keys_arr: u
                    },
                    method: "POST",
                    dataType: "json",
                    success: function(t) {
                        if (0 == t.data.code) {
                            if (r.setData({
                                carts: r.data.carts
                            }), (0, status.cartNum)("", !0).then(function(t) {
                                0 == t.code && r.setData({
                                    cartNum: t.data
                                });
                            }), "" == r.data.carts[e].shopcarts[o].goodstype) {
                                var a = 1 * r.data.carts[e].shopcarts[o].goodsnum, s = r.data.carts[e].shopcarts[o].id;
                                status.indexListCarCount(s, a), r.setData({
                                    updateCart: i + 1
                                });
                            }
                            r.go_record();
                        } else r.data.carts[e].shopcarts[o].goodsnum = n, 1 == r.data.carts[e].shopcarts[o].isselect && (c = r.count_goods(e, o)), 
                        r.setData({
                            carts: r.data.carts,
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
                wx.hideLoading(), (this.data.carts[e].shopcarts[o].goodsnum = 1) == r.data.carts[e].shopcarts[o].isselect && (c = r.count_goods(e, o)), 
                this.setData({
                    carts: this.data.carts,
                    allnum: c.allnum,
                    allcount: c.allcount
                });
                d = wx.getStorageSync("token"), l = [], u = [], this.data.allnum, h = this.data.carts;
                for (var p in h) for (var m in h[p].shopcarts) l.push(h[p].shopcarts[m].key), u.push(h[p].shopcarts[m].key + "_" + h[p].shopcarts[m].goodsnum);
                app.util.request({
                    url: "entry/wxapp/index",
                    data: {
                        controller: "car.checkout_flushall",
                        token: d,
                        car_key: l,
                        community_id: r.data.community_id,
                        all_keys_arr: u
                    },
                    method: "POST",
                    dataType: "json",
                    success: function(t) {
                        if (0 == t.data.code) {
                            if (r.setData({
                                carts: r.data.carts
                            }), (0, status.cartNum)("", !0).then(function(t) {
                                0 == t.code && r.setData({
                                    cartNum: t.data
                                });
                            }), "" == r.data.carts[e].shopcarts[o].goodstype) {
                                var a = 1 * r.data.carts[e].shopcarts[o].goodsnum, s = r.data.carts[e].shopcarts[o].id;
                                status.indexListCarCount(s, a), r.setData({
                                    updateCart: i + 1
                                });
                            }
                            r.go_record();
                        }
                    }
                }), r.cofirm_del(e, o);
            }
        }
    },
    count_goods: function(t, a) {
        var s = this.data.carts[t], r = 0, e = 0;
        return s.shopcarts.forEach(function(t, a) {
            t.isselect && (e += t.currntprice * parseInt(t.goodsnum), r += parseInt(t.goodsnum));
        }), {
            allnum: r,
            allcount: e.toFixed(2)
        };
    },
    delgoods: function(t) {
        var i = parseInt(t.target.dataset.parentid), d = parseInt(t.target.dataset.index), l = this;
        wx.showModal({
            title: "提示",
            content: "确定删除这件商品吗？",
            confirmColor: "#4facfe",
            success: function(t) {
                if (t.confirm) {
                    var a = l.data.carts[i].shopcarts[d].key;
                    if (1 == l.data.carts[i].shopcarts[d].isselect) {
                        var s = parseInt(l.data.allnum) - parseInt(l.data.carts[i].shopcarts[d].goodsnum), r = parseFloat(l.data.allcount) - parseFloat(l.data.carts[i].shopcarts[d].currntprice) * l.data.carts[i].shopcarts[d].goodsnum, e = parseFloat(l.data.carts[i].count) - parseFloat(l.data.carts[i].shopcarts[d].currntprice) * l.data.carts[i].shopcarts[d].goodsnum;
                        l.data.carts[i].count = e.toFixed(2), l.data.carts[i].goodstype = l.data.carts[i].goodstype - 1, 
                        l.data.carts[i].goodstypeselect = l.data.carts[i].goodstypeselect - 1, 0 == l.data.carts[i].goodstype && console.log(i), 
                        l.data.carts[i].shopcarts.splice(d, 1);
                        for (var o = 0, c = 0; c < l.data.carts.length; c++) for (var n = 0; n < l.data.carts[c].shopcarts.length; n++) o += l.data.carts[c].shopcarts[n].goodsnum;
                        s == o && (l.data.allselect = !0), l.setData({
                            carts: l.data.carts,
                            allnum: s,
                            allcount: r.toFixed(2),
                            allselect: l.data.allselect
                        });
                    } else {
                        l.data.carts[i].goodstype = l.data.carts[i].goodstype - 1, l.data.carts[i].goodstype, 
                        l.data.carts[i].shopcarts.splice(d, 1);
                        for (o = 0, c = 0; c < l.data.carts.length; c++) for (n = 0; n < l.data.carts[c].shopcarts.length; n++) o += l.data.carts[c].shopcarts[n].goodsnum;
                        l.data.allnum == o && (l.data.allselect = !0), l.setData({
                            carts: l.data.carts,
                            allselect: l.data.allselect
                        });
                    }
                    0 == l.data.carts[i].shopcarts.length && (delete l.data.carts[i], 0 == Object.keys(l.data.carts).length && l.setData({
                        carts: []
                    })), l.del_car_goods(a);
                }
            }
        }), this.go_record();
    },
    del_car_goods: function(t) {
        var a = wx.getStorageSync("token"), s = this, r = this.data.updateCart;
        console.log("del_car_goods:开始");
        var e = wx.getStorageSync("community").communityId;
        console.log("缓存中的：" + e), console.log("使用中的：" + s.data.community_id), app.util.request({
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
                        updateCart: r + 1
                    });
                });
            }
        });
    },
    delete: function(t) {
        var r = parseInt(t.currentTarget.dataset.parentid), e = parseInt(t.currentTarget.dataset.index), o = this;
        wx.showModal({
            title: "提示",
            content: "确认删除这件商品吗？",
            confirmColor: "#4facfe",
            success: function(t) {
                if (t.confirm) {
                    var a = o.data.carts, s = a[r].shopcarts[e].key;
                    a[r].shopcarts.splice(e, 1), o.setData({
                        carts: a
                    }), 0 == a[r].shopcarts.length && (delete a[r], 0 == Object.keys(a).length && o.setData({
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
            confirmColor: "#4facfe",
            success: function(t) {
                t.confirm && a.setData({
                    loselist: []
                });
            }
        });
    },
    go_record: function() {
        var a = this, t = wx.getStorageSync("token"), s = [], r = [], e = (this.data.allnum, 
        this.data.carts);
        for (var o in e) for (var c in e[o].shopcarts) e[o].shopcarts[c].isselect && s.push(e[o].shopcarts[c].key), 
        r.push(e[o].shopcarts[c].key + "_" + e[o].shopcarts[c].goodsnum);
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "car.checkout_flushall",
                token: t,
                car_key: s,
                community_id: a.data.community_id,
                all_keys_arr: r
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
            var r = this.data.carts;
            for (var e in r) for (var o in r[e].shopcarts) r[e].shopcarts[o].isselect && a.push(r[e].shopcarts[o].key), 
            s.push(r[e].shopcarts[o].key + "_" + r[e].shopcarts[o].goodsnum);
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
            confirmColor: "#4facfe",
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
        var e = this.data.carts, t = 0, a = 0, s = 0, r = Object.getOwnPropertyNames(e), o = [], c = 0, n = 0, i = 0, d = this.data, l = d.delivery_tuanz_money, u = d.man_free_tuanzshipping;
        r.forEach(function(t, a) {
            var s = e[t];
            if (0 == (s.is_open_fullreduction || 0)) return !1;
            var r = s.shopcarts;
            c = 1 * s.full_money, n = 1 * s.full_reducemoney, r.forEach(function(t) {
                t.isselect && t.can_man_jian && o.push(t), t.isselect && 0 < u && 0 < l && (i += t.currntprice * t.goodsnum * 1);
            });
        });
        var h = 0;
        o.forEach(function(t) {
            t.isselect && t.can_man_jian && (h += t.currntprice * t.goodsnum * 1);
        }), c <= h ? a += n : s = c - h, console.log("deliveryGoodsTot", i);
        var p = 0;
        i < 1 * u && (p = 1 * u - i);
        var m = 1 * (t = (t = (1 * this.data.allcount - a).toFixed(2)) <= 0 ? 0 : t) - this.data.man_orderbuy_money;
        this.setData({
            totalAmount: t,
            disAmount: a.toFixed(2),
            diffMoney: s.toFixed(2),
            canbuy_other: m.toFixed(2),
            diffDeliveryMoney: p.toFixed(2)
        });
    },
    openSku: function(t) {
        var a = t.detail, s = a.actId, r = a.skuList;
        this.setData({
            addCar_goodsid: s
        });
        var e = r.list || [], o = [];
        if (0 < e.length) {
            for (var c = 0; c < e.length; c++) {
                var n = e[c].option_value[0], i = {
                    name: n.name,
                    id: n.option_value_id,
                    index: c,
                    idx: 0
                };
                o.push(i);
            }
            for (var d = "", l = 0; l < o.length; l++) l == o.length - 1 ? d += o[l].id : d = d + o[l].id + "_";
            var u = r.sku_mu_list[d];
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
        var r = this;
        r.data.can_car && (r.data.can_car = !1);
        var t = wx.getStorageSync("token"), a = wx.getStorageSync("community"), e = r.data.addCar_goodsid, s = a.communityId, o = r.data.sku_val, c = r.data.cur_sku_arr, n = "", i = r.data.updateCart;
        c && c.option_item_ids && (n = c.option_item_ids), app.util.request({
            url: "entry/wxapp/user",
            data: {
                controller: "car.add",
                token: t,
                goods_id: e,
                community_id: s,
                quantity: o,
                sku_str: n,
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
                        r.setData({
                            needAuth: !0,
                            isEmpty: !0
                        });
                    }
                }); else if (6 == t.data.code) {
                    var a = t.data.max_quantity || "";
                    0 < a && r.setData({
                        sku_val: a,
                        updateCart: i + 1
                    });
                    var s = t.data.msg;
                    wx.showToast({
                        title: s,
                        icon: "none",
                        duration: 2e3
                    });
                } else r.closeSku(), r.showCartGoods(), status.indexListCarCount(e, t.data.cur_count), 
                (0, status.cartNum)(t.data.total), r.setData({
                    cartNum: t.data.total,
                    updateCart: i + 1
                }), wx.showToast({
                    title: "已加入购物车",
                    image: "../../images/addShopCart.png"
                });
            }
        });
    },
    selectSku: function(t) {
        var a = t.currentTarget.dataset.type.split("_"), s = this.data.sku, r = {
            name: a[3],
            id: a[2],
            index: a[0],
            idx: a[1]
        };
        s.splice(a[0], 1, r), this.setData({
            sku: s
        });
        for (var e = "", o = 0; o < s.length; o++) o == s.length - 1 ? e += s[o].id : e = e + s[o].id + "_";
        var c = this.data.skuList.sku_mu_list[e];
        this.setData({
            cur_sku_arr: c
        });
    },
    setNum: function(t) {
        var a = t.currentTarget.dataset.type, s = 1, r = 1 * this.data.sku_val;
        "add" == a ? s = r + 1 : "decrease" == a && 1 < r && (s = r - 1);
        var e = this.data.sku, o = this.data.skuList;
        if (0 < e.length) for (var c = "", n = 0; n < e.length; n++) n == e.length - 1 ? c += e[n].id : c = c + e[n].id + "_";
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
        var a = this, s = t.currentTarget.dataset.idx || 0, r = this.data, e = r.tabIdx, o = r.carts, c = r.mult_carts;
        if (e != s) {
            c[e] = o, o = c[s];
            var n = !0;
            0 != Object.keys(o).length && (n = !1), this.setData({
                tabIdx: s,
                mult_carts: c,
                isEmpty: n,
                carts: o
            }, function() {
                a.xuan_func();
            });
        }
    }
});