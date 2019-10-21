var util = require("../../utils/util.js"), app = getApp(), status = require("../../utils/index.js");

function count_down(e, t) {
    var a = Math.floor(t / 1e3), o = a / 3600 / 24, r = Math.floor(o), n = a / 3600 - 24 * r, i = Math.floor(n), d = a / 60 - 1440 * r - 60 * i, s = Math.floor(d), c = a - 86400 * r - 3600 * i - 60 * s;
    e.setData({
        endtime: {
            days: r,
            hours: fill_zero_prefix(i),
            minutes: fill_zero_prefix(s),
            seconds: fill_zero_prefix(c),
            show_detail: 1
        }
    }), t <= 0 ? e.setData({
        changeState: 1,
        endtime: {
            days: "00",
            hours: "00",
            minutes: "00",
            seconds: "00"
        }
    }) : setTimeout(function() {
        count_down(e, t -= 1e3);
    }, 1e3);
}

function fill_zero_prefix(e) {
    return e < 10 ? "0" + e : e;
}

Page({
    mixins: [ require("../../mixin/compoentCartMixin.js") ],
    data: {
        endtime: {
            days: "00",
            hours: "00",
            minutes: "00",
            seconds: "00"
        },
        cancelOrderVisible: !1,
        orderSkuResps: [],
        tablebar: 4,
        navState: 0,
        theme_type: "",
        loadover: !1,
        pingtai_deal: 0,
        is_show: !1,
        order: {},
        common_header_backgroundimage: "",
        isShowModal: !1,
        userInfo: {},
        groupInfo: {
            group_name: "社区",
            owner_name: "团长"
        },
        is_show_guess_like: 1
    },
    is_show_tip: "",
    timeOut: function() {
        console.log("计时完成");
    },
    options: "",
    canCancel: !0,
    onLoad: function(e) {
        var o = this;
        o.options = e;
        var t = wx.getStorageSync("userInfo");
        t && (t.shareNickName = 3 < t.nickName.length ? t.nickName.substr(0, 3) + "..." : t.nickName), 
        status.setGroupInfo().then(function(e) {
            o.setData({
                groupInfo: e
            });
        }), util.check_login() ? this.setData({
            needAuth: !1
        }) : this.setData({
            needAuth: !0
        }), o.setData({
            common_header_backgroundimage: app.globalData.common_header_backgroundimage,
            userInfo: t
        });
        var a = wx.getStorageSync("token");
        wx.hideShareMenu(), wx.showLoading();
        var r = e && e.is_show || 0, n = e && e.isfail || "";
        null != (this.is_show_tip = r) && 1 == r || wx.showLoading(), null != n && 1 == n && wx.showToast({
            title: "支付失败",
            icon: "none"
        }), app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "order.order_info",
                token: a,
                id: e.id
            },
            dataType: "json",
            method: "POST",
            success: function(e) {
                if (wx.hideLoading(), 0 == e.data.code) {
                    if (null != r && 1 == r && "integral" == e.data.data.order_info.type) wx.showToast({
                        title: "兑换成功"
                    }); else if (null != r && 1 == r) if (1 == e.data.order_pay_after_share) {
                        var t = e.data.data.share_img;
                        o.setData({
                            share_img: t,
                            isShowModal: !0
                        });
                    } else wx.showToast({
                        title: "支付成功"
                    });
                    if (3 == e.data.data.order_info.order_status_id) {
                        var a = 1e3 * (e.data.data.order_info.over_buy_time - e.data.data.order_info.cur_time);
                        0 < a ? count_down(o, a) : 1 == e.data.data.order_info.open_auto_delete && o.setData({
                            changeState: 1
                        });
                    }
                    o.setData({
                        order: e.data.data,
                        pingtai_deal: e.data.pingtai_deal,
                        order_refund: e.data.order_refund,
                        order_can_del_cancle: e.data.order_can_del_cancle,
                        loadover: !0,
                        is_show: 1,
                        hide_lding: !0,
                        is_hidden_orderlist_phone: e.data.is_hidden_orderlist_phone || 0,
                        is_show_guess_like: e.data.is_show_guess_like || 0
                    }), o.hide_lding();
                } else 2 == e.data.code && o.setData({
                    needAuth: !0
                });
            }
        });
    },
    authSuccess: function() {
        this.onLoad(this.options);
    },
    reload_data: function() {
        var a = this, e = wx.getStorageSync("token");
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "order.order_info",
                token: e,
                id: a.data.order.order_info.order_id
            },
            dataType: "json",
            method: "POST",
            success: function(e) {
                if (3 == e.data.data.order_info.order_status_id) {
                    var t = 1e3 * (e.data.data.order_info.over_buy_time - e.data.data.order_info.cur_time);
                    0 < t ? count_down(a, t) : a.setData({
                        changeState: 1
                    });
                }
                a.setData({
                    order: e.data.data,
                    pingtai_deal: e.data.pingtai_deal,
                    order_refund: e.data.order_refund,
                    loadover: !0,
                    is_show: 1,
                    hide_lding: !0
                });
            }
        });
    },
    receivOrder: function(e) {
        var t = e.currentTarget.dataset.type, a = wx.getStorageSync("token"), o = this;
        wx.showModal({
            title: "提示",
            content: "确认收到",
            confirmColor: "#4facfe",
            success: function(e) {
                e.confirm && app.util.request({
                    url: "entry/wxapp/index",
                    data: {
                        controller: "order.receive_order",
                        token: a,
                        order_id: t
                    },
                    dataType: "json",
                    success: function(e) {
                        0 == e.data.code && (wx.showToast({
                            title: "收货成功",
                            icon: "success",
                            duration: 1e3
                        }), o.reload_data());
                    }
                });
            }
        });
    },
    cancelSubmit: function(e) {
        var t = e.detail.formId, a = wx.getStorageSync("token");
        app.util.request({
            url: "entry/wxapp/user",
            data: {
                controller: "user.get_member_form_id",
                token: a,
                from_id: t
            },
            dataType: "json",
            success: function(e) {}
        });
    },
    payNowSubmit: function(e) {
        var t = e.detail.formId, a = wx.getStorageSync("token");
        app.util.request({
            url: "entry/wxapp/user",
            data: {
                controller: "user.get_member_form_id",
                token: a,
                from_id: t
            },
            dataType: "json",
            success: function(e) {}
        });
    },
    callDialog: function(e) {
        var t = e.currentTarget.dataset.type, a = wx.getStorageSync("token");
        wx.showModal({
            title: "取消支付",
            content: "好不容易挑出来，确定要取消吗？",
            confirmColor: "#4facfe",
            success: function(e) {
                e.confirm && app.util.request({
                    url: "entry/wxapp/index",
                    data: {
                        controller: "order.cancel_order",
                        token: a,
                        order_id: t
                    },
                    dataType: "json",
                    success: function(e) {
                        wx.showToast({
                            title: "取消成功",
                            icon: "success",
                            complete: function() {
                                wx.redirectTo({
                                    url: "/lionfish_comshop/pages/order/index"
                                });
                            }
                        });
                    }
                });
            }
        });
    },
    callTelphone: function(e) {
        var t = e.currentTarget.dataset.phone;
        wx.makePhoneCall({
            phoneNumber: t
        });
    },
    applyForService: function(e) {
        var t = e.currentTarget.dataset.type, a = e.currentTarget.dataset.order_goods_id;
        console.log(a);
        wx.getStorageSync("token");
        wx.redirectTo({
            url: "/lionfish_comshop/pages/order/refund?id=" + t + "&order_goods_id=" + a
        });
    },
    payNow: function(e) {
        var t = e.currentTarget.dataset.type, a = wx.getStorageSync("token");
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "car.wxpay",
                token: a,
                order_id: t
            },
            dataType: "json",
            method: "POST",
            success: function(e) {
                0 == e.data.code ? wx.requestPayment({
                    appId: e.data.appId,
                    timeStamp: e.data.timeStamp,
                    nonceStr: e.data.nonceStr,
                    package: e.data.package,
                    signType: e.data.signType,
                    paySign: e.data.paySign,
                    success: function(e) {
                        wx.redirectTo({
                            url: "/lionfish_comshop/pages/order/order?id=" + t + "&is_show=1"
                        });
                    },
                    fail: function(e) {
                        console.log(e);
                    }
                }) : 2 == e.data.code && wx.showToast({
                    title: e.data.msg,
                    icon: "none"
                });
            }
        });
    },
    hide_lding: function() {
        wx.hideLoading(), this.setData({
            is_show: !0
        });
    },
    call_mobile: function(e) {
        var t = e.currentTarget.dataset.mobile;
        wx.makePhoneCall({
            phoneNumber: t
        });
    },
    goComment: function(e) {
        var t = e.currentTarget.dataset.type, a = e.currentTarget.dataset.order_goods_id, o = e.currentTarget.dataset.goods_id;
        3 < getCurrentPages().length ? wx.redirectTo({
            url: "/lionfish_comshop/pages/order/evaluate?id=" + t + "&goods_id=" + o + "&order_goods_id=" + a
        }) : wx.navigateTo({
            url: "/lionfish_comshop/pages/order/evaluate?id=" + t + "&goods_id=" + o + "&order_goods_id=" + a
        });
    },
    goGoods: function(e) {
        var t = e.currentTarget.dataset.type;
        3 < getCurrentPages().length ? wx.redirectTo({
            url: "/Snailfish_shop/pages/goods/index?id=" + t
        }) : wx.navigateTo({
            url: "/Snailfish_shop/pages/goods/index?id=" + t
        });
    },
    orderRefund: function(e) {
        var t = e.currentTarget.dataset.type;
        3 < getCurrentPages().length ? wx.redirectTo({
            url: "/Snailfish_shop/pages/order/refund?id=" + t
        }) : wx.navigateTo({
            url: "/Snailfish_shop/pages/order/refund?id=" + t
        });
    },
    orderRefunddetail: function(e) {
        var t = e.currentTarget.dataset.type;
        3 < getCurrentPages().length ? wx.redirectTo({
            url: "/Snailfish_shop/pages/order/refunddetail?id=" + t
        }) : wx.navigateTo({
            url: "/Snailfish_shop/pages/order/refunddetail?id=" + t
        });
    },
    gokefu: function(e) {
        var t = e.currentTarget.dataset.s_id;
        this.data.goods, this.data.seller_info;
        3 < getCurrentPages().length ? wx.redirectTo({
            url: "/pages/im/index?id=" + t
        }) : wx.navigateTo({
            url: "/pages/im/index?id=" + t
        });
    },
    goRefund: function(e) {
        var t = e.currentTarget.dataset.id || 0;
        t && (3 < getCurrentPages().length ? wx.redirectTo({
            url: "/lionfish_comshop/pages/order/refunddetail?id=" + t
        }) : wx.navigateTo({
            url: "/lionfish_comshop/pages/order/refunddetail?id=" + t
        }));
    },
    navShow: function() {
        this.setData({
            navState: 1
        });
    },
    navHide: function() {
        this.setData({
            navState: 0
        });
    },
    orderPay: function(e) {
        var t = wx.getStorageSync("token"), a = e.currentTarget.dataset.type;
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "car.wxpay",
                token: t,
                order_id: a
            },
            dataType: "json",
            method: "POST",
            success: function(e) {
                var t = e.data.is_pin;
                wx.requestPayment({
                    appId: e.data.appId,
                    timeStamp: e.data.timeStamp,
                    nonceStr: e.data.nonceStr,
                    package: e.data.package,
                    signType: e.data.signType,
                    paySign: e.data.paySign,
                    success: function(e) {
                        0 == t ? wx.redirectTo({
                            url: "/Snailfish_shop/pages/order/order?id=" + a + "&is_show=1"
                        }) : wx.redirectTo({
                            url: "/Snailfish_shop/pages/share/index?id=" + a
                        });
                    },
                    fail: function(e) {
                        console.log(e);
                    }
                });
            }
        });
    },
    closeModal: function() {
        this.setData({
            isShowModal: !1
        });
    },
    cancelOrder: function(o) {
        var r = this;
        this.canCancel && wx.showModal({
            title: "取消订单并退款",
            content: "取消订单后，款项将原路退回到您的支付账户；详情请查看退款进度。",
            confirmText: "取消订单",
            confirmColor: "#4facfe",
            cancelText: "再等等",
            cancelColor: "#666666",
            success: function(e) {
                if (e.confirm) {
                    r.canCancel = !1;
                    var t = o.currentTarget.dataset.type, a = wx.getStorageSync("token");
                    app.util.request({
                        url: "entry/wxapp/index",
                        data: {
                            controller: "order.del_cancle_order",
                            token: a,
                            order_id: t
                        },
                        dataType: "json",
                        method: "POST",
                        success: function(e) {
                            0 == e.data.code ? wx.showModal({
                                title: "提示",
                                content: "取消订单成功",
                                showCancel: !1,
                                confirmColor: "#4facfe",
                                success: function(e) {
                                    e.confirm && wx.redirectTo({
                                        url: "/lionfish_comshop/pages/order/index"
                                    });
                                }
                            }) : (r.canCancel = !0, wx.showToast({
                                title: e.data.msg || "取消订单失败",
                                icon: "none"
                            }));
                        }
                    }), console.log("用户点击确定");
                } else e.cancel && (r.canCancel = !0, console.log("用户点击取消"));
            }
        });
    },
    onShareAppMessage: function(e) {
        var t = this.data.order.order_info.order_id, a = this.data.order.order_goods_list[0].goods_share_image, o = this.data.share_img;
        if (t && 1 == this.is_show_tip) return {
            title: "@" + this.data.order.order_info.ziti_name + this.data.groupInfo.owner_name + "，我是" + this.data.userInfo.shareNickName + "，刚在你这里下单啦！！！",
            path: "lionfish_comshop/pages/order/shareOrderInfo?order_id=" + t,
            imageUrl: o || a
        };
    }
});