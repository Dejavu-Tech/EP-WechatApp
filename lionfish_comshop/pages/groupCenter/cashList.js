var app = getApp();

Page({
    data: {
        loadText: "正在加载",
        LoadingComplete: !0,
        no_order: 0,
        page: 1,
        hide_tip: !0,
        order: [],
        tip: "正在加载"
    },
    onLoad: function(t) {},
    onReady: function() {},
    onShow: function() {
        this.setData({
            page: 1,
            no_order: 0,
            order: []
        }), this.getData();
    },
    getData: function() {
        wx.showLoading({
            title: "加载中...",
            mask: !0
        }), this.setData({
            isHideLoadMore: !0
        }), this.data.no_order = 1;
        var e = this, t = wx.getStorageSync("token");
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "community.cashlist",
                token: t,
                page: e.data.page
            },
            dataType: "json",
            success: function(t) {
                if (0 != t.data.code) return e.setData({
                    LoadingComplete: !0,
                    isHideLoadMore: !0
                }), wx.hideLoading(), !1;
                console.log(e.data.page);
                var a = e.data.order.concat(t.data.data);
                e.setData({
                    order: a,
                    hide_tip: !0,
                    no_order: 0
                }), wx.hideLoading();
            }
        });
    },
    onHide: function() {},
    onUnload: function() {},
    onPullDownRefresh: function() {},
    onReachBottom: function() {
        if (1 == this.data.no_order) return !1;
        this.data.page += 1, this.getData(), this.setData({
            isHideLoadMore: !1
        });
    },
    onShareAppMessage: function() {}
});