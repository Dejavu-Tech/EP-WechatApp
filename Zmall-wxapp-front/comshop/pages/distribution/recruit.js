var app = getApp(), util = require("../../utils/util.js"), WxParse = require("../../wxParse/wxParse.js"), status = require("../../utils/index.js");

Page({
    data: {},
    onLoad: function(t) {
        status.setNavBgColor(), status.setGroupInfo().then(function(t) {
            var s = t && t.commiss_diy_name || "分销";
            wx.setNavigationBarTitle({
                title: "会员" + s
            });
        });
        var a = this;
        util.check_login() || this.setData({
            needAuth: !0
        }), app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "distribution.get_instruct"
            },
            dataType: "json",
            success: function(t) {
                if (0 == t.data.code) {
                    var s = t.data.content || "";
                    WxParse.wxParse("article", "html", s, a, 5);
                }
            }
        });
    },
    authSuccess: function() {
        this.setData({
            needAuth: !1
        });
    },
    subCommis: function() {
        wx.showLoading();
        var t = wx.getStorageSync("token"), s = this;
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "distribution.sub_commission_info",
                token: t
            },
            dataType: "json",
            success: function(t) {
                if (wx.hideLoading(), 0 == t.data.code) "申请成功，平台将尽快审核" == t.data.msg ? wx.navigateTo({
                    url: "/lionfish_comshop/pages/distribution/apply"
                }) : wx.redirectTo({
                    url: "/lionfish_comshop/pages/distribution/me"
                }); else {
                    if ("请先登录" == t.data.msg) return void s.setData({
                        needAuth: !0
                    });
                    if ("您未填写表单！" == t.data.msg) return void wx.navigateTo({
                        url: "/lionfish_comshop/pages/distribution/apply"
                    });
                    wx.showToast({
                        title: t.data.msg ? t.data.msg : "申请失败，请重试！",
                        icon: "none"
                    });
                }
            }
        });
    }
});