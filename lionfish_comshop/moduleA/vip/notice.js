var app = getApp(), WxParse = require("../../wxParse/wxParse.js");

Page({
    data: {},
    onLoad: function(a) {
        this.getData();
    },
    onShow: function() {},
    getData: function() {
        wx.showLoading();
        var a = wx.getStorageSync("token"), e = this;
        app.util.request({
            url: "entry/wxapp/user",
            data: {
                controller: "vipcard.get_vipcard_baseinfo",
                token: a
            },
            dataType: "json",
            success: function(a) {
                if (wx.hideLoading(), 0 == a.data.code) {
                    var t = a.data.data.vipcard_buy_pagenotice;
                    WxParse.wxParse("article", "html", t, e, 0, app.globalData.systemInfo);
                }
            }
        });
    }
});