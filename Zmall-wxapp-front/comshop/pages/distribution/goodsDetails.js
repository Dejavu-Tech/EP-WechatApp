var app = getApp(), util = require("../../utils/util.js");

Page({
    data: {
        currentTab: 0,
        pageSize: 10,
        navList: [ {
            name: "全部",
            status: "-1"
        }, {
            name: "已完成",
            status: "1"
        }, {
            name: "未完成",
            status: "0"
        }, {
            name: "已取消",
            status: "2"
        } ],
        list: [],
        loadText: "没有更多记录了~",
        containerHeight: 0,
        info: {},
        noData: 0,
        loadMore: !0
    },
    page: 1,
    onLoad: function(t) {
        var a = wx.getSystemInfoSync();
        console.log(a.windowHeight), this.setData({
            containerHeight: a.windowHeight - Math.round(a.windowHeight / 375 * 48) - 130
        });
        util.check_login() ? (this.getInfo(), this.getData()) : this.setData({
            needAuth: !0
        });
    },
    getInfo: function() {
        wx.showLoading();
        var t = wx.getStorageSync("token"), a = this;
        app.util.request({
            url: "entry/wxapp/user",
            data: {
                controller: "distribution.get_commission_info",
                token: t
            },
            dataType: "json",
            success: function(t) {
                wx.hideLoading(), 0 == t.data.code ? a.setData({
                    info: t.data.data
                }) : wx.showModal({
                    title: "提示",
                    content: t.data.msg,
                    showCancel: !1,
                    success: function(t) {
                        t.confirm && (console.log("用户点击确定"), wx.reLaunch({
                            url: "/lionfish_comshop/pages/user/me"
                        }));
                    }
                });
            }
        });
    },
    getData: function() {
        var e = this, t = wx.getStorageSync("token"), a = this.data.currentTab, n = this.data.navList[a].status;
        wx.showLoading(), app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "distribution.listorder_list",
                token: t,
                state: n,
                page: this.page
            },
            dataType: "json",
            success: function(t) {
                if (console.log(t), 0 == t.data.code) {
                    var a = t.data.data;
                    a = e.data.list.concat(a), e.page++, e.setData({
                        list: a
                    });
                } else 1 == e.page && e.setData({
                    noData: 1
                }), e.setData({
                    loadMore: !1
                });
                wx.hideLoading();
            }
        });
    },
    getCurrentList: function() {
        if (!this.data.loadMore) return !1;
        this.getData(), this.setData({
            isHideLoadMore: !1
        });
    },
    bindChange: function(t) {
        var a = this;
        this.page = 1, this.setData({
            currentTab: 1 * t.detail.current,
            list: [],
            noData: 0,
            loadMore: !0
        }, function() {
            console.log("我变啦"), a.getData();
        });
    },
    switchNav: function(t) {
        if (this.data.currentTab === 1 * t.target.dataset.current) return !1;
        this.setData({
            currentTab: 1 * t.target.dataset.current
        });
    }
});