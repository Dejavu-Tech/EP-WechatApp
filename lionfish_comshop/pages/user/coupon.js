var util = require("../../utils/util.js"), app = getApp();

Page({
    data: {
        is_login: !0,
        tab_index: 1,
        isHideLoadMore: !0,
        no_order: 0,
        quan: [],
        loadText: "加载中"
    },
    page: 1,
    onLoad: function(t) {
        util.check_login() ? this.setData({
            is_login: !0
        }) : this.setData({
            is_login: !1
        }), this.getData();
    },
    onShow: function() {},
    authSuccess: function() {
        wx.reLaunch({
            url: "/lionfish_comshop/pages/user/me"
        });
    },
    tabchange: function(t) {
        var a = t.currentTarget.dataset.index;
        this.page = 1, this.setData({
            quan: [],
            tab_index: a
        }), this.getData();
    },
    getData: function() {
        this.setData({
            isHideLoadMore: !0
        }), wx.showLoading(), this.data.no_order = 1;
        var t = this.page, a = this.data.tab_index, e = wx.getStorageSync("token"), i = this;
        app.util.request({
            url: "entry/wxapp/user",
            data: {
                controller: "user.myvoucherlist",
                token: e,
                type: a,
                page: t,
                pre_page: 5
            },
            dataType: "json",
            method: "POST",
            success: function(t) {
                if (wx.hideLoading(), 0 != t.data.code) return i.setData({
                    isHideLoadMore: !0
                }), !1;
                var a = i.data.quan;
                t.data.list.map(function(t) {
                    a.push(t);
                }), i.setData({
                    quan: a,
                    no_order: 0
                });
            }
        });
    },
    goUse: function(t) {
        var a = t.currentTarget.dataset.idx, e = this.data.quan || [];
        if (e.length >= a) if (0 == e[a].is_limit_goods_buy) wx.switchTab({
            url: "/lionfish_comshop/pages/index/index"
        }); else if (1 == e[a].is_limit_goods_buy) {
            var i = e[a].limit_goods_list, s = "";
            s = 1 < i.split(",").length ? "/lionfish_comshop/pages/type/result?type=2&good_ids=" + i : "/lionfish_comshop/pages/goods/goodsDetail?id=" + i, 
            wx.navigateTo({
                url: s
            });
        } else if (2 == e[a].is_limit_goods_buy) {
            var o = e[a].goodscates || 0;
            wx.navigateTo({
                url: "/lionfish_comshop/pages/type/result?type=1&gid=" + o
            });
        }
    },
    onReachBottom: function() {
        if (1 == this.data.no_order) return !1;
        this.page += 1, this.getData(), this.setData({
            isHideLoadMore: !1
        });
    }
});