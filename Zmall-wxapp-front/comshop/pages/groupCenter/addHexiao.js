var app = getApp(), util = require("../../utils/util.js");

Page({
    data: {
        qrcode: ""
    },
    onLoad: function(e) {
        util.check_login() || wx.redirectTo({
            url: "/lionfish_comshop/pages/user/me"
        }), this.get_hx_qrcode();
    },
    get_hx_qrcode: function() {
        var o = this, e = wx.getStorageSync("token");
        wx.showLoading(), app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "community.get_community_bind_member_qrcode",
                token: e
            },
            dataType: "json",
            success: function(e) {
                console.log(e), 0 == e.data.code && (console.log(e), o.setData({
                    qrcode: e.data.qrcode
                })), wx.hideLoading();
            }
        });
    },
    onShow: function() {}
});