var app = getApp(), util = require("../../utils/util.js");

Page({
    data: {
        pickerIndex: 0,
        formArr: []
    },
    onLoad: function(t) {
        util.check_login() ? this.getMemberInfo() : this.setData({
            needAuth: !0
        });
    },
    authSuccess: function() {
        var t = this;
        this.setData({
            needAuth: !1
        }, function() {
            t.getMemberInfo();
        });
    },
    onShow: function() {},
    getMemberInfo: function() {
        var t = wx.getStorageSync("token"), s = this;
        app.util.request({
            url: "entry/wxapp/user",
            data: {
                controller: "user.get_user_info",
                token: t
            },
            dataType: "json",
            success: function(t) {
                if (wx.hideLoading(), 0 == t.data.code) {
                    if (0 == t.data.commiss_level) return void wx.navigateTo({
                        url: "/lionfish_comshop/pages/user/me"
                    });
                    var e = t.data.data, a = 0;
                    1 == t.data.commiss_biaodan_need ? 1 == e.is_writecommiss_form && (a = 1) == e.comsiss_flag && (a = 0 == e.comsiss_state ? 1 : 2) : a = 1;
                    var i = [], r = t.data.commiss_diy_form;
                    r && 0 < r.length && r.forEach(function(t) {
                        var e = "";
                        "text" != t.type && "textarea" != t.type || (e = t.value);
                        var a = {
                            type: t.type,
                            name: t.title,
                            value: e,
                            index: 0
                        };
                        i.push(a);
                    }), s.setData({
                        commiss_diy_form: r,
                        userInfo: e,
                        status: a,
                        formArr: i
                    });
                } else s.setData({
                    needAuth: !0
                });
            }
        });
    },
    iptFocus: function(t) {
        var e = t.currentTarget.dataset.name;
        this.setData({
            currentFocus: e
        });
    },
    iptBlur: function() {
        this.setData({
            currentFocus: ""
        });
    },
    bindPickerChange: function(t) {
        console.log("picker发送选择改变，携带值为", t.detail.value);
        var e = this.data.formArr, a = (t.currentTarget.dataset.name, t.currentTarget.dataset.idx), i = t.detail.value, r = this.data.commiss_diy_form, s = {
            type: "select",
            name: r[a].title,
            value: r[a].value[i].value || "",
            index: i
        };
        e.splice(a, 1, s), this.setData({
            formArr: e
        });
    },
    radioChange: function(t) {
        var e = this.data.formArr, a = t.currentTarget.dataset.idx, i = t.detail.value, r = {
            type: "radio",
            name: this.data.commiss_diy_form[a].title,
            value: i
        };
        e.splice(a, 1, r), this.setData({
            formArr: e
        }), console.log("radio发生change事件，携带value值为：", t.detail.value);
    },
    checkboxChange: function(t) {
        var e = this.data.formArr, a = t.currentTarget.dataset.idx, i = t.detail.value, r = {
            type: "checkbox",
            name: this.data.commiss_diy_form[a].title,
            value: i
        };
        e.splice(a, 1, r), this.setData({
            formArr: e
        }), console.log("checkbox发生change事件，携带value值为：", t.detail.value);
    },
    formSubmit: function(t) {
        var i = this, r = t.detail.value, s = this.data.formArr, o = this.data.commiss_diy_form;
        Object.keys(r).forEach(function(t) {
            var e = t.split("-")[1], a = {
                type: o[e].type,
                name: o[e].title,
                value: r[t].replace(/^\s*|\s*$/g, "")
            };
            s.splice(e, 1, a), i.setData({
                formArr: s
            });
        }), console.log(s);
        for (var e = 0; e < s.length; e++) {
            var a = s[e];
            if ("" == a.value) {
                var n = "选择";
                return "text" != a.type && "textarea" != a.type || (n = "输入"), wx.showToast({
                    title: "请" + n + a.name,
                    icon: "none"
                }), !1;
            }
        }
        wx.showLoading({
            title: "提交中"
        });
        var u = wx.getStorageSync("token"), c = this;
        app.util.request({
            url: "entry/wxapp/user",
            data: {
                controller: "distribution.sub_distribut_form",
                token: u,
                data: s
            },
            dataType: "json",
            success: function(t) {
                wx.hideLoading(), 0 == t.data.code ? c.setData({
                    status: 1
                }) : wx.showToast({
                    title: "提交失败，请重试。",
                    icon: "none"
                });
            }
        });
    },
    goLink: function(t) {
        var e = t.currentTarget.dataset.url, a = "";
        switch (-1 != e.indexOf("lionfish_comshop/pages/user/me") && (a = "switch"), a) {
          case "switch":
            wx.switchTab({
                url: e
            });
            break;

          default:
            wx.navigateTo({
                url: e
            });
        }
    }
});