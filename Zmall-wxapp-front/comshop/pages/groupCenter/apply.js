var util = require("../../utils/util.js"), status = require("../../utils/index.js"), locat = require("../../utils/Location.js"), app = getApp(), clearTime = null;

Page({
    data: {
        pass: -2,
        canSubmit: !1,
        region: [ "选择地址", "", "" ],
        addr_detail: "",
        lon_lat: "",
        focus_mobile: !1,
        showCountDown: !0,
        timeStamp: 60,
        apply_complete: !1,
        wechat: "",
        needAuth: !1,
        member_info: {
            is_head: 0
        }
    },
    community_id: "",
    bindRegionChange: function(t) {
        this.setData({
            region: t.detail.value.replace(/^\s*|\s*$/g, "")
        });
    },
    inputAddress: function(t) {
        this.setData({
            addr_detail: t.detail.value.replace(/^\s*|\s*$/g, "")
        });
    },
    inputCommunity: function(t) {
        this.setData({
            community_name: t.detail.value.replace(/^\s*|\s*$/g, "")
        });
    },
    inputMobile: function(t) {
        this.setData({
            mobile_detail: t.detail.value.replace(/^\s*|\s*$/g, "")
        });
    },
    inputRealName: function(t) {
        this.setData({
            head_name: t.detail.value.replace(/^\s*|\s*$/g, "")
        });
    },
    inputWechat: function(t) {
        this.setData({
            wechat: t.detail.value.replace(/^\s*|\s*$/g, "")
        });
    },
    chose_location: function() {
        var r = this;
        wx.chooseLocation({
            success: function(t) {
                var e = t.longitude + "," + t.latitude, a = t.address, n = r.data.region, i = "", o = a, s = new RegExp("(.*?省)(.*?市)(.*?区)", "g"), u = s.exec(o);
                null == u && null == (u = (s = new RegExp("(.*?省)(.*?市)(.*?市)", "g")).exec(o)) && null == (u = (s = new RegExp("(.*?省)(.*?市)(.*县)", "g")).exec(o)) || (n[0] == u[1] && n[1] == u[2] && n[2] == u[3] || wx.showToast({
                    title: "省市区信息已同步修改",
                    icon: "none"
                }), n[0] = u[1], n[1] = u[2], n[2] = u[3], i = a.replace(u[0], ""));
                var l = i + t.name, c = "";
                locat.getGpsLocation(t.latitude, t.longitude).then(function(t) {
                    (c = t) && (n[0] = c.province, n[1] = c.city, n[2] = c.district), r.setData({
                        region: n,
                        lon_lat: e,
                        addr_detail: l
                    });
                }), "省" == n[0] && wx.showToast({
                    title: "请重新选择省市区",
                    icon: "none"
                });
            }
        });
    },
    submit: function() {
        if (this.authModal()) {
            var t = wx.getStorageSync("token"), e = this.data.region[0], a = this.data.region[1], n = this.data.region[2], i = this.data.addr_detail, o = this.data.community_name, s = this.data.mobile_detail, u = this.data.lon_lat, l = this.data.head_name, c = this.data.wechat, r = this;
            if ("" == l || void 0 === l) return wx.showToast({
                title: "请填写姓名",
                icon: "none"
            }), !1;
            if ("" == s || !/^1(3|4|5|6|7|8|9)\d{9}$/.test(s)) return this.setData({
                focus_mobile: !0
            }), wx.showToast({
                title: "手机号码有误",
                icon: "none"
            }), !1;
            if ("" == c || void 0 === c) return wx.showToast({
                title: "请填写微信号",
                icon: "none"
            }), !1;
            if ("" == o || void 0 === o) return wx.showToast({
                title: "请填写小区名称",
                icon: "none"
            }), !1;
            if ("省" == e && "市" == a && "区" == n) return wx.showToast({
                title: "请选择地区",
                icon: "none"
            }), !1;
            if ("" == u || void 0 === u) return wx.showToast({
                title: "请选择地图位置",
                icon: "none"
            }), !1;
            if ("" == i || void 0 === i) return wx.showToast({
                title: "请填写详细地址",
                icon: "none"
            }), !1;
            var d = {
                province_name: e,
                city_name: a,
                area_name: n,
                lon_lat: u,
                addr_detail: i,
                community_name: o,
                mobile: s,
                head_name: l,
                wechat: c,
                controller: "community.sub_community_head",
                token: t,
                community_id: this.community_id
            };
            app.util.request({
                url: "entry/wxapp/user",
                data: d,
                method: "post",
                dataType: "json",
                success: function(t) {
                    0 == t.data.code && (wx.showToast({
                        title: "提交成功，等待审核",
                        icon: "none",
                        duration: 2e3
                    }), r.setData({
                        apply_complete: !0
                    }));
                }
            });
        }
    },
    onLoad: function(t) {
        status.setNavBgColor(), status.setGroupInfo().then(function(t) {
            var e = t && t.owner_name || "团长";
            wx.setNavigationBarTitle({
                title: e + "申请"
            });
        });
        var e = decodeURIComponent(t.scene);
        "undefined" != e && (this.community_id = e), this.getUserInfo();
    },
    onShow: function() {
        var e = this;
        util.check_login_new().then(function(t) {
            t ? e.setData({
                needAuth: !1
            }) : e.setData({
                needAuth: !0
            });
        });
    },
    authModal: function() {
        return !this.data.needAuth || (this.setData({
            showAuthModal: !this.data.showAuthModal
        }), !1);
    },
    authSuccess: function() {
        var t = this;
        this.setData({
            needAuth: !1
        }, function() {
            t.getUserInfo();
        });
    },
    getUserInfo: function() {
        var e = this, t = wx.getStorageSync("token");
        app.util.request({
            url: "entry/wxapp/user",
            data: {
                controller: "user.get_user_info",
                token: t
            },
            dataType: "json",
            success: function(t) {
                0 == t.data.code ? e.setData({
                    member_info: t.data.data
                }) : e.setData({
                    needAuth: !0
                });
            }
        });
    },
    applyAgain: function() {
        var t = this.data.member_info;
        t.is_head = 0, this.setData({
            member_info: t
        });
    },
    countDown: function() {
        var a = this;
        clearInterval(clearTime), clearTime = setInterval(function() {
            var t = a.data.timeStamp, e = a.data.showCountDown;
            0 < t ? t-- : (e = !0, clearInterval(clearTime), t = 60), a.setData({
                showCountDown: e,
                timeStamp: t
            });
        }, 1e3);
    }
});