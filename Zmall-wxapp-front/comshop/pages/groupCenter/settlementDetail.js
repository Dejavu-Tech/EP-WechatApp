var page = 1;

Page({
    data: {
        containerHeight: "",
        LoadingComplete: !1,
        loadText: "没有更多订单了~",
        orderDetail: {},
        rewardList: []
    },
    onLoad: function(t) {
        var e = wx.getSystemInfoSync();
        this.setData({
            containerHeight: e.windowHeight,
            orderDetail: t
        });
    },
    onReady: function() {},
    onShow: function() {
        page = 1, wx.showLoading({
            title: "加载中...",
            mask: !0
        }), this.data.rewardList = [], this.getDetailInfo();
    },
    getDetailInfo: function() {
        console.log(211), wx.hideLoading();
    },
    getMoreList: function() {
        wx.showLoading({
            title: "加载中...",
            mask: !0
        }), this.data.LoadingComplete ? (page += 1, this.getDetailInfo()) : wx.hideLoading();
    }
});