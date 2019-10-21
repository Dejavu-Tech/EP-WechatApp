var app = getApp();

Page({
    data: {
        recordList: [ {
            memberHeadPic: "../../images/head-bitmap.png",
            receiverName: "名字",
            orderNum: "111",
            createTime: "2018-09-12"
        } ],
        refundList: [ {
            userAvatar: "",
            orderUserName: "霸气妖",
            returnOrderCount: "222",
            createTime: "2018-09-12"
        } ],
        currentTab: 0,
        navList: [ {
            name: "购买记录",
            status: "0"
        }, {
            name: "退单记录",
            status: "1"
        } ],
        LoadingComplete: !1,
        loadText: "没有更多了~",
        groupOrderStatus: "",
        containerHeight: 0,
        scrollTop: 0
    },
    onLoad: function(t) {
        this.setData({
            recordList: this.data.recordList.map(function(t) {
                return t.isHide = !1, t;
            }),
            groupOrderNo: t.groupOrderNo,
            skuId: t.skuId,
            containerHeight: app.globalData.systemInfo.windowHeight - Math.round(app.globalData.systemInfo.windowHeight / 375 * 10),
            groupOrderStatus: t.groupOrderStatus
        }), this.getList(this.data.currentTab);
    },
    onReady: function() {},
    onShow: function() {},
    bindChange: function(t) {
        this.setData({
            currentTab: 1 * t.detail.current
        }), this.getList(this.data.currentTab);
    },
    getList: function(t) {
        wx.showLoading({
            title: "加载中...",
            mask: !0
        }), 0 === t && (console.log(222), wx.hideLoading());
    },
    switchNav: function(t) {
        if (this.data.currentTab === 1 * t.currentTarget.dataset.current) return !1;
        this.setData({
            currentTab: 1 * t.currentTarget.dataset.current
        });
    },
    onHide: function() {},
    onUnload: function() {},
    onPullDownRefresh: function() {},
    onReachBottom: function() {},
    onShareAppMessage: function() {}
});