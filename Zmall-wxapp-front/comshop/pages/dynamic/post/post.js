function _toConsumableArray(t) {
    if (Array.isArray(t)) {
        for (var e = 0, a = Array(t.length); e < t.length; e++) a[e] = t[e];
        return a;
    }
    return Array.from(t);
}

var util = require("../../../utils/util.js"), app = getApp();

Page({
    data: {
        max: 300,
        currentWordNumber: 0,
        quanInfo: "",
        list: [],
        is_more: !0,
        isDisable: !0,
        isChecked: !1,
        goodsItem: "",
        thumb_img: [],
        gid: 0,
        isGoods: !1
    },
    imgs: [],
    orign_image: [],
    page: 1,
    token: "",
    is_share: 0,
    onLoad: function(t) {
        this.getQuanInfo(), this.token = wx.getStorageSync("token");
    },
    onReady: function() {},
    onShow: function() {},
    onHide: function() {},
    getQuanInfo: function() {
        var e = this;
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "quan.get_quan_info",
                token: e.token
            },
            success: function(t) {
                0 == t.data.code && e.setData({
                    quanInfo: t.data.data
                });
            }
        });
    },
    getGoods: function() {
        var o = this;
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "quan.load_fabu_goods",
                page: o.page
            },
            method: "POST",
            success: function(t) {
                if (0 == t.data.code) {
                    1 == o.page && t.data.list.length < 10 && o.setData({
                        is_more: !1
                    });
                    var e = o.data.list, a = t.data.list;
                    o.page++, o.setData({
                        list: [].concat(_toConsumableArray(e), _toConsumableArray(a))
                    });
                } else o.setData({
                    is_more: !1
                });
            }
        });
    },
    textValue: function(t) {
        var e = t.detail.value, a = parseInt(e.length);
        a > this.data.max || this.setData({
            currentWordNumber: a
        });
    },
    previewImg: function(t) {
        var e = t.currentTarget.dataset.imgidx, a = this.imgs;
        wx.previewImage({
            current: a[e],
            urls: a,
            success: function(t) {},
            fail: function(t) {
                console.log("预览失败");
            }
        });
    },
    deleteImg: function(t) {
        var e = this.data.thumb_img, a = t.currentTarget.dataset.imgidx;
        e.splice(a, 1), this.orign_image.splice(a, 1), this.imgs.splice(a, 1), this.setData({
            thumb_img: e
        });
    },
    deleteGoods: function(t) {
        t.currentTarget.dataset.gid;
        this.setData({
            isDisable: !0,
            isChecked: !1,
            goodsItem: "",
            gid: 0
        });
    },
    getUrl: function(t) {
        var e = "entry/wxapp/index", a = getCurrentPages(), o = "";
        return a.length && (a = a[getCurrentPages().length - 1]) && a.__route__ && (o = {
            m: a.__route__.split("/")[0],
            controller: t
        }), app.util.url(e, o);
    },
    chooseImg: function(t) {
        var n = this, o = this.data.thumb_img;
        if (9 <= o.length) return this.setData({
            lenMore: 1
        }), setTimeout(function() {
            n.setData({
                lenMore: 0
            });
        }, 2500), !1;
        wx.chooseImage({
            sizeType: [ "original", "compressed" ],
            sourceType: [ "album", "camera" ],
            success: function(t) {
                wx.showLoading({
                    title: "上传中"
                });
                for (var e = t.tempFilePaths, s = n.data.thumb_img, a = 0; a < e.length; a++) {
                    if (9 <= o.length) return n.setData({
                        thumb_img: s
                    }), !1;
                    wx.uploadFile({
                        url: n.getUrl("goods.doPageUpload"),
                        filePath: e[a],
                        name: "upfile",
                        formData: {
                            name: e[a]
                        },
                        header: {
                            "content-type": "multipart/form-data"
                        },
                        success: function(t) {
                            console.log(t);
                            var e = JSON.parse(t.data);
                            if (0 == e.code) {
                                var a = e.image_thumb, o = e.image_o, i = e.image;
                                n.imgs.push(i), s.push(a), n.orign_image.push(o), n.setData({
                                    thumb_img: s
                                });
                            } else wx.hideLoading(), wx.showModal({
                                title: "提示",
                                content: e.msg,
                                showCancel: !1,
                                confirmColor: "#4facfe"
                            });
                        }
                    }), wx.hideLoading();
                }
            }
        });
    },
    checkboxChange: function(t) {
        var e = t.detail.value;
        this.is_share = e[0] || 0, console.log(this.is_share);
    },
    formSubmit: function(t) {
        var e = t.detail.value.content;
        if (e) {
            var a = this.data.quanInfo.group_id, o = this.data.gid, i = this.orign_image, s = this.is_share;
            app.util.request({
                url: "entry/wxapp/index",
                data: {
                    controller: "quan.post_group",
                    token: this.token,
                    group_id: a,
                    goods_id: o,
                    pics: i,
                    content: e,
                    is_share: s
                },
                method: "POST",
                success: function(t) {
                    console.log(t), 0 == t.data.code ? (wx.showToast({
                        title: "提交成功",
                        icon: "success",
                        duration: 2e3
                    }), setTimeout(function() {
                        wx.reLaunch({
                            url: "/Snailfish_shop/pages/dynamic/index"
                        });
                    }, 2e3)) : wx.showModal({
                        title: "提示",
                        content: "提交失败",
                        showCancel: !1,
                        confirmText: "确定"
                    });
                }
            });
        } else wx.showToast({
            title: "请输入内容",
            image: "../../../images/error.png",
            duration: 2e3
        });
    },
    chooseGoods: function() {
        this.getGoods(), this.setData({
            isGoods: !0
        });
    },
    closeGoods: function() {
        this.setData({
            isGoods: !1
        });
    },
    loadMore: function() {
        this.data.is_more && (this.getGoods(), console.log(111));
    },
    chooseGoodsItem: function(t) {
        var e = t.currentTarget.dataset.index, a = this.data.list, o = a[e];
        this.setData({
            isDisable: !1,
            isGoods: !1,
            goodsItem: a[e],
            gid: o.goods_id
        });
    },
    onUnload: function() {}
});