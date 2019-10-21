var app = getApp(), status = require("../../utils/index.js");

Component({
    externalClasses: [ "i-class" ],
    properties: {
        updateCart: {
            type: Number,
            value: 0,
            observer: function(t) {
                0 < t && this.updateCartNum();
            }
        },
        likeTitle: {
            type: String,
            value: "大家常买"
        },
        controller: {
            type: "String",
            value: "index.load_gps_goodslist"
        },
        gid: {
            type: "Number",
            value: 0
        }
    },
    data: {
        disabled: !1,
        list: [],
        show_goods_guess_like: 1
    },
    attached: function() {
        this.getData();
    },
    pageLifetimes: {
        show: function() {
            this.updateCartNum();
        }
    },
    methods: {
        getData: function() {
            var t = wx.getStorageSync("token"), o = this, a = wx.getStorageSync("community"), e = this.data, s = e.controller, i = e.gid;
            app.util.request({
                url: "entry/wxapp/index",
                data: {
                    controller: s,
                    token: t,
                    pageNum: 1,
                    is_random: 1,
                    head_id: a.communityId,
                    id: i
                },
                dataType: "json",
                success: function(t) {
                    if (console.log("guess", t.data), 0 == t.data.code) {
                        var a = o.data.list, e = t.data.list || [];
                        e = a.concat(e);
                        var s = 1;
                        i && (s = t.data.show_goods_guess_like || 0), o.setData({
                            list: e,
                            show_goods_guess_like: s
                        });
                    } else o.setData({
                        noMore: !0
                    });
                }
            });
        },
        openSku: function(t) {
            var a = t.currentTarget.dataset.idx;
            this.setData({
                disabled: !1
            });
            var e = this.data.list[a];
            void 0 === e.skuList.length ? this.triggerEvent("openSku", {
                actId: e.actId,
                skuList: e.skuList,
                promotionDTO: e.promotionDTO || "",
                allData: {
                    spuName: e.spuName,
                    skuImage: e.skuImage,
                    actPrice: e.actPrice,
                    canBuyNum: e.spuCanBuyNum,
                    stock: e.spuCanBuyNum,
                    marketPrice: e.marketPrice
                }
            }) : this.addCart({
                value: 1,
                type: "plus",
                idx: a
            });
        },
        changeNumber: function(t) {
            var a = t.detail;
            a && this.addCart(a);
        },
        outOfMax: function(t) {
            console.log(t);
            t.detail;
            var a = t.idx, e = this.data.list, s = e[a].spuCanBuyNum;
            e[a].car_count >= s && wx.showToast({
                title: "不能购买更多啦",
                icon: "none"
            });
        },
        addCart: function(t) {
            var a = wx.getStorageSync("token"), e = wx.getStorageSync("community"), s = t.idx, o = this.data.list, i = o[s].actId, n = e.communityId, u = this;
            "plus" == t.type ? app.util.request({
                url: "entry/wxapp/user",
                data: {
                    controller: "car.add",
                    token: a,
                    goods_id: i,
                    community_id: n,
                    quantity: 1,
                    sku_str: "",
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
                    }); else if (6 == t.data.code) {
                        var a = t.data.max_quantity || "";
                        o[s].car_count = t.data.max_quantity || 0, console.log(o[s].car_count)(0 < a) && u.setData({
                            list: o
                        });
                        var e = t.data.msg;
                        wx.showToast({
                            title: e,
                            icon: "none",
                            duration: 2e3
                        });
                    } else u.triggerEvent("changeCartNum", t.data.total), o[s].car_count = t.data.cur_count || 0, 
                    u.setData({
                        list: o
                    }), wx.showToast({
                        title: "已加入购物车",
                        image: "../../images/addShopCart.png"
                    }), status.indexListCarCount(i, t.data.cur_count);
                }
            }) : app.util.request({
                url: "entry/wxapp/user",
                data: {
                    controller: "car.reduce_car_goods",
                    token: a,
                    goods_id: i,
                    community_id: n,
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
                    }) : (u.triggerEvent("changeCartNum", t.data.total), o[s].car_count = t.data.cur_count || 0, 
                    u.setData({
                        list: o
                    }), status.indexListCarCount(i, t.data.cur_count));
                }
            });
        },
        updateCartNum: function() {
            var t = app.globalData.goodsListCarCount, s = this.data.list;
            0 < t.length && 0 < s.length && (t.forEach(function(a) {
                var t = s.findIndex(function(t) {
                    return t.actId == a.actId;
                });
                if (-1 != t && 0 === s[t].skuList.length) {
                    var e = 1 * a.num;
                    s[t].car_count = 0 <= e ? e : 0;
                }
            }), this.setData({
                list: s
            }));
        }
    }
});