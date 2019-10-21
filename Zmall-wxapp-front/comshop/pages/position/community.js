var location = require("../../utils/Location"), QQMapWX = require("../../utils/qqmap-wx-jssdk.min.js"), util = require("../../utils/util.js"), status = require("../../utils/index.js"), app = getApp();

Page({
    data: {
        loadMore: !0,
        canGetGPS: !0,
        tip: "加载中...",
        community: {},
        communities: [],
        historyCommunity: [],
        city: {
            districtName: ""
        },
        latitude: "",
        longitude: "",
        hasRefeshin: !1,
        pageNum: 1,
        isNotHistory: !0,
        city_id: 0,
        needAuth: !1,
        common_header_backgroundimage: "",
        groupInfo: {
            group_name: "社区",
            owner_name: "团长"
        },
        isEmpty: !1
    },
    linkSearch: function() {
        wx.navigateTo({
            url: "/lionfish_comshop/pages/position/search?city=" + JSON.stringify(this.data.city)
        });
    },
    isFirst: !0,
    onLoad: function(t) {
        var e = this;
        status.setNavBgColor(), this.setData({
            common_header_backgroundimage: app.globalData.common_header_backgroundimage
        }), status.setGroupInfo().then(function(t) {
            e.setData({
                groupInfo: t
            });
        }), this.loadpage();
    },
    loadpage: function() {
        var t = this, e = wx.getStorageSync("community");
        if (e && t.setData({
            community: e
        }), wx.getStorageSync("tx_map_key")) {
            var a = wx.getStorageSync("shopname");
            wx.setNavigationBarTitle({
                title: a
            }), t.load_gps_community();
        } else t.getCommunityConfig();
    },
    authSuccess: function() {
        this.setData({
            needAuth: !1
        }), this.loadpage();
    },
    getCommunityConfig: function() {
        console.log("getCommunityConfig", 2);
        var e = this;
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "index.get_community_config"
            },
            dataType: "json",
            success: function(t) {
                0 == t.data.code && (wx.setStorage({
                    key: "shopname",
                    data: t.data.shoname
                }), t.data.shoname && wx.setNavigationBarTitle({
                    title: t.data.shoname
                }), wx.setStorage({
                    key: "tx_map_key",
                    data: t.data.tx_map_key
                }), e.setData({
                    tx_map_key: t.data.tx_map_key
                }), wx.setStorage({
                    key: "shop_index_share_title",
                    data: t.data.shop_index_share_title
                }), e.load_gps_community());
            }
        });
    },
    load_gps_community: function() {
        var t = wx.getStorageSync("token"), e = wx.getStorageSync("tx_map_key");
        if (null == e || "" == e) {
            if (!this.data.tx_map_key) return void this.getCommunityConfig();
            e = this.data.tx_map_key;
        }
        var i = this;
        t && app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "index.load_history_community",
                token: t
            },
            dataType: "json",
            success: function(t) {
                if (0 == t.data.code) {
                    var e = t.data.list, a = !1;
                    0 != Object.keys(e).length && 0 != e.communityId || (a = !0), i.data.community && (app.globalData.community = e), 
                    i.setData({
                        historyCommunity: e,
                        isNotHistory: a
                    });
                }
            }
        });
        var a = new QQMapWX({
            key: e || ""
        });
        wx.getLocation({
            type: "gcj02",
            success: function(t) {
                console.log("getLocation success");
                t.latitude, t.longitude;
                i.setData({
                    latitude: t.latitude,
                    longitude: t.longitude
                }), wx.setStorage({
                    key: "latitude",
                    data: t.latitude
                }), wx.setStorage({
                    key: "longitude",
                    data: t.longitude
                }), a.reverseGeocoder({
                    location: {
                        latitude: t.latitude,
                        longitude: t.longitude
                    },
                    success: function(t) {
                        var e = t.result.address_component.city;
                        i.setData({
                            city: {
                                districtName: e
                            }
                        }), wx.showLoading({
                            title: "加载中...",
                            mask: !0,
                            icon: "none"
                        }), i.load_gps_community_list();
                    }
                });
            },
            fail: function(t) {
                console.log("getLocation Fail"), i.isFirst = !0, location.checkGPS(app, function() {
                    if (console.log("canGetGPS", app.globalData.canGetGPS), app.globalData.canGetGPS) {
                        console.log("checkGPS sucess");
                        var t = app.globalData.location;
                        t && t.lat && (i.setData({
                            latitude: t.latitude,
                            longitude: t.longitude
                        }), wx.setStorage({
                            key: "latitude",
                            data: t.latitude
                        }), wx.setStorage({
                            key: "longitude",
                            data: t.longitude
                        }), a.reverseGeocoder({
                            location: {
                                latitude: t.latitude,
                                longitude: t.longitude
                            },
                            success: function(t) {
                                var e = t.result.address_component.city;
                                i.setData({
                                    city: {
                                        districtName: e
                                    }
                                }), i.load_gps_community_list();
                            }
                        }));
                    } else location.openSetting(app).then(function(t) {
                        i.setData({
                            latitude: t.latitude,
                            longitude: t.longitude
                        }), wx.setStorage({
                            key: "latitude",
                            data: t.latitude
                        }), wx.setStorage({
                            key: "longitude",
                            data: t.longitude
                        }), a.reverseGeocoder({
                            location: {
                                latitude: t.latitude,
                                longitude: t.longitude
                            },
                            success: function(t) {
                                var e = t.result.address_component.city;
                                i.setData({
                                    city: {
                                        districtName: e
                                    }
                                }), i.load_gps_community_list();
                            }
                        });
                    }).catch(function() {
                        i.setData({
                            isEmpty: !0,
                            loadMore: !1,
                            hasRefeshin: !0,
                            tip: "",
                            canGetGPS: !1
                        });
                    });
                });
            }
        });
    },
    load_gps_community_list: function(t) {
        console.log("load_gps_community_list");
        var e = wx.getStorageSync("token"), a = this;
        console.log("come gpslist"), a.data.hasRefeshin || (a.setData({
            hasRefeshin: !0,
            loadMore: !0
        }), app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "index.load_gps_community",
                token: e,
                pageNum: a.data.pageNum,
                longitude: a.data.longitude,
                latitude: a.data.latitude,
                city_id: a.data.city_id || 0
            },
            dataType: "json",
            success: function(t) {
                if (wx.hideLoading(), 0 == t.data.code) {
                    var e = a.data.communities.concat(t.data.list);
                    if (1 == a.data.pageNum && 0 == e.length) return a.setData({
                        isEmpty: !0,
                        loadMore: !1,
                        tip: "",
                        hasRefeshin: !0
                    }), !1;
                    a.setData({
                        communities: e,
                        pageNum: a.data.pageNum + 1,
                        loadMore: !1,
                        hasRefeshin: !1,
                        tip: "",
                        index_hide_headdetail_address: t.data.index_hide_headdetail_address || 0
                    });
                } else 1 == t.data.code ? a.setData({
                    loadMore: !1,
                    tip: "^_^已经到底了"
                }) : 2 == t.data.code && (wx.hideLoading(), console.log(a.data.needAuth), a.setData({
                    needAuth: !0,
                    hasRefeshin: !1
                }));
            }
        }));
    },
    openSetting: function() {
        var t = this;
        t.setData({
            isEmpty: !1,
            loadMore: !0,
            hasRefeshin: !1,
            tip: "加载中"
        }, function() {
            t.load_gps_community();
        });
    },
    onShow: function() {
        if (console.log("show"), this.isFirst) this.isFirst = !1; else {
            console.log("nofirst");
            var t = wx.getStorageSync("city"), e = wx.getStorageSync("city_id");
            console.log(e), t && this.setData({
                city: t,
                city_id: e,
                pageNum: 1,
                hasRefeshin: !1,
                communities: []
            }), wx.showLoading({
                title: "加载中...",
                mask: !0,
                icon: "none"
            }), this.load_gps_community_list();
        }
    },
    onPullDownRefresh: function() {},
    onReachBottom: function() {
        this.load_gps_community_list();
    }
});