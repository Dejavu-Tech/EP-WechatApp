var util = require("../../utils/util.js"), status = require("../../utils/index.js"), app = getApp();

Page({
    data: {
        list: ""
    },
    token: "",
    onLoad: function(t) {
        status.setNavBgColor();
        var n = wx.getStorageSync("token");
        this.token = n, wx.showLoading({
            title: "加载中"
        }), this.get_list();
    },
    get_list: function() {
        var e = this;
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "article.get_article_list",
                token: this.token
            },
            dataType: "json",
            success: function(t) {
                if (wx.hideLoading(), 0 == t.data.code) {
                    var n = t.data.data;
                    e.setData({
                        list: n
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
    onReachBottom: function() {}
});