var _extends = Object.assign || function(t) {
    for (var a = 1; a < arguments.length; a++) {
        var i = arguments[a];
        for (var n in i) Object.prototype.hasOwnProperty.call(i, n) && (t[n] = i[n]);
    }
    return t;
}, app = getApp(), util = require("../../utils/util.js"), WxParse = require("../../wxParse/wxParse.js");

Page({
    data: {
        status: 0,
        type: 1,
        items: [ {
            name: "1",
            value: "余额",
            show: !0,
            checked: "true"
        }, {
            name: "2",
            value: "微信零钱",
            show: !0
        }, {
            name: "3",
            value: "支付宝",
            show: !0
        }, {
            name: "4",
            value: "银行卡",
            show: !0
        } ],
        info: [],
        tixian_money: "",
        final_money: 0
    },
    onLoad: function(t) {
        util.check_login() ? this.getData() : this.setData({
            needAuth: !0
        });
    },
    canTixian: !0,
    authSuccess: function() {
        var t = this;
        this.setData({
            needAuth: !1
        }, function() {
            t.getData();
        });
    },
    getData: function() {
        wx.showLoading();
        var t = wx.getStorageSync("token"), e = this;
        app.util.request({
            url: "entry/wxapp/user",
            data: {
                controller: "distribution.get_commission_info",
                token: t
            },
            dataType: "json",
            success: function(t) {
                if (wx.hideLoading(), 0 == t.data.code) {
                    var a = t.data.data.commiss_tixian_publish;
                    WxParse.wxParse("article", "html", a, e, 15, app.globalData.systemInfo);
                    var i = e.data.items, n = t.data.data;
                    0 == n.commiss_tixianway_yuer && (i[0].show = !1), 0 == n.commiss_tixianway_weixin && (i[1].show = !1), 
                    0 == n.commiss_tixianway_alipay && (i[2].show = !1), 0 == n.commiss_tixianway_bank && (i[3].show = !1), 
                    e.setData({
                        info: t.data.data,
                        items: i
                    });
                } else wx.showModal({
                    title: "提示",
                    content: t.data.msg,
                    showCancel: !1,
                    success: function(t) {
                        t.confirm && (console.log("用户点击确定"), wx.reLaunch({
                            url: "/lionfish_comshop/pages/user/me"
                        }));
                    }
                });
            }
        });
    },
    formSubmit: function(t) {
        var a = t.detail.value, i = 0;
        for (var n in a) {
            if (a[n] = a[n].replace(/(^\s*)|(\s*$)/g, ""), !a[n]) {
                wx.showToast({
                    title: "请输入正确的表单内容",
                    icon: "none"
                }), i = 1;
                break;
            }
            if ("money" == n && 1 * a[n] <= 0) return void wx.showToast({
                title: "请输入正确的金额",
                icon: "none"
            });
        }
        if (1 != i) {
            a.type = this.data.type, console.log(a);
            var e = this.data, o = parseFloat(e.tixian_money), s = e.info.total_money, r = parseFloat(e.info.commiss_min_tixian_money);
            if ("" == o || o < r) return wx.showToast({
                title: "最小提现" + r + "元",
                icon: "none"
            }), !1;
            if (s < o) {
                wx.showToast({
                    title: "本次最大可提现" + s + "元",
                    icon: "none"
                });
                var c = (s * (100 - e.info.commiss_tixian_bili) / 100).toFixed(2);
                return this.setData({
                    tixian_money: s,
                    final_money: c
                }), !1;
            }
            if (this.canTixian) {
                this.canTixian = !1, wx.showLoading();
                var l = wx.getStorageSync("token"), u = this;
                app.util.request({
                    url: "entry/wxapp/user",
                    data: _extends({
                        controller: "distribution.tixian_sub",
                        token: l
                    }, a),
                    dataType: "json",
                    success: function(t) {
                        wx.hideLoading(), 0 == t.data.code ? u.setData({
                            status: 1
                        }) : (console.log(t), wx.showToast({
                            title: t.data.msg ? t.data.msg : "提交失败，请重试",
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
    radioChange: function(t) {
        this.setData({
            type: t.detail.value
        });
    },
    bindTixianMoneyInput: function(t) {
        var a = this.data.info.total_money, i = t.detail.value;
        a < i && wx.showToast({
            title: "本次最大可提现" + a + "元",
            icon: "none"
        });
        var n = (i * (100 - this.data.info.commiss_tixian_bili) / 100).toFixed(2), e = !1;
        return e = !!i, this.setData({
            tixian_money: 1 * i,
            final_money: n,
            canPay: e
        }), i;
    },
    getAll: function() {
        var t = this.data, a = 1 * t.info.total_money, i = (a * (100 - t.info.commiss_tixian_bili) / 100).toFixed(2), n = !1;
        n = !!a, this.setData({
            tixian_money: a,
            final_money: i,
            canPay: n
        });
    }
});