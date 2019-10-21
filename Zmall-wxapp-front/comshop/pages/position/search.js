var wcache = require("../../utils/wcache.js"), status = require("../../utils/index.js"), app = getApp();

Page({
    data: {
        communities: [],
        city: {
            districtName: ""
        },
        cityName: "",
        inputValue: "",
        loadMore: !1,
        noResult: !0,
        latitude: "",
        longitude: "",
        hasRefeshin: !1,
        pageNum: 1,
        groupInfo: {
            group_name: "社区",
            owner_name: "团长"
        },
        tip: ""
    },
    onLoad: function(t) {
        var a = this;
        status.setNavBgColor();
        var e = wx.getStorageSync("city"), n = wcache.get("shopname");
        n && wx.setNavigationBarTitle({
            title: n
        }), status.setGroupInfo().then(function(t) {
            a.setData({
                groupInfo: t
            });
        }), a.setData({
            city: e,
            cityName: e.districtName
        });
    },
    onReady: function() {},
    onInput: function(t) {
        console.log(t.detail.value), this.setData({
            inputValue: t.detail.value
        });
    },
    subInput: function() {
        this.setData({
            pageNum: 1,
            hasRefeshin: !1
        }), this.load_gps_community_list();
    },
    load_gps_community_list: function() {
        var t = wx.getStorageSync("token"), a = wx.getStorageSync("latitude"), e = wx.getStorageSync("longitude"), n = this, i = this.data.inputValue;
        n.data.hasRefeshin || (n.setData({
            hasRefeshin: !0,
            loadMore: !0
        }), app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "index.load_gps_community",
                token: t,
                inputValue: i,
                pageNum: n.data.pageNum,
                longitude: e,
                latitude: a
            },
            dataType: "json",
            success: function(t) {
                if (0 == t.data.code) {
                    var a = n.data.communities.concat(t.data.list);
                    n.setData({
                        communities: a,
                        pageNum: n.data.pageNum + 1,
                        loadMore: !1,
                        hasRefeshin: !1,
                        tip: ""
                    });
                } else 1 == t.data.code ? n.setData({
                    loadMore: !1,
                    tip: "^_^已经到底了"
                }) : t.data.code;
            }
        }));
    },
    onShow: function() {},
    onHide: function() {},
    onUnload: function() {},
    onPullDownRefresh: function() {},
    onReachBottom: function() {
        this.load_gps_community_list();
    }
});