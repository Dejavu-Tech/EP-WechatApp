var util = require("../../utils/util.js"), app = getApp(), WxParse = require("../../wxParse/wxParse.js");

Page({
    onLoad: function() {
        wx.showLoading(), this.get_article();
    },
    get_article: function() {
        var t = this;
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "group.pintuan_slides"
            },
            dataType: "json",
            success: function(a) {
                if (wx.hideLoading(), 0 == a.data.code) {
                    var e = a.data.pintuan_publish;
                    WxParse.wxParse("article", "html", e, t, 15);
                }
            }
        });
    }
});