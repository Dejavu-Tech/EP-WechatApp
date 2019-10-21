var util = require("../../utils/util.js"), app = getApp(), status = require("../../utils/index.js");

Page({
    data: {
        image_thumb: "",
        image_o_full: "",
        orign_image: "",
        shopname: "",
        name: "",
        mobile: "",
        product: "",
        state: null
    },
    onLoad: function(t) {
        status.setNavBgColor(), this.getData();
    },
    authSuccess: function() {
        var t = this;
        this.setData({
            needAuth: !1
        }, function() {
            t.getData();
        });
    },
    authModal: function() {
        return !this.data.needAuth || (this.setData({
            showAuthModal: !this.data.showAuthModal
        }), !1);
    },
    onShow: function() {
        var a = this;
        util.check_login_new().then(function(t) {
            t ? a.setData({
                needAuth: !1
            }) : a.setData({
                needAuth: !0
            });
        });
    },
    getData: function() {
        wx.showLoading();
        var t = wx.getStorageSync("token"), e = this;
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "supply.apply_info",
                token: t
            },
            dataType: "json",
            method: "POST",
            success: function(t) {
                wx.hideLoading();
                var a = t.data.code;
                0 == a ? e.setData({
                    state: t.data.data.state || 0
                }) : 1 == a && console.log("needAuth");
            }
        });
    },
    inputShopName: function(t) {
        this.setData({
            shopname: t.detail.value
        });
    },
    inputName: function(t) {
        this.setData({
            name: t.detail.value
        });
    },
    inputMobile: function(t) {
        this.setData({
            mobile: t.detail.value
        });
    },
    inputAdvantage: function(t) {
        this.setData({
            product: t.detail.value
        });
    },
    addImg: function() {
        var i = this;
        wx.chooseImage({
            count: 1,
            success: function(t) {
                var a = t.tempFilePaths;
                i.data.thumb_img;
                wx.showLoading({
                    title: "上传中"
                }), wx.uploadFile({
                    url: app.util.url("entry/wxapp/index", {
                        m: "lionfish_comshop",
                        controller: "goods.doPageUpload"
                    }),
                    filePath: a[0],
                    name: "upfile",
                    formData: {
                        name: a[0]
                    },
                    header: {
                        "content-type": "multipart/form-data"
                    },
                    success: function(t) {
                        wx.hideLoading();
                        var a = JSON.parse(t.data), e = a.image_thumb, o = a.image_o_full, n = a.image_o;
                        i.setData({
                            image_thumb: e,
                            image_o_full: o,
                            orign_image: n
                        });
                    }
                });
            }
        });
    },
    submit: function() {
        if (this.authModal()) {
            var t = wx.getStorageSync("token"), a = this.data.shopname, e = this.data.mobile, o = this.data.name, n = this.data.product;
            if ("" == a) return wx.showToast({
                title: "请填供应商名称",
                icon: "none"
            }), !1;
            if ("" == o) return wx.showToast({
                title: "请填写供应商联系人",
                icon: "none"
            }), !1;
            if ("" == e || !/^1(3|4|5|6|7|8|9)\d{9}$/.test(e)) return wx.showToast({
                title: "手机号码有误",
                icon: "none"
            }), !1;
            var i = {
                shopname: a,
                name: o,
                mobile: e,
                product: n,
                controller: "user.supply_apply",
                token: t
            };
            app.util.request({
                url: "entry/wxapp/user",
                data: i,
                method: "post",
                dataType: "json",
                success: function(t) {
                    0 == t.data.code ? wx.showToast({
                        title: "提交成功，等待审核",
                        icon: "none",
                        duration: 2e3,
                        success: function() {
                            setTimeout(function() {
                                wx.switchTab({
                                    url: "/lionfish_comshop/pages/user/me"
                                });
                            }, 2e3);
                        }
                    }) : wx.showModal({
                        title: "提示",
                        content: t.data.msg,
                        showCancel: !1
                    });
                }
            });
        }
    }
});