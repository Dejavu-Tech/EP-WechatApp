var app = getApp(), util = require("./util.js"), wcache = require("./wcache.js");

function loadStatus() {
    return new Promise(function(e) {
        util.check_login_new().then(function(a) {
            var t = 1;
            a ? app.globalData.hasDefaultCommunity || (t = 2) : t = 0, app.globalData.appLoadStatus = t, 
            e();
        });
    });
}

function changeCommunity(e, a) {
    var t = wx.getStorageSync("token") || "";
    if (e.communityId && e.communityId !== app.globalData.community.communityId && t) {
        app.globalData.timer.del(), app.globalData.changedCommunity = !0, app.globalData.community = e, 
        app.globalData.refresh = !0, app.globalData.hasDefaultCommunity = !0, wx.setStorage({
            key: "community",
            data: e
        }), app.globalData.city = a, wx.setStorage({
            key: "city",
            data: a
        });
        var o = {
            community: e,
            city: a
        }, n = app.globalData.historyCommunity || [];
        (0 === n.length || n[0] && n[0].communityId !== e.communityId) && (1 < n.length && n.shift(), 
        n.push(o), app.globalData.historyCommunity = n, wx.setStorage({
            key: "historyCommunity",
            data: n
        })), app.globalData.changedCommunity = !0, app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "index.switch_history_community",
                token: t,
                head_id: e.communityId
            },
            dataType: "json",
            success: function(a) {
                if (0 == a.data.code) {
                    app.globalData.community_id = e.communityId;
                    var t = app.globalData.navBackUrl;
                    t ? -1 != t.indexOf("lionfish_comshop/pages/index/index") || -1 != t.indexOf("lionfish_comshop/pages/order/shopCart") || -1 != t.indexOf("lionfish_comshop/pages/user/me") || -1 != t.indexOf("lionfish_comshop/pages/type/index") ? wx.switchTab({
                        url: t,
                        success: function() {
                            app.globalData.navBackUrl = "";
                        }
                    }) : wx.redirectTo({
                        url: t,
                        success: function() {
                            app.globalData.navBackUrl = "";
                        }
                    }) : wx.switchTab({
                        url: "/lionfish_comshop/pages/index/index"
                    });
                }
            }
        });
    } else app.globalData.community.disUserHeadImg || (app.globalData.community = e, 
    wx.setStorage({
        key: "community",
        data: e
    })), app.globalData.changedCommunity = !0, wx.switchTab({
        url: "/lionfish_comshop/pages/index/index"
    });
}

function isIdCard(a) {
    return /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(a);
}

function cartNum() {
    function e(t) {
        var a = wx.getStorageSync("token") || "";
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "car.count",
                token: a,
                community_id: app.globalData.community.communityId
            },
            dataType: "json",
            success: function(a) {
                0 == a.data.code && (app.globalData.cartNum = a.data.data, wx.setStorageSync("cartNum", a.data.data), 
                o(a.data.data), t(a.data));
            }
        });
    }
    function o(a) {}
    var n = 0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : "", i = 1 < arguments.length && void 0 !== arguments[1] && arguments[1];
    return new Promise(function(a) {
        if (i) e(a); else {
            var t = new Date().getTime();
            app.globalData.cartNumStamp < t ? e(a) : ("number" == typeof n && (app.globalData.cartNum = n), 
            app.globalData.cartNum, a(n)), app.globalData.cartNumStamp = new Date().getTime() + 6e4;
        }
    });
}

function getRect(a, e, o) {
    return new Promise(function(t) {
        wx.createSelectorQuery().in(a)[o ? "selectAll" : "select"](e).boundingClientRect(function(a) {
            o && Array.isArray(a) && a.length && t(a), !o && a && t(a);
        }).exec();
    });
}

function getInNum() {
    return new Promise(function(a, t) {
        var e = Date.parse(new Date()), o = parseInt(wx.getStorageSync("inNum")) || 0, n = parseInt(wx.getStorageSync("inNumExp")) || 0, i = new Date(new Date().toLocaleDateString()).getTime();
        864e5 < e - n || 0 == n ? (console.log("过期了"), o = 1, wx.setStorage({
            key: "inNumExp",
            data: i
        })) : o += 1, wx.setStorage({
            key: "inNum",
            data: o
        }), a(!(3 < o));
    });
}

function setNavBgColor() {
    var a = wcache.get("navBgColor", 1), t = wcache.get("navFontColor", 1);
    1 == a || 1 == t ? app.util.request({
        url: "entry/wxapp/index",
        data: {
            controller: "index.get_nav_bg_color"
        },
        dataType: "json",
        success: function(a) {
            if (0 == a.data.code) {
                var t = a.data.data || "#F75451", e = a.data.nav_font_color || "#ffffff";
                wx.setNavigationBarColor({
                    frontColor: e,
                    backgroundColor: t
                }), wcache.put("navBgColor", t, 600), wcache.put("navFontColor", e, 600);
            }
        }
    }) : wx.setNavigationBarColor({
        frontColor: t,
        backgroundColor: a
    });
}

function setGroupInfo() {
    return new Promise(function(e, a) {
        var t = wcache.get("groupInfo", 1);
        1 == t ? app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "index.get_group_info"
            },
            dataType: "json",
            success: function(a) {
                if (0 == a.data.code) {
                    var t = a.data.data;
                    console.log(t), t.group_name = t.group_name || "社区", t.owner_name = t.owner_name || "团长", 
                    wcache.put("groupInfo", t, 600), e(t);
                }
            }
        }) : e(t);
    });
}

function setIcon() {
    var e = wcache.get("tabList", 1);
    return new Promise(function(o, a) {
        if (1 == e) app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "index.get_tabbar"
            },
            dataType: "json",
            success: function(a) {
                if (0 == a.data.code) {
                    var t = a.data.data, e = {
                        home: "",
                        car: "",
                        user: ""
                    };
                    e.home = t.i1 || "/lionfish_comshop/images/icon-tab-index.png", e.car = t.i2 || "/lionfish_comshop/images/icon-tab-shop.png", 
                    e.user = t.i3 || "/lionfish_comshop/images/icon-tab-me.png", o(e);
                }
            }
        }); else {
            var t = {
                home: "",
                car: ""
            };
            t.home = e.list[0].iconPath, t.car = e.list[2].iconPath, t.user = e.list[3].iconPath, 
            o(t);
        }
    });
}

function getPx(a) {
    return Math.round(app.globalData.systemInfo.windowWidth / 375 * a);
}

function drawText(a, t, e, o, n, i) {
    var r = e.split(""), u = "", c = [];
    a.setFillStyle(t.color), a.textAlign = t.textAlign, a.setFontSize(t.size);
    for (var s = 0; s < r.length; s++) a.measureText(u).width < i || (c.push(u), u = ""), 
    u += r[s];
    c.push(u);
    for (var l = 0; l < c.length; l++) a.fillText(c[l], o, n + 12 * l);
}

function download(a) {
    return new Promise(function(t) {
        wx.downloadFile({
            url: a,
            success: function(a) {
                200 === a.statusCode && t(a);
            },
            fail: function(a) {
                console.log(a), wx.hideLoading();
            }
        });
    });
}

function indexListCarCount(a) {
    var t = {
        actId: a,
        num: 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : 0
    };
    if (a) {
        var e = app.globalData.goodsListCarCount;
        if (0 == e.length) e.push(t); else {
            var o = e.findIndex(function(a) {
                return a.actId == t.actId;
            });
            -1 == o ? e.push(t) : e[o].num = t.num;
        }
        app.globalData.goodsListCarCount = e;
    }
}

module.exports = {
    changeCommunity: changeCommunity,
    loadStatus: loadStatus,
    isIdCard: isIdCard,
    cartNum: cartNum,
    getRect: getRect,
    getInNum: getInNum,
    setNavBgColor: setNavBgColor,
    setGroupInfo: setGroupInfo,
    setIcon: setIcon,
    getPx: getPx,
    drawText: drawText,
    download: download,
    indexListCarCount: indexListCarCount
};