var util = require("../../utils/util.js"), app = getApp();

Page({
    data: {
        containerHeight: 0,
        scrollTop: 0,
        currentTab: "0",
        navList: [ {
            name: "全部",
            status: "0"
        }, {
            name: "处理中",
            status: "1"
        }, {
            name: "已退款",
            status: "2"
        }, {
            name: "已拒绝",
            status: "3"
        } ],
        refundList: [],
        loading: !0,
        page: 1,
        loadover: !1,
        order_status: 12,
        no_order: 0,
        hide_tip: !0,
        order: [],
        tip: "正在加载",
        pageNum: [ 1, 1, 1, 1 ],
        pageSize: 20,
        loadText: "没有更多订单了~",
        LoadingComplete: [ "", "", "", "" ]
    },
    onLoad: function(t) {
        var a = wx.getSystemInfoSync();
        this.setData({
            currentTab: t.orderStatus || "0",
            containerHeight: a.windowHeight - Math.round(a.windowWidth / 375 * 55)
        }), this.getData();
    },
    getData: function() {
        this.setData({
            isHideLoadMore: !0
        }), this.data.no_order = 1;
        var e = this, t = wx.getStorageSync("token");
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "order.refundorderlist",
                token: t,
                currentTab: e.data.currentTab,
                page: e.data.page,
                order_status: e.data.order_status
            },
            dataType: "json",
            success: function(t) {
                if (0 != t.data.code) return e.setData({
                    isHideLoadMore: !0
                }), !1;
                var a = e.data.order.concat(t.data.data);
                e.setData({
                    order: a,
                    hide_tip: !0,
                    no_order: 0
                });
            }
        });
    },
    onShow: function() {
        this.setData({
            pageNum: [ 1, 1, 1, 1, 1 ],
            loading: !0
        }), this.getAllList();
    },
    getAllList: function() {
        var a = this;
        Promise.all([ this.getDataList({
            pageNum: 1,
            status: ""
        }), this.getDataList({
            pageNum: 1,
            status: 1
        }), this.getDataList({
            pageNum: 1,
            status: 3
        }), this.getDataList({
            pageNum: 1,
            status: 4
        }) ]).then(function(t) {
            a.setData({
                loading: !1
            }), wx.stopPullDownRefresh();
        }).catch(function() {});
    },
    switchNav: function(t) {
        this.data.currentTab !== t.currentTarget.dataset.current && this.setData({
            currentTab: t.currentTarget.dataset.current
        });
    },
    bindChange: function(t) {
        console.log(t.detail.current), this.setData({
            no_order: 0,
            page: 1,
            order: [],
            currentTab: t.detail.current + ""
        }), this.getData();
    },
    getDataList: function(t) {
        return {
            pageNum: t.pageNum,
            pageSize: this.data.pageSize,
            status: t.status
        };
    },
    goRefund: function(t) {
        var a = t.currentTarget.dataset.type;
        wx.navigateTo({
            url: "/lionfish_comshop/pages/order/refunddetail?id=" + a
        });
    },
    goOrder: function(t) {
        var a = t.currentTarget.dataset.type;
        wx.navigateTo({
            url: "/lionfish_comshop/pages/order/order?id=" + a
        });
    },
    cancelApplication: function(t) {
        var a = this, r = t.detail;
        wx.showModal({
            title: "撤销申请",
            content: "您确定要撤销本次退款申请吗？",
            success: function(t) {
                t.confirm && (0, e.default)("/shop-return-order/refund/undo", {
                    returnOrderNo: r
                }).then(function(t) {
                    0 === t.head.error ? wx.showToast({
                        title: "撤销成功",
                        icon: "none"
                    }) : wx.showToast({
                        title: "该退款申请已处理",
                        icon: "none"
                    }), a.getAllList();
                }).catch(function() {});
            }
        });
    },
    onPullDownRefresh: function() {},
    getCurrentList: function() {
        if (1 == this.data.no_order) return !1;
        this.data.page += 1, this.getData(), this.setData({
            isHideLoadMore: !1
        });
    },
    onReachBottom: function() {}
});