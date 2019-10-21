var util = require("../../utils/util.js"), app = getApp();

Page({
    data: {
        qrcode: ""
    },
    onLoad: function(t) {
        util.check_login() || wx.switchTab({
            url: "/lionfish_comshop/pages/user/me"
        }), wx.showLoading();
    },
    getData: function() {
        var t = wx.getStorageSync("token"), e = this;
        app.util.request({
            url: "entry/wxapp/user",
            data: {
                controller: "community.get_community_zhitui_qrcode",
                token: t
            },
            dataType: "json",
            success: function(t) {
                wx.hideLoading(), 0 == t.data.code ? e.setData({
                    qrcode: t.data.qrcode
                }) : wx.switchTab({
                    url: "/lionfish_comshop/pages/user/me"
                });
            }
        });
    },
    onShow: function() {
        this.getData();
    }
});