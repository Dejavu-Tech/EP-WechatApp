var _extends = Object.assign || function(e) {
    for (var i = 1; i < arguments.length; i++) {
        var t = arguments[i];
        for (var n in t) Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
    }
    return e;
}, timeFormat = require("../../utils/timeFormat"), app = getApp(), util = require("../../utils/util.js"), WxParse = require("../../wxParse/wxParse.js");

Page({
    data: {
        tixian_money: "",
        final_money: 0,
        sxfee: 0,
        type: 1,
        items: [ {
            name: "1",
            value: "余额",
            show: !0,
            checked: !1
        }, {
            name: "2",
            value: "微信零钱",
            show: !0,
            checked: !1
        }, {
            name: "3",
            value: "支付宝",
            show: !0,
            checked: !1
        }, {
            name: "4",
            value: "银行卡",
            show: !0,
            checked: !1
        } ]
    },
    canTixian: !0,
    onLoad: function(e) {
        var i = wx.getStorageSync("token"), r = this;
        app.util.request({
            url: "entry/wxapp/user",
            data: {
                controller: "community.get_community_info",
                token: i
            },
            dataType: "json",
            success: function(e) {
                if (0 == e.data.code) {
                    var i = e.data, t = r.data.items, n = i.community_info;
                    0 == n.head_commiss_tixianway_yuer && (t[0].show = !1), 0 == n.head_commiss_tixianway_weixin && (t[1].show = !1), 
                    0 == n.head_commiss_tixianway_alipay && (t[2].show = !1), 0 == n.head_commiss_tixianway_bank && (t[3].show = !1);
                    for (var a = r.data.type, o = 0; o < t.length; o++) if (t[o].show) {
                        t[o].checked = !0, a = t[o].name;
                        break;
                    }
                    var s = i.head_commiss_tixian_publish;
                    WxParse.wxParse("article", "html", s, r, 15, app.globalData.systemInfo);
                    var m = "" != s;
                    r.setData({
                        member_info: i.member_info,
                        community_info: i.community_info,
                        commission_info: i.commission_info,
                        community_tixian_fee: i.community_tixian_fee,
                        community_min_money: i.community_min_money,
                        items: t,
                        type: a,
                        hasTixianPublish: m
                    });
                } else wx.reLaunch({
                    url: "/lionfish_comshop/pages/user/me"
                });
            }
        });
    },
    bindTixianMoneyInput: function(e) {
        var i = this.data.commission_info.money, t = e.detail.value;
        i < t && wx.showToast({
            title: "本次最大可提现" + i + "元",
            icon: "none"
        });
        var n = (t * (100 - this.data.community_tixian_fee) / 100).toFixed(2), a = (t - n).toFixed(2);
        this.setData({
            tixian_money: t,
            final_money: n,
            sxfee: a
        });
    },
    onShow: function() {},
    getAll: function() {
        var e = this.data.commission_info.money, i = (e * (100 - this.data.community_tixian_fee) / 100).toFixed(2), t = (e - i).toFixed(2);
        this.setData({
            tixian_money: e,
            final_money: i,
            sxfee: t
        });
    },
    formSubmit: function(e) {
        var i = e.detail.value, t = 0;
        for (var n in i) {
            if (i[n] = i[n].replace(/(^\s*)|(\s*$)/g, ""), !i[n]) {
                wx.showToast({
                    title: "请输入正确的表单内容",
                    icon: "none"
                }), t = 1;
                break;
            }
            if ("money" == n && 1 * i[n] <= 0) return void wx.showToast({
                title: "请输入正确的金额",
                icon: "none"
            });
        }
        if (console.log(t), 1 != t) {
            i.type = this.data.type, console.log(i);
            var a = this.data, o = parseFloat(a.tixian_money), s = a.commission_info.money, m = parseFloat(a.community_min_money);
            if ("" == o || o < m) return wx.showToast({
                title: "最小提现" + m + "元",
                icon: "none"
            }), !1;
            if (s < o) {
                wx.showToast({
                    title: "本次最大可提现" + s + "元",
                    icon: "none"
                });
                var r = (s * (100 - a.community_tixian_fee) / 100).toFixed(2), c = (s - r).toFixed(2);
                return this.setData({
                    tixian_money: s,
                    final_money: r,
                    sxfee: c
                }), !1;
            }
            if (this.canTixian) {
                this.canTixian = !1;
                var u = wx.getStorageSync("token"), l = this;
                wx.showLoading(), app.util.request({
                    url: "entry/wxapp/user",
                    data: _extends({
                        controller: "community.tixian_community_info",
                        token: u
                    }, i),
                    dataType: "json",
                    success: function(e) {
                        l.canTixian = !0, 0 == e.data.code ? wx.showToast({
                            title: "提现成功，等待审核",
                            icon: "none",
                            duration: 2e3,
                            mask: !0,
                            success: function() {
                                wx.redirectTo({
                                    url: "/lionfish_comshop/pages/groupCenter/cashList"
                                });
                            }
                        }) : wx.showToast({
                            title: "提现失败",
                            icon: "none",
                            duration: 2e3,
                            mask: !0
                        });
                    }
                });
            }
        }
    },
    radioChange: function(e) {
        this.setData({
            type: e.detail.value
        });
    }
});