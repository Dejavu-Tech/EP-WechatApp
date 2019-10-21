var app = getApp(), util = require("../../utils/util.js"), wcache = require("../../utils/wcache.js");

Page({
    mixins: [ require("../../mixin/cartMixin.js") ],
    data: {
        list: [],
        specialList: [],
        navBackUrl: "/lionfish_comshop/moduleA/special/list"
    },
    page: 1,
    noMore: !1,
    onLoad: function(t) {
        "undefined" != t.share_id && 0 < t.share_id && wcache.put("share_id", t.share_id), 
        this.getData();
    },
    authSuccess: function() {
        var t = this;
        this.page = 1, this.setData({
            needAuth: !1,
            noMore: !1,
            list: [],
            specialList: []
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
                needAuth: !0
            });
        });
    },
    getData: function() {
        var t = wx.getStorageSync("token"), e = this, a = wx.getStorageSync("community");
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "marketing.get_special_page_list",
                token: t,
                head_id: a.communityId,
                page: this.page
            },
            dataType: "json",
            success: function(t) {
                if (wx.stopPullDownRefresh(), 0 == t.data.code) {
                    var a = t.data.data;
                    a = e.data.specialList.concat(a), e.page++, e.setData({
                        specialList: a
                    });
                } else 1 == t.data.code ? e.noMore = !0 : 2 == t.data.code && e.setData({
                    needAuth: !0
                });
            }
        });
    },
    goSpecial: function(t) {
        var a = t.currentTarget.dataset.id;
        a && wx.navigateTo({
            url: "/lionfish_comshop/moduleA/special/index?id=" + a
        });
    },
    openSku: function(t) {
        if (this.authModal()) {
            var a = t.currentTarget.dataset.idx, e = this.data.specialList[a].list || [];
            this.setData({
                list: e
            });
            var i = this, s = e[t.currentTarget.dataset.gidx], n = s.actId, o = s.skuList;
            i.setData({
                addCar_goodsid: n
            });
            var r = o.list || [], u = [];
            if (0 < r.length) {
                for (var c = 0; c < r.length; c++) {
                    var l = r[c].option_value[0], d = {
                        name: l.name,
                        id: l.option_value_id,
                        index: c,
                        idx: 0
                    };
                    u.push(d);
                }
                for (var h = "", p = 0; p < u.length; p++) p == u.length - 1 ? h += u[p].id : h = h + u[p].id + "_";
                var g = o.sku_mu_list[h];
                i.setData({
                    sku: u,
                    sku_val: 1,
                    cur_sku_arr: g,
                    skuList: s.skuList,
                    visible: !0,
                    showSku: !0
                });
            } else {
                var f = s;
                i.setData({
                    sku: [],
                    sku_val: 1,
                    skuList: [],
                    cur_sku_arr: f
                });
                var _ = {
                    detail: {
                        formId: ""
                    }
                };
                _.detail.formId = "the formId is a mock one", i.gocarfrom(_);
            }
        }
    },
    onPullDownRefresh: function() {
        this.noMore = !1, this.page = 1;
        var t = this;
        t.setData({
            list: [],
            specialList: []
        }, function() {
            t.getData();
        });
    },
    onReachBottom: function() {
        this.noMore || this.getData();
    },
    onShareAppMessage: function() {
        return {
            title: "活动专题列表",
            path: "lionfish_comshop/moduleA/special/list?share_id=" + wx.getStorageSync("member_id"),
            success: function(t) {},
            fail: function(t) {}
        };
    }
});