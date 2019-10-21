var page = 1, app = getApp(), util = require("../../utils/util.js");

Page({
    data: {
        queryData: {
            createTime: null,
            communityId: null,
            order: [],
            page: page,
            pageSize: 20
        },
        searchKey: "",
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
    onShow: function() {
        var a = this.data.is_show_on;
        0 < a ? (this.setData({
            page: 1,
            order: []
        }), this.getData()) : this.setData({
            is_show_on: a + 1
        });
    },
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
                controller: "distribution.get_member_fanslist",
                keyword: e.data.searchKey,
                token: a,
                page: e.data.page
            },
            dataType: "json",
            success: function(a) {
                a.data.today_member_count, a.data.yes_member_count;
                if (0 != a.data.code) return e.setData({
                    isHideLoadMore: !0
                }), wx.hideLoading(), !1;
                var t = e.data.order.concat(a.data.data);
                e.setData({
                    order: t,
                    hide_tip: !0,
                    no_order: 0
                }), wx.hideLoading();
            }
        });
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
    getMore: function() {
        if (1 == this.data.no_order) return !1;
        this.data.page += 1, this.getData(), this.setData({
            isHideLoadMore: !1
        });
    }
});