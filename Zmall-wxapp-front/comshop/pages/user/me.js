var _extends = Object.assign || function(e) {
    for (var t = 1; t < arguments.length; t++) {
        var a = arguments[t];
        for (var s in a) Object.prototype.hasOwnProperty.call(a, s) && (e[s] = a[s]);
    }
    return e;
}, util = require("../../utils/util.js"), status = require("../../utils/index.js"), wcache = require("../../utils/wcache.js"), app = getApp();

Page({
    data: {
        tablebar: 4,
        canIUse: wx.canIUse("button.open-type.getUserInfo"),
        theme_type: "",
        add_mo: 0,
        is_show_on: 0,
        level_name: "",
        member_level_is_open: 0,
        is_yue_open: 0,
        needAuth: !1,
        opencommiss: 0,
        inputValue: 0,
        getfocus: !1,
        showguess: !0,
        items: [],
        auditStatus: 5,
        isShowCoder: !1,
        myCoderList: [],
        qrcodebase64: "",
        setInter: null,
        copyright: "",
        common_header_backgroundimage: "",
        enabled_front_supply: 0,
        cartNum: 0,
        is_show_about_us: 0,
        groupInfo: {
            group_name: "社区",
            owner_name: "团长"
        },
        is_show_score: 0,
        showGetPhone: !1,
        user_tool_icons: {}
    },
    onLoad: function(e) {
        wx.hideTabBar();
        var t = this;
        status.setNavBgColor(), status.setGroupInfo().then(function(e) {
            t.setData({
                groupInfo: e
            });
        }), wx.showLoading(), this.getCopyright();
    },
    getMemberInfo: function() {
        var e = wx.getStorageSync("token"), u = this;
        app.util.request({
            url: "entry/wxapp/user",
            data: {
                controller: "user.get_user_info",
                token: e
            },
            dataType: "json",
            success: function(e) {
                if (wx.hideLoading(), 0 == e.data.code) {
                    var t = !1;
                    1 != e.data.is_show_auth_mobile || e.data.data.telephone || (t = !0);
                    var a = e.data.data, s = {};
                    if (0 < e.data.commiss_level) {
                        var o = 1 * e.data.commiss_share_member_update, i = 1 * e.data.share_member_count, n = 1 * e.data.commiss_share_member_update - 1 * e.data.share_member_count, r = 0;
                        1 == a.is_writecommiss_form && (r = 1) == a.comsiss_flag && (r = 0 == a.comsiss_state ? 1 : 2), 
                        s = {
                            formStatus: r,
                            commiss_level: e.data.commiss_level,
                            commiss_sharemember_need: e.data.commiss_sharemember_need,
                            commiss_share_member_update: o,
                            commiss_biaodan_need: e.data.commiss_biaodan_need,
                            share_member_count: i,
                            today_share_member_count: e.data.today_share_member_count,
                            yestoday_share_member_count: e.data.yestoday_share_member_count,
                            need_num_update: n
                        };
                    }
                    u.setData(_extends({}, s, {
                        member_info: a,
                        enabled_front_supply: e.data.enabled_front_supply,
                        is_supply: e.data.is_supply,
                        is_open_yue_pay: e.data.is_open_yue_pay,
                        is_show_score: e.data.is_show_score,
                        showGetPhone: t,
                        index_top_font_color: e.data.index_top_font_color || "#fff",
                        user_order_menu_icons: e.data.user_order_menu_icons || {},
                        commiss_diy_name: e.data.commiss_diy_name || "分销",
                        close_community_apply_enter: e.data.close_community_apply_enter || 0,
                        user_tool_icons: e.data.user_tool_icons || {},
                        ishow_user_loginout_btn: e.data.ishow_user_loginout_btn || 0
                    }));
                } else u.setData({
                    needAuth: !0
                }), wx.hideTabBar(), wx.setStorage({
                    key: "member_id",
                    data: null
                });
            }
        });
    },
    getCopyright: function() {
        var t = this;
        app.util.request({
            url: "entry/wxapp/user",
            data: {
                controller: "user.get_copyright"
            },
            dataType: "json",
            success: function(e) {
                0 == e.data.code && t.setData({
                    copyright: e.data.data || "",
                    common_header_backgroundimage: e.data.common_header_backgroundimage || "",
                    is_show_about_us: e.data.is_show_about_us || 0
                });
            }
        });
    },
    authSuccess: function() {
        var t = this;
        wx.showLoading(), t.setData({
            needAuth: !1,
            showAuthModal: !1,
            tabbarRefresh: !0
        }), (0, status.cartNum)("", !0).then(function(e) {
            0 == e.code && t.setData({
                cartNum: e.data
            });
        }), t.getMemberInfo();
    },
    authModal: function() {
        return !this.data.needAuth || (this.setData({
            showAuthModal: !this.data.showAuthModal
        }), !1);
    },
    goToGroup: function() {
        5 === this.data.auditStatus ? wx.navigateTo({
            url: "/lionfish_comshop/pages/groupCenter/index"
        }) : wx.navigateTo({
            url: "/lionfish_comshop/pages/groupCenter/apply"
        });
    },
    bindGetUserInfo: function(s) {
        var o = this;
        if ("getUserInfo:ok" === s.detail.errMsg) {
            var e = Object.assign({}, wx.getStorageSync("userInfo"), {
                avatarUrl: s.detail.userInfo.avatarUrl,
                nickName: s.detail.userInfo.nickName
            });
            app.globalData.userInfo = e, wx.setStorage({
                key: "userInfo",
                data: e
            }), this.setData({
                userInfo: e
            }), wx.showToast({
                title: "资料已更新",
                icon: "none",
                duration: 2e3
            }), app.util.request({
                url: "entry/wxapp/user",
                data: {
                    controller: "user.update_user_info",
                    memberId: wx.getStorageSync("member_id"),
                    nickName: s.detail.userInfo.nickName,
                    avatarUrl: s.detail.userInfo.avatarUrl
                },
                dataType: "json",
                success: function(e) {
                    var t = o.data.member_info, a = Object.assign({}, t, {
                        avatar: s.detail.userInfo.avatarUrl,
                        username: s.detail.userInfo.nickName
                    });
                    o.setData({
                        member_info: a
                    });
                }
            });
        } else wx.showToast({
            title: "资料更新失败。",
            icon: "none"
        });
    },
    previewImage: function(e) {
        var t = e.target.dataset.src;
        t && wx.previewImage({
            current: t,
            urls: [ t ]
        });
    },
    goLink2: function(e) {
        if (this.authModal()) {
            var t = e.currentTarget.dataset.link;
            3 < getCurrentPages().length ? wx.redirectTo({
                url: t
            }) : wx.navigateTo({
                url: t
            });
        }
    },
    onShow: function() {
        var t = this;
        util.check_login_new().then(function(e) {
            e ? (t.setData({
                needAuth: !1,
                tabbarRefresh: !0
            }), (0, status.cartNum)("", !0).then(function(e) {
                0 == e.code && t.setData({
                    cartNum: e.data
                });
            }), t.getMemberInfo()) : (t.setData({
                needAuth: !0
            }), wx.hideLoading());
        });
    },
    onHide: function() {
        this.setData({
            tabbarRefresh: !1
        });
    },
    getReceiveMobile: function(e) {
        e.detail;
        wx.showToast({
            icon: "none",
            title: "授权成功"
        }), this.setData({
            showGetPhone: !1
        });
    },
    close: function() {
        this.setData({
            showGetPhone: !1
        });
    },
    closeDistribution: function() {
        this.setData({
            showDistribution: !1
        });
    },
    goDistribution: function() {
        var e = this.data.member_info;
        0 == e.comsiss_flag ? this.distributionNext() : 0 == e.comsiss_state ? this.distributionNext() : wx.navigateTo({
            url: "/lionfish_comshop/distributionCenter/pages/me"
        });
    },
    distributionNext: function() {
        if (1 == this.data.commiss_sharemember_need) {
            console.log("需要分享");
            wx.navigateTo({
                url: "/lionfish_comshop/distributionCenter/pages/recruit"
            });
        } else if (1 == this.data.commiss_biaodan_need) console.log("需要表单"), wx.navigateTo({
            url: "/lionfish_comshop/distributionCenter/pages/recruit"
        }); else {
            var e = 0, t = this.data.member_info;
            1 == t.comsiss_flag && (e = 0 == t.comsiss_state ? 1 : 2);
            var a = "/lionfish_comshop/distributionCenter/pages/recruit";
            2 == e && (a = "/lionfish_comshop/distributionCenter/pages/me"), wx.navigateTo({
                url: a
            });
        }
    },
    goNext: function(e) {
        console.log(e);
        var t = 0, a = this.data.member_info;
        1 == a.comsiss_flag && (t = 0 == a.comsiss_state ? 1 : 2);
        var s = e.currentTarget.dataset.type;
        "share" == s ? wx.navigateTo({
            url: "/lionfish_comshop/distributionCenter/pages/share"
        }) : "commiss" == s ? 2 == t ? wx.navigateTo({
            url: "/lionfish_comshop/distributionCenter/pages/me"
        }) : wx.navigateTo({
            url: "/lionfish_comshop/distributionCenter/pages/recruit"
        }) : "form" == s && (2 == t ? wx.navigateTo({
            url: "/lionfish_comshop/distributionCenter/pages/me"
        }) : wx.navigateTo({
            url: "/lionfish_comshop/distributionCenter/pages/recruit"
        }));
    },
    loginOut: function() {
        wx.removeStorageSync("community"), wx.removeStorage({
            key: "token",
            success: function(e) {
                wx.reLaunch({
                    url: "/lionfish_comshop/pages/user/me"
                });
            }
        });
    }
});