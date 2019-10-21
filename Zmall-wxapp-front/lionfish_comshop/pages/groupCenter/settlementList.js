var page = 1;

Page({
    data: {
        settlementList: [ {
            id: "1",
            disSettleNo: "111111111111",
            settleNum: "111",
            totalAmount: "2222",
            payNo: "4444",
            createTime: "2018-12-16"
        } ],
        loadText: "没有更多记录了~",
        LoadingComplete: !1,
        scrollTop: 0,
        containerHeight: 0,
        chooseDate: "",
        chooseDateTime: "",
        data: "",
        settle: "",
        communnityId: ""
    },
    onLoad: function(t) {
        var e = wx.getSystemInfoSync();
        this.setData({
            containerHeight: e.windowHeight
        });
    },
    onReady: function() {},
    onShow: function() {
        page = 1, wx.showLoading({
            title: "加载中...",
            mask: !0
        });
        var t = new Date(), e = t.getFullYear(), a = t.getMonth() + 1, o = Date.parse(t);
        this.setData({
            chooseDate: e + "年" + a + "月",
            chooseDateTime: o
        }), this.data.settlementList = [], this.getData();
    },
    getData: function() {
        console.log(111), wx.hideLoading();
    },
    getSettlementList: function() {
        console.log(222);
    },
    getMoreList: function() {
        wx.showLoading({
            title: "加载中...",
            mask: !0
        }), this.data.LoadingComplete ? (page += 1, this.getSettlementList()) : wx.hideLoading();
    },
    bindDateChange: function(t) {
        page = 1, console.log("picker发送选择改变，携带值为", t.detail.value), this.setData({
            date: t.detail.value
        });
        var e = this.data.date.split("-"), a = Date.parse(this.data.date);
        this.setData({
            chooseDate: e[0] + "年" + e[1] + "月",
            chooseDateTime: a
        }), this.getData();
    },
    onHide: function() {},
    onUnload: function() {},
    onPullDownRefresh: function() {},
    onReachBottom: function() {},
    onShareAppMessage: function() {}
});