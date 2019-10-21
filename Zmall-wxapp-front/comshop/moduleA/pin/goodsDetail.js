var util = require("../../utils/util.js"), status = require("../../utils/index.js"), WxParse = require("../../wxParse/wxParse.js"), app = getApp(), detailClearTime = null;

function count_down(t, e) {
    var a = Math.floor(e / 1e3), o = a / 3600 / 24, s = Math.floor(o), i = a / 3600 - 24 * s, n = Math.floor(i), d = a / 60 - 1440 * s - 60 * n, r = Math.floor(d), c = a - 86400 * s - 3600 * n - 60 * r;
    if (t.setData({
        endtime: {
            days: fill_zero_prefix(s),
            hours: fill_zero_prefix(n),
            minutes: fill_zero_prefix(r),
            seconds: fill_zero_prefix(c),
            show_detail: 1
        }
    }), e <= 0) return clearTimeout(detailClearTime), detailClearTime = null, 0 == t.data.goods.over_type && t.authSuccess(), 
    void t.setData({
        endtime: {
            days: "00",
            hours: "00",
            minutes: "00",
            seconds: "00"
        }
    });
    detailClearTime = setTimeout(function() {
        count_down(t, e -= 1e3);
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
        relative_goods_list: [],
        needPosition: !1
    },
    $data: {
        id: "",
        scene: "",
        community_id: 0
    },
    imageUrl: "",
    goodsImg: "",
    currentOptions: [],
    onLoad: function(a) {
        var l = this;
        status.setNavBgColor(), status.setIcon().then(function(t) {
            l.setData({
                iconArr: t
            });
        });
        var o = wx.getStorageSync("token"), s = decodeURIComponent(a.scene);
        this.$data.id = a.id, this.$data.community_id = a.community_id, this.$data.scene = a.scene;
        var t = wx.getStorageSync("community"), g = t && t.communityId || "";
        if (wx.showLoading(), g) console.log("step3"), n(), d(t); else {
            var e = {};
            if ("undefined" !== a.community_id && 0 < a.community_id && (e.communityId = a.community_id), 
            "undefined" !== s) {
                var i = s.split("_");
                a.community_id = i[2], e.communityId = a.community_id;
            }
            util.getCommunityInfo(e).then(function(t) {
                console.log("step1"), n(), d(t);
            }).catch(function(t) {
                console.log("step4 新人"), "" != Object.keys(t) && l.addhistory(t, !0);
            });
        }
        function n() {
            if (console.log("step2"), "undefined" != a.community_id && 0 < a.community_id && e(a.community_id), 
            "undefined" != s) {
                var t = s.split("_");
                a.id = t[0], wx.setStorage({
                    key: "share_id",
                    data: t[1]
                }), e(t[2]);
            }
            function e(a) {
                app.util.request({
                    url: "entry/wxapp/index",
                    data: {
                        controller: "index.get_community_info",
                        community_id: a
                    },
                    dataType: "json",
                    success: function(t) {
                        if (0 == t.data.code) {
                            var e = t.data.data;
                            if (a != g) wx.showModal({
                                title: "温馨提示",
                                content: "是否切换为分享人所在小区“" + e.communityName,
                                confirmColor: "#4facfe",
                                success: function(t) {
                                    t.confirm ? (app.globalData.community = e, app.globalData.changedCommunity = !0, 
                                    wx.setStorage({
                                        key: "community",
                                        data: e
                                    }), o && l.addhistory(e), d(e), console.log("用户点击确定")) : t.cancel && (l.showNoBindCommunity(), 
                                    console.log("用户点击取消"));
                                }
                            }); else console.log("step5"), wx.getStorageSync("community") || (app.globalData.community = e, 
                            app.globalData.changedCommunity = !0, wx.setStorage({
                                key: "community",
                                data: e
                            }));
                        }
                    }
                });
            }
            l.setData({
                goods_id: a.id
            });
        }
        function d(t) {
            if (!a.id) return wx.hideLoading(), wx.showModal({
                title: "提示",
                content: "参数错误",
                showCancel: !1,
                confirmColor: "#4facfe",
                success: function(t) {
                    t.confirm && wx.redirectTo({
                        url: "/lionfish_comshop/pages/index/index"
                    });
                }
            }), !1;
            t && (g = t.communityId), app.util.request({
                url: "entry/wxapp/index",
                data: {
                    controller: "goods.get_goods_detail",
                    token: o,
                    id: a.id,
                    community_id: g
                },
                dataType: "json",
                success: function(t) {
                    wx.hideLoading();
                    var a = t.data.data.goods;
                    a && 0 != a.length && "" != Object.keys(a) || wx.showModal({
                        title: "提示",
                        content: "该商品不存在，回首页",
                        showCancel: !1,
                        confirmColor: "#4facfe",
                        success: function(t) {
                            t.confirm && wx.switchTab({
                                url: "/lionfish_comshop/pages/index/index"
                            });
                        }
                    });
                    var e = t.data.comment_list;
                    e.map(function(t) {
                        3 < 14 * t.content.length / app.globalData.systemInfo.windowWidth && (t.showOpen = !0), 
                        t.isOpen = !0;
                    });
                    var o = t.data.data.goods_image, s = [];
                    o.forEach(function(t) {
                        s.push(t.image);
                    });
                    var i = t.data.isopen_community_group_share || 0, n = t.data.group_share_info, d = t.data.data.relative_goods_list || [], r = [];
                    "[object Object]" == Object.prototype.toString.call(d) && 0 < Object.keys(d).length ? Object.keys(d).forEach(function(t) {
                        r.push(d[t]);
                    }) : r = d, l.currentOptions = t.data.data.options, l.setData({
                        order_comment_count: t.data.order_comment_count,
                        comment_list: e,
                        goods: a,
                        options: t.data.data.options,
                        order: {
                            goods_id: t.data.data.goods.goods_id,
                            pin_id: t.data.data.pin_id
                        },
                        share_title: a.share_title,
                        buy_record_arr: t.data.data.buy_record_arr,
                        goods_image: t.data.data.goods_image,
                        goods_image_length: t.data.data.goods_image.length,
                        service: a.tag,
                        showSkeleton: !1,
                        is_comunity_rest: t.data.is_comunity_rest,
                        prevImgArr: s,
                        open_man_orderbuy: t.data.open_man_orderbuy,
                        man_orderbuy_money: t.data.man_orderbuy_money,
                        goodsdetails_addcart_bg_color: t.data.goodsdetails_addcart_bg_color || "linear-gradient(270deg, #f9c706 0%, #feb600 100%)",
                        goodsdetails_buy_bg_color: t.data.goodsdetails_buy_bg_color || "linear-gradient(90deg, #ff5041 0%, #ff695c 100%)",
                        isopen_community_group_share: i,
                        group_share_info: n,
                        relative_goods_list: r,
                        needPosition: !!g
                    }, function() {
                        var t = a.goods_share_image;
                        if (t) console.log("draw分享图"), status.download(t + "?imageView2/1/w/500/h/400").then(function(t) {
                            l.goodsImg = t.tempFilePath, l.drawImgNoPrice();
                        }); else {
                            console.log("draw价格");
                            var e = a.image_thumb;
                            status.download(e + "?imageView2/1/w/500/h/400").then(function(t) {
                                l.goodsImg = t.tempFilePath, l.drawImg();
                            });
                        }
                    }), 1 == t.data.is_comunity_rest && wx.showModal({
                        title: "温馨提示",
                        content: "团长休息中，欢迎下次光临!",
                        showCancel: !1,
                        confirmColor: "#4facfe",
                        confirmText: "好的",
                        success: function(t) {}
                    });
                    var c = 0;
                    0 < (c = 0 == a.over_type ? 1e3 * (a.begin_time - t.data.data.cur_time) : 1e3 * (a.end_time - t.data.data.cur_time)) && count_down(l, c);
                    var u = t.data.data.goods.description;
                    WxParse.wxParse("article", "html", u, l, 0, app.globalData.systemInfo);
                }
            });
        }
        "undefined" != a.share_id && 0 < a.share_id && wx.setStorage({
            key: "share_id",
            data: a.share_id
        }), this.get_instructions(), this.setData({
            canvasWidth: app.globalData.systemInfo.windowWidth,
            canvasHeight: .8 * app.globalData.systemInfo.windowWidth
        });
    },
    showNoBindCommunity: function() {
        wx.showModal({
            title: "提示",
            content: "您未绑定该小区，请切换后下单！",
            showCancel: !1,
            confirmColor: "#4facfe",
            success: function(t) {
                t.confirm && wx.redirectTo({
                    url: "/lionfish_comshop/pages/position/community"
                });
            }
        });
    },
    authSuccess: function() {
        var t = this.$data.id, e = this.$data.scene, a = "/lionfish_comshop/pages/goods/goodsDetail?id=" + t + "&community_id=" + this.$data.community_id + "&scene=" + e;
        app.globalData.navBackUrl = a;
        var o = wx.getStorageSync("community"), s = this.data.needPosition;
        o && (s = !1), s || wx.redirectTo({
            url: a
        });
    },
    authModal: function() {
        return !this.data.needAuth || (this.setData({
            showAuthModal: !this.data.showAuthModal
        }), !1);
    },
    addhistory: function(t) {
        var e = 1 < arguments.length && void 0 !== arguments[1] && arguments[1], a = t.communityId;
        console.log("addhistory");
        var o = wx.getStorageSync("token");
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "index.addhistory_community",
                community_id: a,
                token: o
            },
            dataType: "json",
            success: function(t) {
                e && (console.log("新人 社区"), app.util.request({
                    url: "entry/wxapp/index",
                    data: {
                        controller: "index.get_community_info",
                        community_id: a
                    },
                    dataType: "json",
                    success: function(t) {
                        if (0 == t.data.code) {
                            var e = t.data.data;
                            app.globalData.community = e, app.globalData.changedCommunity = !0, wx.setStorage({
                                key: "community",
                                data: e
                            });
                        }
                    }
                }));
            }
        });
    },
    imageLoad: function(t) {
        var e = util.imageUtil(t);
        this.setData({
            imageSize: e
        });
    },
    get_instructions: function() {
        var a = this;
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "goods.get_instructions"
            },
            dataType: "json",
            success: function(t) {
                if (0 == t.data.code) {
                    var e = t.data.data.value;
                    WxParse.wxParse("instructions", "html", e, a, 25), "" == e && a.setData({
                        noIns: !0
                    }), a.setData({
                        index_bottom_image: t.data.data.index_bottom_image,
                        goods_details_middle_image: t.data.data.goods_details_middle_image,
                        is_show_buy_record: t.data.data.is_show_buy_record,
                        order_notify_switch: t.data.data.order_notify_switch,
                        is_show_comment_list: t.data.data.is_show_comment_list,
                        goods_details_price_bg: t.data.data.goods_details_price_bg,
                        isShowContactBtn: t.data.data.index_service_switch || 0,
                        goods_industrial_switch: t.data.data.goods_industrial_switch || 0,
                        goods_industrial: t.data.data.goods_industrial || "",
                        is_show_ziti_time: t.data.data.is_show_ziti_time || 0
                    });
                }
            }
        });
    },
    scrollImagesChange: function(t) {
        this.videoContext.pause(), this.setData({
            fmShow: !0,
            goodsIndex: t.detail.current + 1
        });
    },
    onShow: function() {
        var e = this;
        util.check_login_new().then(function(t) {
            t ? (0, status.cartNum)("", !0).then(function(t) {
                0 == t.code && e.setData({
                    cartNum: t.data
                });
            }) : e.setData({
                needAuth: !0
            });
        }), this.setData({
            stopNotify: !1
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
    drawImgNoPrice: function() {
        var e = this;
        wx.createSelectorQuery().select(".canvas-img").boundingClientRect(function() {
            var t = wx.createCanvasContext("myCanvas");
            t.drawImage(e.goodsImg, 0, 0, status.getPx(375), status.getPx(300)), e.data.goods.video && t.drawImage("../../images/play.png", status.getPx(150), status.getPx(105), status.getPx(76), status.getPx(76)), 
            t.save(), t.restore(), t.draw(!1, e.checkCanvasNoPrice());
        }).exec();
    },
    checkCanvasNoPrice: function() {
        var e = this;
        setTimeout(function() {
            wx.canvasToTempFilePath({
                canvasId: "myCanvas",
                success: function(t) {
                    t.tempFilePath ? e.imageUrl = t.tempFilePath : e.drawImgNoPrice(), console.log("我画完了");
                },
                fail: function(t) {
                    e.drawImgNoPrice();
                }
            });
        }, 500);
    },
    drawImg: function() {
        var t = this.data.endtime, r = (0 < t.days ? t.days + "天" : "") + t.hours + ":" + t.minutes + ":" + t.seconds, c = this;
        wx.createSelectorQuery().select(".canvas-img").boundingClientRect(function() {
            var t = wx.createCanvasContext("myCanvas");
            t.font = "28px Arial";
            var e = t.measureText("￥").width + 2, a = t.measureText(c.data.goods.price_front + "." + c.data.goods.price_after).width;
            t.font = "17px Arial";
            var o = t.measureText("￥" + c.data.goods.productprice).width + 3, s = t.measureText("累计销售 " + c.data.goods.seller_count).width, i = t.measureText("· 剩余" + c.data.goods.total + " ").width + 10;
            t.font = "18px Arial";
            var n = t.measureText("距结束").width, d = t.measureText(r).width + 10;
            t.drawImage(c.goodsImg, 0, 0, status.getPx(375), status.getPx(300)), t.drawImage("../../images/shareBottomBg.png", status.getPx(0), status.getPx(225), status.getPx(375), status.getPx(75)), 
            c.data.goods.video && t.drawImage("../../images/play.png", status.getPx(149.5), status.getPx(74.5), status.getPx(76), status.getPx(76)), 
            t.save(), status.drawText(t, {
                color: "#ffffff",
                size: 28,
                textAlign: "left"
            }, "￥", status.getPx(6), status.getPx(267), status.getPx(e)), status.drawText(t, {
                color: "#ffffff",
                size: 28,
                textAlign: "left"
            }, c.data.goods.price_front + "." + c.data.goods.price_after, status.getPx(e), status.getPx(267), status.getPx(a)), 
            t.restore(), t.save(), t.restore(), t.save(), (0, status.drawText)(t, {
                color: "#ffffff",
                size: 15,
                textAlign: "left"
            }, "￥" + c.data.goods.productprice, (0, status.getPx)(e + a + 10), (0, status.getPx)(267), (0, 
            status.getPx)(o)), t.restore(), t.save(), (0, status.drawText)(t, {
                color: "#ffffff",
                size: 17,
                textAlign: "left"
            }, "累计销售" + c.data.goods.seller_count, (0, status.getPx)(10), (0, status.getPx)(290), (0, 
            status.getPx)(s)), t.restore(), t.save(), (0, status.drawText)(t, {
                color: "#ffffff",
                size: 17,
                textAlign: "left"
            }, "· 剩余" + c.data.goods.total, (0, status.getPx)(s + 10), (0, status.getPx)(290), (0, 
            status.getPx)(i)), t.restore(), t.save(), t.beginPath(), t.setStrokeStyle("white"), 
            t.moveTo((0, status.getPx)(e + a + 10), (0, status.getPx)(261)), t.lineTo((0, status.getPx)(e + a + o + 15), (0, 
            status.getPx)(261)), t.stroke(), t.restore(), t.save(), (0, status.drawText)(t, {
                color: "#F8E71C",
                size: 18,
                textAlign: "center"
            }, "距结束", (0, status.getPx)(318), (0, status.getPx)(260), (0, status.getPx)(n)), 
            t.restore(), t.save(), (0, status.drawText)(t, {
                color: "#F8E71C",
                size: 18,
                textAlign: "center"
            }, r, (0, status.getPx)(315), (0, status.getPx)(288), (0, status.getPx)(d)), t.restore(), 
            t.draw(!1, c.checkCanvas());
        }).exec();
    },
    checkCanvas: function() {
        var e = this;
        setTimeout(function() {
            wx.canvasToTempFilePath({
                canvasId: "myCanvas",
                success: function(t) {
                    t.tempFilePath ? e.imageUrl = t.tempFilePath : e.drawImg(), console.log("我画完了");
                },
                fail: function(t) {
                    e.drawImg();
                }
            });
        }, 500);
    },
    previewImg: function(t) {
        var e = t.currentTarget.dataset.idx || 0, a = this.data.prevImgArr;
        wx.previewImage({
            current: a[e],
            urls: a
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
    onShareAppMessage: function() {}
});