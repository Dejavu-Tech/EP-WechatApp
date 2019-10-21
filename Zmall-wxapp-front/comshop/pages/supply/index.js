var app = getApp(), util = require("../../utils/util.js");

Page({
    mixins: [ require("../../mixin/cartMixin.js") ],
    data: {
        list: [],
        supplyList: [],
        noMore: !1
    },
    page: 1,
    onLoad: function(t) {
        this.getData();
    },
    authSuccess: function() {
        var t = this;
        this.page = 1, this.setData({
            needAuth: !1,
            noMore: !1,
            list: [],
            supplyList: []
        }, function() {
            t.getData();
        });
    },
    onShow: function() {
        var a = this;
        util.check_login_new().then(function(t) {
            t ? a.setData({
                needAuth: !1
            }) : a.setData({
                needAuth: !0,
                navBackUrl: "/lionfish_comshop/pages/supply/index"
            });
        });
    },
    getData: function() {
        wx.showLoading();
        var t = wx.getStorageSync("token"), s = this, a = wx.getStorageSync("community");
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "supply.get_list",
                token: t,
                page: s.page,
                head_id: a.communityId
            },
            dataType: "json",
            success: function(t) {
                if (wx.stopPullDownRefresh(), wx.hideLoading(), 0 == t.data.code) {
                    var a = s.data.supplyList.concat(t.data.data);
                    s.setData({
                        supplyList: a
                    });
                } else s.setData({
                    noMore: !0
                });
            }
        });
    },
    goDetails: function(t) {
        var a = t.currentTarget.dataset.id || 0;
        a && wx.navigateTo({
            url: "/lionfish_comshop/pages/supply/home?id=" + a
        });
    },
    onPullDownRefresh: function() {
        var t = this;
        this.page = 1, this.setData({
            noMore: !1,
            list: [],
            supplyList: []
        }, function() {
            t.getData();
        });
    },
    openSku: function(t) {
        if (this.authModal()) {
            var a = t.currentTarget.dataset.shopidx, s = this.data.supplyList[a].goods_list || [];
            this.setData({
                list: s
            });
            var e = this, i = s[t.currentTarget.dataset.idx], n = i.actId, o = i.skuList;
            e.setData({
                addCar_goodsid: n
            });
            var u = o.list || [], r = [];
            if (0 < u.length) {
                for (var l = 0; l < u.length; l++) {
                    var d = u[l].option_value[0], p = {
                        name: d.name,
                        id: d.option_value_id,
                        index: l,
                        idx: 0
                    };
                    r.push(p);
                }
                for (var h = "", c = 0; c < r.length; c++) c == r.length - 1 ? h += r[c].id : h = h + r[c].id + "_";
                var g = o.sku_mu_list[h];
                e.setData({
                    sku: r,
                    sku_val: 1,
                    cur_sku_arr: g,
                    skuList: i.skuList,
                    visible: !0,
                    showSku: !0
                });
            } else {
                var f = i;
                e.setData({
                    sku: [],
                    sku_val: 1,
                    skuList: [],
                    cur_sku_arr: f
                });
                var v = {
                    detail: {
                        formId: ""
                    }
                };
                v.detail.formId = "the formId is a mock one", e.gocarfrom(v);
            }
        }
    },
    onReachBottom: function() {
        this.data.noMore || (this.page++, this.getData());
    },
    onShareAppMessage: function() {}
});