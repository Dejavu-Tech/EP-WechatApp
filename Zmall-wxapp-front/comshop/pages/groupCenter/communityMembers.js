var page = 1, app = getApp(), util = require("../../utils/util.js"), timeFormat = require("../../utils/timeFormat");

Page({
    data: {
        isCalling: !1,
        queryData: {
            createTime: null,
            communityId: null,
            order: [],
            page: page,
            pageSize: 20
        },
        maxDate: (0, timeFormat.formatYMD)(new Date()),
        searchKey: "",
        date: "",
        containerHeight: 0,
        showLoadMore: !1,
        no_order: 0,
        page: 1,
        hide_tip: !0,
        order: [],
        tip: "正在加载"
    },
    onLoad: function(a) {
        var t = wx.getSystemInfoSync();
        this.setData({
            containerHeight: t.windowHeight - Math.round(t.windowWidth / 375 * 125)
        }), page = 1, this.data.queryData.communityId = app.globalData.disUserInfo.communityId, 
        this.data.queryData.createTime = null, this.getData();
    },
    onReady: function() {},
    onShow: function() {
        var a = this.data.is_show_on;
        0 < a ? (this.setData({
            page: 1,
            order: []
        }), this.getData()) : this.setData({
            is_show_on: a + 1
        });
    },
    onHide: function() {},
    getData: function() {
        wx.showLoading({
            title: "加载中...",
            mask: !0
        }), this.setData({
            isHideLoadMore: !0
        }), this.data.no_order = 1;
        var e = this, a = wx.getStorageSync("token");
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "community.get_community_member_orderlist",
                date: e.data.date,
                searchKey: e.data.searchKey,
                token: a,
                page: e.data.page
            },
            dataType: "json",
            success: function(a) {
                if (0 != a.data.code) return e.setData({
                    isHideLoadMore: !0
                }), wx.hideLoading(), !1;
                console.log(e.data.page);
                var t = e.data.order.concat(a.data.data);
                e.setData({
                    order: t,
                    hide_tip: !0,
                    no_order: 0
                }), wx.hideLoading();
            }
        });
    },
    getTodayMs: function() {
        var a = new Date();
        return a.setHours(0), a.setMinutes(0), a.setSeconds(0), a.setMilliseconds(0), Date.parse(a);
    },
    bindSearchChange: function(a) {
        this.setData({
            searchKey: a.detail.value
        });
    },
    searchByKey: function() {
        page = 1, this.setData({
            order: [],
            no_order: 0,
            page: 1
        }), this.data.queryData.memberNickName = this.data.searchKey, this.getData();
    },
    cancel: function() {
        page = 1, this.setData({
            searchKey: "",
            order: []
        }), this.data.queryData.memberNickName = null, this.getData();
    },
    bindDateChange: function(a) {
        page = 1, this.setData({
            date: a.detail.value,
            order: [],
            no_order: 0,
            page: 1
        }), this.data.queryData.createTime = new Date(a.detail.value).getTime() - 288e5, 
        this.getData();
    },
    clearDate: function() {
        page = 1, this.setData({
            date: "",
            order: [],
            no_order: 0,
            page: 1
        }), this.data.queryData.createTime = null, this.getData();
    },
    callTelphone: function(a) {
        var t = this, e = a.currentTarget.dataset.phone;
        "未下单" != e && (this.data.isCalling || (this.data.isCalling = !0, wx.makePhoneCall({
            phoneNumber: e,
            complete: function() {
                t.data.isCalling = !1;
            }
        })));
    },
    getMore: function() {
        if (console.log(222), 1 == this.data.no_order) return !1;
        this.data.page += 1, this.getData(), this.setData({
            isHideLoadMore: !1
        });
    },
    onUnload: function() {},
    onPullDownRefresh: function() {},
    onReachBottom: function() {}
});