var app = getApp(), util = require("../../utils/util.js");

Page({
    data: {
        list: [],
        showData: 1,
        loadText: "加载中",
        remark: [ "", "前台充值", "", "余额支付", "订单退款", "后台充值", "商品退款", "", "后台扣除", "分销提现至余额", "团长提现至余额", "拼团佣金提现至余额" ]
    },
    page: 1,
    no_data: 0,
    onLoad: function(a) {
        util.check_login() ? this.setData({
            is_login: !0
        }) : this.setData({
            is_login: !1
        }), this.getData();
    },
    authSuccess: function() {
        wx.reLaunch({
            url: "/lionfish_comshop/pages/user/rechargeDetails"
        });
    },
    getData: function() {
        var a = wx.getStorageSync("token"), e = this;
        wx.showLoading(), this.setData({
            isHideLoadMore: !1
        }), app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "user.get_user_charge_flow",
                token: a,
                page: e.page
            },
            dataType: "json",
            success: function(a) {
                if (wx.hideLoading(), 0 == a.data.code) {
                    var t = e.data.list;
                    t = t.concat(a.data.data), e.setData({
                        list: t,
                        isHideLoadMore: !0
                    });
                } else {
                    if (1 == a.data.code) return 0 == e.data.list.length && 1 == e.page && e.setData({
                        showData: 0
                    }), e.no_data = 1, e.setData({
                        isHideLoadMore: !0
                    }), !1;
                    2 == a.data.code && e.setData({
                        is_login: !1
                    });
                }
            },
            fail: function(a) {
                console.log(a), wx.showLoading();
            }
        });
    },
    onShow: function() {},
    onHide: function() {},
    onUnload: function() {},
    onPullDownRefresh: function() {},
    onReachBottom: function() {
        if (1 == this.no_data) return !1;
        this.page += 1, this.getData(), this.setData({
            isHideLoadMore: !1
        });
    }
});