var util = require("../../utils/util.js"), app = getApp(), buyClearTime = null, status = require("../../utils/index.js");

function count_down(t, a) {
    var e = Math.floor(a / 1e3), o = e / 3600 / 24, i = Math.floor(o), s = e / 3600 - 24 * i, n = Math.floor(s), d = e / 60 - 1440 * i - 60 * n, r = Math.floor(d), c = e - 86400 * i - 3600 * n - 60 * r;
    if (t.setData({
        endtime: {
            days: fill_zero_prefix(i),
            hours: fill_zero_prefix(n),
            minutes: fill_zero_prefix(r),
            seconds: fill_zero_prefix(c),
            show_detail: 1
        }
    }), a <= 0) return clearTimeout(buyClearTime), void t.setData({
        endtime: {
            days: "00",
            hours: "00",
            minutes: "00",
            seconds: "00"
        }
    });
    buyClearTime = setTimeout(function() {
        count_down(t, a -= 1e3);
    }, 1e3);
}

function fill_zero_prefix(t) {
    return t < 10 ? "0" + t : t;
}

Page({
    data: {
        showData: 1,
        cartNum: 0,
        needAuth: !1,
        iconArr: {
            home: "",
            car: ""
        },
        list: [],
        loadMore: !0,
        tip: "加载中"
    },
    page: 1,
    hasRefeshin: !1,
    goodId: 0,
    community_id: 0,
    onLoad: function(o) {
        var i = this, s = wx.getStorageSync("token");
        status.setNavBgColor(), status.setIcon().then(function(t) {
            i.setData({
                iconArr: t
            });
        }), this.goodId = o.id, this.community_id = o.community_id;
        var t = wx.getStorageSync("community"), n = t && t.communityId || "";
        if (n) console.log("step3"), e(), d(); else {
            var a = {};
            void 0 !== o.community_id && 0 < o.community_id && (a.communityId = o.community_id), 
            util.getCommunityInfo(a).then(function(t) {
                console.log("step1"), e(), d(t);
            }).catch(function(t) {
                console.log("step4 新人"), "" != Object.keys(t) && i.addhistory(t, !0);
            });
        }
        function e() {
            console.log("step2"), "undefined" != o.community_id && 0 < o.community_id && app.util.request({
                url: "entry/wxapp/index",
                data: {
                    controller: "index.get_community_info",
                    community_id: o.community_id
                },
                dataType: "json",
                success: function(t) {
                    if (0 == t.data.code) {
                        var a = t.data.data, e = n;
                        o.community_id != e && wx.showModal({
                            title: "温馨提示",
                            content: "是否切换为分享人所在小区“" + a.communityName,
                            confirmColor: "#4facfe",
                            success: function(t) {
                                t.confirm ? (app.globalData.community = a, app.globalData.changedCommunity = !0, 
                                wx.setStorage({
                                    key: "community",
                                    data: a
                                }), s && i.addhistory(a), d(a), console.log("用户点击确定")) : t.cancel && (i.showNoBindCommunity(), 
                                console.log("用户点击取消"));
                            }
                        });
                    }
                }
            }), i.setData({
                goods_id: o.id
            }, function() {
                i.load_comment_list();
            });
        }
        function d(t) {
            t && (n = t.communityId), app.util.request({
                url: "entry/wxapp/index",
                data: {
                    controller: "goods.get_goods_detail",
                    token: s,
                    id: o.id,
                    community_id: n
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
                    }), i.setData({
                        order_comment_count: t.data.order_comment_count,
                        order_comment_images: t.data.order_comment_images,
                        comment_list: e,
                        loadover: !0,
                        goods: a,
                        buy_record_arr: t.data.data.buy_record_arr,
                        site_name: t.data.data.site_name,
                        share_title: a.share_title,
                        options: t.data.data.options,
                        goods_image: t.data.data.goods_image,
                        goods_image_length: t.data.data.goods_image.length,
                        service: a.tag,
                        favgoods: a.favgoods,
                        cur_time: t.data.data.cur_time,
                        order: {
                            goods_id: t.data.data.goods.goods_id,
                            pin_id: t.data.data.pin_id
                        },
                        showSkeleton: !1,
                        is_comunity_rest: t.data.is_comunity_rest,
                        goodsdetails_addcart_bg_color: t.data.goodsdetails_addcart_bg_color || "linear-gradient(270deg, #f9c706 0%, #feb600 100%)",
                        goodsdetails_buy_bg_color: t.data.goodsdetails_buy_bg_color || "linear-gradient(90deg, #ff5041 0%, #ff695c 100%)"
                    }), 1 == t.data.is_comunity_rest && wx.showModal({
                        title: "温馨提示",
                        content: "团长休息中，欢迎下次光临!",
                        showCancel: !1,
                        confirmColor: "#4facfe",
                        confirmText: "好的",
                        success: function(t) {}
                    });
                    var o = 0;
                    0 < (o = 0 == a.over_type ? 1e3 * (a.begin_time - t.data.data.cur_time) : 1e3 * (a.end_time - t.data.data.cur_time)) && count_down(i, o);
                }
            });
        }
        "undefined" != o.share_id && 0 < o.share_id && wx.setStorage({
            key: "share_id",
            data: o.share_id
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
    load_comment_list: function() {
        var t = this.data.goods_id, a = wx.getStorageSync("token"), o = this;
        !this.hasRefeshin && (o.hasRefeshin = !0, o.setData({
            loadMore: !0,
            tip: "加载中"
        }), app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "goods.comment_info",
                token: a,
                goods_id: t,
                page: o.page
            },
            dataType: "json",
            success: function(t) {
                if (0 == t.data.code) {
                    var a = t.data.list;
                    a.map(function(t) {
                        3 < 14 * t.content.length / app.globalData.systemInfo.windowWidth && (t.showOpen = !0), 
                        t.isOpen = !0;
                    });
                    var e = o.data.list.concat(a);
                    o.page++, o.hasRefeshin = !1, o.setData({
                        list: e,
                        loadMore: !1,
                        tip: ""
                    });
                } else 1 == t.data.code ? (1 == o.page && o.setData({
                    showData: 0
                }), o.setData({
                    loadMore: !1,
                    tip: "^_^已经到底了"
                })) : t.data.code;
            }
        }));
    },
    authSuccess: function() {
        var t = this.goodId, a = wx.getStorageSync("community"), e = a && a.communityId || this.community_id || "";
        wx.redirectTo({
            url: "/lionfish_comshop/pages/goods/comment?id=" + t + "&community_id=" + e
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
        var t = this.data.goods_id, a = this.data.options;
        this.setData({
            addCar_goodsid: t
        });
        var e = a.list || [], o = [];
        if (0 < e.length) {
            for (var i = 0; i < e.length; i++) {
                var s = e[i].option_value[0], n = {
                    name: s.name,
                    id: s.option_value_id,
                    index: i,
                    idx: 0
                };
                o.push(n);
            }
            for (var d = "", r = 0; r < o.length; r++) r == o.length - 1 ? d += o[r].id : d = d + o[r].id + "_";
            var c = a.sku_mu_list[d];
            this.setData({
                sku: o,
                sku_val: 1,
                cur_sku_arr: c,
                skuList: a,
                visible: !0,
                showSku: !0
            });
        } else {
            var u = this.data.goods, l = {
                canBuyNum: u.total,
                spuName: u.goodsname,
                actPrice: u.actPrice,
                marketPrice: u.marketPrice,
                stock: u.total,
                skuImage: u.image_thumb
            };
            this.setData({
                sku: [],
                sku_val: 1,
                cur_sku_arr: l,
                skuList: []
            });
            var m = {
                detail: {
                    formId: ""
                }
            };
            m.detail.formId = "the formId is a mock one", this.gocarfrom(m);
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
        var o = this;
        o.data.can_car && (o.data.can_car = !1);
        var t = wx.getStorageSync("token"), a = wx.getStorageSync("community"), i = o.data.goods_id, e = a.communityId, s = o.data.sku_val, n = o.data.cur_sku_arr, d = "", r = o.data.is_just_addcar;
        n && n.option_item_ids && (d = n.option_item_ids), app.util.request({
            url: "entry/wxapp/user",
            data: {
                controller: "car.add",
                token: t,
                goods_id: i,
                community_id: e,
                quantity: s,
                sku_str: d,
                buy_type: "dan",
                pin_id: 0,
                is_just_addcar: r
            },
            dataType: "json",
            method: "POST",
            success: function(t) {
                if (3 == t.data.code) wx.showToast({
                    title: t.data.msg,
                    icon: "none",
                    duration: 2e3
                }); else if (4 == t.data.code) wx.showToast({
                    title: "您未登录",
                    duration: 2e3
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
                    if (1 == r) o.closeSku(), wx.showToast({
                        title: "已加入购物车",
                        image: "../../images/addShopCart.png"
                    }), app.globalData.cartNum = t.data.total, o.setData({
                        cartNum: t.data.total
                    }), status.indexListCarCount(i); else 3 < getCurrentPages().length ? wx.redirectTo({
                        url: "/lionfish_comshop/pages/order/placeOrder?type=dan"
                    }) : wx.navigateTo({
                        url: "/lionfish_comshop/pages/order/placeOrder?type=dan"
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
        for (var i = "", s = 0; s < e.length; s++) s == e.length - 1 ? i += e[s].id : i = i + e[s].id + "_";
        var n = this.data.skuList.sku_mu_list[i];
        this.setData({
            cur_sku_arr: n
        }), console.log(i);
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
        for (var i = this.data.sku, s = this.data.skuList, n = "", d = 0; d < i.length; d++) d == i.length - 1 ? n += i[d].id : n = n + i[d].id + "_";
        e > s.sku_mu_list[n].canBuyNum && (e -= 1), this.setData({
            sku_val: e
        });
    },
    preview: function(t) {
        var a = t.currentTarget.dataset.index, e = t.currentTarget.dataset.idx;
        wx.previewImage({
            urls: this.data.list[a].images,
            current: this.data.list[a].images[e],
            fail: function(t) {
                wx.showToast({
                    title: "预览图片失败，请重试",
                    icon: "none"
                }), console.log(t);
            }
        });
    },
    copy: function(t) {
        wx.setClipboardData({
            data: t.currentTarget.dataset.val,
            success: function() {
                wx.showToast({
                    title: "内容复制成功！",
                    icon: "none"
                });
            }
        });
    },
    bindOpen: function(t) {
        var a = t.currentTarget.dataset.idx;
        if (this.data.list[a].isOpen) {
            this.data.list[a].isOpen = !1;
            var e = this.data.list;
            this.setData({
                list: e
            });
        } else {
            this.data.list[a].isOpen = !0;
            e = this.data.list;
            this.setData({
                list: e
            });
        }
    },
    onReachBottom: function() {
        console.log("我是底线"), this.load_comment_list();
    }
});