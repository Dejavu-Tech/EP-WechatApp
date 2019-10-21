var util = require("../../utils/util.js"), app = getApp();

Page({
    data: {
        poster: "",
        imageSize: {
            imageWidth: "100%",
            imageHeight: 600
        },
        is_share_html: !0,
        member_info: {}
    },
    onLoad: function(e) {
        util.check_login() ? (this.getMemberInfo(), this.getData()) : this.setData({
            needAuth: !0
        });
    },
    authSuccess: function() {
        var e = this;
        this.setData({
            needAuth: !1
        }, function() {
            e.getMemberInfo(), e.getData();
        });
    },
    imageLoad: function(e) {
        var t = util.imageUtil(e);
        this.setData({
            imageSize: t
        });
    },
    getMemberInfo: function() {
        var e = wx.getStorageSync("token"), o = this;
        app.util.request({
            url: "entry/wxapp/user",
            data: {
                controller: "user.get_user_info",
                token: e
            },
            dataType: "json",
            success: function(e) {
                if (0 == e.data.code) {
                    var t = e.data.data;
                    if (0 < e.data.commiss_level) {
                        var a = 1 * e.data.commiss_share_member_update, s = 1 * e.data.share_member_count, i = 1 * e.data.commiss_share_member_update - 1 * e.data.share_member_count, n = e.data.commiss_diy_name || "分销";
                        wx.setNavigationBarTitle({
                            title: "会员" + n
                        }), o.setData({
                            member_info: t,
                            commiss_level: e.data.commiss_level,
                            commiss_sharemember_need: e.data.commiss_sharemember_need,
                            commiss_share_member_update: a,
                            share_member_count: s,
                            need_num_update: i,
                            commiss_diy_name: n
                        });
                    } else wx.showModal({
                        title: "提示",
                        content: "未开启分销",
                        showCancel: !1,
                        success: function(e) {
                            e.confirm && (console.log("用户点击确定"), wx.reLaunch({
                                url: "/lionfish_comshop/pages/user/me"
                            }));
                        }
                    });
                } else o.setData({
                    is_login: !1
                }), wx.setStorage({
                    key: "member_id",
                    data: null
                });
            }
        });
    },
    onShow: function() {},
    getData: function() {
        wx.showLoading();
        var e = wx.getStorageSync("token"), t = this;
        app.util.request({
            url: "entry/wxapp/user",
            data: {
                controller: "distribution.get_haibao",
                token: e
            },
            dataType: "json",
            success: function(e) {
                wx.hideLoading(), 0 == e.data.code ? t.setData({
                    poster: e.data.commiss_qrcode
                }) : t.setData({
                    needAuth: !0
                });
            }
        });
    },
    toggleShare: function() {
        var e = this.data.is_share_html;
        this.setData({
            is_share_html: !e
        });
    },
    prevImg: function(e) {
        var t = e.currentTarget.dataset.src;
        wx.previewImage({
            current: t,
            urls: [ t ]
        });
    },
    onShareAppMessage: function() {
        var e = wx.getStorageSync("community").communityId, t = wx.getStorageSync("member_id");
        return console.log(e, t), {
            title: "",
            path: "lionfish_comshop/pages/index/index?community_id=" + e + "&share_id=" + t,
            imageUrl: "",
            success: function() {},
            fail: function() {}
        };
    }
});