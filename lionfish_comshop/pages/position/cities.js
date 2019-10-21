var app = getApp(), cities = [], QQMapWX = require("../../utils/qqmap-wx-jssdk.min.js");

Page({
    data: {
        cities: [],
        localCity: {}
    },
    onLoad: function(t) {
        var e = wx.getStorageSync("shopname");
        e && wx.setNavigationBarTitle({
            title: e || ""
        }), this.getMapKey(), this.getData();
    },
    getMapKey: function() {
        var t = wx.getStorageSync("tx_map_key");
        console.log("tx_map_key", t);
        t ? this.getCity() : (console.log("step4"), this.getCommunityConfig(), console.log("step2"));
    },
    getCommunityConfig: function() {
        var a = this;
        return new Promise(function(e, t) {
            app.util.request({
                url: "entry/wxapp/index",
                data: {
                    controller: "index.get_community_config"
                },
                dataType: "json",
                success: function(t) {
                    console.log("step1"), 0 == t.data.code && (wx.setStorage({
                        key: "shopname",
                        data: t.data.shoname
                    }), t.data.shoname && wx.setNavigationBarTitle({
                        title: t.data.shoname
                    }), wx.setStorage({
                        key: "tx_map_key",
                        data: t.data.tx_map_key
                    }), wx.setStorage({
                        key: "shop_index_share_title",
                        data: t.data.shop_index_share_title
                    }), e(t), a.getCity());
                }
            });
        });
    },
    getCity: function() {
        console.log("step3");
        wx.getStorageSync("token");
        var t = wx.getStorageSync("tx_map_key");
        console.log(t);
        var e = this, a = new QQMapWX({
            key: t
        });
        wx.getLocation({
            type: "gcj02",
            success: function(t) {
                t.latitude, t.longitude;
                e.setData({
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
                        e.setData({
                            localCity: {
                                districtName: t.result.address_component.city
                            }
                        }), wx.setStorage({
                            key: "city",
                            data: e.data.localCity
                        });
                    }
                });
            }
        });
    },
    getData: function() {
        var e = this;
        wx.showLoading({
            title: "加载中...",
            mask: !0
        });
        var t = app.globalData.city;
        if (cities.length) this.setData({
            cities: cities,
            localCity: t
        }), wx.hideLoading(); else {
            var a = wx.getStorageSync("token");
            wx.getStorageSync("community");
            app.util.request({
                url: "entry/wxapp/index",
                data: {
                    controller: "community.get_city_list",
                    token: a
                },
                dataType: "json",
                success: function(t) {
                    if (0 == t.data.code) {
                        var i = [], o = [];
                        t.data.data && t.data.data.forEach(function(t) {
                            var e = t.firstLetter, a = o.indexOf(e);
                            a < 0 && (o.push(e), i.push({
                                key: e,
                                list: []
                            }), a = o.length - 1), i[a].list.push({
                                name: t.districtName,
                                key: e,
                                city: t
                            });
                        }), i.sort(function(t, e) {
                            return t.key > e.key ? 1 : t.key < e.key ? -1 : 0;
                        }), cities = i, e.setData({
                            cities: cities
                        });
                    }
                    wx.hideLoading();
                }
            });
        }
    },
    chooseCity: function(t) {
        var e = getCurrentPages(), a = 1;
        -1 < e[e.length - 2].route.indexOf("/position/search") && (a = 2);
        var i = t.currentTarget.dataset.city;
        app.globalData.changeCity = i.city_id || 0, wx.setStorage({
            key: "city",
            data: {
                districtName: i.districtName
            }
        }), wx.setStorage({
            key: "city_id",
            data: i.city_id
        }), wx.navigateBack({
            delta: a
        });
    }
});