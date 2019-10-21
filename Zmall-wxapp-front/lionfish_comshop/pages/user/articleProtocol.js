var util = require("../../utils/util.js"), app = getApp(), WxParse = require("../../wxParse/wxParse.js");

Page({
    data: {
        list: ""
    },
    token: "",
    articleId: 0,
    onLoad: function(t) {
        var e = t.id || 0;
        this.articleId = e;
        var a = t.about || 0, i = wx.getStorageSync("token");
        this.token = i, wx.showLoading({
            title: "加载中"
        }), a ? this.get_about_us() : this.get_article();
    },
    get_article: function() {
        var a = this;
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "article.get_article",
                token: a.token,
                id: a.articleId
            },
            dataType: "json",
            success: function(t) {
                if (wx.hideLoading(), 0 == t.data.code) {
                    var e = t.data.data;
                    WxParse.wxParse("article", "html", e.content, a, 15), wx.setNavigationBarTitle({
                        title: e.title
                    });
                }
            }
        });
    },
    get_about_us: function() {
        var a = this;
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "user.get_about_us"
            },
            dataType: "json",
            success: function(t) {
                if (wx.hideLoading(), 0 == t.data.code) {
                    var e = t.data.data;
                    WxParse.wxParse("article", "html", e, a, 15), wx.setNavigationBarTitle({
                        title: "关于我们"
                    });
                }
            }
        });
    },
    onReady: function() {},
    onShow: function() {},
    onHide: function() {},
    onUnload: function() {},
    onPullDownRefresh: function() {},
    onReachBottom: function() {},
    onShareAppMessage: function() {}
});