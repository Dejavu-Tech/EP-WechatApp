var app = getApp();

Page({
    data: {
        isIpx: app.globalData.isIpx,
        list: [],
        state: 0
    },
    list_id: "",
    onLoad: function(t) {
        var o = t.id || "", e = t.state || 0;
        o ? (this.setData({
            state: e
        }), wx.showLoading(), this.list_id = o, this.getData(o)) : wx.redirectTo({
            url: "/lionfish_comshop/pages/groupCenter/list"
        });
    },
    getData: function(t) {
        var o = this, e = wx.getStorageSync("token");
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "community.get_head_deliverygoods",
                token: e,
                list_id: t
            },
            dataType: "json",
            success: function(t) {
                wx.hideLoading(), console.log(t), 0 == t.data.code && o.setData({
                    list: t.data.data || []
                });
            },
            fail: function(t) {
                console.log(t), wx.hideLoading();
            }
        });
    },
    signAll: function() {
        var t = wx.getStorageSync("token"), o = this.list_id;
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "community.sub_head_delivery",
                token: t,
                list_id: o
            },
            dataType: "json",
            success: function(t) {
                wx.hideLoading(), console.log(t), 0 == t.data.code ? (wx.showToast({
                    title: "收货成功",
                    icon: !1
                }), setTimeout(function() {
                    wx.redirectTo({
                        url: "/lionfish_comshop/pages/groupCenter/list"
                    });
                }, 2e3)) : wx.showToast({
                    title: "签收失败，请重试！",
                    icon: !1
                });
            },
            fail: function(t) {
                console.log(t), wx.hideLoading();
            }
        });
    },
    onReady: function() {},
    onShow: function() {},
    onHide: function() {},
    onUnload: function() {},
    onPullDownRefresh: function() {},
    onReachBottom: function() {}
});