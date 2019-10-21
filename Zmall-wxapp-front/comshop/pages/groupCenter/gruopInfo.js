var app = getApp(), util = require("../../utils/util.js"), status = require("../../utils/index.js");

Page({
    data: {
        distributeInfo: {},
        list: [],
        stateName: [ "未结算", "已结算", "已取消" ],
        typeName: {
            commiss: "订单分佣",
            tuijian: "推荐下级奖励"
        },
        noData: 0,
        tip: "加载中",
        isHideLoadMore: !0
    },
    page: 1,
    hasMore: !0,
    onLoad: function(t) {
        var a = this, s = wx.getStorageSync("commiss_diy_name") || "分销";
        status.setGroupInfo().then(function(t) {
            var e = t && t.owner_name || "团长";
            wx.setNavigationBarTitle({
                title: e + s
            }), a.setData({
                groupInfo: t
            });
        }), this.setData({
            commiss_diy_name: s
        }), util.check_login() || wx.reLaunch({
            url: "/lionfish_comshop/pages/user/me"
        }), wx.showLoading(), this.getList();
    },
    getData: function() {
        var t = wx.getStorageSync("token"), e = this;
        app.util.request({
            url: "entry/wxapp/user",
            data: {
                controller: "community.get_head_distribute_info",
                token: t
            },
            dataType: "json",
            success: function(t) {
                wx.hideLoading(), 0 == t.data.code ? e.setData({
                    distributeInfo: t.data.data
                }) : wx.reLaunch({
                    url: "/lionfish_comshop/pages/user/me"
                });
            }
        });
    },
    getList: function() {
        var t = wx.getStorageSync("token"), a = this;
        a.hasMore && (this.setData({
            isHideLoadMore: !1
        }), app.util.request({
            url: "entry/wxapp/user",
            data: {
                controller: "community.get_head_distribute_order",
                token: t,
                page: a.page,
                type: "",
                level: ""
            },
            dataType: "json",
            success: function(t) {
                if (0 == t.data.code) {
                    var e = a.data.list.concat(t.data.data);
                    a.setData({
                        list: e,
                        isHideLoadMore: !0
                    });
                } else 0 == a.data.list.length && 1 == a.page && a.setData({
                    noData: 1
                }), a.hasMore = !1;
            }
        }));
    },
    onShow: function() {
        this.getData(), console.log(this.page);
    },
    onPullDownRefresh: function() {},
    onReachBottom: function() {
        this.page++, this.getList();
    }
});