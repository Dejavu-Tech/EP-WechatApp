var app = getApp(), util = require("../../utils/util.js");

Page({
    data: {
        showDialog: !1
    },
    onLoad: function(t) {},
    cashMoney: function() {
        this.data.community_info;
        3 < getCurrentPages().length ? wx.redirectTo({
            url: "/lionfish_comshop/pages/groupCenter/editInfo"
        }) : wx.navigateTo({
            url: "/lionfish_comshop/pages/groupCenter/editInfo"
        });
    },
    confirm: function() {
        this.setData({
            showDialog: !1
        }), console.log(111);
    },
    cancel: function() {
        this.setData({
            showDialog: !1
        });
    },
    onReady: function() {},
    onShow: function() {
        var t = wx.getStorageSync("token"), o = this;
        app.util.request({
            url: "entry/wxapp/user",
            data: {
                controller: "community.get_community_info",
                token: t
            },
            dataType: "json",
            success: function(t) {
                0 == t.data.code ? o.setData({
                    member_info: t.data.member_info,
                    community_info: t.data.community_info,
                    commission_info: t.data.commission_info,
                    total_order_count: t.data.total_order_count,
                    total_member_count: t.data.total_member_count,
                    today_order_count: t.data.today_order_count,
                    today_effect_order_count: t.data.today_effect_order_count,
                    today_pay_order_count: t.data.today_pay_order_count,
                    today_pre_total_money: t.data.today_pre_total_money,
                    today_all_total_money: t.data.today_all_total_money,
                    month_pre_total_money: t.data.month_pre_total_money,
                    pre_total_money: t.data.pre_total_money,
                    wait_sub_total_money: t.data.wait_sub_total_money,
                    tixian_sucess_money: t.data.tixian_sucess_money
                }) : wx.reLaunch({
                    url: "/lionfish_comshop/pages/user/me"
                });
            }
        });
    }
});