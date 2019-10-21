var _extends = Object.assign || function(e) {
    for (var t = 1; t < arguments.length; t++) {
        var a = arguments[t];
        for (var i in a) Object.prototype.hasOwnProperty.call(a, i) && (e[i] = a[i]);
    }
    return e;
}, app = getApp(), locat = require("../../utils/Location.js"), util = require("../../utils/util.js"), status = require("../../utils/index.js"), wcache = require("../../utils/wcache.js");

Page({
    data: {
        payBtnLoading: !1,
        showConfirmModal: !1,
        receiverAddress: "",
        tuan_send_address: "",
        showGetPhone: !1,
        lou_meng_hao: "",
        pickUpAddress: "",
        disUserName: "",
        pickUpCommunityName: "",
        is_limit_distance_buy: 0,
        tabList: [ {
            id: 0,
            name: "到点自提",
            dispatching: "pickup",
            enabled: !1
        }, {
            id: 1,
            name: "免费配送",
            dispatching: "tuanz_send",
            enabled: !1
        }, {
            id: 2,
            name: "快递配送",
            dispatching: "express",
            enabled: !1
        } ],
        originTabList: [ {
            id: 0,
            name: "到点自提",
            dispatching: "pickup"
        }, {
            id: 1,
            name: "免费配送",
            dispatching: "tuanz_send"
        }, {
            id: 2,
            name: "快递配送",
            dispatching: "express"
        } ],
        tabIdx: 0,
        region: [ "选择地址", "", "" ],
        tot_price: 0,
        needAuth: !1,
        reduce_money: 0,
        hide_quan: !0,
        tuan_region: [ "选择地址", "", "" ],
        groupInfo: {
            group_name: "社区",
            owner_name: "团长"
        },
        comment: "",
        is_yue_open: 0,
        can_yupay: 0,
        ck_yupay: 0,
        use_score: 0,
        commentArr: {}
    },
    canPay: !0,
    onLoad: function(e) {
        var T = this;
        status.setGroupInfo().then(function(e) {
            T.setData({
                groupInfo: e
            });
        });
        var t = wx.getStorageSync("token"), a = wx.getStorageSync("community"), i = a.communityId;
        util.check_login() ? this.setData({
            needAuth: !1
        }) : (this.setData({
            needAuth: !0
        }), wx.hideTabBar());
        var o = e.is_limit || 0;
        this.setData({
            buy_type: e.type || "",
            pickUpAddress: a.fullAddress,
            pickUpCommunityName: a.communityName,
            disUserName: a.disUserName
        }), wx.showLoading();
        var n = wx.getStorageSync("latitude2"), s = wx.getStorageSync("longitude2");
        function r() {
            app.util.request({
                url: "entry/wxapp/user",
                data: {
                    controller: "car.checkout",
                    token: t,
                    community_id: i,
                    buy_type: e.type
                },
                dataType: "json",
                method: "POST",
                success: function(e) {
                    var t = e.data, a = 0, i = 0, o = T.data.tabList, n = [], s = e.data, r = s.delivery_express_name, d = s.delivery_tuanzshipping_name, c = s.delivery_ziti_name, _ = s.delivery_diy_sort, u = s.delivery_type_express, l = s.delivery_type_tuanz, h = s.delivery_type_ziti, p = s.delivery_tuanz_money;
                    if (1 == u && (o[2].enabled = !0, i++), 1 == l && (o[1].enabled = !0, i++), 1 == h && (o[0].enabled = !0, 
                    i++), _) {
                        var g = _.split(",");
                        g[2] && o[g[2]] && o[g[2]].enabled && (a = g[2]), g[1] && o[g[1]] && o[g[1]].enabled && (a = g[1]), 
                        g[0] && o[g[0]] && o[g[0]].enabled && (a = g[0]), g.forEach(function(e) {
                            n.push(o[e]);
                        });
                    }
                    r && (o[2].name = r), d && (o[1].name = d), c && (o[0].name = c);
                    1 == a || 2 == a && t.trans_free_toal;
                    wx.hideLoading();
                    var m = 0, y = 0, f = t.seller_goodss, v = (Object.keys(f).length, {});
                    for (var x in f) v[x] = "";
                    var b = "";
                    for (var w in f) for (var S in 1 == f[w].show_voucher && (f[w].chose_vouche.id && (m = f[w].chose_vouche.id), 
                    f[w].chose_vouche.store_id && (y = f[w].chose_vouche.store_id), "[object Object]" == Object.prototype.toString.call(f[w].chose_vouche) && (b = f[w].chose_vouche)), 
                    f[w].goodsnum = Object.keys(f[w].goods).length, f[w].goods) 0 < f[w].goods[S].header_disc && f[w].goods[S].header_disc < 100 && (f[w].goods[S].header_disc = (f[w].goods[S].header_disc / 10).toFixed(1));
                    var k = {
                        loadover: !0,
                        commentArr: v,
                        sel_chose_vouche: b,
                        tabList: n,
                        is_limit_distance_buy: t.is_limit_distance_buy || 0,
                        tabIdx: a,
                        tabLength: i,
                        tuan_send_address: t.tuan_send_address,
                        is_open_order_message: t.is_open_order_message,
                        is_yue_open: t.is_yue_open,
                        can_yupay: t.can_yupay,
                        show_voucher: t.show_voucher,
                        current_distance: t.current_distance || "",
                        man_free_tuanzshipping: 1 * t.man_free_tuanzshipping || 0,
                        man_free_shipping: 1 * t.man_free_shipping || 0,
                        index_hide_headdetail_address: t.index_hide_headdetail_address || 0,
                        open_score_buy_score: t.open_score_buy_score || 0,
                        score: t.score || 0,
                        score_for_money: t.score_for_money || 0,
                        bue_use_score: t.bue_use_score || 0,
                        is_man_delivery_tuanz_fare: t.is_man_delivery_tuanz_fare,
                        fare_man_delivery_tuanz_fare_money: t.fare_man_delivery_tuanz_fare_money,
                        is_man_shipping_fare: t.is_man_shipping_fare,
                        fare_man_shipping_fare_money: t.fare_man_shipping_fare_money
                    }, z = t.address;
                    Object.keys(z) && 0 < Object.keys(z).length ? (k.ziti_name = t.address.name, k.ziti_mobile = z.telephone, 
                    k.receiverAddress = z.address, k.region = [ z.province_name || "选择地址", z.city_name || "", z.country_name || "" ]) : (k.ziti_name = t.ziti_name, 
                    k.ziti_mobile = t.ziti_mobile);
                    var D = t.tuan_send_address_info;
                    Object.keys(D) && 0 < Object.keys(D).length && (k.tuan_region = [ D.province_name, D.city_name, D.country_name ], 
                    k.lou_meng_hao = D.lou_meng_hao), T.setData(_extends({}, k, {
                        pick_up_time: e.data.pick_up_time,
                        pick_up_type: e.data.pick_up_type,
                        pick_up_weekday: e.data.pick_up_weekday,
                        addressState: !0,
                        is_integer: e.data.is_integer,
                        is_ziti: e.data.is_ziti,
                        pick_up_arr: e.data.pick_up_arr,
                        seller_goodss: e.data.seller_goodss,
                        seller_chose_id: m,
                        seller_chose_store_id: y,
                        goods: e.data.goods,
                        buy_type: e.data.buy_type,
                        yupay: e.data.can_yupay,
                        is_yue_open: e.data.is_yue_open,
                        yu_money: e.data.yu_money,
                        total_free: e.data.total_free,
                        trans_free_toal: e.data.trans_free_toal,
                        delivery_tuanz_money: e.data.delivery_tuanz_money,
                        reduce_money: e.data.reduce_money,
                        is_open_fullreduction: e.data.is_open_fullreduction,
                        cha_reduce_money: e.data.cha_reduce_money
                    }), function() {
                        T.calcPrice();
                    });
                }
            });
        }
        1 == o && n && s && console.log("---------is here ?-----------"), r();
    },
    authSuccess: function() {
        this.onLoad();
    },
    getReceiveMobile: function(e) {
        var t = e.detail;
        this.setData({
            t_ziti_mobile: t,
            showGetPhone: !1
        });
    },
    ck_wxpays: function() {
        this.setData({
            ck_yupay: 0
        });
    },
    ck_yupays: function() {
        this.setData({
            ck_yupay: 1
        });
    },
    scoreChange: function(e) {
        console.log("是否使用", e.detail.value);
        var t = this.data, a = 1 * t.score_for_money, i = 1 * t.tot_price, o = 1 * t.disAmount;
        e.detail.value ? (i = (i - a).toFixed(2), o += a) : (i = (i + a).toFixed(2), o -= a), 
        this.setData({
            use_score: e.detail.value ? 1 : 0,
            tot_price: i,
            disAmount: o.toFixed(2)
        });
    },
    needAuth: function() {
        this.setData({
            needAuth: !0
        });
    },
    close: function() {
        this.setData({
            showGetPhone: !1
        });
    },
    goOrderfrom: function() {
        var e = this.data.ziti_name, t = this.data.ziti_mobile, a = this.data.receiverAddress, i = this.data.region, o = this.data.tuan_send_address, n = this.data.lou_meng_hao;
        if ("" == e) {
            this.setData({
                focus_name: !0
            });
            var s = "请填写收货人";
            return 0 == this.data.tabIdx && (s = "请填写提货人"), wx.showToast({
                title: s,
                icon: "none"
            }), !1;
        }
        if ("" == t || !/^1(3|4|5|6|7|8|9)\d{9}$/.test(t)) return this.setData({
            focus_mobile: !0
        }), wx.showToast({
            title: "手机号码有误",
            icon: "none"
        }), !1;
        if (2 == this.data.tabIdx && "选择地址" == i[0]) return wx.showToast({
            title: "请选择所在地区",
            icon: "none"
        }), !1;
        if (2 == this.data.tabIdx && "" == a) return this.setData({
            focus_addr: !0
        }), wx.showToast({
            title: "请填写详细地址",
            icon: "none"
        }), !1;
        if (1 == this.data.tabIdx) {
            if ("选择位置" == o || "" == o) return wx.showToast({
                title: "请选择位置",
                icon: "none"
            }), !1;
            if ("" == n) return wx.showToast({
                title: "输入楼号门牌",
                icon: "none"
            }), !1;
        }
        2 == this.data.tabIdx ? this.prepay() : this.conformOrder();
    },
    prepay: function() {
        if (console.log(this.canPay), 1 == this.data.is_limit_distance_buy && 1 == this.data.tabIdx) return wx.showModal({
            title: "提示",
            content: "离团长太远了，暂不支持下单",
            showCancel: !1,
            confirmColor: "#4facfe"
        }), !1;
        if (this.canPay) {
            this.setData({
                payBtnLoading: !0
            }), this.canPay = !1;
            var i = this, e = this.data, t = wx.getStorageSync("token"), a = e.seller_chose_id, o = e.seller_chose_store_id, n = e.ck_yupay, s = e.tabIdx, r = e.tabList, d = "";
            r.forEach(function(e) {
                e.id == s && (d = e.dispatching);
            });
            var c = e.commentArr, _ = [];
            for (var u in c) _.push(c[u]);
            var l = _.join("@EOF@"), h = e.receiverAddress, p = e.region, g = e.ziti_name, m = e.ziti_mobile, y = [];
            if (0 < a) {
                var f = o + "_" + a;
                y.push(f);
            }
            var v = "", x = "", b = "", w = "", S = "", k = "";
            1 == s ? (v = e.tuan_send_address, w = (x = e.tuan_region)[0], S = x[1], k = x[2]) : 2 == s && (b = h, 
            w = p[0], S = p[1], k = p[2]);
            var z = wx.getStorageSync("community").communityId, D = wx.getStorageSync("latitude2"), T = wx.getStorageSync("longitude2"), I = this.data.use_score;
            app.util.request({
                url: "entry/wxapp/user",
                data: {
                    controller: "car.sub_order",
                    token: t,
                    pay_method: "wxpay",
                    buy_type: i.data.buy_type,
                    pick_up_id: z,
                    dispatching: d,
                    ziti_name: g,
                    quan_arr: y,
                    comment: l,
                    ziti_mobile: m,
                    latitude: D,
                    longitude: T,
                    ck_yupay: n,
                    tuan_send_address: v,
                    lou_meng_hao: i.data.lou_meng_hao,
                    address_name: b,
                    province_name: w,
                    city_name: S,
                    country_name: k,
                    use_score: I
                },
                dataType: "json",
                method: "POST",
                success: function(t) {
                    var e = t.data.has_yupay || 0, a = t.data.order_id;
                    console.log("支付日志："), console.log(t), 0 == t.data.code ? (i.changeIndexList(), 1 == e ? (i.canPay = !0, 
                    t.data.is_go_orderlist <= 1 ? wx.redirectTo({
                        url: "/lionfish_comshop/pages/order/order?id=" + a + "&is_show=1"
                    }) : wx.redirectTo({
                        url: "/lionfish_comshop/pages/order/index?is_show=1"
                    })) : wx.requestPayment({
                        appId: t.data.appId,
                        timeStamp: t.data.timeStamp,
                        nonceStr: t.data.nonceStr,
                        package: t.data.package,
                        signType: t.data.signType,
                        paySign: t.data.paySign,
                        success: function(e) {
                            i.canPay = !0, t.data.is_go_orderlist <= 1 ? wx.redirectTo({
                                url: "/lionfish_comshop/pages/order/order?id=" + a + "&is_show=1"
                            }) : wx.redirectTo({
                                url: "/lionfish_comshop/pages/order/index?is_show=1"
                            });
                        },
                        fail: function(e) {
                            t.data.is_go_orderlist <= 1 ? wx.redirectTo({
                                url: "/lionfish_comshop/pages/order/order?id=" + a + "&?isfail=1"
                            }) : wx.redirectTo({
                                url: "/lionfish_comshop/pages/order/index?isfail=1"
                            });
                        }
                    })) : 1 == t.data.code ? (i.canPay = !0, wx.showToast({
                        title: "支付失败",
                        icon: "none"
                    })) : 2 == t.data.code && (i.canPay = !0, wx.showToast({
                        title: t.data.msg,
                        icon: "none"
                    })), i.setData({
                        btnLoading: !1,
                        payBtnLoading: !1
                    });
                }
            });
        }
    },
    changeReceiverName: function(e) {
        var t = e.detail.value.trim();
        if (t) this.setData({
            ziti_name: t
        }); else {
            var a = "请填写收货人";
            0 == this.data.tabIdx && (a = "请填写提货人"), wx.showToast({
                title: a,
                icon: "none"
            }), this.setData({
                ziti_name: t
            });
        }
        return {
            value: e.detail.value.trim()
        };
    },
    bindReceiverMobile: function(e) {
        this.setData({
            receiverMobile: e.detail.value.trim()
        });
        var t = e.detail.value.trim();
        return this.setData({
            ziti_mobile: t
        }), {
            value: e.detail.value.trim()
        };
    },
    changeReceiverAddress: function(e) {
        return this.setData({
            receiverAddress: e.detail.value.trim()
        }), {
            value: e.detail.value.trim()
        };
    },
    changeTuanAddress: function(e) {
        return this.setData({
            lou_meng_hao: e.detail.value.trim()
        }), {
            value: e.detail.value.trim()
        };
    },
    conformOrder: function() {
        this.setData({
            showConfirmModal: !0
        });
    },
    closeConfirmModal: function() {
        this.canPay = !0, this.setData({
            showConfirmModal: !1
        });
    },
    bindRegionChange: function(e) {
        var t = e.detail.value;
        t && this.checkOut(t[1]), this.setData({
            region: t
        });
    },
    checkOut: function(e) {
        var n = this, t = wx.getStorageSync("token"), a = wx.getStorageSync("community").communityId, i = wx.getStorageSync("latitude2"), o = wx.getStorageSync("longitude2");
        app.util.request({
            url: "entry/wxapp/user",
            data: {
                controller: "car.checkout",
                token: t,
                community_id: a,
                mb_city_name: e,
                latitude: i,
                longitude: o
            },
            dataType: "json",
            method: "POST",
            success: function(e) {
                if (1 == e.data.code) {
                    var t = e.data, a = t.shop_buy_distance || 0, i = t.is_limit_distance_buy || 0, o = t.current_distance || "";
                    1 == n.data.tabIdx && 1 == i && a < o && wx.showModal({
                        title: "提示",
                        content: "超出配送范围，请重新选择",
                        showCancel: !1,
                        confirmColor: "#4facfe"
                    }), n.setData({
                        is_limit_distance_buy: i,
                        current_distance: o,
                        trans_free_toal: t.trans_free_toal,
                        is_man_delivery_tuanz_fare: t.is_man_delivery_tuanz_fare,
                        fare_man_delivery_tuanz_fare_money: t.fare_man_delivery_tuanz_fare_money,
                        is_man_shipping_fare: t.is_man_shipping_fare,
                        fare_man_shipping_fare_money: t.fare_man_shipping_fare_money
                    }, function() {
                        n.calcPrice();
                    });
                }
            }
        });
    },
    choseLocation: function() {
        var c = this;
        wx.chooseLocation({
            success: function(e) {
                var t = e, a = c.data.region, i = "", o = t, n = new RegExp("(.*?省)(.*?市)(.*?区)", "g"), s = n.exec(o);
                null == s && null == (s = (n = new RegExp("(.*?省)(.*?市)(.*?市)", "g")).exec(o)) && null == (s = (n = new RegExp("(.*?省)(.*?市)(.*县)", "g")).exec(o)) || (a[0] = s[1], 
                a[1] = s[2], a[2] = s[3], i = t.replace(s[0], ""));
                var r = i + e.name, d = "";
                wcache.put("latitude2", e.latitude), wcache.put("longitude2", e.longitude), locat.getGpsLocation(e.latitude, e.longitude).then(function(e) {
                    console.log("反推了"), (d = e) && (a[0] = d.province, a[1] = d.city, a[2] = d.district), 
                    function() {
                        console.log("setData"), a && "市" != a[1] && c.checkOut(a[1]);
                        var e = [ "选择地址", "", "" ];
                        1 == c.data.tabIdx ? (console.log("选择地图后返回，tabIdx=1：" + a), e = a, c.setData({
                            tuan_send_address: r,
                            tuan_region: e
                        })) : c.setData({
                            region: a,
                            receiverAddress: r
                        });
                    }();
                });
            },
            fail: function(e) {
                console.log(e), "chooseLocation:fail auth deny" == e.errMsg && (console.log("无权限"), 
                locat.checkGPS(app, locat.openSetting()));
            }
        });
    },
    getWxAddress: function() {
        var n = this.data.region, s = this;
        wx.getSetting({
            success: function(e) {
                console.log("vres.authSetting['scope.address']：", e.authSetting["scope.address"]), 
                e.authSetting["scope.address"] ? wx.chooseAddress({
                    success: function(e) {
                        console.log("step1"), n[0] = e.provinceName || "选择地址", n[1] = e.cityName || "", 
                        n[2] = e.countyName || "";
                        var t = e.detailInfo, a = e.userName, i = e.telNumber, o = s.data.tuan_region;
                        1 == s.data.tabIdx ? (o = n, s.setData({
                            tuan_send_address: t,
                            tuan_region: o
                        })) : s.setData({
                            region: n,
                            receiverAddress: t
                        }), s.setData({
                            ziti_name: a,
                            ziti_mobile: i
                        }), n && "市" != n[1] && s.checkOut(n[1]);
                    },
                    fail: function(e) {
                        console.log("step4"), console.log(e);
                    }
                }) : 0 == e.authSetting["scope.address"] ? wx.openSetting({
                    success: function(e) {
                        console.log(e.authSetting);
                    }
                }) : (console.log("step2"), wx.chooseAddress({
                    success: function(e) {
                        console.log("step3"), n[0] = e.provinceName || "选择地址", n[1] = e.cityName || "", 
                        n[2] = e.countyName || "";
                        var t = e.detailInfo, a = e.userName, i = e.telNumber;
                        n && "市" != n[1] && s.checkOut(n[1]);
                        var o = s.data.tuan_region;
                        1 == s.data.tabIdx ? (o = n, s.setData({
                            tuan_send_address: t,
                            tuan_region: o
                        })) : s.setData({
                            region: n,
                            receiverAddress: t
                        }), s.setData({
                            ziti_name: a,
                            ziti_mobile: i
                        });
                    }
                }));
            }
        });
    },
    tabSwitch: function(e) {
        var t = 1 * e.currentTarget.dataset.idx;
        0 != t && wx.showToast({
            title: "配送变更，费用已变化",
            icon: "none"
        }), this.setData({
            tabIdx: t
        }, function() {
            this.calcPrice(1);
        });
    },
    show_voucher: function(e) {
        var t = e.currentTarget.dataset.seller_id, a = [], i = this.data.seller_chose_id, o = this.data.seller_chose_store_id, n = this.data.seller_goodss;
        for (var s in n) {
            n[s].store_info.s_id == t && (a = n[s].voucher_list, 0 == i && (i = n[s].chose_vouche.id || 0, 
            o = n[s].chose_vouche.store_id || 0));
        }
        this.setData({
            ssvoucher_list: a,
            voucher_serller_id: t,
            seller_chose_id: i,
            seller_chose_store_id: o,
            hide_quan: !1
        });
    },
    chose_voucher_id: function(e) {
        wx.showLoading();
        var n = e.currentTarget.dataset.voucher_id, s = e.currentTarget.dataset.seller_id, r = this, t = wx.getStorageSync("token"), a = s + "_" + n, i = wx.getStorageSync("latitude2"), o = wx.getStorageSync("longitude2"), d = r.data.buy_type, c = wx.getStorageSync("community").communityId;
        app.util.request({
            url: "entry/wxapp/user",
            data: {
                controller: "car.checkout",
                token: t,
                community_id: c,
                voucher_id: n,
                use_quan_str: a,
                buy_type: d,
                latitude: i,
                longitude: o
            },
            dataType: "json",
            method: "POST",
            success: function(e) {
                if (wx.hideLoading(), 1 == e.data.code) {
                    var t = e.data.seller_goodss, a = "";
                    for (var i in t) t[i].goodsnum = Object.keys(t[i].goods).length, "[object Object]" == Object.prototype.toString.call(t[i].chose_vouche) && (a = t[i].chose_vouche);
                    var o = e.data;
                    r.setData({
                        seller_goodss: t,
                        seller_chose_id: n,
                        seller_chose_store_id: s,
                        hide_quan: !0,
                        goods: o.goods,
                        buy_type: o.buy_type || "dan",
                        yupay: o.can_yupay,
                        is_yue_open: o.is_yue_open,
                        total_free: o.total_free,
                        sel_chose_vouche: a,
                        current_distance: o.current_distance || ""
                    }, function() {
                        r.calcPrice();
                    });
                }
            }
        });
    },
    closeCouponModal: function() {
        this.setData({
            hide_quan: !0
        });
    },
    calcPrice: function() {
        var e = 0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : 0, t = this.data, a = 1 * t.total_free, i = 1 * t.delivery_tuanz_money, o = 1 * t.trans_free_toal, n = t.tabIdx, s = t.goods, r = 0, d = 0;
        "[object Object]" == Object.prototype.toString.call(s) ? Object.keys(s).forEach(function(e) {
            d += s[e].total;
        }) : s.forEach(function(e) {
            d += e.total;
        });
        var c = d;
        if (0 == n) r = a; else if (1 == n) {
            r = 0 == t.is_man_delivery_tuanz_fare ? i + a : a, c += i;
        } else if (2 == n) {
            c += o, r = 0 == t.is_man_shipping_fare ? o + a : a;
        }
        var _ = t.use_score;
        e && _ && (r -= 1 * t.score_for_money);
        var u;
        u = (c - 1 * r).toFixed(2), this.setData({
            total_all: c.toFixed(2),
            disAmount: u,
            tot_price: r.toFixed(2),
            total_goods_price: d.toFixed(2)
        });
    },
    bindInputMessage: function(e) {
        var t = this.data.commentArr, a = e.currentTarget.dataset.idx, i = e.detail.value;
        t[a] = i, this.setData({
            commentArr: t
        });
    },
    changeIndexList: function() {
        var e = this.data.goods;
        0 < e.length && e.forEach(function(e) {
            0 == e.option.length && status.indexListCarCount(e.goods_id, 0);
        });
    }
});