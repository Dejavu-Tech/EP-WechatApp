var app = getApp(), status = require("../../utils/index.js");

Page({
    data: {
        waitSendNum: 0,
        waitSignNum: 0,
        waitPickNum: 0,
        completeNum: 0,
        disUserId: "",
        communityName: "",
        communityId: "",
        distribution: "",
        estimate: "",
        lastMonth: "",
        isShow: !0,
        currentTab: 0,
        show_on_one: 0,
        dialogShow: 0,
        effectValidOrderNum: 0,
        groupInfo: {
            group_name: "社区",
            owner_name: "团长"
        }
    },
    onLoad: function(t) {
        var e = this;
        status.setGroupInfo().then(function(t) {
            var a = t && t.owner_name || "团长";
            wx.setNavigationBarTitle({
                title: a + "中心"
            }), e.setData({
                groupInfo: t
            });
        }), this.loadPage();
    },
    loadPage: function() {
        var a = this;
        status.loadStatus().then(function() {
            var t = app.globalData.appLoadStatus;
            0 == t && wx.redirectTo({
                url: "/lionfish_comshop/pages/auth/index"
            }), a.setData({
                appLoadStatus: t,
                community: app.globalData.community
            });
        }), this.load_community_data();
    },
    load_community_data: function() {
        var t = wx.getStorageSync("token"), s = this;
        app.util.request({
            url: "entry/wxapp/user",
            data: {
                controller: "community.get_community_info",
                token: t
            },
            dataType: "json",
            success: function(t) {
                if (0 == t.data.code) {
                    var a = t.data, e = a.commission_info;
                    e.mix_total_money = e.mix_total_money.toFixed(2);
                    var o = t.data, n = o.head_today_pay_money, i = o.today_add_head_member, r = o.today_after_sale_order_count, _ = o.today_invite_head_member;
                    s.setData({
                        member_info: a.member_info,
                        community_info: a.community_info,
                        commission_info: e,
                        total_order_count: a.total_order_count || 0,
                        total_member_count: a.total_member_count || 0,
                        today_order_count: a.today_order_count || 0,
                        today_effect_order_count: a.today_effect_order_count || 0,
                        today_pay_order_count: a.today_pay_order_count || 0,
                        today_pre_total_money: a.today_pre_total_money || 0,
                        waitSendNum: a.wait_send_count || 0,
                        waitSignNum: a.wait_qianshou_count || 0,
                        waitPickNum: a.wait_tihuo_count || 0,
                        completeNum: a.has_success_count || 0,
                        open_community_addhexiaomember: a.open_community_addhexiaomember,
                        open_community_head_leve: a.open_community_head_leve,
                        head_today_pay_money: n,
                        today_add_head_member: i,
                        today_after_sale_order_count: r,
                        today_invite_head_member: _
                    });
                } else wx.reLaunch({
                    url: "/lionfish_comshop/pages/user/me"
                });
            }
        });
    },
    goScan: function() {
        wx.scanCode({
            success: function(t) {
                console.log(t), "WX_CODE" == t.scanType && "" != t.path && wx.navigateTo({
                    url: "/" + t.path
                });
            }
        });
    },
    onShow: function() {
        0 < this.data.show_on_one && this.load_community_data(), this.setData({
            show_on_one: 1
        });
    },
    goOrder: function(t) {
        var a = t.currentTarget.dataset.status;
        wx.navigateTo({
            url: "/lionfish_comshop/pages/groupCenter/groupList?tab=" + a
        });
    },
    goEdit: function() {
        wx.navigateTo({
            url: "/lionfish_comshop/pages/groupCenter/setting?id=" + this.data.community_info.id
        });
    },
    switchNav: function(t) {
        if (this.data.currentTab === 1 * t.target.dataset.current) return !1;
        this.setData({
            currentTab: 1 * t.target.dataset.current
        });
    },
    bindChange: function(t) {
        this.setData({
            currentTab: 1 * t.detail.current
        });
        for (var a = 0; a < 4; a++) this.data.currentTab === a && this.setData({
            effectEstimate: this.data.effectList[a].estimate,
            effectSettle: this.data.effectList[a].settle,
            effectValidOrderNum: this.data.effectList[a].validOrderNum
        });
    }
});