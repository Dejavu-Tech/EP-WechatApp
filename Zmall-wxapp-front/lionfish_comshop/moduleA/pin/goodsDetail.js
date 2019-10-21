var util = require("../../utils/util.js"), status = require("../../utils/index.js"), WxParse = require("../../wxParse/wxParse.js"), app = getApp(), detailClearTime = null;

function count_down(t, a) {
    var e = Math.floor(a / 1e3), s = e / 3600 / 24, o = Math.floor(s), i = e / 3600 - 24 * o, n = Math.floor(i), d = e / 60 - 1440 * o - 60 * n, r = Math.floor(d), u = e - 86400 * o - 3600 * n - 60 * r;
    if (t.setData({
        endtime: {
            days: fill_zero_prefix(o),
            hours: fill_zero_prefix(n),
            minutes: fill_zero_prefix(r),
            seconds: fill_zero_prefix(u),
            show_detail: 1
        }
    }), a <= 0) return clearTimeout(detailClearTime), detailClearTime = null, 0 == t.data.goods.over_type && t.authSuccess(), 
    void t.setData({
        endtime: {
            days: "00",
            hours: "00",
            minutes: "00",
            seconds: "00"
        }
    });
    detailClearTime = setTimeout(function() {
        count_down(t, a -= 1e3);
    }, 1e3);
}

function fill_zero_prefix(t) {
    return t < 10 ? "0" + t : t;
}

Page({
    data: {
        needAuth: !1,
        goodsIndex: 1,
        goods_id: 0,
        endtime: {
            days: "00",
            hours: "00",
            minutes: "00",
            seconds: "00"
        },
        is_share_html: !0,
        imageSize: {
            imageWidth: "100%",
            imageHeight: 600
        },
        cartNum: 0,
        noIns: !1,
        index_bottom_image: "",
        hideModal: !0,
        shareImgUrl: "",
        goods_details_middle_image: "",
        is_show_buy_record: 0,
        stopNotify: !0,
        iconArr: {
            home: "",
            car: ""
        },
        canvasWidth: 375,
        canvasHeight: 300,
        fmShow: !0,
        pinListCount: 0,
        pinList: []
    },
    $data: {
        id: "",
        scene: ""
    },
    imageUrl: "",
    goodsImg: "",
    currentOptions: [],
    buy_type: "pindan",
    onLoad: function(t) {
        app.globalData.navBackUrl = "";
        var a = this;
        status.setNavBgColor(), status.setIcon().then(function(t) {
            a.setData({
                iconArr: t
            });
        });
        wx.getStorageSync("token");
        var e = decodeURIComponent(t.scene);
        if (this.$data.id = t.id, this.$data.scene = t.scene, wx.showLoading(), "undefined" != t.share_id && 0 < t.share_id && wx.setStorage({
            key: "share_id",
            data: t.share_id
        }), "undefined" != e) {
            var s = e.split("_");
            t.id = s[0], wx.setStorage({
                key: "share_id",
                data: s[1]
            });
        }
        this.get_goods_details(t.id), this.get_instructions(), this.setData({
            canvasWidth: app.globalData.systemInfo.windowWidth,
            canvasHeight: .8 * app.globalData.systemInfo.windowWidth,
            goods_id: t.id
        });
    },
    get_goods_details: function(t) {
        var r = this;
        if (!t) return wx.hideLoading(), wx.showModal({
            title: "提示",
            content: "参数错误",
            showCancel: !1,
            confirmColor: "#F75451",
            success: function(t) {
                t.confirm && wx.redirectTo({
                    url: "/lionfish_comshop/pages/index/index"
                });
            }
        }), !1;
        this.getFujinTuan(t);
        var a = wx.getStorageSync("token");
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "groupdo.get_goods_detail",
                token: a,
                id: t,
                community_id: 0
            },
            dataType: "json",
            success: function(t) {
                wx.hideLoading();
                var e = t.data.data.goods;
                e && 0 != e.length && "" != Object.keys(e) || wx.showModal({
                    title: "提示",
                    content: "该商品不存在，回首页",
                    showCancel: !1,
                    confirmColor: "#F75451",
                    success: function(t) {
                        t.confirm && wx.switchTab({
                            url: "/lionfish_comshop/pages/index/index"
                        });
                    }
                });
                var a = t.data.comment_list;
                a.map(function(t) {
                    3 < 14 * t.content.length / app.globalData.systemInfo.windowWidth && (t.showOpen = !0), 
                    t.isOpen = !0;
                });
                var s = t.data.data.goods_image, o = [];
                s.forEach(function(t) {
                    o.push(t.image);
                }), r.currentOptions = t.data.data.options;
                var i = t.data.data.pin_info || {};
                r.setData({
                    order_comment_count: t.data.order_comment_count,
                    comment_list: a,
                    goods: e,
                    options: t.data.data.options,
                    order: {
                        goods_id: t.data.data.goods.goods_id,
                        pin_id: t.data.data.pin_id
                    },
                    share_title: e.share_title,
                    buy_record_arr: t.data.data.buy_record_arr,
                    goods_image: t.data.data.goods_image,
                    goods_image_length: t.data.data.goods_image.length,
                    service: e.tag,
                    showSkeleton: !1,
                    is_comunity_rest: t.data.is_comunity_rest,
                    prevImgArr: o,
                    open_man_orderbuy: t.data.open_man_orderbuy,
                    man_orderbuy_money: t.data.man_orderbuy_money,
                    goodsdetails_addcart_bg_color: t.data.goodsdetails_addcart_bg_color || "linear-gradient(270deg, #f9c706 0%, #feb600 100%)",
                    goodsdetails_buy_bg_color: t.data.goodsdetails_buy_bg_color || "linear-gradient(90deg, #ff5041 0%, #ff695c 100%)",
                    pin_info: i
                }, function() {
                    var t = e.goods_share_image;
                    if (t) console.log("draw分享图"), status.download(t + "?imageView2/1/w/500/h/400").then(function(t) {
                        r.goodsImg = t.tempFilePath, r.drawImgNoPrice();
                    }); else {
                        console.log("draw价格");
                        var a = e.image_thumb;
                        status.download(a + "?imageView2/1/w/500/h/400").then(function(t) {
                            r.goodsImg = t.tempFilePath, r.drawImg();
                        });
                    }
                });
                var n = 0;
                0 < (n = 0 == e.over_type ? 1e3 * (e.begin_time - t.data.data.cur_time) : 1e3 * (e.end_time - t.data.data.cur_time)) && count_down(r, n);
                var d = t.data.data.goods.description;
                WxParse.wxParse("article", "html", d, r, 0, app.globalData.systemInfo);
            }
        });
    },
    authSuccess: function() {
        var t = "/lionfish_comshop/moduleA/pin/goodsDetail?id=" + this.$data.id + "&scene=" + this.$data.scene;
        app.globalData.navBackUrl = t, wx.redirectTo({
            url: t
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
            t ? (0, status.cartNum)("", !0).then(function(t) {
                0 == t.code && a.setData({
                    cartNum: t.data
                });
            }) : a.setData({
                needAuth: !0
            });
        }), this.setData({
            stopNotify: !1
        });
    },
    imageLoad: function(t) {
        var a = util.imageUtil(t);
        this.setData({
            imageSize: a
        });
    },
    get_instructions: function() {
        var e = this;
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "goods.get_instructions"
            },
            dataType: "json",
            success: function(t) {
                if (0 == t.data.code) {
                    var a = t.data.data.value;
                    WxParse.wxParse("instructions", "html", a, e, 25), "" == a && e.setData({
                        noIns: !0
                    }), e.setData({
                        index_bottom_image: t.data.data.index_bottom_image,
                        goods_details_middle_image: t.data.data.goods_details_middle_image,
                        is_show_buy_record: t.data.data.is_show_buy_record,
                        order_notify_switch: t.data.data.order_notify_switch,
                        is_show_comment_list: t.data.data.is_show_comment_list,
                        goods_details_price_bg: t.data.data.goods_details_price_bg,
                        isShowContactBtn: t.data.data.index_service_switch || 0,
                        goods_industrial_switch: t.data.data.goods_industrial_switch || 0,
                        goods_industrial: t.data.data.goods_industrial || "",
                        is_show_ziti_time: t.data.data.is_show_ziti_time || 0,
                        hide_community_change_btn: t.data.data.hide_community_change_btn || 0,
                        is_show_goodsdetails_communityinfo: t.data.data.is_show_goodsdetails_communityinfo || 0
                    });
                }
            }
        });
    },
    getFujinTuan: function(t) {
        var i = this;
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "groupdo.get_goods_fujin_tuan",
                goods_id: t,
                limit: 4
            },
            dataType: "json",
            success: function(t) {
                if (0 == t.data.code) {
                    var a = t.data, e = a.list, s = a.count;
                    if (e.length) {
                        var o = Date.parse(new Date());
                        e.forEach(function(t, a) {
                            e[a].seconds = 1e3 * (t.end_time - t.cur_interface_time) + o, console.log(t.end_time - t.cur_interface_time);
                        });
                    }
                    i.setData({
                        pinList: e || [],
                        pinListCount: s || 0
                    });
                }
            }
        });
    },
    openSku: function(t) {
        if (this.authModal()) {
            var a = this.data.goods_id, e = this.currentOptions;
            this.setData({
                addCar_goodsid: a
            });
            var s = e.list || [], o = [];
            if (0 < s.length) {
                for (var i = 0; i < s.length; i++) {
                    var n = s[i].option_value[0], d = {
                        name: n.name,
                        id: n.option_value_id,
                        index: i,
                        idx: 0
                    };
                    o.push(d);
                }
                for (var r = "", u = 0; u < o.length; u++) u == o.length - 1 ? r += o[u].id : r = r + o[u].id + "_";
                var c = e.sku_mu_list[r];
                this.setData({
                    sku: o,
                    sku_val: 1,
                    cur_sku_arr: c,
                    skuList: e,
                    visible: !0,
                    showSku: !0,
                    is_just_addcar: 0
                });
            } else {
                var l = this.data.goods, g = this.data.pin_info.danprice || 0, _ = {
                    canBuyNum: l.total,
                    spuName: l.goodsname,
                    marketPrice: l.marketPrice,
                    stock: l.total,
                    skuImage: l.image_thumb,
                    pinprice: l.actPrice,
                    actPrice: g.split(".")
                };
                this.setData({
                    sku: [],
                    sku_val: 1,
                    cur_sku_arr: _,
                    skuList: [],
                    visible: !0,
                    showSku: !0
                });
            }
        }
    },
    gocarfrom: function(t) {
        wx.showLoading();
        var a = wx.getStorageSync("token");
        app.util.request({
            url: "entry/wxapp/user",
            data: {
                controller: "user.get_member_form_id",
                token: a,
                from_id: t.detail.formId
            },
            dataType: "json",
            success: function(t) {}
        }), this.goOrder();
    },
    closeSku: function() {
        this.setData({
            visible: 0,
            stopClick: !1
        });
    },
    goOrder: function() {
        var o = this;
        if (o.data.can_car && (o.data.can_car = !1), 1 == this.data.open_man_orderbuy) {
            var t = 1 * this.data.man_orderbuy_money, a = this.data.sku_val, e = this.data.cur_sku_arr, s = e.actPrice[0] + "." + e.actPrice[1];
            if (console.log(1 * s * a), 1 * s * a < t) return wx.showToast({
                title: "满" + t + "元可下单！",
                icon: "none"
            }), !1;
        }
        var i = wx.getStorageSync("token"), n = o.data.addCar_goodsid, d = o.data.sku_val, r = o.data.cur_sku_arr, u = "", c = this.buy_type;
        r && r.option_item_ids && (u = r.option_item_ids), app.util.request({
            url: "entry/wxapp/user",
            data: {
                controller: "car.add",
                token: i,
                goods_id: n,
                community_id: 0,
                quantity: d,
                sku_str: u,
                buy_type: c,
                pin_id: 0,
                is_just_addcar: 0
            },
            dataType: "json",
            method: "POST",
            success: function(t) {
                if (3 == t.data.code) wx.showToast({
                    title: t.data.msg,
                    icon: "none",
                    duration: 2e3
                }); else if (4 == t.data.code) wx.hideLoading(), o.setData({
                    needAuth: !0,
                    showAuthModal: !0,
                    visible: !1
                }); else if (6 == t.data.code) {
                    var a = t.data.msg, e = t.data.max_quantity || "";
                    0 < e && o.setData({
                        sku_val: e
                    }), wx.showToast({
                        title: a,
                        icon: "none",
                        duration: 2e3
                    });
                } else {
                    var s = t.data.is_limit_distance_buy;
                    3 < getCurrentPages().length ? wx.redirectTo({
                        url: "/lionfish_comshop/pages/order/placeOrder?type=" + c + "&is_limit=" + s
                    }) : wx.navigateTo({
                        url: "/lionfish_comshop/pages/order/placeOrder?type=" + c + "&is_limit=" + s
                    });
                }
            }
        });
    },
    selectSku: function(t) {
        var a = t.currentTarget.dataset.type.split("_"), e = this.data.sku, s = {
            name: a[3],
            id: a[2],
            index: a[0],
            idx: a[1]
        };
        e.splice(a[0], 1, s), this.setData({
            sku: e
        });
        for (var o = "", i = 0; i < e.length; i++) i == e.length - 1 ? o += e[i].id : o = o + e[i].id + "_";
        var n = this.data.skuList.sku_mu_list[o];
        this.setData({
            cur_sku_arr: n
        }), console.log(o);
    },
    submit: function(t) {
        var a = t.detail.formId, e = wx.getStorageSync("token");
        app.util.request({
            url: "entry/wxapp/user",
            data: {
                controller: "user.get_member_form_id",
                token: e,
                from_id: a
            },
            dataType: "json",
            success: function(t) {}
        });
    },
    balance: function(t) {
        var a = t.currentTarget.dataset.type;
        this.buy_type = a, this.setData({
            buy_type: a
        }), this.authModal() && this.openSku(a);
    },
    setNum: function(t) {
        var a = t.currentTarget.dataset.type, e = 1, s = 1 * this.data.sku_val;
        "add" == a ? e = s + 1 : "decrease" == a && 1 < s && (e = s - 1);
        var o = this.data.sku, i = this.data.skuList;
        if (0 < o.length) for (var n = "", d = 0; d < o.length; d++) d == o.length - 1 ? n += o[d].id : n = n + o[d].id + "_";
        0 < i.length ? e > i.sku_mu_list[n].canBuyNum && (e -= 1) : e > this.data.cur_sku_arr.canBuyNum && (e -= 1);
        this.setData({
            sku_val: e
        });
    },
    scrollImagesChange: function(t) {
        this.videoContext.pause(), this.setData({
            fmShow: !0,
            goodsIndex: t.detail.current + 1
        });
    },
    share_handler: function() {
        this.setData({
            is_share_html: !this.data.is_share_html
        });
    },
    share_quan: function() {
        wx.showLoading({
            title: "获取中"
        });
        var t = wx.getStorageSync("token"), a = wx.getStorageSync("community"), e = this.data.order.goods_id, s = a.communityId, o = this;
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "goods.get_user_goods_qrcode",
                token: t,
                community_id: s,
                goods_id: e
            },
            dataType: "json",
            success: function(t) {
                if (0 == t.data.code) {
                    setTimeout(function() {
                        wx.hideLoading();
                    }, 2e3);
                    var a = t.data.image_path;
                    wx.getImageInfo({
                        src: a,
                        success: function(t) {
                            var a = t.path;
                            wx.saveImageToPhotosAlbum({
                                filePath: a,
                                success: function(t) {
                                    wx.showToast({
                                        title: "图片保存成功，可以分享了",
                                        icon: "none",
                                        duration: 2e3
                                    }), o.setData({
                                        is_share_html: !0
                                    });
                                }
                            });
                        }
                    });
                }
            }
        });
    },
    onReady: function(t) {
        this.videoContext = wx.createVideoContext("myVideo");
    },
    onHide: function() {
        this.setData({
            stopNotify: !0
        }), console.log("详情页hide", this.data.stopNotify);
    },
    onUnload: function() {
        console.log("onUnload"), this.setData({
            stopNotify: !0
        }), console.log("详情页unload", this.data.stopNotify), detailClearTime = null, clearTimeout(detailClearTime);
    },
    get_share_img: function() {
        if (wx.showLoading(), "" != this.data.shareImgUrl) wx.hideLoading(), this.setData({
            hideModal: !1,
            is_share_html: !0
        }); else {
            var t = wx.getStorageSync("token"), a = wx.getStorageSync("community"), e = this.data.goods_id, s = a.communityId;
            app.util.request({
                url: "entry/wxapp/index",
                data: {
                    controller: "goods.get_user_goods_qrcode",
                    token: t,
                    community_id: s,
                    goods_id: e
                },
                dataType: "json",
                success: function(t) {
                    if (0 == t.data.code) {
                        wx.hideLoading();
                        var a = t.data.image_path;
                        wx.previewImage({
                            current: a,
                            urls: [ a ]
                        });
                    }
                }
            });
        }
    },
    closeShareModal: function() {
        this.setData({
            hideModal: !0
        });
    },
    bindOpen: function(t) {
        var a = t.currentTarget.dataset.idx;
        if (console.log(a), this.data.comment_list[a].isOpen) {
            this.data.comment_list[a].isOpen = !1;
            var e = this.data.comment_list;
            this.setData({
                comment_list: e
            });
        } else {
            this.data.comment_list[a].isOpen = !0;
            e = this.data.comment_list;
            this.setData({
                comment_list: e
            });
        }
    },
    saveThumb: function(t) {
        wx.showLoading();
        var e = this, a = this.data.shareImgUrl;
        wx.getImageInfo({
            src: a,
            success: function(t) {
                var a = t.path;
                a && wx.saveImageToPhotosAlbum({
                    filePath: a,
                    success: function(t) {
                        console.log(t), wx.hideLoading(), wx.showToast({
                            title: "已保存相册",
                            icon: "none",
                            duration: 2e3
                        }), e.setData({
                            hideModal: !0
                        });
                    },
                    fail: function(t) {
                        wx.hideLoading(), console.log(t), "saveImageToPhotosAlbum:fail:auth denied" === t.errMsg && wx.openSetting({
                            success: function(t) {
                                t.authSetting["scope.writePhotosAlbum"] ? console.log("获取权限成功，再次点击图片保存到相册") : console.log("获取权限失败");
                            }
                        });
                    }
                });
            }
        });
    },
    drawImgNoPrice: function() {
        var a = this;
        wx.createSelectorQuery().select(".canvas-img").boundingClientRect(function() {
            var t = wx.createCanvasContext("myCanvas");
            t.drawImage(a.goodsImg, 0, 0, status.getPx(375), status.getPx(300)), a.data.goods.video && t.drawImage("../../images/play.png", status.getPx(127.5), status.getPx(90), status.getPx(120), status.getPx(120)), 
            t.save(), t.restore(), t.draw(!1, a.checkCanvasNoPrice());
        }).exec();
    },
    checkCanvasNoPrice: function() {
        var a = this;
        setTimeout(function() {
            wx.canvasToTempFilePath({
                canvasId: "myCanvas",
                success: function(t) {
                    t.tempFilePath ? a.imageUrl = t.tempFilePath : a.drawImgNoPrice(), console.log("我画完了");
                },
                fail: function(t) {
                    a.drawImgNoPrice();
                }
            });
        }, 500);
    },
    drawImg: function() {
        var t = this.data.endtime, u = (0 < t.days ? t.days + "天" : "") + t.hours + ":" + t.minutes + ":" + t.seconds, c = this;
        wx.createSelectorQuery().select(".canvas-img").boundingClientRect(function() {
            var t = wx.createCanvasContext("myCanvas");
            t.font = "28px Arial";
            var a = t.measureText("￥").width + 2, e = t.measureText(c.data.goods.price_front + "." + c.data.goods.price_after).width;
            t.font = "17px Arial";
            var s = t.measureText("￥" + c.data.goods.productprice).width + 3, o = t.measureText("累计销售 " + c.data.goods.seller_count).width, i = t.measureText("· 剩余" + c.data.goods.total + " ").width + 10;
            t.font = "18px Arial";
            var n = 0 == c.data.goods.over_type ? "距开始" : "距结束", d = t.measureText(n).width, r = t.measureText(u).width + 10;
            t.drawImage(c.goodsImg, 0, 0, status.getPx(375), status.getPx(300)), t.drawImage("../../images/shareBottomBg.png", status.getPx(0), status.getPx(225), status.getPx(375), status.getPx(75)), 
            c.data.goods.video && t.drawImage("../../images/play.png", status.getPx(127.5), status.getPx(70), status.getPx(120), status.getPx(120)), 
            t.save(), status.drawText(t, {
                color: "#ffffff",
                size: 28,
                textAlign: "left"
            }, "￥", status.getPx(6), status.getPx(267), status.getPx(a)), status.drawText(t, {
                color: "#ffffff",
                size: 28,
                textAlign: "left"
            }, c.data.goods.price_front + "." + c.data.goods.price_after, status.getPx(a), status.getPx(267), status.getPx(e)), 
            t.restore(), t.save(), t.restore(), t.save(), (0, status.drawText)(t, {
                color: "#ffffff",
                size: 15,
                textAlign: "left"
            }, "￥" + c.data.goods.productprice, (0, status.getPx)(a + e + 10), (0, status.getPx)(267), (0, 
            status.getPx)(s)), t.restore(), t.save(), (0, status.drawText)(t, {
                color: "#ffffff",
                size: 17,
                textAlign: "left"
            }, "累计销售" + c.data.goods.seller_count, (0, status.getPx)(10), (0, status.getPx)(290), (0, 
            status.getPx)(o)), t.restore(), t.save(), (0, status.drawText)(t, {
                color: "#ffffff",
                size: 17,
                textAlign: "left"
            }, "· 剩余" + c.data.goods.total, (0, status.getPx)(o + 10), (0, status.getPx)(290), (0, 
            status.getPx)(i)), t.restore(), t.save(), t.beginPath(), t.setStrokeStyle("white"), 
            t.moveTo((0, status.getPx)(a + e + 10), (0, status.getPx)(261)), t.lineTo((0, status.getPx)(a + e + s + 15), (0, 
            status.getPx)(261)), t.stroke(), t.restore(), t.save(), (0, status.drawText)(t, {
                color: "#F8E71C",
                size: 18,
                textAlign: "center"
            }, n, (0, status.getPx)(318), (0, status.getPx)(260), (0, status.getPx)(d)), t.restore(), 
            t.save(), (0, status.drawText)(t, {
                color: "#F8E71C",
                size: 18,
                textAlign: "center"
            }, u, (0, status.getPx)(315), (0, status.getPx)(288), (0, status.getPx)(r)), t.restore(), 
            t.draw(!1, c.checkCanvas());
        }).exec();
    },
    checkCanvas: function() {
        var a = this;
        setTimeout(function() {
            wx.canvasToTempFilePath({
                canvasId: "myCanvas",
                success: function(t) {
                    t.tempFilePath ? a.imageUrl = t.tempFilePath : a.drawImg(), console.log("我画完了");
                },
                fail: function(t) {
                    a.drawImg();
                }
            });
        }, 500);
    },
    previewImg: function(t) {
        var a = t.currentTarget.dataset.idx || 0, e = this.data.prevImgArr;
        wx.previewImage({
            current: e[a],
            urls: e
        });
    },
    btnPlay: function() {
        this.setData({
            fmShow: !1
        }), this.videoContext.play();
    },
    videEnd: function() {
        this.setData({
            fmShow: !0
        });
    },
    endPlay: function() {
        this.videoContext.pause(), this.setData({
            fmShow: !0
        });
    },
    goLink: function(t) {
        var a = getCurrentPages(), e = t.currentTarget.dataset.link;
        3 < a.length ? wx.redirectTo({
            url: e
        }) : wx.navigateTo({
            url: e
        });
    },
    onShareAppMessage: function() {
        this.data.goods_id;
        var t = this.data.share_title, a = wx.getStorageSync("member_id"), e = "lionfish_comshop/moduleA/pin/goodsDetail?id=" + this.data.goods_id + "&share_id=" + a, s = this.data.goods.goods_share_image;
        console.log("商品分享地址："), console.log(e);
        return this.setData({
            is_share_html: !0,
            hideModal: !0
        }), {
            title: t,
            path: e,
            imageUrl: s || this.imageUrl,
            success: function(t) {},
            fail: function(t) {}
        };
    }
});