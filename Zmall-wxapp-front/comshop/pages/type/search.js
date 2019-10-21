var app = getApp(), util = require("../../utils/util.js");

Page({
    data: {
        is_login: !0,
        wxSearchData: []
    },
    onLoad: function(e) {
        wx.showLoading(), util.check_login() ? this.setData({
            is_login: !0
        }) : this.setData({
            is_login: !1
        }), this.getHisKeys();
    },
    onShow: function() {
        wx.hideLoading();
    },
    goResult: function(e) {
        var t = e.detail.value.replace(/\s+/g, "");
        t ? (this.wxSearchAddHisKey(t), wx.navigateTo({
            url: "/lionfish_comshop/pages/type/result?keyword=" + t
        })) : wx.showToast({
            title: "请输入关键词",
            icon: "none"
        });
    },
    goResultName: function(e) {
        console.log(e);
        var t = e.currentTarget.dataset.name;
        t ? (this.wxSearchAddHisKey(t), wx.navigateTo({
            url: "/lionfish_comshop/pages/type/result?keyword=" + t
        })) : wx.showToast({
            title: "请输入关键词",
            icon: "none"
        });
    },
    getHisKeys: function() {
        var e = [];
        try {
            (e = wx.getStorageSync("wxSearchHisKeys")) && this.setData({
                wxSearchData: e
            });
        } catch (e) {}
    },
    clearHis: function() {
        var t = this;
        wx.removeStorage({
            key: "wxSearchHisKeys",
            success: function(e) {
                t.setData({
                    wxSearchData: []
                });
            }
        });
    },
    wxSearchAddHisKey: function(e) {
        var t = {}, s = this;
        if (t.name = e, void 0 !== t && 0 != t.length) {
            var i = wx.getStorageSync("wxSearchHisKeys");
            i ? JSON.stringify(i).indexOf(JSON.stringify(t)) < 0 && (4 < i.length && i.pop(), 
            i.unshift(t)) : (i = []).push(t), wx.setStorage({
                key: "wxSearchHisKeys",
                data: i,
                success: function() {
                    s.getHisKeys();
                }
            });
        }
    },
    onHide: function() {},
    onUnload: function() {}
});