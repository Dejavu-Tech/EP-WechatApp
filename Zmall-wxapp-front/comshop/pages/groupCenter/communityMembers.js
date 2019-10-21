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
    onLoad: function(e) {
        var a = wx.getSystemInfoSync();
        this.setData({
            containerHeight: a.windowHeight - Math.round(a.windowWidth / 375 * 125)
        }), page = 1, this.data.queryData.communityId = app.globalData.disUserInfo.communityId, 
        this.data.queryData.createTime = null, this.getData();
    },
    onShow: function() {
        var e = this.data.is_show_on;
        0 < e ? (this.setData({
            page: 1,
            order: []
        }), this.getData()) : this.setData({
            is_show_on: e + 1
        });
    },
    getData: function() {
        wx.showLoading({
            title: "加载中...",
            mask: !0
        }), this.setData({
            isHideLoadMore: !0
        }), this.data.no_order = 1;
        var i = this, e = wx.getStorageSync("token");
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "community.get_community_member_orderlist",
                date: i.data.date,
                searchKey: i.data.searchKey,
                token: e,
                page: i.data.page
            },
            dataType: "json",
            success: function(e) {
                if (0 != e.data.code) return i.setData({
                    isHideLoadMore: !0
                }), wx.hideLoading(), !1;
                var a = e.data.close_community_delivery_orders || 0, t = i.data.order.concat(e.data.data);
                i.setData({
                    order: t,
                    hide_tip: !0,
                    no_order: 0,
                    close_community_delivery_orders: a
                }), wx.hideLoading();
            }
        });
    },
    getTodayMs: function() {
        var e = new Date();
        return e.setHours(0), e.setMinutes(0), e.setSeconds(0), e.setMilliseconds(0), Date.parse(e);
    },
    bindSearchChange: function(e) {
        this.setData({
            searchKey: e.detail.value
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
    bindDateChange: function(e) {
        page = 1, this.setData({
            date: e.detail.value,
            order: [],
            no_order: 0,
            page: 1
        }), this.data.queryData.createTime = new Date(e.detail.value).getTime() - 288e5, 
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
    callTelphone: function(e) {
        var a = this, t = e.currentTarget.dataset.phone;
        "未下单" != t && (this.data.isCalling || (this.data.isCalling = !0, wx.makePhoneCall({
            phoneNumber: t,
            complete: function() {
                a.data.isCalling = !1;
            }
        })));
    },
    getMore: function() {
        if (1 == this.data.no_order) return !1;
        this.data.page += 1, this.getData(), this.setData({
            isHideLoadMore: !1
        });
    },
    goLink: function(e) {
        if (1 != this.data.close_community_delivery_orders) {
            var a = getCurrentPages(), t = e.currentTarget.dataset.link;
            3 < a.length ? wx.redirectTo({
                url: t
            }) : wx.navigateTo({
                url: t
            });
        }
    }
});