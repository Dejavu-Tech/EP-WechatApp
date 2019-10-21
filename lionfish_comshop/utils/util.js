function getdomain() {
    var e = getApp();
    return e.siteInfo.uniacid + "_" + e.siteInfo.siteroot;
}

function api() {
    return "https://mall.shiziyu888.com/dan/";
}

function check_login() {
    var e = wx.getStorageSync("token"), o = wx.getStorageSync("member_id");
    return !!(e && null != o && 0 < o.length);
}

function check_login_new() {
    var t = wx.getStorageSync("token"), n = wx.getStorageSync("member_id");
    return new Promise(function(e, o) {
        wx.checkSession({
            success: function() {
                console.log("checkSession 未过期"), t && null != n && 0 < n.length ? e(!0) : e(!1);
            },
            fail: function() {
                console.log("checkSession 过期"), e(!1);
            }
        });
    });
}

function checkRedirectTo(e, o) {
    var t = !1;
    if (o) {
        -1 !== [ "/lionfish_comshop/pages/groupCenter/apply", "/lionfish_comshop/pages/supply/apply", "/lionfish_comshop/pages/user/charge", "/lionfish_comshop/pages/order/index" ].indexOf(e) && (t = !0);
    }
    return t;
}

function login(n) {
    var i = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : 0, r = getApp(), a = wx.getStorageSync("share_id");
    null == a && (a = "0"), wx.login({
        success: function(e) {
            e.code && (console.log(e.code), r.util.request({
                url: "entry/wxapp/user",
                data: {
                    controller: "user.applogin",
                    code: e.code
                },
                dataType: "json",
                success: function(t) {
                    console.log(t), wx.setStorage({
                        key: "token",
                        data: t.data.token
                    }), wx.getUserInfo({
                        success: function(e) {
                            var o = e.userInfo;
                            wx.setStorage({
                                key: "userInfo",
                                data: o
                            }), console.log(e.userInfo), r.util.request({
                                url: "entry/wxapp/user",
                                data: {
                                    controller: "user.applogin_do",
                                    token: t.data.token,
                                    share_id: a,
                                    nickName: e.userInfo.nickName,
                                    avatarUrl: e.userInfo.avatarUrl,
                                    encrypteddata: e.encryptedData,
                                    iv: e.iv
                                },
                                method: "post",
                                dataType: "json",
                                success: function(e) {
                                    wx.setStorage({
                                        key: "member_id",
                                        data: e.data.member_id
                                    }), wx.showToast({
                                        title: "资料已更新",
                                        icon: "success",
                                        duration: 2e3,
                                        success: function() {
                                            n && 0 < n.length && (1 == i ? wx.switchTab({
                                                url: n
                                            }) : wx.redirectTo({
                                                url: n
                                            }));
                                        }
                                    });
                                }
                            });
                        },
                        fail: function(e) {}
                    });
                }
            }));
        }
    });
}

function login_prosime() {
    var i = !(0 < arguments.length && void 0 !== arguments[0]) || arguments[0], r = getApp(), a = wx.getStorageSync("share_id");
    null == a && (a = "0");
    var e = wx.getStorageSync("community"), s = e && (e.communityId || 0);
    return e && wx.setStorageSync("lastCommunity", e), new Promise(function(n, o) {
        wx.login({
            success: function(e) {
                e.code ? (console.log(e.code), r.util.request({
                    url: "entry/wxapp/user",
                    data: {
                        controller: "user.applogin",
                        code: e.code
                    },
                    dataType: "json",
                    success: function(t) {
                        console.log(t), wx.setStorage({
                            key: "token",
                            data: t.data.token
                        }), wx.getUserInfo({
                            success: function(e) {
                                var o = e.userInfo;
                                wx.setStorage({
                                    key: "userInfo",
                                    data: o
                                }), console.log(e.userInfo), r.util.request({
                                    url: "entry/wxapp/user",
                                    data: {
                                        controller: "user.applogin_do",
                                        token: t.data.token,
                                        share_id: a,
                                        nickName: e.userInfo.nickName,
                                        avatarUrl: e.userInfo.avatarUrl,
                                        encrypteddata: e.encryptedData,
                                        iv: e.iv,
                                        community_id: s
                                    },
                                    method: "post",
                                    dataType: "json",
                                    success: function(e) {
                                        wx.setStorage({
                                            key: "member_id",
                                            data: e.data.member_id
                                        }), console.log("needPosition", i), i && getCommunityInfo(), n(e);
                                    }
                                });
                            },
                            fail: function(e) {
                                o(e);
                            }
                        });
                    }
                })) : o(e.errMsg);
            }
        });
    });
}

function stringToJson(e) {
    return JSON.parse(e);
}

function jsonToString(e) {
    return JSON.stringify(e);
}

function imageUtil(e) {
    var n = {}, i = e.detail.width, r = e.detail.height, a = r / i;
    return wx.getSystemInfo({
        success: function(e) {
            var o = e.windowWidth, t = e.windowHeight;
            a < t / o ? (n.imageWidth = o, n.imageHeight = o * r / i) : (n.imageHeight = t, 
            n.imageWidth = t * i / r);
        }
    }), n;
}

var formatTime = function(e) {
    var o = e.getFullYear(), t = e.getMonth() + 1, n = e.getDate(), i = e.getHours(), r = e.getMinutes(), a = e.getSeconds();
    return [ o, t, n ].map(formatNumber).join("/") + " " + [ i, r, a ].map(formatNumber).join(":");
}, formatNumber = function(e) {
    return (e = e.toString())[1] ? e : "0" + e;
}, getCommunityInfo = function() {
    var n = 0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : {}, o = wx.getStorageSync("community"), i = getApp(), r = wx.getStorageSync("token");
    return new Promise(function(t, e) {
        o ? t("") : i.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "index.load_history_community",
                token: r
            },
            dataType: "json",
            success: function(e) {
                if (0 == e.data.code) {
                    var o = e.data.list;
                    0 < Object.keys(o).length || 0 != o.communityId ? (wx.setStorageSync("community", o), 
                    i.globalData.community = o, t(o)) : t("");
                } else console.log(n), check_login() && void 0 === n.communityId ? (wx.redirectTo({
                    url: "/lionfish_comshop/pages/position/community"
                }), t("")) : t(n);
            }
        });
    });
};

module.exports = {
    formatTime: formatTime,
    login: login,
    check_login: check_login,
    api: api,
    getdomain: getdomain,
    imageUtil: imageUtil,
    jsonToString: jsonToString,
    stringToJson: stringToJson,
    login_prosime: login_prosime,
    getCommunityInfo: getCommunityInfo,
    check_login_new: check_login_new,
    checkRedirectTo: checkRedirectTo
};