var app = getApp(), util = require("../../utils/util.js"), status = require("../../utils/index.js");

Page({
    mixins: [ require("../../mixin/compoentCartMixin.js") ],
    data: {
        loadMore: !0,
        loadText: "加载中...",
        rushList: [],
        cartNum: 0,
        showEmpty: !1
    },
    $data: {
        id: 0,
        pageNum: 1
    },
    onLoad: function(t) {
        var a = t.id || "";
        (this.$data.id = a) ? this.getData() : wx.showToast({
            title: "参数错误",
            icon: "none"
        }, function() {
            wx.switchTab({
                url: "/lionfish_comshop/pages/index/index"
            });
        });
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
    authSuccess: function() {
        var t = this;
        this.$data.pageNum = 1, this.setData({
            loadMore: !0,
            loadText: "加载中...",
            rushList: [],
            showEmpty: !1,
            needAuth: !1
        }, function() {
            t.getData();
        });
    },
    getData: function() {
        var h = this;
        return new Promise(function(l, t) {
            var a = wx.getStorageSync("token"), e = wx.getStorageSync("community"), i = h.$data.id;
            wx.showLoading(), app.util.request({
                url: "entry/wxapp/index",
                data: {
                    controller: "index.load_gps_goodslist",
                    token: a,
                    pageNum: h.$data.pageNum,
                    head_id: e.communityId,
                    gid: i,
                    per_page: 12
                },
                dataType: "json",
                success: function(t) {
                    if (wx.hideLoading(), 0 == t.data.code) {
                        var a = t.data, e = a.cate_info, i = a.full_money, o = a.full_reducemoney, n = a.is_open_fullreduction, s = a.list, u = {
                            full_money: i,
                            full_reducemoney: o,
                            is_open_fullreduction: n
                        }, d = {
                            rushList: h.data.rushList.concat(s),
                            pageEmpty: !1,
                            cur_time: t.data.cur_time,
                            reduction: u,
                            cate_info: e,
                            loadOver: !0
                        };
                        1 == h.$data.pageNum && (wx.setNavigationBarTitle({
                            title: e.name || ""
                        }), 0 == s.length && (d.showEmpty = !0)), d.loadText = h.data.loadMore ? "加载中..." : "没有更多商品了~", 
                        h.setData(d, function() {
                            h.$data.pageNum += 1;
                        });
                    } else if (1 == t.data.code) {
                        var r = {
                            loadMore: !1
                        };
                        if (1 == h.$data.pageNum) {
                            var c = t.data.cate_info;
                            wx.setNavigationBarTitle({
                                title: c.name || ""
                            }), r.showEmpty = !0, r.cate_info = c;
                        }
                        h.setData(r);
                    } else 2 == t.data.code && h.setData({
                        needAuth: !0
                    });
                    l(t);
                }
            });
        });
    },
    changeCartNum: function(t) {
        var a = t.detail;
        (0, status.cartNum)(this.setData({
            cartNum: a
        }));
    },
    onReachBottom: function() {
        console.log("这是我的底线"), this.data.loadMore && (this.setData({
            loadOver: !1
        }), this.getData());
    },
    onShareAppMessage: function(t) {
        var a = this.data.cate_info.name || "分类列表", e = wx.getStorageSync("member_id");
        return {
            title: a,
            path: "lionfish_comshop/pages/type/details?id=" + this.$data.id + "&share_id=" + e,
            success: function(t) {},
            fail: function(t) {}
        };
    }
});