var app = getApp(), util = require("../../utils/util.js");

Page({
    data: {
        order: {}
    },
    onLoad: function(t) {
        this.setData({
            orderId: t.groupOrderId
        }), util.check_login() ? this.setData({
            needAuth: !1
        }) : this.setData({
            needAuth: !0
        }), wx.showLoading({
            title: "加载中...",
            mask: !0
        }), this.getData();
    },
    authSuccess: function() {
        var t = this;
        this.setData({
            needAuth: !1
        }, function() {
            t.getData();
        });
    },
    onShow: function() {},
    getData: function() {
        var s = this, t = wx.getStorageSync("token");
        this.data.orderId ? app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "order.order_head_info",
                token: t,
                id: this.data.orderId
            },
            dataType: "json",
            success: function(t) {
                if (wx.hideLoading(), 0 == t.data.code) {
                    var a = t.data.data, e = 0;
                    a && a.order_goods_list && a.order_goods_list.forEach(function(t) {
                        e += parseFloat(t.commision);
                    }), s.setData({
                        order: t.data.data,
                        commision: e.toFixed(2)
                    });
                }
            }
        }) : wx.showModal({
            title: "提示",
            content: "订单不存在",
            showCancel: !1,
            success: function(t) {
                t.confirm && wx.redirectTo({
                    url: "/lionfish_comshop/pages/groupCenter/groupList"
                });
            }
        });
    },
    swithState: function(t) {
        switch (t) {
          case "-1":
            break;

          case "0":
            this.setData({
                orderStatusName: "待成团"
            });
            break;

          case "1":
            this.setData({
                orderStatusName: "待配送"
            });
            break;

          case "2":
            this.setData({
                orderStatusName: "待收货"
            });
            break;

          case "3":
            this.setData({
                orderStatusName: "待提货"
            });
            break;

          case "4":
            this.setData({
                orderStatusName: "已完成"
            });
            break;

          case "6":
            this.setData({
                orderStatusName: "待采购"
            });
        }
    }
});