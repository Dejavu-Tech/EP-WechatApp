var util = require("../../utils/util.js"), app = getApp();

Page({
    data: {
        ref_id: 0,
        order_goods: {},
        order_id: 0,
        order_info: {},
        order_refund: {},
        order_refund_historylist: [],
        refund_images: []
    },
    onLoad: function(e) {
        var r = e.id, o = this;
        this.setData({
            ref_id: r
        }, function() {
            o.getData();
        });
    },
    onShow: function() {},
    onPullDownRefresh: function() {
        this.getData();
    },
    sub_cancle: function() {
        var r = this.data.order_id, e = this.data.ref_id, o = wx.getStorageSync("token");
        app.util.request({
            url: "entry/wxapp/user",
            data: {
                controller: "user.cancel_refund",
                token: o,
                ref_id: e
            },
            dataType: "json",
            success: function(e) {
                3 == e.data.code || 1 == e.data.code && wx.showToast({
                    title: "撤销成功",
                    icon: "success",
                    duration: 1e3,
                    success: function(e) {
                        wx.redirectTo({
                            url: "/lionfish_comshop/pages/order/order?id=" + r
                        });
                    }
                });
            }
        });
    },
    getData: function() {
        var e = this.data.ref_id, r = wx.getStorageSync("token"), s = this;
        app.util.request({
            url: "entry/wxapp/user",
            data: {
                controller: "afterorder.refunddetail",
                token: r,
                ref_id: e
            },
            dataType: "json",
            success: function(e) {
                if (wx.stopPullDownRefresh(), 3 == e.data.code) ; else if (1 == e.data.code) {
                    var r = e.data, o = r.order_goods, t = r.order_id, d = r.order_info, i = r.order_refund, n = r.order_refund_historylist, a = r.refund_images;
                    s.setData({
                        order_goods: o,
                        order_id: t,
                        order_info: d,
                        order_refund: i,
                        order_refund_historylist: n,
                        refund_images: a
                    });
                }
            }
        });
    },
    cancelApply: function() {
        var r = this;
        wx.showModal({
            title: "撤销申请",
            content: "退款申诉一旦撤销就不可恢复，并且不可以再次申请，确定要撤销本次申诉吗？",
            confirmText: "我要撤销",
            confirmColor: "#4facfe",
            cancelText: "暂不撤销",
            cancelColor: "#666666",
            success: function(e) {
                e.confirm && r.sub_cancle();
            }
        });
    },
    editApply: function() {
        var e = this.data, r = e.order_goods, o = e.order_refund.ref_id || 0, t = r.order_id || 0, d = r.order_goods_id || 0;
        o && t && d && wx.navigateTo({
            url: "/lionfish_comshop/pages/order/refund?ref_id=" + o + "&id=" + t + "&order_goods_id=" + d
        });
    }
});