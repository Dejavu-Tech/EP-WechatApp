var util = require("../../utils/util.js"), status = require("../../utils/index.js"), WxParse = require("../../wxParse/wxParse.js"), app = getApp(), detailClearTime = null;

function count_down(t, a) {
    var e = Math.floor(a / 1e3), o = e / 3600 / 24, s = Math.floor(o), i = e / 3600 - 24 * s, n = Math.floor(i), d = e / 60 - 1440 * s - 60 * n, r = Math.floor(d), c = e - 86400 * s - 3600 * n - 60 * r;
    if (t.setData({
        endtime: {
            days: fill_zero_prefix(s),
            hours: fill_zero_prefix(n),
            minutes: fill_zero_prefix(r),
            seconds: fill_zero_prefix(c),
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
        stickyFlag: !1,
        showSkeleton: !0,
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
        stickyFlag: !1,
        id: "",
        scene: "",
        community_id: 0
    },
    imageUrl: "",
    goodsImg: "",
    currentOptions: [],
    onLoad: function(e) {
        var l = this;
        status.setNavBgColor(), status.setIcon().then(function(t) {
            l.setData({
                iconArr: t
            });
        });
        var o = wx.getStorageSync("token"), s = decodeURIComponent(e.scene);
        this.$data.id = e.id, this.$data.community_id = e.community_id, this.$data.scene = e.scene;
        var t = wx.getStorageSync("community"), g = t && t.communityId || "";
        if (wx.showLoading(), g) console.log("step3"), n(), d(t); else {
            var a = {};
            if ("undefined" !== e.community_id && 0 < e.community_id && (a.communityId = e.community_id), 
            "undefined" !== s) {
                var i = s.split("_");
                e.community_id = i[2], a.communityId = e.community_id;
            }
            util.getCommunityInfo(a).then(function(t) {
                console.log("step1"), n(), d(t);
            }).catch(function(t) {
                console.log("step4 新人"), "" != Object.keys(t) && l.addhistory(t, !0);
            });
        }
        function n() {
            if (console.log("step2"), "undefined" != e.community_id && 0 < e.community_id && a(e.community_id), 
            "undefined" != s) {
                var t = s.split("_");
                e.id = t[0], wx.setStorage({
                    key: "share_id",
                    data: t[1]
                }), a(t[2]);
            }
            function a(e) {
                app.util.request({
                    url: "entry/wxapp/index",
                    data: {
                        controller: "index.get_community_info",
                        community_id: e
                    },
                    dataType: "json",
                    success: function(t) {
                        if (0 == t.data.code) {
                            var a = t.data.data;
                            if (e != g) wx.showModal({
                                title: "温馨提示",
                                content: "是否切换为分享人所在小区“" + a.communityName,
                                confirmColor: "#4facfe",
                                success: function(t) {
                                    t.confirm ? (app.globalData.community = a, app.globalData.changedCommunity = !0, 
                                    wx.setStorage({
                                        key: "community",
                                        data: a
                                    }), o && l.addhistory(a), d(a), console.log("用户点击确定")) : t.cancel && (l.showNoBindCommunity(), 
                                    console.log("用户点击取消"));
                                }
                            }); else console.log("step5"), wx.getStorageSync("community") || (app.globalData.community = a, 
                            app.globalData.changedCommunity = !0, wx.setStorage({
                                key: "community",
                                data: a
                            }));
                        }
                    }
                });
            }
            l.setData({
                goods_id: e.id
            });
        }
        function d(t) {
            if (!e.id) return wx.hideLoading(), wx.showModal({
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
                    id: e.id,
                    community_id: g
                },
                dataType: "json",
                success: function(t) {
                    wx.hideLoading();
                    var e = t.data.data.goods;
                    e && 0 != e.length && "" != Object.keys(e) || wx.showModal({
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
                    var a = t.data.comment_list;
                    a.map(function(t) {
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
                        prevImgArr: s,
                        open_man_orderbuy: t.data.open_man_orderbuy,
                        man_orderbuy_money: t.data.man_orderbuy_money,
                        goodsdetails_addcart_bg_color: t.data.goodsdetails_addcart_bg_color || "linear-gradient(270deg, #f9c706 0%, #feb600 100%)",
                        goodsdetails_buy_bg_color: t.data.goodsdetails_buy_bg_color || "linear-gradient(90deg, #ff5041 0%, #ff695c 100%)",
                        isopen_community_group_share: i,
                        group_share_info: n,
                        relative_goods_list: r,
                        needPosition: !!g,
                        is_close_details_time: t.data.is_close_details_time || 0
                    }, function() {
                        var t = e.goods_share_image;
                        if (t) console.log("draw分享图"), status.download(t + "?imageView2/1/w/500/h/400").then(function(t) {
                            l.goodsImg = t.tempFilePath, l.drawImgNoPrice();
                        }); else {
                            console.log("draw价格");
                            var a = e.image_thumb;
                            status.download(a + "?imageView2/1/w/500/h/400").then(function(t) {
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
                    0 < (c = 0 == e.over_type ? 1e3 * (e.begin_time - t.data.data.cur_time) : 1e3 * (e.end_time - t.data.data.cur_time)) && count_down(l, c);
                    var u = t.data.data.goods.description;
                    WxParse.wxParse("article", "html", u, l, 0, app.globalData.systemInfo);
                }
            });
        }
        "undefined" != e.share_id && 0 < e.share_id && wx.setStorage({
            key: "share_id",
            data: e.share_id
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
        var t = this.$data.id, a = this.$data.scene, e = "/lionfish_comshop/pages/goods/goodsDetail?id=" + t + "&community_id=" + this.$data.community_id + "&scene=" + a;
        app.globalData.navBackUrl = e;
        var o = wx.getStorageSync("community"), s = this.data.needPosition;
        o && (s = !1), s || wx.redirectTo({
            url: e
        });
    },
    authModal: function() {
        return !this.data.needAuth || (this.setData({
            showAuthModal: !this.data.showAuthModal
        }), !1);
    },
    addhistory: function(t) {
        var a = 1 < arguments.length && void 0 !== arguments[1] && arguments[1], e = t.communityId;
        console.log("addhistory");
        var o = wx.getStorageSync("token");
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "index.addhistory_community",
                community_id: e,
                token: o
            },
            dataType: "json",
            success: function(t) {
                a && (console.log("新人 社区"), app.util.request({
                    url: "entry/wxapp/index",
                    data: {
                        controller: "index.get_community_info",
                        community_id: e
                    },
                    dataType: "json",
                    success: function(t) {
                        if (0 == t.data.code) {
                            var a = t.data.data;
                            app.globalData.community = a, app.globalData.changedCommunity = !0, wx.setStorage({
                                key: "community",
                                data: a
                            });
                        }
                    }
                }));
            }
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
                        is_show_ziti_time: t.data.data.is_show_ziti_time || 0
                    });
                }
            }
        });
    },
    onPageScroll: function(t) {
        !this.data.stickyFlag && 200 < t.scrollTop && (this.$data.stickyFlag = !0, this.setData({
            stickyFlag: !0
        })), this.$data.stickyFlag && t.scrollTop <= 200 && (this.$data.stickyFlag = !1, 
        this.setData({
            stickyFlag: !1
        }));
    },
    returnTop: function() {
        this.stickyFlag = !1, this.setData({
            stickyFlag: !1
        }), wx.pageScrollTo({
            scrollTop: 0,
            duration: 500
        });
    },
    addToCart: function(t) {
        if (this.authModal()) {
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
            }), this.setData({
                is_just_addcar: 1
            }), this.openSku();
        }
    },
    openSku: function() {
        var t = 0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : null;
        if (this.authModal()) {
            var a = this, e = this.data.is_just_addcar;
            if (t) {
                var o = t.detail, s = o.actId, i = o.skuList;
                e = 1;
            } else s = this.data.goods_id, i = this.currentOptions;
            a.setData({
                addCar_goodsid: s
            }), console.log(i);
            var n = i.list || [], d = [];
            if (0 < n.length) {
                for (var r = 0; r < n.length; r++) {
                    var c = n[r].option_value[0], u = {
                        name: c.name,
                        id: c.option_value_id,
                        index: r,
                        idx: 0
                    };
                    d.push(u);
                }
                for (var l = "", g = 0; g < d.length; g++) g == d.length - 1 ? l += d[g].id : l = l + d[g].id + "_";
                var m = i.sku_mu_list[l];
                a.setData({
                    sku: d,
                    sku_val: 1,
                    cur_sku_arr: m,
                    skuList: i,
                    visible: !0,
                    showSku: !0,
                    is_just_addcar: e
                });
            } else if (t) {
                var _ = o.allData;
                a.setData({
                    sku: [],
                    sku_val: 1,
                    skuList: [],
                    cur_sku_arr: _,
                    is_just_addcar: e
                });
                var h = {
                    detail: {
                        formId: ""
                    }
                };
                h.detail.formId = "the formId is a mock one", a.gocarfrom(h);
            } else {
                var f = this.data.goods, p = {
                    canBuyNum: f.total,
                    spuName: f.goodsname,
                    actPrice: f.actPrice,
                    marketPrice: f.marketPrice,
                    stock: f.total,
                    skuImage: f.image_thumb
                };
                a.setData({
                    sku: [],
                    sku_val: 1,
                    cur_sku_arr: p,
                    skuList: [],
                    visible: !0,
                    showSku: !0
                });
            }
        }
    },
    gocarfrom: function(t) {
        this.data.is_just_addcar;
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
        var s = this;
        if (s.data.can_car && (s.data.can_car = !1), 1 == this.data.open_man_orderbuy && 0 == this.data.is_just_addcar) {
            var t = 1 * this.data.man_orderbuy_money, a = this.data.sku_val, e = this.data.cur_sku_arr, o = e.actPrice[0] + "." + e.actPrice[1];
            if (console.log(1 * o * a), 1 * o * a < t) return wx.showToast({
                title: "满" + t + "元可下单！",
                icon: "none"
            }), !1;
        }
        var i = wx.getStorageSync("token"), n = wx.getStorageSync("community"), d = s.data.addCar_goodsid, r = n.communityId, c = s.data.sku_val, u = s.data.cur_sku_arr, l = "", g = s.data.is_just_addcar;
        u && u.option_item_ids && (l = u.option_item_ids), app.util.request({
            url: "entry/wxapp/user",
            data: {
                controller: "car.add",
                token: i,
                goods_id: d,
                community_id: r,
                quantity: c,
                sku_str: l,
                buy_type: "dan",
                pin_id: 0,
                is_just_addcar: g
            },
            dataType: "json",
            method: "POST",
            success: function(t) {
                if (3 == t.data.code) wx.showToast({
                    title: t.data.msg,
                    icon: "none",
                    duration: 2e3
                }); else if (4 == t.data.code) wx.hideLoading(), s.setData({
                    needAuth: !0,
                    showAuthModal: !0,
                    visible: !1
                }); else if (6 == t.data.code) {
                    var a = t.data.msg, e = t.data.max_quantity || "";
                    0 < e && s.setData({
                        sku_val: e
                    }), wx.showToast({
                        title: a,
                        icon: "none",
                        duration: 2e3
                    });
                } else if (1 == g) s.closeSku(), wx.showToast({
                    title: "已加入购物车",
                    image: "../../images/addShopCart.png"
                }), app.globalData.cartNum = t.data.total, s.setData({
                    cartNum: t.data.total
                }), status.indexListCarCount(d); else {
                    var o = t.data.is_limit_distance_buy;
                    3 < getCurrentPages().length ? wx.redirectTo({
                        url: "/lionfish_comshop/pages/order/placeOrder?type=dan&is_limit=" + o
                    }) : wx.navigateTo({
                        url: "/lionfish_comshop/pages/order/placeOrder?type=dan&is_limit=" + o
                    });
                }
            }
        });
    },
    selectSku: function(t) {
        var a = t.currentTarget.dataset.type.split("_"), e = this.data.sku, o = {
            name: a[3],
            id: a[2],
            index: a[0],
            idx: a[1]
        };
        e.splice(a[0], 1, o), this.setData({
            sku: e
        });
        for (var s = "", i = 0; i < e.length; i++) i == e.length - 1 ? s += e[i].id : s = s + e[i].id + "_";
        var n = this.data.skuList.sku_mu_list[s];
        this.setData({
            cur_sku_arr: n
        }), console.log(s);
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
        this.authModal() && (this.setData({
            is_just_addcar: 0
        }), this.openSku());
    },
    setNum: function(t) {
        var a = t.currentTarget.dataset.type, e = 1, o = 1 * this.data.sku_val;
        "add" == a ? e = o + 1 : "decrease" == a && 1 < o && (e = o - 1);
        var s = this.data.sku, i = this.data.skuList;
        if (0 < s.length) for (var n = "", d = 0; d < s.length; d++) d == s.length - 1 ? n += s[d].id : n = n + s[d].id + "_";
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
            is_share_html: !1
        });
    },
    hide_share_handler: function() {
        this.setData({
            is_share_html: !0
        });
    },
    share_quan: function() {
        wx.showLoading({
            title: "获取中"
        });
        var t = wx.getStorageSync("token"), a = wx.getStorageSync("community"), e = this.data.order.goods_id, o = a.communityId, s = this;
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "goods.get_user_goods_qrcode",
                token: t,
                community_id: o,
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
                                    }), s.setData({
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
            var t = wx.getStorageSync("token"), a = wx.getStorageSync("community"), e = this.data.goods_id, o = a.communityId;
            app.util.request({
                url: "entry/wxapp/index",
                data: {
                    controller: "goods.get_user_goods_qrcode",
                    token: t,
                    community_id: o,
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
            t.drawImage(a.goodsImg, 0, 0, status.getPx(375), status.getPx(300)), a.data.goods.video && t.drawImage("../../images/play.png", status.getPx(150), status.getPx(105), status.getPx(76), status.getPx(76)), 
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
        var t = this.data.endtime, r = (0 < t.days ? t.days + "天" : "") + t.hours + ":" + t.minutes + ":" + t.seconds, c = this;
        wx.createSelectorQuery().select(".canvas-img").boundingClientRect(function() {
            var t = wx.createCanvasContext("myCanvas");
            t.font = "28px Arial";
            var a = t.measureText("￥").width + 2, e = t.measureText(c.data.goods.price_front + "." + c.data.goods.price_after).width;
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
            t.moveTo((0, status.getPx)(a + e + 10), (0, status.getPx)(261)), t.lineTo((0, status.getPx)(a + e + o + 15), (0, 
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
    showGroupCode: function() {
        var t = this.data.group_share_info.share_wxcode || "";
        t && wx.previewImage({
            current: t,
            urls: [ t ]
        });
    },
    onShareAppMessage: function() {
        var t = wx.getStorageSync("community"), a = (this.data.goods_id, t.communityId), e = this.data.share_title, o = wx.getStorageSync("member_id"), s = "lionfish_comshop/pages/goods/goodsDetail?id=" + this.data.goods_id + "&share_id=" + o + "&community_id=" + a, i = this.data.goods.goods_share_image;
        console.log("商品分享地址："), console.log(s);
        return this.setData({
            is_share_html: !0,
            hideModal: !0
        }), {
            title: e,
            path: s,
            imageUrl: i || this.imageUrl,
            success: function(t) {},
            fail: function(t) {}
        };
    }
});