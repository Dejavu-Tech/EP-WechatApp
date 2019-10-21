var app = getApp(), util = require("../../utils/util.js");

Page({
    mixins: [ require("../../mixin/cartMixin.js") ],
    data: {
        list: [],
        info: []
    },
    id: 0,
    onLoad: function(t) {
        var e = t.id || 0;
        this.id = e, util.check_login() ? (this.setData({
            needAuth: !1
        }), this.getData(e)) : this.setData({
            needAuth: !0
        });
    },
    authSuccess: function() {
        this.getData(this.id), this.setData({
            needAuth: !1
        });
    },
    getData: function(t) {
        var e = wx.getStorageSync("token"), i = this, a = wx.getStorageSync("community");
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "marketing.get_special",
                token: e,
                head_id: a.communityId,
                id: t
            },
            dataType: "json",
            success: function(t) {
                if (0 == t.data.code) {
                    var e = t.data.list, a = t.data.data;
                    wx.setNavigationBarTitle({
                        title: a.special_title || "专题"
                    }), i.setData({
                        list: e,
                        info: a
                    });
                } else 1 == t.data.code ? wx.showModal({
                    title: "提示",
                    content: t.data.msg,
                    showCancel: !1,
                    success: function(t) {
                        t.confirm && wx.switchTab({
                            url: "/lionfish_comshop/pages/index/index"
                        });
                    }
                }) : 2 == t.data.code && i.setData({
                    needAuth: !0
                });
            }
        });
    },
    onShow: function() {},
    onPullDownRefresh: function() {},
    onReachBottom: function() {}
});