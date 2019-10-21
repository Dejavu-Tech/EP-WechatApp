var app = getApp(), util = require("../../utils/util.js"), status = require("../../utils/index.js");

Page({
    data: {
        list: [],
        noData: 0,
        tip: "加载中",
        isHideLoadMore: !0,
        level: "",
        groupInfo: {
            owner_name: "团长"
        }
    },
    page: 1,
    hasMore: !0,
    onLoad: function(t) {
        var e = t.level || "";
        this.setData({
            level: e
        });
        var a = this;
        status.setGroupInfo().then(function(t) {
            var e = t && t.owner_name || "团长";
            wx.setNavigationBarTitle({
                title: e + "列表"
            }), a.setData({
                groupInfo: t
            });
        }), util.check_login() || wx.redirectTo({
            url: "/lionfish_comshop/pages/user/me"
        }), wx.showLoading(), this.getList();
    },
    onShow: function() {},
    getList: function() {
        var t = wx.getStorageSync("token"), a = this;
        a.hasMore && (this.setData({
            isHideLoadMore: !1
        }), app.util.request({
            url: "entry/wxapp/user",
            data: {
                controller: "community.get_head_child_headlist",
                token: t,
                page: a.page,
                level: a.data.level
            },
            dataType: "json",
            success: function(t) {
                if (wx.hideLoading(), 0 == t.data.code) {
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
    onPullDownRefresh: function() {},
    onReachBottom: function() {
        this.page++, this.getList();
    }
});