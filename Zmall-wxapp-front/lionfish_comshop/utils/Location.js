var app = getApp(), QQMapWX = require("./qqmap-wx-jssdk.min.js");

function checkGPS(t, e) {
    wx.authorize({
        scope: "scope.userLocation",
        success: function() {
            console.log("get GPS success"), wx.getLocation({
                success: function(t) {
                    console.log("get GPS location success"), app.globalData.location = {
                        lat: t.latitude,
                        lng: t.longitude
                    }, app.globalData.canGetGPS = !0, wx.setStorage({
                        key: "latitude",
                        data: t.latitude
                    }), wx.setStorage({
                        key: "longitude",
                        data: t.longitude
                    });
                },
                fail: function() {
                    console.log("get GPS location fail"), app.globalData.canGetGPS = !1;
                }
            });
        },
        fail: function() {
            console.log("get GPS fail checkGPS"), app.globalData.canGetGPS = !1, console.log(e());
        }
    });
}

function openSetting(t) {
    return new Promise(function(e, o) {
        wx.showModal({
            content: "为了更好的服务您,需要您的地理位置",
            confirmText: "去开启",
            confirmColor: "#FF673F",
            success: function(t) {
                t.confirm ? wx.openSetting({
                    success: function(t) {
                        console.log(t), t.authSetting["scope.userLocation"] ? wx.getLocation({
                            success: function(t) {
                                console.log("get GPS location success"), getApp().globalData.location = {
                                    lat: t.latitude,
                                    lng: t.longitude
                                }, getApp().globalData.canGetGPS = !0, e(t);
                            },
                            fail: function(t) {
                                console.log("get GPS fail openSetting"), getApp().globalData.canGetGPS = !1, o("取消", t);
                            }
                        }) : o("未开启");
                    },
                    fail: function(t) {
                        o(t);
                    }
                }) : t.cancel && (o("用户点击取消"), console.log("用户点击取消"));
            }
        });
    });
}

function getGps() {
    var o = this;
    return new Promise(function(e, t) {
        wx.getLocation({
            type: "gcj02",
            success: function(t) {
                e(t);
                t.latitude, t.longitude;
                wx.setStorage({
                    key: "latitude",
                    data: t.latitude
                }), wx.setStorage({
                    key: "longitude",
                    data: t.longitude
                });
            },
            fail: function(t) {
                "getLocation:fail auth deny" == t.errMsg ? o.openSetting().then(function(t) {
                    console.log(t);
                }).catch(function() {
                    console.log(t);
                }) : console.log(t);
            }
        });
    });
}

function getGpsLocation(o, n) {
    var a = wx.getStorageSync("tx_map_key");
    return a ? new Promise(function(e, t) {
        analyzeGps(a, o, n).then(function(t) {
            e(t);
        });
    }) : new Promise(function(e, t) {
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "index.get_community_config"
            },
            dataType: "json",
            success: function(t) {
                0 == t.data.code && (a = t.data.tx_map_key, wx.setStorage({
                    key: "tx_map_key",
                    data: a
                }), analyzeGps(a, o, n).then(function(t) {
                    e(t);
                }));
            }
        });
    });
}

function analyzeGps(t, e, n) {
    var a = new QQMapWX({
        key: t
    });
    return new Promise(function(o, t) {
        a.reverseGeocoder({
            location: {
                latitude: e,
                longitude: n
            },
            success: function(t) {
                var e = t.result.address_component;
                o(e);
            }
        });
    });
}

module.exports = {
    checkGPS: checkGPS,
    openSetting: openSetting,
    getGps: getGps,
    getGpsLocation: getGpsLocation
};