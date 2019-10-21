function _toConsumableArray(t) {
    if (Array.isArray(t)) {
        for (var a = 0, e = Array(t.length); a < t.length; a++) e[a] = t[a];
        return e;
    }
    return Array.from(t);
}

var util = require("../../utils/util.js"), app = getApp();

Page({
    data: {
        tablebar: 5,
        theme_type: "",
        loadover: !1,
        is_more: !0,
        token: "",
        list: [],
        can_post: !1,
        images: {}
    },
    down_post_id: 0,
    up_post_id: 0,
    post_id: 0,
    up_down: 1,
    onLoad: function(t) {
        var a = this;
        wx.showLoading(), wx.request({
            url: util.api() + "index.php?s=/Apiindex/get_cur_theme_type",
            success: function(t) {
                0 == t.data.code && a.setData({
                    theme_type: t.data.type,
                    loadover: !0
                }), wx.hideLoading();
            }
        });
        var e = wx.getStorageSync("token");
        a.getQuanInfo(e), a.getAuth(e), a.setData({
            token: e
        }), a.loadData();
    },
    getAuth: function(t) {
        var a = this;
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "quan.get_quan_authority",
                token: t
            },
            success: function(t) {
                0 == t.data.code && a.setData({
                    can_post: !0
                });
            }
        });
    },
    getQuanInfo: function(t) {
        var a = this;
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "quan.get_quan_info",
                token: t
            },
            success: function(t) {
                0 == t.data.code && a.setData({
                    quanInfo: t.data.data
                });
            }
        });
    },
    loadData: function() {
        var o = this;
        1 == o.up_down ? o.post_id = o.down_post_id : o.post_id = o.up_post_id, app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "quan.load",
                token: o.data.token,
                post_id: o.post_id,
                up_down: o.up_down
            },
            success: function(t) {
                if (0 == t.data.code) {
                    o.down_post_id = t.data.down_post_id, o.up_post_id = t.data.up_post_id;
                    var a = t.data.list, e = o.data.list;
                    a.length < 10 && o.setData({
                        is_more: !1
                    }), 1 == o.up_down ? o.setData({
                        list: [].concat(_toConsumableArray(e), _toConsumableArray(a))
                    }) : o.setData({
                        list: a
                    });
                } else o.setData({
                    is_more: !1
                });
            }
        });
    },
    previewImg: function(t) {
        var a = t.currentTarget.dataset.imgidx, e = t.currentTarget.dataset.listidx, o = this.data.list[e].content;
        wx.previewImage({
            current: o[a],
            urls: o,
            success: function(t) {},
            fail: function(t) {
                console.log("预览失败");
            }
        });
    },
    goPost: function() {
        wx.navigateTo({
            url: "/Snailfish_shop/pages/dynamic/post/post"
        });
    },
    gotoGoods: function(t) {
        var a = t.currentTarget.dataset.gid;
        wx.navigateTo({
            url: "/Snailfish_shop/pages/goods/index?id=" + a
        });
    },
    imageLoad: function(t) {
        var a, e, o = t.detail.width / t.detail.height;
        o < .75 ? a = (e = 400) * o : e = (a = 300) / o;
        var n = this.data.images;
        n[t.target.dataset.index] = {
            width: a,
            height: e
        }, this.setData({
            images: n
        });
    },
    onReady: function() {},
    onShow: function() {},
    onHide: function() {},
    goLink: function(t) {
        var a = t.currentTarget.dataset.link;
        wx.reLaunch({
            url: a
        });
    },
    pullRefresh: function() {
        this.setData({
            is_more: !0
        }), this.up_down = 2, this.loadData(), console.log("下拉刷新");
    },
    loadMore: function() {
        this.up_down = 1, this.data.is_more && this.loadData(), console.log("加载更多");
    },
    onUnload: function() {},
    onShareAppMessage: function() {
        return {
            title: this.data.quan_share,
            path: "Snailfish_shop/pages/dynamic/index",
            success: function(t) {},
            fail: function(t) {}
        };
    }
});