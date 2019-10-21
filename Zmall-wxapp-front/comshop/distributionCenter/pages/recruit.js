var _extends = Object.assign || function(t) {
    for (var e = 1; e < arguments.length; e++) {
        var a = arguments[e];
        for (var s in a) Object.prototype.hasOwnProperty.call(a, s) && (t[s] = a[s]);
    }
    return t;
}, app = getApp(), util = require("../../utils/util.js"), WxParse = require("../../wxParse/wxParse.js"), status = require("../../utils/index.js");

Page({
    mixins: [ require("../../mixin/commonMixin.js") ],
    data: {
        comsissStatus: 0,
        canApply: !0
    },
    onLoad: function(t) {
        status.setNavBgColor(), status.setGroupInfo().then(function(t) {
            var e = t && t.commiss_diy_name || "分销";
            wx.setNavigationBarTitle({
                title: "会员" + e
            });
        }), this.get_instruct();
    },
    onShow: function() {
        var e = this;
        util.check_login_new().then(function(t) {
            t ? (e.setData({
                needAuth: !1
            }), e.getData()) : e.setData({
                needAuth: !0
            });
        });
    },
    get_instruct: function() {
        var a = this;
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "distribution.get_instruct"
            },
            dataType: "json",
            success: function(t) {
                if (0 == t.data.code) {
                    var e = t.data.content || "";
                    WxParse.wxParse("article", "html", e, a, 5);
                }
            }
        });
    },
    getData: function() {
        var t = wx.getStorageSync("token"), h = this;
        app.util.request({
            url: "entry/wxapp/user",
            data: {
                controller: "user.get_user_info",
                token: t
            },
            dataType: "json",
            success: function(t) {
                if (wx.hideLoading(), 0 == t.data.code) {
                    var e = t.data.data, a = e.comsiss_flag, s = e.comsiss_state, i = t.data, n = i.commiss_level, o = i.commiss_sharemember_need, r = (i.commiss_biaodan_need, 
                    i.commiss_share_member_update), u = i.share_member_count, c = (i.commiss_become_condition, 
                    t.data.commiss_diy_name || "分销");
                    wx.setNavigationBarTitle({
                        title: "会员" + c
                    });
                    var d = {}, m = 0;
                    if (0 < n) {
                        var l = 0, p = !1;
                        1 == a && 1 == s ? l = 1 : 1 == o ? (l = 2, (m = 1 * r - 1 * u) <= 0 && (l = 3, 
                        p = !0)) : p = !0, d = {
                            formStatus: 0,
                            need_num_update: m,
                            comsissStatus: l,
                            canApply: p
                        };
                    }
                    h.setData(_extends({}, d, {
                        commiss_diy_name: t.data.commiss_diy_name || "分销"
                    }));
                } else h.setData({
                    needAuth: !0
                }), wx.setStorage({
                    key: "member_id",
                    data: null
                });
            }
        });
    },
    authSuccess: function() {
        var t = this;
        this.setData({
            needAuth: !1
        }, function() {
            t.get_instruct(), t.getData();
        });
    },
    subCommis: function() {
        if (this.authModal()) {
            wx.showLoading();
            var t = wx.getStorageSync("token"), e = this;
            app.util.request({
                url: "entry/wxapp/index",
                data: {
                    controller: "distribution.sub_commission_info",
                    token: t
                },
                dataType: "json",
                success: function(t) {
                    if (wx.hideLoading(), 0 == t.data.code) "申请成功，平台将尽快审核" == t.data.msg ? wx.navigateTo({
                        url: "/lionfish_comshop/distributionCenter/pages/apply"
                    }) : wx.redirectTo({
                        url: "/lionfish_comshop/distributionCenter/pages/me"
                    }); else {
                        if ("请先登录" == t.data.msg) return void e.setData({
                            needAuth: !0
                        });
                        if ("您未填写表单！" == t.data.msg) return void wx.navigateTo({
                            url: "/lionfish_comshop/distributionCenter/pages/apply"
                        });
                        wx.showToast({
                            title: t.data.msg ? t.data.msg : "申请失败，请重试！",
                            icon: "none"
                        });
                    }
                }
            });
        }
    },
    goNext: function(t) {
        if (this.authModal()) {
            var e = 0, a = this.data.member_info || {}, s = a.comsiss_flag || 0, i = a.comsiss_state || 0;
            1 == s && (e = 0 == i ? 1 : 2);
            var n = t.currentTarget.dataset.type;
            "share" == n ? wx.navigateTo({
                url: "/lionfish_comshop/distributionCenter/pages/share"
            }) : "commiss" == n ? 2 == e ? wx.navigateTo({
                url: "/lionfish_comshop/distributionCenter/pages/me"
            }) : wx.navigateTo({
                url: "/lionfish_comshop/distributionCenter/pages/recruit"
            }) : "form" == n && (2 == e ? wx.navigateTo({
                url: "/lionfish_comshop/distributionCenter/pages/me"
            }) : wx.navigateTo({
                url: "/lionfish_comshop/distributionCenter/pages/apply"
            }));
        }
    }
});