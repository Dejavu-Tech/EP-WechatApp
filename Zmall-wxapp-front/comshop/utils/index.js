var app = getApp(), util = require("./util.js"), wcache = require("./wcache.js");

function loadStatus() {
    return new Promise(function(o) {
        util.check_login_new().then(function(a) {
            var t = 1;
            a ? app.globalData.hasDefaultCommunity || (t = 2) : t = 0, app.globalData.appLoadStatus = t, 
            o();
        });
    });
}

function changeCommunity(o, a) {
    var t = wx.getStorageSync("token") || "";
    if (o.communityId && o.communityId !== app.globalData.community.communityId) {
        app.globalData.timer.del(), app.globalData.changedCommunity = !0, app.globalData.community = o, 
        app.globalData.refresh = !0, app.globalData.hasDefaultCommunity = !0, wx.setStorage({
            key: "community",
            data: o
        }), app.globalData.city = a, wx.setStorage({
            key: "city",
            data: a
        });
        var e = {
            community: o,
            city: a
        }, n = app.globalData.historyCommunity || [];
        (0 === n.length || n[0] && n[0].communityId !== o.communityId) && (1 < n.length && n.shift(), 
        n.push(e), app.globalData.historyCommunity = n, wx.setStorage({
            key: "historyCommunity",
            data: n
        })), app.globalData.changedCommunity = !0, t ? app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "index.switch_history_community",
                token: t,
                head_id: o.communityId
            },
            dataType: "json",
            success: function(a) {
                if (0 == a.data.code) {
                    app.globalData.community_id = o.communityId;
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
        }) : (app.globalData.community_id = o.communityId, wx.switchTab({
            url: "/lionfish_comshop/pages/index/index"
        }));
    } else app.globalData.community.disUserHeadImg || (app.globalData.community = o, 
    wx.setStorage({
        key: "community",
        data: o
    })), app.globalData.changedCommunity = !0, wx.switchTab({
        url: "/lionfish_comshop/pages/index/index"
    });
}

function isIdCard(a) {
    return /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(a);
}

function cartNum() {
    function o(t) {
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
                e(a.data.data), t(a.data));
            }
        });
    }
    function e(a) {}
    var n = 0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : "", i = 1 < arguments.length && void 0 !== arguments[1] && arguments[1];
    return new Promise(function(a) {
        if (i) o(a); else {
            var t = new Date().getTime();
            app.globalData.cartNumStamp < t ? o(a) : ("number" == typeof n && (app.globalData.cartNum = n), 
            app.globalData.cartNum, a(n)), app.globalData.cartNumStamp = new Date().getTime() + 6e4;
        }
    });
}

function getRect(a, o, e) {
    return new Promise(function(t) {
        wx.createSelectorQuery().in(a)[e ? "selectAll" : "select"](o).boundingClientRect(function(a) {
            e && Array.isArray(a) && a.length && t(a), !e && a && t(a);
        }).exec();
    });
}

function getInNum() {
    return new Promise(function(a, t) {
        var o = Date.parse(new Date()), e = parseInt(wx.getStorageSync("inNum")) || 0, n = parseInt(wx.getStorageSync("inNumExp")) || 0, i = new Date(new Date().toLocaleDateString()).getTime();
        864e5 < o - n || 0 == n ? (console.log("过期了"), e = 1, wx.setStorage({
            key: "inNumExp",
            data: i
        })) : e += 1, wx.setStorage({
            key: "inNum",
            data: e
        }), a(!(3 < e));
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
                var t = a.data.data || "#F75451", o = a.data.nav_font_color || "#ffffff";
                wx.setNavigationBarColor({
                    frontColor: o,
                    backgroundColor: t
                }), wcache.put("navBgColor", t, 600), wcache.put("navFontColor", o, 600);
            }
        }
    }) : wx.setNavigationBarColor({
        frontColor: t,
        backgroundColor: a
    });
}

function setGroupInfo() {
    return new Promise(function(o, a) {
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
                    wcache.put("groupInfo", t, 600), o(t);
                }
            }
        }) : o(t);
    });
}

function setIcon() {
    var o = wcache.get("tabList", 1);
    return new Promise(function(e, a) {
        if (1 == o) app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "index.get_tabbar"
            },
            dataType: "json",
            success: function(a) {
                if (0 == a.data.code) {
                    var t = a.data.data, o = {
                        home: "",
                        car: "",
                        user: ""
                    };
                    o.home = t.i1 || "/lionfish_comshop/images/icon-tab-index.png", o.car = t.i2 || "/lionfish_comshop/images/icon-tab-shop.png", 
                    o.user = t.i3 || "/lionfish_comshop/images/icon-tab-me.png", e(o);
                }
            }
        }); else {
            var t = {
                home: "",
                car: ""
            };
            t.home = o.list[0].iconPath, t.car = o.list[2].iconPath, t.user = o.list[3].iconPath, 
            e(t);
        }
    });
}

function getPx(a) {
    return Math.round(app.globalData.systemInfo.windowWidth / 375 * a);
}

function drawText(a, t, o, e, n, i) {
    var r = o.split(""), c = "", u = [];
    a.setFillStyle(t.color), a.textAlign = t.textAlign, a.setFontSize(t.size);
    for (var l = 0; l < r.length; l++) a.measureText(c).width < i || (u.push(c), c = ""), 
    c += r[l];
    u.push(c);
    for (var s = 0; s < u.length; s++) a.fillText(u[s], e, n + 12 * s);
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
        var o = app.globalData.goodsListCarCount;
        if (0 == o.length) o.push(t); else {
            var e = o.findIndex(function(a) {
                return a.actId == t.actId;
            });
            -1 == e ? o.push(t) : o[e].num = t.num;
        }
        app.globalData.goodsListCarCount = o;
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