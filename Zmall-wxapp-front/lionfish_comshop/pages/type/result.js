var app = getApp(), util = require("../../utils/util.js"), a = require("../../utils/public"), status = require("../../utils/index.js");

Page({
    data: {
        cartNum: 0,
        showEmpty: !1,
        showLoadMore: !0,
        rushList: [],
        needAuth: !1
    },
    pageNum: 1,
    keyword: "",
    type: 0,
    good_ids: "",
    gid: 0,
    onLoad: function(t) {
        wx.showLoading(), this.keyword = t.keyword || "", this.type = t.type || 0, this.good_ids = t.good_ids || "", 
        this.gid = t.gid || 0, this.getData();
    },
    onShow: function() {
        var e = this;
        util.check_login_new().then(function(t) {
            var a = !t;
            e.setData({
                needAuth: a
            }), t && (0, status.cartNum)("", !0).then(function(t) {
                0 == t.code && e.setData({
                    cartNum: t.data
                });
            });
        });
    },
    getData: function() {
        if (!this.hasRefeshin) {
            this.hasRefeshin = !0;
            var i = this;
            i.setData({
                showLoadMore: !0,
                loadMore: !0,
                loadText: "加载中"
            });
            var t = wx.getStorageSync("token"), a = wx.getStorageSync("community"), e = this.keyword, s = this.type, o = this.good_ids, d = this.gid;
            app.util.request({
                url: "entry/wxapp/index",
                data: {
                    controller: "index.load_condition_goodslist",
                    token: t,
                    pageNum: i.pageNum,
                    head_id: a.communityId,
                    keyword: e,
                    type: s,
                    good_ids: o,
                    gid: d
                },
                dataType: "json",
                success: function(t) {
                    if (0 == t.data.code) {
                        var a = i.data.rushList.concat(t.data.list), e = [];
                        for (var s in a) 0 < a[s].spuCanBuyNum && e.push(a[s]);
                        var o = {
                            full_money: t.data.full_money,
                            full_reducemoney: t.data.full_reducemoney,
                            is_open_fullreduction: t.data.is_open_fullreduction
                        };
                        i.pageNum += 1, i.hasRefeshin = !1, i.setData({
                            showLoadMore: !1,
                            rushList: e,
                            loadMore: !1,
                            cur_time: t.data.cur_time,
                            reduction: o
                        }), 0 == i.data.rushList.length && i.setData({
                            showEmpty: !0
                        });
                    } else 1 == t.data.code ? (1 == i.pageNum && 0 == i.data.rushList.length && i.setData({
                        showEmpty: !0
                    }), i.setData({
                        showLoadMore: !0,
                        loadMore: !1,
                        loadText: "没有更多了"
                    }), i.hasRefeshin = !0) : 2 == t.data.code && i.setData({
                        needAuth: !0
                    });
                },
                complete: function() {
                    wx.hideLoading();
                }
            });
        }
    },
    authSuccess: function() {
        var t = this;
        this.pageNum = 1, this.setData({
            showEmpty: !1,
            showLoadMore: !0,
            rushList: [],
            needAuth: !1
        }, function() {
            t.getData();
        });
    },
    authModal: function() {
        this.data.needAuth && this.setData({
            showAuthModal: !this.data.showAuthModal
        });
    },
    openSku: function(t) {
        var a = this, e = t.detail, s = e.actId, o = e.skuList;
        a.setData({
            addCar_goodsid: s
        });
        var i = o.list || [], d = [];
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
            for (var c = "", h = 0; h < d.length; h++) h == d.length - 1 ? c += d[h].id : c = c + d[h].id + "_";
            var l = o.sku_mu_list[c];
            a.setData({
                sku: d,
                sku_val: 1,
                cur_sku_arr: l,
                skuList: e.skuList,
                visible: !0,
                showSku: !0
            });
        } else {
            var _ = e.allData;
            a.setData({
                sku: [],
                sku_val: 1,
                skuList: [],
                cur_sku_arr: _
            });
            var g = {
                detail: {
                    formId: ""
                }
            };
            g.detail.formId = "the formId is a mock one", a.gocarfrom(g);
        }
    },
    gocarfrom: function(t) {
        wx.showLoading(), a.collectFormIds(t.detail.formId), this.goOrder();
    },
    goOrder: function() {
        var s = this;
        s.data.can_car && (s.data.can_car = !1);
        var t = wx.getStorageSync("token"), a = wx.getStorageSync("community"), e = s.data.addCar_goodsid, o = a.communityId, i = s.data.sku_val, d = s.data.cur_sku_arr, u = "";
        d && d.option_item_ids && (u = d.option_item_ids), app.util.request({
            url: "entry/wxapp/user",
            data: {
                controller: "car.add",
                token: t,
                goods_id: e,
                community_id: o,
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
                        s.setData({
                            needAuth: !0
                        });
                    }
                }); else if (6 == t.data.code) {
                    var a = t.data.msg, e = t.data.max_quantity || "";
                    0 < e && s.setData({
                        sku_val: e
                    }), wx.showToast({
                        title: a,
                        icon: "none",
                        duration: 2e3
                    });
                } else {
                    s.closeSku(), (0, status.cartNum)(t.data.total), s.setData({
                        cartNum: t.data.total
                    }), wx.showToast({
                        title: "已加入购物车",
                        image: "../../images/addShopCart.png"
                    });
                }
            }
        });
    },
    selectSku: function(t) {
        var a = t.currentTarget.dataset.type.split("_"), e = this.data.sku, s = {
            name: a[3],
            id: a[2],
            index: a[0],
            idx: a[1]
        };
        e.splice(a[0], 1, s), this.setData({
            sku: e
        });
        for (var o = "", i = 0; i < e.length; i++) i == e.length - 1 ? o += e[i].id : o = o + e[i].id + "_";
        var d = this.data.skuList.sku_mu_list[o];
        this.setData({
            cur_sku_arr: d
        }), console.log(o);
    },
    setNum: function(t) {
        var a = t.currentTarget.dataset.type, e = 1, s = 1 * this.data.sku_val;
        "add" == a ? e = s + 1 : "decrease" == a && 1 < s && (e = s - 1);
        var o = this.data.sku, i = this.data.skuList;
        if (0 < o.length) for (var d = "", u = 0; u < o.length; u++) u == o.length - 1 ? d += o[u].id : d = d + o[u].id + "_";
        0 < i.length ? e > i.sku_mu_list[d].canBuyNum && (e -= 1) : e > this.data.cur_sku_arr.canBuyNum && (e -= 1);
        this.setData({
            sku_val: e
        });
    },
    closeSku: function() {
        this.setData({
            visible: 0,
            stopClick: !1
        });
    },
    changeCartNum: function(t) {
        var a = t.detail;
        (0, status.cartNum)(this.setData({
            cartNum: a
        }));
    },
    onReachBottom: function() {
        console.log("这是我的底线"), this.getData();
    }
});