var app = getApp(), util = require("../../utils/util.js");

Page({
    data: {
        list: []
    },
    onLoad: function(t) {
        util.check_login() || wx.redirectTo({
            url: "/lionfish_comshop/pages/user/me"
        }), this.getList();
    },
    getList: function() {
        wx.showLoading();
        var o = this, t = wx.getStorageSync("token");
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "community.get_community_hexiao_memberlist",
                token: t
            },
            dataType: "json",
            success: function(t) {
                console.log(t), 0 == t.data.code ? o.setData({
                    list: t.data.member_list
                }) : console.log(t.data.log), wx.hideLoading();
            }
        });
    },
    goQrcode: function() {
        wx.navigateTo({
            url: "/lionfish_comshop/pages/groupCenter/addHexiao"
        });
    },
    onShow: function() {},
    onReachBottom: function() {}
});