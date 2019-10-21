var a = require("../../utils/public"), app = getApp();

Component({
    properties: {
        visible: {
            type: Boolean,
            value: !1,
            observer: function(t) {
                t && this.setData({
                    value: 1,
                    loading: !1
                });
            }
        },
        cur_sku_arr: {
            type: Object,
            value: {}
        },
        skuList: {
            type: Object,
            value: {}
        },
        sku_val: {
            type: Number,
            value: 1
        },
        sku: {
            type: Array,
            value: []
        },
        goodsid: {
            type: Number,
            value: 0
        },
        type: {
            type: Number,
            value: 0
        }
    },
    data: {
        value: 1,
        loading: !1
    },
    methods: {
        close: function() {
            this.triggerEvent("cancel");
        },
        selectSku: function(t) {
            var a = t.currentTarget.dataset.type.split("_"), e = this.data.sku, s = {
                name: a[3],
                id: a[2],
                index: a[0],
                idx: a[1]
            };
            e.splice(a[0], 1, s);
            for (var i = "", u = 0; u < e.length; u++) u == e.length - 1 ? i += e[u].id : i = i + e[u].id + "_";
            var r = this.data.skuList.sku_mu_list[i];
            this.setData({
                cur_sku_arr: r,
                sku: e
            });
        },
        setNum: function(t) {
            var a = t.currentTarget.dataset.type, e = 1, s = 1 * this.data.sku_val;
            "add" == a ? e = s + 1 : "decrease" == a && 1 < s && (e = s - 1);
            var i = this.data.sku, u = this.data.skuList;
            if (0 < i.length) for (var r = "", o = 0; o < i.length; o++) o == i.length - 1 ? r += i[o].id : r = r + i[o].id + "_";
            0 < u.length ? e > u.sku_mu_list[r].canBuyNum && (e -= 1) : e > this.data.cur_sku_arr.canBuyNum && (e -= 1);
            this.setData({
                sku_val: e
            });
        },
        gocarfrom: function(t) {
            wx.showLoading(), a.collectFormIds(t.detail.formId), this.goOrder();
        },
        goOrder: function() {
            var s = this, t = s.data;
            t.can_car && (t.can_car = !1);
            var a = wx.getStorageSync("token"), e = wx.getStorageSync("community").communityId, i = t.goodsid, u = t.sku_val, r = t.cur_sku_arr, o = "";
            r && r.option_item_ids && (o = r.option_item_ids), app.util.request({
                url: "entry/wxapp/user",
                data: {
                    controller: "car.add",
                    token: a,
                    goods_id: i,
                    community_id: e,
                    quantity: u,
                    sku_str: o,
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
                        var a = t.data.max_quantity || "";
                        0 < a && s.setData({
                            sku_val: a
                        });
                        var e = t.data.msg;
                        wx.showToast({
                            title: e,
                            icon: "none",
                            duration: 2e3
                        });
                    } else {
                        s.close(), wx.hideLoading(), t.data.total && s.triggerEvent("changeCartNum", t.data.total), 
                        wx.showToast({
                            title: "已加入购物车",
                            image: "../../images/addShopCart.png"
                        });
                    }
                }
            });
        }
    }
});