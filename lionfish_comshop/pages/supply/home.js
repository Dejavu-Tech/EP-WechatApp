var app = getApp(), util = require("../../utils/util.js"), wcache = require("../../utils/wcache.js"), status = require("../../utils/index.js");

Page({
    mixins: [ require("../../mixin/cartMixin.js") ],
    data: {
        list: [],
        info: [],
        cartNum: 0
    },
    supplyId: 0,
    page: 1,
    onLoad: function(t) {
        this.supplyId = t.id || 0, "undefined" != t.share_id && 0 < t.share_id && wcache.put("share_id", t.share_id), 
        this.getData();
    },
    authSuccess: function() {
        this.getData(), this.setData({
            needAuth: !1
        });
    },
    getData: function() {
        wx.showLoading();
        var t = wx.getStorageSync("token"), o = this, a = wx.getStorageSync("community");
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "supply.get_details",
                token: t,
                page: o.page,
                is_random: 1,
                head_id: a.communityId,
                id: o.supplyId
            },
            dataType: "json",
            success: function(t) {
                if (wx.hideLoading(), 0 == t.data.code) {
                    var a = o.data.list, e = t.data.data || [], i = a.concat(t.data.list), s = !1;
                    1 == o.page && (wx.setNavigationBarTitle({
                        title: e.storename || e.shopname || "供应商"
                    }), 0 == i.length && (s = !0));
                    var n = !1;
                    0 == t.data.list.length && (n = !0), o.setData({
                        list: i,
                        info: e,
                        noMore: n,
                        noData: s
                    });
                } else o.setData({
                    noMore: !0
                });
            }
        });
    },
    onShow: function() {
        var e = this, i = this;
        util.check_login_new().then(function(t) {
            if (t) e.setData({
                needAuth: !1
            }), (0, status.cartNum)("", !0).then(function(t) {
                0 == t.code && i.setData({
                    cartNum: t.data
                });
            }); else {
                var a = e.specialId;
                e.setData({
                    needAuth: !0,
                    navBackUrl: "/lionfish_comshop/pages/supply/home?id=" + a
                });
            }
        });
    },
    onPullDownRefresh: function() {},
    onReachBottom: function() {
        this.data.noMore || (this.page++, this.getData());
    },
    onShareAppMessage: function(t) {
        var a = this.data.info.storename || "供应商主页", e = wx.getStorageSync("member_id");
        return {
            title: a,
            path: "lionfish_comshop/pages/special/index?id=" + this.supplyId + "&share_id=" + e,
            success: function(t) {},
            fail: function(t) {}
        };
    }
});