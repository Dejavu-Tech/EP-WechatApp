var util = require("../../utils/util.js"), app = getApp();

Page({
    data: {
        classification: {
            tabs: [],
            activeIndex: 0
        },
        slider_list: [],
        pintuan_show_type: 0,
        loadMore: !0,
        loadText: "加载中...",
        loadOver: !1,
        showEmpty: !1,
        rushList: [],
        isIpx: app.globalData.isIpx
    },
    pageNum: 1,
    onLoad: function(t) {
        this.initFn();
    },
    initFn: function() {
        wx.showLoading(), this.getTabs(), this.getData();
    },
    authSuccess: function() {
        var t = this;
        this.pageNum = 1, this.setData({
            classification: {
                tabs: [],
                activeIndex: 0
            },
            slider_list: [],
            pintuan_show_type: 0,
            loadMore: !0,
            loadText: "加载中...",
            loadOver: !1,
            showEmpty: !1,
            rushList: []
        }, function() {
            t.initFn();
        });
    },
    authModal: function() {
        return !this.data.needAuth || (this.setData({
            showAuthModal: !this.data.showAuthModal
        }), !1);
    },
    getTabs: function() {
        var d = this;
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "group.pintuan_slides"
            },
            dataType: "json",
            success: function(t) {
                if (0 == t.data.code) {
                    var a = t.data, i = a.category_list, e = a.pintuan_show_type, s = a.slider_list, n = a.pintuan_index_share_title, o = a.pintuan_index_share_img, l = {
                        classification: {}
                    };
                    l.slider_list = s || [], l.pintuan_show_type = e, l.pintuan_index_share_title = n || "", 
                    l.pintuan_index_share_img = o || "";
                    0 < (i = i || []).length ? (i.unshift({
                        name: "推荐",
                        id: 0
                    }), l.isShowClassification = !0, l.classification.tabs = i) : l.isShowClassification = !1, 
                    d.setData(l);
                }
            }
        });
    },
    onShow: function() {},
    classificationChange: function(t) {
        console.log(t.detail.e), wx.showLoading();
        var a = this;
        this.pageNum = 1, this.setData({
            rushList: [],
            showEmpty: !1,
            "classification.activeIndex": t.detail.e,
            classificationId: t.detail.a
        }, function() {
            a.getData();
        });
    },
    getData: function() {
        var d = this, t = wx.getStorageSync("token"), a = d.data.classificationId;
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "group.get_pintuan_list",
                pageNum: this.pageNum,
                gid: a,
                token: t
            },
            dataType: "json",
            success: function(t) {
                if (wx.hideLoading(), wx.stopPullDownRefresh(), 0 == t.data.code) {
                    var a = d.data.rushList, i = {}, e = t.data.list;
                    1 == d.pageNum && 0 == e.length && (i.showEmpty = !0);
                    var s = a.concat(e), n = t.data, o = {
                        full_money: n.full_money,
                        full_reducemoney: n.full_reducemoney,
                        is_open_fullreduction: n.is_open_fullreduction
                    };
                    i.rushList = s, i.reduction = o, i.loadOver = !0, i.loadText = d.data.loadMore ? "加载中..." : "没有更多商品了~", 
                    d.setData(i, function() {
                        d.pageNum += 1;
                    });
                } else if (1 == t.data.code) {
                    var l = {
                        loadMore: !1
                    };
                    1 == d.pageNum && (l.showEmpty = !0), d.setData(l);
                } else 2 == t.data.code && d.setData({
                    needAuth: !0
                });
            }
        });
    },
    goBannerUrl: function(t) {
        var a = t.currentTarget.dataset.idx, i = this.data, e = i.slider_list, s = i.needAuth;
        if (0 < e.length) {
            var n = e[a].link, o = e[a].linktype;
            if (util.checkRedirectTo(n, s)) return void this.authModal();
            if (0 == o) n && wx.navigateTo({
                url: "/lionfish_comshop/pages/web-view?url=" + encodeURIComponent(n)
            }); else if (1 == o) -1 != n.indexOf("lionfish_comshop/pages/index/index") || -1 != n.indexOf("lionfish_comshop/pages/order/shopCart") || -1 != n.indexOf("lionfish_comshop/pages/user/me") || -1 != n.indexOf("lionfish_comshop/pages/type/index") ? n && wx.switchTab({
                url: n
            }) : n && wx.navigateTo({
                url: n
            }); else if (2 == o) {
                e[a].appid && wx.navigateToMiniProgram({
                    appId: e[a].appid,
                    path: n,
                    extraData: {},
                    envVersion: "release",
                    success: function(t) {},
                    fail: function(t) {
                        console.log(t);
                    }
                });
            }
        }
    },
    onPullDownRefresh: function() {
        var t = this;
        this.pageNum = 1, this.setData({
            loadMore: !0,
            loadText: "加载中...",
            loadOver: !1,
            showEmpty: !1,
            rushList: []
        }, function() {
            t.getData();
        });
    },
    onReachBottom: function() {
        console.log("这是我的底线"), this.data.loadMore && (this.setData({
            loadOver: !1
        }), this.getData());
    },
    onShareAppMessage: function() {
        var t = wx.getStorageSync("member_id"), a = this.data;
        return {
            title: a.pintuan_index_share_title,
            path: "lionfish_comshop/moduleA/pin/index?share_id=" + t,
            imageUrl: a.pintuan_index_share_img,
            success: function() {},
            fail: function() {}
        };
    }
});