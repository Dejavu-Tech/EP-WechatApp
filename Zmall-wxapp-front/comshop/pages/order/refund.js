var util = require("../../utils/util.js"), app = getApp();

Page({
    data: {
        xarray: [ "点击选择退款理由", "商品有质量问题", "没有收到货", "商品少发漏发发错", "商品与描述不一致", "收到商品时有划痕或破损", "质疑假货", "其他" ],
        index: 0,
        refund_type: 1,
        refund_imgs: [],
        complaint_mobile: "",
        refund_thumb_imgs: [],
        complaint_desc: "",
        order_id: 0,
        order_status_id: -1,
        complaint_name: "",
        ref_id: 0,
        complaint_money: 0,
        refund_money: 0
    },
    canRefund: !0,
    onLoad: function(e) {
        var t = e.id, a = e.order_goods_id, i = e.ref_id, o = this;
        this.setData({
            order_id: t || 0,
            order_goods_id: a || 0,
            ref_id: i || 0
        }, function() {
            o.getData();
        });
    },
    bindPickerChange: function(e) {
        this.setData({
            index: e.detail.value
        });
    },
    choseImg: function() {
        var r = this;
        if (3 <= this.data.refund_imgs.length) return wx.showToast({
            title: "最多三张图片",
            icon: "success",
            duration: 1e3
        }), !1;
        wx.chooseImage({
            count: 1,
            sizeType: [ "original", "compressed" ],
            sourceType: [ "album", "camera" ],
            success: function(e) {
                var t = e.tempFilePaths;
                wx.showLoading({
                    title: "上传中"
                }), wx.uploadFile({
                    url: app.util.url("entry/wxapp/index", {
                        m: "lionfish_comshop",
                        controller: "goods.doPageUpload"
                    }),
                    filePath: t[0],
                    name: "upfile",
                    formData: {
                        name: t[0]
                    },
                    header: {
                        "content-type": "multipart/form-data"
                    },
                    success: function(e) {
                        wx.hideLoading();
                        var t = JSON.parse(e.data), a = t.image_thumb, i = t.image_o, o = r.data.refund_imgs, n = r.data.refund_thumb_imgs;
                        o.push(i), n.push(a), r.setData({
                            refund_thumb_imgs: n,
                            refund_imgs: o
                        });
                    }
                });
            }
        });
    },
    chose_type: function(e) {
        var t = e.currentTarget.dataset.rel;
        this.setData({
            refund_type: t
        });
    },
    cancle_img: function(e) {
        var t = e.currentTarget.dataset.sr, a = 0, i = this.data.refund_imgs, o = this.data.refund_thumb_imgs, n = [], r = [];
        for (var d in o) o[d] == t ? (console.log("find"), a = d) : r.push(o[d]);
        for (var d in i) d != a && n.push(i[d]);
        this.setData({
            refund_thumb_imgs: r,
            refund_imgs: n
        }), console.log(r.length), console.log(n.length);
    },
    wenti_input: function(e) {
        var t = e.detail.value;
        this.setData({
            complaint_desc: t
        });
    },
    mobile_input: function(e) {
        var t = e.detail.value;
        this.setData({
            complaint_mobile: t
        });
    },
    name_input: function(e) {
        var t = e.detail.value;
        this.setData({
            complaint_name: t
        });
    },
    refund_money_input: function(e) {
        var t = 1 * e.detail.value, a = this.data.refund_money, i = {};
        a < t && (wx.showToast({
            title: "最大退款金额为" + a,
            icon: "none",
            duration: 1e3
        }), t = a, i.refund_money = a), i.complaint_money = t, this.setData(i);
    },
    sub_refund: function() {
        var t = this;
        if (t.canRefund) {
            var e = this.data, a = e.index, i = e.xarray, o = e.order_id, n = e.order_goods_id, r = e.refund_type, d = e.refund_imgs, s = e.complaint_desc, u = e.complaint_mobile, _ = e.total, c = e.complaint_name, l = e.complaint_money, m = (e.refund_money, 
            e.ref_id);
            if (0 == a) return this.errorToast("退款原因"), !1;
            var f = i[a];
            if (l <= 0) return this.errorToast("退款金额"), !1;
            if (_ < l && (l = _), "" == s) return this.errorToast("问题描述"), !1;
            if ("" == c) return this.errorToast("联系人"), !1;
            if ("" == u) return this.errorToast("手机号"), !1;
            if (!/^(((13[0-9]{1})|(15[0-9]{1})|(17[0-9]{1})|(18[0-9]{1}))+\d{8})$/.test(u)) return this.errorToast("正确手机号"), 
            !1;
            t.canRefund = !1;
            var p = wx.getStorageSync("token");
            app.util.request({
                url: "entry/wxapp/index",
                data: {
                    controller: "afterorder.refund_sub",
                    token: p,
                    ref_id: m,
                    order_id: o,
                    order_goods_id: n,
                    complaint_type: r,
                    complaint_images: d,
                    complaint_desc: s,
                    complaint_mobile: u,
                    complaint_reason: f,
                    complaint_money: l,
                    complaint_name: c
                },
                method: "POST",
                dataType: "json",
                success: function(e) {
                    if (wx.hideLoading(), t.canRefund = !0, 3 == e.data.code) wx.showToast({
                        title: "未登录",
                        icon: "loading",
                        duration: 1e3
                    }); else {
                        if (0 == e.data.code) return void wx.showToast({
                            title: e.data.msg,
                            icon: "success",
                            duration: 1e3
                        });
                        wx.showToast({
                            title: "申请成功",
                            icon: "success",
                            duration: 3e3,
                            success: function(e) {
                                wx.redirectTo({
                                    url: "/lionfish_comshop/pages/order/order?id=" + t.data.order_id
                                });
                            }
                        });
                    }
                }
            });
        }
    },
    errorToast: function(e) {
        wx.showToast({
            title: "请填写正确" + e,
            icon: "none",
            duration: 1e3
        });
    },
    getData: function() {
        var e = wx.getStorageSync("token"), h = this, t = this.data, a = t.order_id, i = t.order_goods_id, o = t.ref_id;
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "afterorder.get_order_money",
                token: e,
                order_id: a,
                order_goods_id: i,
                ref_id: o
            },
            dataType: "json",
            success: function(e) {
                if (1 == e.data.code) {
                    var t = e.data, a = t.order_goods, i = t.order_status_id, o = t.refund_image, n = t.refund_info, r = t.shipping_name, d = t.shipping_tel, s = t.total, u = h.data.xarray, _ = n.ref_name, c = u.findIndex(function(e) {
                        return e == _;
                    });
                    c = c <= 0 ? 0 : c;
                    var l = n.ref_description, m = n.ref_mobile, f = n.complaint_name, p = n.ref_money;
                    h.setData({
                        order_goods: a,
                        order_status_id: i,
                        refund_image: o,
                        refund_info: n,
                        shipping_name: r,
                        shipping_tel: d,
                        total: s,
                        index: c || 0,
                        complaint_desc: l || "",
                        complaint_mobile: m || d,
                        complaint_name: f || r,
                        complaint_money: p || s,
                        refund_money: p || s
                    });
                } else e.data.code;
            }
        });
    }
});