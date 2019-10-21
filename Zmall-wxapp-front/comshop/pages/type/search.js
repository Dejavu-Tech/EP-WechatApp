var app = getApp(), util = require("../../utils/util.js");

Page({
    data: {
        is_login: !0,
        wxSearchData: []
    },
    onLoad: function(e) {
        wx.showLoading(), this.getHisKeys();
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
        var t = {}, a = this;
        if (t.name = e, void 0 !== t && 0 != t.length) {
            var s = wx.getStorageSync("wxSearchHisKeys");
            s ? JSON.stringify(s).indexOf(JSON.stringify(t)) < 0 && (4 < s.length && s.pop(), 
            s.unshift(t)) : (s = []).push(t), wx.setStorage({
                key: "wxSearchHisKeys",
                data: s,
                success: function() {
                    a.getHisKeys();
                }
            });
        }
    },
    onHide: function() {},
    onUnload: function() {}
});