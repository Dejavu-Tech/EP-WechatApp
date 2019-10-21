var util = require("../../utils/util.js"), app = getApp();

Page({
    data: {
        order_id: 0,
        goods_id: 0,
        miaoshu_no: 0,
        price_no: 0,
        zhiliang_no: 0,
        is_jifen: 0,
        pinjia_text: "",
        thumb_img: [],
        image: [],
        placeholder: "亲，您对这个商品满意吗？您的评价会帮助我们选择更好的商品哦～",
        evaluate: "",
        imgGroup: [],
        imgMax: 4,
        isIpx: !1,
        focus: !1,
        progressList: []
    },
    onLoad: function(t) {
        var a = this, e = wx.getStorageSync("token"), o = t.id, i = t.goods_id;
        this.setData({
            order_id: o,
            goods_id: i
        }), app.util.request({
            url: "entry/wxapp/user",
            data: {
                controller: "user.order_comment",
                token: e,
                order_id: o,
                goods_id: i
            },
            dataType: "json",
            success: function(t) {
                3 == t.data.code || 0 == t.data.code && a.setData({
                    goods_id: t.data.goods_id,
                    order_goods: t.data.order_goods,
                    goods_image: t.data.goods_image
                });
            }
        });
    },
    onReady: function() {},
    addImg: function() {
        var d = this, n = this.data.imgGroup;
        wx.chooseImage({
            count: this.data.imgMax - n.length,
            success: function(t) {
                for (var a = t.tempFilePaths, e = d.data.thumb_img, o = 0; o < a.length; o++) {
                    if (wx.showLoading({
                        title: "上传中"
                    }), 4 <= e.length) return d.setData({
                        thumb_img: e
                    }), !1;
                    wx.uploadFile({
                        url: app.util.url("entry/wxapp/index", {
                            m: "lionfish_comshop",
                            controller: "goods.doPageUpload"
                        }),
                        filePath: a[o],
                        name: "upfile",
                        formData: {
                            name: a[o]
                        },
                        header: {
                            "content-type": "multipart/form-data"
                        },
                        success: function(t) {
                            wx.hideLoading();
                            var a = JSON.parse(t.data), e = a.image_thumb, o = (a.image_o_full, a.image_o), i = d.data.image, s = d.data.thumb_img;
                            i.push(o), s.push(e), n.push(e), d.setData({
                                thumb_img: s,
                                image: i,
                                imgGroup: n
                            });
                        }
                    });
                }
            }
        });
    },
    textinput: function(t) {
        var a = t.detail.value;
        this.setData({
            pinjia_text: a
        });
    },
    choseImg: function(t) {
        var a = t.currentTarget.dataset.idx, e = this.data.imgGroup, o = this.data.image;
        o.splice(a, 1), e.splice(a, 1), this.setData({
            imgGroup: e,
            image: o
        });
    },
    sub_comment: function() {
        var a = this.data.order_id, t = this.data.goods_id, e = this.data.pinjia_text, o = this.data.image;
        if ("" == e) return wx.showToast({
            title: "请填写评价内容",
            icon: "success",
            duration: 1e3
        }), !1;
        wx.showLoading({
            title: "评论中"
        });
        var i = wx.getStorageSync("token");
        console.log(o), app.util.request({
            url: "entry/wxapp/user",
            data: {
                controller: "user.sub_comment",
                token: i,
                order_id: a,
                goods_id: t,
                comment_content: e,
                imgs: o
            },
            method: "POST",
            dataType: "json",
            success: function(t) {
                wx.hideLoading(), 3 == t.data.code ? wx.showToast({
                    title: "未登录",
                    icon: "loading",
                    duration: 1e3
                }) : wx.showToast({
                    title: "评价成功",
                    icon: "success",
                    duration: 1e3,
                    success: function(t) {
                        wx.redirectTo({
                            url: "/lionfish_comshop/pages/order/order?id=" + a
                        });
                    }
                });
            }
        });
    },
    bigImg: function(t) {
        var a = t.currentTarget.dataset.src, e = t.currentTarget.dataset.list;
        wx.previewImage({
            current: a,
            urls: e
        });
    },
    onShow: function() {},
    onHide: function() {},
    onUnload: function() {}
});