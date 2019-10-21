var app = getApp(), util = require("../../utils/util.js"), wcache = require("../../utils/wcache.js"), status = require("../../utils/index.js");

Page({
    mixins: [ require("../../mixin/cartMixin.js") ],
    data: {
        list: [],
        info: {},
        cartNum: 0,
        needAuth: !1
    },
    specialId: 0,
    onLoad: function(t) {
        var e = t.id || 0;
        this.specialId = e, "undefined" != t.share_id && 0 < t.share_id && wcache.put("share_id", t.share_id), 
        this.getData(e);
    },
    authSuccess: function() {
        this.getData(this.specialId), this.setData({
            needAuth: !1
        });
    },
    getData: function(t) {
        wx.showLoading();
        var e = wx.getStorageSync("token"), n = this, a = wx.getStorageSync("community");
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
                if (wx.hideLoading(), 0 == t.data.code) {
                    var e = t.data.list, a = t.data.data, i = t.data.ishow_special_share_btn || 0;
                    wx.setNavigationBarTitle({
                        title: a.special_title || "专题"
                    });
                    var s = 0 == e.length;
                    n.setData({
                        list: e,
                        info: a,
                        ishowShareBtn: i,
                        noData: s
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
                }) : 2 == t.data.code && n.setData({
                    needAuth: !0
                });
            }
        });
    },
    onShow: function() {
        var a = this, i = this;
        util.check_login_new().then(function(t) {
            if (t) a.setData({
                needAuth: !1
            }), (0, status.cartNum)("", !0).then(function(t) {
                0 == t.code && i.setData({
                    cartNum: t.data
                });
            }); else {
                var e = a.specialId;
                a.setData({
                    needAuth: !0,
                    navBackUrl: "/lionfish_comshop/pages/special/index?id=" + e
                });
            }
        });
    },
    onPullDownRefresh: function() {},
    onShareAppMessage: function(t) {
        var e = this.data.info.special_title || "活动专题", a = wx.getStorageSync("member_id");
        return {
            title: e,
            path: "lionfish_comshop/moduleA/special/index?id=" + this.specialId + "&share_id=" + a,
            success: function(t) {},
            fail: function(t) {}
        };
    }
});