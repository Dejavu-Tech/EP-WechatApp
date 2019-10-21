var app = getApp(), status = require("../../utils/index.js");

Component({
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
        }
    },
    data: {
        disabled: !1,
        list: []
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
            var t = wx.getStorageSync("token"), e = this, a = wx.getStorageSync("community");
            app.util.request({
                url: "entry/wxapp/index",
                data: {
                    controller: "index.load_gps_goodslist",
                    token: t,
                    pageNum: 1,
                    is_random: 1,
                    head_id: a.communityId
                },
                dataType: "json",
                success: function(t) {
                    if (0 == t.data.code) {
                        var a = e.data.list.concat(t.data.list);
                        e.setData({
                            list: a
                        });
                    } else e.setData({
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
            this.triggerEvent("openSku", {
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
            });
        },
        changeNumber: function(t) {
            var a = t.detail;
            a && this.addCart(a);
        },
        outOfMax: function(t) {
            console.log(t);
            t.detail;
            var a = t.idx, e = this.data.list, n = e[a].spuCanBuyNum;
            e[a].car_count >= n && wx.showToast({
                title: "不能购买更多啦",
                icon: "none"
            });
        },
        addCart: function(t) {
            var a = wx.getStorageSync("token"), e = wx.getStorageSync("community"), n = t.idx, i = this.data.list, s = i[n].actId, o = e.communityId, u = this;
            "plus" == t.type ? app.util.request({
                url: "entry/wxapp/user",
                data: {
                    controller: "car.add",
                    token: a,
                    goods_id: s,
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
                    if (3 == t.data.code) wx.showToast({
                        title: t.data.msg,
                        icon: "none",
                        duration: 2e3
                    }); else if (6 == t.data.code) {
                        var a = t.data.max_quantity || "";
                        i[n].car_count = t.data.max_quantity || 0, 0 < a && u.setData({
                            list: i
                        });
                        var e = t.data.msg;
                        wx.showToast({
                            title: e,
                            icon: "none",
                            duration: 2e3
                        });
                    } else u.triggerEvent("changeCartNum", t.data.total), i[n].car_count = t.data.cur_count || 0, 
                    u.setData({
                        list: i
                    }), wx.showToast({
                        title: "已加入购物车",
                        image: "../../images/addShopCart.png"
                    }), status.indexListCarCount(s, t.data.cur_count);
                }
            }) : app.util.request({
                url: "entry/wxapp/user",
                data: {
                    controller: "car.reduce_car_goods",
                    token: a,
                    goods_id: s,
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
                    }) : (u.triggerEvent("changeCartNum", t.data.total), i[n].car_count = t.data.cur_count || 0, 
                    u.setData({
                        list: i
                    }), status.indexListCarCount(s, t.data.cur_count));
                }
            });
        },
        updateCartNum: function() {
            var t = app.globalData.goodsListCarCount, n = this.data.list;
            0 < t.length && 0 < n.length && (t.forEach(function(a) {
                var t = n.findIndex(function(t) {
                    return t.actId == a.actId;
                });
                if (-1 != t && 0 === n[t].skuList.length) {
                    var e = 1 * a.num;
                    n[t].car_count = 0 <= e ? e : 0;
                }
            }), this.setData({
                list: n
            }));
        }
    }
});