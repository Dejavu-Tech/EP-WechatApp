var app = getApp(), util = require("../../utils/util.js"), WxParse = require("../../wxParse/wxParse.js"), status = require("../../utils/index.js");

Page({
    data: {},
    onLoad: function(t) {
        status.setNavBgColor();
        var e = this;
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "community.get_apply_page"
            },
            dataType: "json",
            success: function(t) {
                if (0 == t.data.code) {
                    console.log(t);
                    var a = t.data.data || "";
                    WxParse.wxParse("article", "html", a, e, 5);
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