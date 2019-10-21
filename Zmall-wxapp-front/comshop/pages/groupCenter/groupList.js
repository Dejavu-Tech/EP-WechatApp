var page = 1, app = getApp();

Page({
    data: {
        currentTab: 0,
        pageSize: 10,
        navList: [ {
            name: "全部",
            id: "0"
        }, {
            name: "待配送",
            id: "1"
        }, {
            name: "待签收",
            id: "2"
        }, {
            name: "待提货",
            id: "3"
        }, {
            name: "已完成",
            id: "4"
        } ],
        loadText: "",
        disUserId: "",
        no_order: 0,
        page: 1,
        hide_tip: !0,
        order: [],
        tip: "正在加载"
    },
    onLoad: function(t) {
        page = 1;
        var a = 0;
        null != t && (a = t.tab), this.setData({
            currentTab: a
        }), this.getData(a);
    },
    onReady: function() {},
    onShow: function() {},
    callPhone: function(t) {
        var a = t.currentTarget.dataset.phone;
        a && wx.makePhoneCall({
            phoneNumber: a
        });
    },
    switchNav: function(t) {
        if (this.data.currentTab === 1 * t.currentTarget.dataset.id) return !1;
        this.setData({
            currentTab: 1 * t.currentTarget.dataset.id,
            page: 1,
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
        var r = this, t = wx.getStorageSync("token"), a = this.data.currentTab, e = -1;
        1 == a ? e = 1 : 2 == a ? e = 14 : 3 == a ? e = 4 : 4 == a && (e = 6), app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "order.orderlist",
                is_tuanz: 1,
                token: t,
                page: r.data.page,
                order_status: e
            },
            dataType: "json",
            success: function(t) {
                if (0 != t.data.code) return r.setData({
                    isHideLoadMore: !0
                }), wx.hideLoading(), !1;
                console.log(r.data.page);
                var a = t.data.data, e = r.data.order.concat(a);
                r.setData({
                    order: e,
                    hide_tip: !0,
                    no_order: 0
                }), wx.hideLoading();
            }
        });
    },
    sign_one: function(t) {
        var o = this, n = t.currentTarget.dataset.order_id, a = wx.getStorageSync("token");
        wx.showModal({
            title: "提示",
            content: "确认提货",
            confirmColor: "#4facfe",
            success: function(t) {
                t.confirm && app.util.request({
                    url: "entry/wxapp/index",
                    data: {
                        controller: "order.sign_dan_order",
                        token: a,
                        order_id: n
                    },
                    dataType: "json",
                    success: function(t) {
                        wx.showToast({
                            title: "签收成功",
                            duration: 1e3
                        });
                        var a = o.data.order, e = [];
                        for (var r in a) a[r].order_id != n && e.push(a[r]);
                        o.setData({
                            order: e
                        });
                    }
                });
            }
        });
    },
    goOrderDetail: function(t) {
        var a = t.currentTarget.dataset.order_id;
        wx.navigateTo({
            url: "/lionfish_comshop/pages/groupCenter/groupDetail?groupOrderId=" + a
        });
    },
    onReachBottom: function() {
        if (1 == this.data.no_order) return !1;
        this.data.page += 1, this.getData(), this.setData({
            isHideLoadMore: !1
        });
    }
});