var app = getApp(), util = require("../../utils/util.js");

Page({
    data: {
        is_login: !0,
        list: [],
        showData: 1,
        loadText: "加载中",
        remark: {
            goodsbuy: "商品购买送积分",
            refundorder: "订单退款增加积分",
            system_add: "系统后台增加积分",
            system_del: "系统后台减少积分",
            orderbuy: "商品购买扣除积分"
        }
    },
    page: 1,
    onLoad: function(t) {
        util.check_login() ? this.setData({
            is_login: !0
        }) : this.setData({
            is_login: !1
        }), this.getData();
    },
    getData: function() {
        var t = wx.getStorageSync("token"), e = this;
        wx.showLoading(), this.setData({
            isHideLoadMore: !1
        }), app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "user.get_user_integral_flow",
                token: t,
                page: e.page
            },
            dataType: "json",
            success: function(t) {
                if (wx.hideLoading(), 0 == t.data.code) {
                    var a = e.data.list;
                    a = a.concat(t.data.data), e.setData({
                        list: a,
                        isHideLoadMore: !0
                    });
                } else {
                    if (1 == t.data.code) return 0 == e.data.list.length && 1 == e.page && e.setData({
                        showData: 0
                    }), e.setData({
                        isHideLoadMore: !0,
                        no_data: 1
                    }), !1;
                    2 == t.data.code && e.setData({
                        is_login: !1
                    });
                }
            },
            fail: function(t) {
                console.log(t), wx.showLoading();
            }
        });
    },
    authSuccess: function() {
        wx.reLaunch({
            url: "/lionfish_comshop/pages/user/scoreDetails"
        });
    },
    onShow: function() {},
    onHide: function() {},
    onPullDownRefresh: function() {},
    onReachBottom: function() {
        if (1 == this.data.no_data) return !1;
        this.page += 1, this.getData(), this.setData({
            isHideLoadMore: !1
        });
    }
});