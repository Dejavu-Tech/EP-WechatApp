var _extends = Object.assign || function(a) {
    for (var t = 1; t < arguments.length; t++) {
        var n = arguments[t];
        for (var e in n) Object.prototype.hasOwnProperty.call(n, e) && (a[e] = n[e]);
    }
    return a;
}, app = getApp(), util = require("../../utils/util.js"), WxParse = require("../../wxParse/wxParse.js");

Page({
    mixins: [ require("../../mixin/commonMixin.js") ],
    data: {
        status: 0,
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
        } ],
        info: [],
        tixian_money: "",
        final_money: 0
    },
    canTixian: !0,
    onLoad: function(a) {
        this.getData();
    },
    onShow: function() {
        var t = this;
        util.check_login_new().then(function(a) {
            a ? t.setData({
                needAuth: !1
            }) : t.setData({
                needAuth: !0
            });
        });
    },
    authSuccess: function() {
        var a = this;
        this.setData({
            needAuth: !1
        }, function() {
            a.getData();
        });
    },
    getData: function() {
        wx.showLoading();
        var a = wx.getStorageSync("token"), s = this;
        app.util.request({
            url: "entry/wxapp/user",
            data: {
                controller: "groupdo.get_commission_info",
                token: a
            },
            dataType: "json",
            success: function(a) {
                if (wx.hideLoading(), 0 == a.data.code) {
                    var t = a.data.data.commiss_tixian_publish;
                    WxParse.wxParse("article", "html", t, s, 15, app.globalData.systemInfo);
                    var n = s.data.items, e = a.data.data;
                    0 == e.commiss_tixianway_yuer && (n[0].show = !1), 0 == e.commiss_tixianway_weixin && (n[1].show = !1), 
                    0 == e.commiss_tixianway_alipay && (n[2].show = !1), 0 == e.commiss_tixianway_bank && (n[3].show = !1);
                    for (var i = s.data.type, o = 0; o < n.length; o++) if (n[o].show) {
                        n[o].checked = !0, i = n[o].name;
                        break;
                    }
                    s.setData({
                        info: a.data.data,
                        items: n,
                        type: i
                    });
                } else wx.showModal({
                    title: "提示",
                    content: a.data.msg,
                    showCancel: !1,
                    success: function(a) {
                        a.confirm && (console.log("用户点击确定"), wx.reLaunch({
                            url: "/lionfish_comshop/pages/user/me"
                        }));
                    }
                });
            }
        });
    },
    formSubmit: function(a) {
        var t = a.detail.value, n = 0, e = this.data.type, i = [ {}, {}, {
            bankusername: "微信人姓名"
        }, {
            bankusername: "支付宝名称",
            bankaccount: "支付宝账号"
        }, {
            bankname: "银行卡名称",
            bankusername: "持卡人姓名",
            bankaccount: "银行卡账号"
        } ];
        for (var o in t) {
            if (t[o] = t[o].replace(/(^\s*)|(\s*$)/g, ""), !t[o]) {
                var s = i[e][o];
                wx.showToast({
                    title: "请输入" + (s || "正确的表单内容"),
                    icon: "none"
                }), n = 1;
                break;
            }
            if ("money" == o && 1 * t[o] <= 0) return void wx.showToast({
                title: "请输入正确的金额",
                icon: "none"
            });
        }
        if (1 != n) {
            t.type = this.data.type, console.log(t);
            var c = this.data, r = parseFloat(c.tixian_money), u = c.info.money, l = parseFloat(c.info.commiss_min_tixian_money);
            if ("" == r || r < l) return wx.showToast({
                title: "最小提现" + l + "元",
                icon: "none"
            }), !1;
            if (u < r) {
                wx.showToast({
                    title: "本次最大可提现" + u + "元",
                    icon: "none"
                });
                var h = (u * (100 - c.info.commiss_tixian_bili) / 100).toFixed(2);
                return this.setData({
                    tixian_money: u,
                    final_money: h
                }), !1;
            }
            if (this.canTixian) {
                this.canTixian = !1, wx.showLoading();
                var m = wx.getStorageSync("token"), d = this;
                app.util.request({
                    url: "entry/wxapp/user",
                    data: _extends({
                        controller: "groupdo.tixian_sub",
                        token: m
                    }, t),
                    dataType: "json",
                    success: function(a) {
                        wx.hideLoading(), 0 == a.data.code ? d.setData({
                            status: 1
                        }) : (console.log(a), wx.showToast({
                            title: a.data.msg ? a.data.msg : "提交失败，请重试",
                            icon: "none"
                        }));
                    }
                });
            }
        }
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
    radioChange: function(a) {
        this.setData({
            type: a.detail.value
        });
    },
    bindTixianMoneyInput: function(a) {
        var t = this.data.info.money, n = a.detail.value;
        t < n && wx.showToast({
            title: "本次最大可提现" + t + "元",
            icon: "none"
        });
        var e = (n * (100 - this.data.info.commiss_tixian_bili) / 100).toFixed(2), i = !1;
        return i = !!n, this.setData({
            tixian_money: 1 * n,
            final_money: e,
            canPay: i
        }), n;
    },
    getAll: function() {
        var a = this.data, t = 1 * a.info.money, n = (t * (100 - a.info.commiss_tixian_bili) / 100).toFixed(2), e = !1;
        e = !!t, this.setData({
            tixian_money: t,
            final_money: n,
            canPay: e
        });
    }
});