var app = getApp(), util = require("../../utils/util.js"), WxParse = require("../../wxParse/wxParse.js");

Page({
    data: {
        canPay: !1,
        money: 0,
        onFocus: !1,
        accountMoney: 0,
        chargetype_list: []
    },
    rech_id: 0,
    onLoad: function(t) {
        this.getAccountMoney();
    },
    onShow: function() {
        util.check_login() || wx.redirectTo({
            url: "/lionfish_comshop/pages/user/me"
        });
    },
    getAccountMoney: function() {
        var t = wx.getStorageSync("token"), o = this;
        app.util.request({
            url: "entry/wxapp/user",
            data: {
                controller: "user.get_account_money",
                token: t
            },
            dataType: "json",
            success: function(t) {
                if (0 == t.data.code) {
                    var e = t.data, a = e.member_charge_publish;
                    WxParse.wxParse("article", "html", a, o, 15, app.globalData.systemInfo);
                    var n = e.chargetype_list;
                    o.setData({
                        accountMoney: e.data,
                        chargetype_list: n
                    });
                } else 1 == t.data.code && wx.redirectTo({
                    url: "/lionfish_comshop/pages/user/me"
                });
            }
        });
    },
    getMoney: function(t) {
        var e = t.detail.value;
        e ? this.setData({
            canPay: !0
        }) : this.setData({
            canPay: !1
        });
        var a = e;
        this.setData({
            money: a
        });
    },
    wxcharge: function() {
        var t = 0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : 0, e = 0;
        if (0 < t) e = t; else {
            e = this.data.money, console.log(e);
            if (!/^\d+(\.\d+)?$/.test(e)) return wx.showToast({
                title: "请输入正确的金额",
                icon: "none"
            }), !1;
        }
        var a = parseFloat(e).toFixed(2) || 0, n = wx.getStorageSync("token"), o = this;
        o.data.canPay && app.util.request({
            url: "entry/wxapp/user",
            data: {
                controller: "car.wxcharge",
                token: n,
                money: a,
                rech_id: o.rech_id
            },
            dataType: "json",
            success: function(t) {
                wx.requestPayment({
                    appId: t.data.appId,
                    timeStamp: t.data.timeStamp,
                    nonceStr: t.data.nonceStr,
                    package: t.data.package,
                    signType: t.data.signType,
                    paySign: t.data.paySign,
                    success: function(t) {
                        o.setData({
                            canPay: !1
                        }), o.getAccountMoney(), o.rech_id = 0, wx.showToast({
                            icon: "none",
                            title: "充值成功"
                        }), setTimeout(function() {
                            wx.reLaunch({
                                url: "/lionfish_comshop/pages/user/me"
                            });
                        }, 2e3);
                    },
                    fail: function(t) {
                        0 < o.rech_id && (o.setData({
                            canPay: !1
                        }), o.rech_id = 0), wx.showToast({
                            icon: "none",
                            title: "充值失败，请重试！"
                        });
                    }
                });
            }
        });
    },
    bindIptFocus: function() {
        this.setData({
            onFocus: !0
        });
    },
    bindIptBlur: function() {
        this.setData({
            onFocus: !1
        });
    },
    goCharge: function(t) {
        var e = this, a = this.data.chargetype_list, n = t.currentTarget.dataset.idx, o = a[n].id, s = a[n].money;
        this.rech_id = o, this.setData({
            canPay: !0
        }, function() {
            e.wxcharge(s);
        });
    }
});