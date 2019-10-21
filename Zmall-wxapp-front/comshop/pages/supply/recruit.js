var app = getApp(), util = require("../../utils/util.js"), WxParse = require("../../wxParse/wxParse.js"), status = require("../../utils/index.js");

Page({
    data: {},
    onLoad: function(a) {
        status.setNavBgColor();
        var n = this;
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "supply.get_apply_page"
            },
            dataType: "json",
            success: function(a) {
                var t = a.data.supply_diy_name || "供应商";
                if (wx.setNavigationBarTitle({
                    title: t
                }), n.setData({
                    supply_diy_name: t
                }), 0 == a.data.code) {
                    console.log(a);
                    var e = a.data.data || "";
                    WxParse.wxParse("article", "html", e, n, 5);
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