var app = getApp();

Page({
    data: {},
    onLoad: function(a) {
        this.getData();
    },
    onShow: function() {},
    getData: function() {
        wx.showLoading();
        var a = wx.getStorageSync("token"), u = this;
        app.util.request({
            url: "entry/wxapp/user",
            data: {
                controller: "vipcard.get_vipcard_baseinfo",
                token: a
            },
            dataType: "json",
            success: function(a) {
                if (wx.hideLoading(), 0 == a.data.code) {
                    var e = a.data.data, t = e.member_info, i = e.card_equity_list, n = e.card_list, c = e.is_open_vipcard_buy, o = e.modify_vipcard_name, d = e.is_vip_card_member, r = e.vipcard_unopen_headbg, s = e.vipcard_effect_headbg, p = e.vipcard_afterefect_headbg, _ = (e.vipcard_buy_pagenotice, 
                    e.vipcard_equity_notice);
                    u.setData({
                        member_info: t,
                        card_equity_list: i,
                        card_list: n,
                        is_open_vipcard_buy: c,
                        modify_vipcard_name: o,
                        is_vip_card_member: d,
                        vipcard_unopen_headbg: r,
                        vipcard_effect_headbg: s,
                        vipcard_afterefect_headbg: p,
                        vipcard_equity_notice: _,
                        del_vip_day: a.data.del_vip_day || ""
                    });
                }
            }
        });
    },
    choosecard: function(a) {
        this.setData({
            selectid: a.currentTarget.dataset.id
        });
    },
    submitpay: function(a) {
        if (wx.getStorageSync("token")) {
            var e = this.data.selectid, t = wx.getStorageSync("token");
            if (null == e) return wx.showToast({
                icon: "none",
                title: "请选择要开通的会员类型"
            });
            app.util.request({
                url: "entry/wxapp/user",
                data: {
                    controller: "vipcard.wxcharge",
                    token: t,
                    rech_id: e
                },
                dataType: "json",
                success: function(a) {
                    wx.requestPayment({
                        appId: a.data.appId,
                        timeStamp: a.data.timeStamp,
                        nonceStr: a.data.nonceStr,
                        package: a.data.package,
                        signType: a.data.signType,
                        paySign: a.data.paySign,
                        success: function(a) {
                            wx.showToast({
                                title: "支付成功",
                                icon: "none",
                                duration: 2e3,
                                success: function() {
                                    setTimeout(function() {
                                        wx.switchTab({
                                            url: "/lionfish_comshop/pages/user/me"
                                        });
                                    }, 2e3);
                                }
                            });
                        },
                        fail: function(a) {
                            wx.showToast({
                                icon: "none",
                                title: "支付失败，请重试！"
                            });
                        }
                    });
                }
            });
        } else this.setData({
            needAuth: !0
        });
    }
});