var _extends = Object.assign || function(t) {
    for (var a = 1; a < arguments.length; a++) {
        var e = arguments[a];
        for (var o in e) Object.prototype.hasOwnProperty.call(e, o) && (t[o] = e[o]);
    }
    return t;
}, util = require("../../utils/util.js"), status = require("../../utils/index.js"), a = require("../../utils/public"), e = require("../../wxParse/wxParse.js"), countDownInit = require("../../utils/countDown"), wcache = require("../../utils/wcache.js"), app = getApp(), timerOut = "";

Page(Object.assign({}, countDownInit.default, {
    data: {
        needAuth: !1,
        stopClick: !1,
        community: {},
        rushList: [],
        commingList: [],
        countDownMap: [],
        actEndMap: [],
        skuList: [],
        pageNum: 1,
        notice_list: [],
        slider_list: [],
        shop_info: {},
        showEmpty: !1,
        indexBottomImage: "",
        classification: {
            tabs: [],
            activeIndex: 0
        },
        commingClassification: {
            tabs: [],
            activeIndex: 0
        },
        isShowCommingClassification: !0,
        isShowClassification: !0,
        showChangeCommunity: !1,
        isTipShow: !1,
        isShowGuide: !1,
        index_lead_image: "",
        theme: 0,
        cartNum: 0,
        navigat: [],
        tabIdx: 0,
        scrollDirect: "",
        isSticky: !1,
        showCommingEmpty: !1,
        stopNotify: !0,
        reduction: {},
        is_share_html: !0,
        commingNum: 0,
        couponRefresh: !1,
        index_change_cate_btn: 0,
        newComerRefresh: !1,
        showCouponModal: !1,
        copy_text_arr: [],
        showCopyText: !1,
        totalAlertMoney: 0,
        groupInfo: {
            group_name: "社区",
            owner_name: "团长"
        },
        needPosition: !0,
        typeTopicList: [],
        pinList: {}
    },
    isFirst: 0,
    $data: {
        stickyFlag: !1,
        scrollTop: 0,
        overPageNum: 1,
        loadOver: !1,
        hasOverGoods: !1,
        countDownMap: {},
        actEndMap: {},
        timer: {},
        scrollHeight: 1300,
        stickyTop: 0,
        hasCommingGoods: !0
    },
    tpage: 1,
    hasRefeshin: !1,
    postion: {},
    options: "",
    onPageScroll: function(t) {
        this.$data.isLoadData || (t.scrollTop < this.$data.scrollHeight ? t.scrollTop > this.$data.scrollTop ? "down" !== this.data.scrollDirect && this.setData({
            scrollDirect: "down"
        }) : "up" != this.data.scrollDirect && this.setData({
            scrollDirect: "up"
        }) : "down" !== this.data.scrollDirect && this.setData({
            scrollDirect: "down"
        }), t.scrollTop > this.$data.stickyTop ? this.data.isSticky || (this.setData({
            isSticky: !0
        }), this.$data.stickyFlag = !0) : t.scrollTop < this.$data.stickyBackTop && this.data.isSticky && (this.setData({
            isSticky: !1
        }), this.$data.stickyFlag = !1), this.$data.scrollTop = t.scrollTop);
    },
    onLoad: function(i) {
        console.log("options", i), wx.hideTabBar();
        var s = this;
        status.setNavBgColor(), status.setGroupInfo().then(function(t) {
            s.setData({
                groupInfo: t
            });
        }), console.log("step1");
        var n = wx.getStorageSync("community"), d = n.communityId || "";
        if (i && 0 != Object.keys(i).length) {
            console.log("step2");
            var t = decodeURIComponent(i.scene);
            if ("undefined" != t) {
                var a = t.split("_");
                i.community_id = a[0], wcache.put("share_id", a[1]);
            }
            "undefined" != (s.options = i).share_id && 0 < i.share_id && wcache.put("share_id", i.share_id), 
            "undefined" != i.community_id && 0 < i.community_id ? (console.log("step3"), s.setData({
                needPosition: !1
            }), app.util.request({
                url: "entry/wxapp/index",
                data: {
                    controller: "index.get_community_info",
                    community_id: i.community_id
                },
                dataType: "json",
                success: function(t) {
                    var a = wx.getStorageSync("token");
                    if (0 == t.data.code && t.data.data) {
                        console.log("step4");
                        var e = t.data.data;
                        console.log("分享community_id", i.community_id), console.log("历史community_id", d);
                        var o = {};
                        i.community_id != d ? d ? (o.showChangeCommunity = !0, o.changeCommunity = e, o.community = n) : (o.shareCommunity = e, 
                        wcache.put("community", e)) : o.community = n, o.hidetip = !1, o.token = a, o.showEmpty = !1, 
                        s.setData(o), s.loadPage();
                    } else console.log("step5"), s.loadPage(), s.setData({
                        hidetip: !1,
                        token: a,
                        showEmpty: !1
                    });
                    a && s.addhistory();
                }
            })) : (console.log("step6"), s.loadPage());
        } else {
            console.log("step7"), s.loadPage();
            var e = wx.getStorageSync("token");
            s.setData({
                hidetip: !1,
                token: e,
                showEmpty: !1,
                community: n
            });
        }
    },
    addhistory: function() {
        var a = 0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : 0;
        console.log("step13");
        var t = 0;
        0 == a ? t = wx.getStorageSync("community").communityId : t = a;
        console.log("history community_id=" + t);
        var e = wx.getStorageSync("token"), o = this;
        void 0 !== t && app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "index.addhistory_community",
                community_id: t,
                token: e
            },
            dataType: "json",
            success: function(t) {
                0 != a && (o.getHistoryCommunity(), console.log("addhistory+id", a));
            }
        });
    },
    loadPage: function() {
        wx.showLoading(), console.log("step8");
        var e = this;
        e.get_index_info(), e.get_type_topic(), e.getNavigat(), e.getCoupon(), e.getPinList(), 
        status.loadStatus().then(function() {
            var t = app.globalData.appLoadStatus;
            if (console.log("appLoadStatus", t), 0 == t) wx.hideLoading(), e.setData({
                needAuth: !0,
                couponRefresh: !1
            }), e.load_goods_data(); else if (2 == t) console.log("step9"), e.getHistoryCommunity(); else {
                console.log("step12");
                var a = wx.getStorageSync("community");
                a || (a = app.globalData.community), a ? e.setData({
                    community: e.fliterCommunity(a)
                }) : util.getCommunityInfo().then(function(t) {
                    e.setData({
                        community: e.fliterCommunity(t)
                    });
                }), console.log("step18"), e.load_goods_data();
            }
        });
    },
    fliterCommunity: function(t) {
        var a = t && t.fullAddress && t.fullAddress.split("省");
        return Object.assign({}, t, {
            address: a[1] || a[0]
        });
    },
    onShow: function() {
        var a = this, e = this;
        if (console.log("isFirst", e.isFirst), this.setData({
            stopNotify: !1,
            tabbarRefresh: !0
        }), util.check_login_new().then(function(t) {
            t ? e.setData({
                needAuth: !1
            }) : a.setData({
                needAuth: !0,
                couponRefresh: !1
            });
        }), app.globalData.timer.start(), (0, status.cartNum)("", !0).then(function(t) {
            0 == t.code && e.setData({
                cartNum: t.data
            });
        }), app.globalData.changedCommunity) {
            console.log("change"), app.globalData.goodsListCarCount = [];
            var t = app.globalData.community;
            this.setData({
                community: e.fliterCommunity(t),
                newComerRefresh: !1
            }), this.getCommunityPos(t.communityId), this.hasRefeshin = !1, this.setData({
                newComerRefresh: !0,
                rushList: [],
                pageNum: 1,
                classificationId: null,
                "classification.activeIndex": -1
            }, function() {
                a.setData({
                    "classification.activeIndex": 0
                });
            }), this.$data = _extends({}, this.$data, {
                overPageNum: 1,
                loadOver: !1,
                hasOverGoods: !1,
                countDownMap: {},
                actEndMap: {},
                timer: {},
                stickyFlag: !1,
                hasCommingGoods: !0
            }), app.globalData.changedCommunity = !1, this.get_index_info(), this.addhistory(), 
            this.load_goods_data();
        } else console.log("nochange"), 1 <= e.isFirst && (this.setData({
            loadOver: !0
        }), this.changeRushListNum());
        0 == e.isFirst ? this.setData({
            couponRefresh: !0
        }) : this.getCoupon(), e.isFirst++;
    },
    changeRushListNum: function() {
        var t = app.globalData.goodsListCarCount, o = this.data.rushList, i = !1;
        this.setData({
            changeCarCount: i
        }), 0 < t.length && 0 < o.length && (t.forEach(function(a) {
            var t = o.findIndex(function(t) {
                return t.actId == a.actId;
            });
            if (-1 != t && 0 === o[t].skuList.length) {
                var e = 1 * a.num;
                o[t].car_count = 0 <= e ? e : 0, i = !0;
            }
        }), this.setData({
            rushList: o,
            changeCarCount: i
        }));
    },
    changeNotListCartNum: function(t) {
        var a = t.detail;
        (0, status.cartNum)(this.setData({
            cartNum: a
        })), this.changeRushListNum();
    },
    onHide: function() {
        this.setData({
            stopNotify: !0,
            tabbarRefresh: !1,
            changeCarCount: !1
        }), console.log("详情页", this.data.stopNotify), app.globalData.timer.stop(), console.log("onHide");
    },
    authSuccess: function() {
        console.log("authSuccess");
        var a = this;
        this.tpage = 1, this.hasRefeshin = !1, this.setData({
            rushList: [],
            pageNum: 1,
            needAuth: !1,
            newComerRefresh: !1,
            couponRefresh: !0
        }), this.$data = _extends({}, this.$data, {
            overPageNum: 1,
            loadOver: !1,
            hasOverGoods: !1,
            countDownMap: {},
            actEndMap: {},
            timer: {},
            hasCommingGoods: !0
        }), status.getInNum().then(function(t) {
            t && (a.setData({
                isTipShow: !0
            }), timerOut = setTimeout(function() {
                a.setData({
                    isTipShow: !1
                });
            }, 7e3));
        }), this.loadPage(), this.data.isTipShow && (timerOut = setTimeout(function() {
            a.setData({
                isTipShow: !1
            });
        }, 7e3));
    },
    authModal: function() {
        var t = 0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : {}, a = t && t.detail || this.data.needAuth;
        return !this.data.needAuth && !t.detail || (this.setData({
            showAuthModal: !this.data.showAuthModal,
            needAuth: a
        }), !1);
    },
    getHistoryCommunity: function() {
        var d = this, c = wx.getStorageSync("token");
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "index.load_history_community",
                token: c
            },
            dataType: "json",
            success: function(t) {
                if (console.log("step14"), 0 == t.data.code) {
                    console.log("getHistoryCommunity");
                    var a = t.data.list, e = !1;
                    0 != Object.keys(a).length && 0 != a.communityId || (e = !0);
                    var o = a && a.fullAddress && a.fullAddress.split("省");
                    if (a = Object.assign({}, a, {
                        address: o[1]
                    }), d.setData({
                        community: a
                    }), wcache.put("community", a), app.globalData.community = a, c && !e) {
                        var i = wx.getStorageSync("lastCommunity"), s = i.communityId || "";
                        "" != s && s != a.communityId && d.setData({
                            showChangeCommunity: !0,
                            changeCommunity: i
                        }, function() {
                            wx.removeStorageSync("lastCommunity");
                        });
                    }
                    d.setData({
                        community: app.globalData.community
                    }), d.load_goods_data();
                } else {
                    var n = d.options;
                    void 0 !== n && n.community_id ? (console.log("新人加入分享进来的社区id:", d.options), d.addhistory(n.community_id)) : wx.redirectTo({
                        url: "/lionfish_comshop/pages/position/community"
                    });
                }
            }
        });
    },
    getScrollHeight: function() {
        var a = this;
        wx.createSelectorQuery().select(".rush-list-box").boundingClientRect(function(t) {
            t && t.height && (a.$data.scrollHeight = t.height || 1300), console.log(a.$data.scrollHeight);
        }).exec();
    },
    handleProxy: function() {
        clearTimeout(timerOut), this.setData({
            isTipShow: !1,
            isShowGuide: !0
        }), wcache.put("inNum", 4);
    },
    handleHideProxy: function() {
        this.setData({
            isTipShow: !1,
            isShowGuide: !1
        });
    },
    get_index_info: function() {
        var D = this, t = wx.getStorageSync("community"), T = t && t.communityId || "", a = wx.getStorageSync("token");
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "index.index_info",
                communityId: T,
                token: a
            },
            dataType: "json",
            success: function(t) {
                var a = t.data;
                if (0 == a.code) {
                    if (!t.data.is_community && T && !D.data.needAuth) {
                        var e = D.data.changeCommunity || {};
                        e.communityId || "" ? (wcache.put("community", e), D.addhistory(e.community_id), 
                        D.setData({
                            community: e,
                            showChangeCommunity: !1
                        }), D.loadPage()) : wx.showModal({
                            title: "提示",
                            content: "该小区不在，请重新选择小区",
                            showCancel: !1,
                            confirmColor: "#F75451",
                            success: function(t) {
                                t.confirm && wx.redirectTo({
                                    url: "/lionfish_comshop/pages/position/community"
                                });
                            }
                        });
                    }
                    var o = a.notice_list, i = a.slider_list, s = a.index_lead_image;
                    s ? status.getInNum().then(function(t) {
                        t && D.setData({
                            isTipShow: !0
                        }, function() {
                            timerOut = setTimeout(function() {
                                D.setData({
                                    isTipShow: !1
                                });
                            }, 9e3);
                        });
                    }) : D.setData({
                        isTipShow: !1
                    });
                    var n = a.common_header_backgroundimage;
                    app.globalData.common_header_backgroundimage = n;
                    var d = a.order_notify_switch, c = a.index_list_top_image_on || 1, r = a.index_change_cate_btn || 0, l = "../../images/rush-title.png";
                    1 == c && (l = "");
                    var u = a.index_list_top_image ? a.index_list_top_image : l, h = {
                        shoname: a.shoname,
                        shop_index_share_image: a.shop_index_share_image,
                        index_list_top_image: u,
                        title: a.title,
                        common_header_backgroundimage: n,
                        order_notify_switch: d,
                        index_top_img_bg_open: a.index_top_img_bg_open || 0,
                        index_top_font_color: a.index_top_font_color || "#fff",
                        index_communityinfo_showtype: a.index_communityinfo_showtype || 0
                    };
                    app.globalData.placeholdeImg = a.index_loading_image || "", wcache.put("shopname", a.shoname), 
                    wx.setNavigationBarTitle({
                        title: a.shoname
                    });
                    var m = a.category_list || [], g = a.index_type_first_name || "全部";
                    0 < m.length ? (m.unshift({
                        name: g,
                        id: 0
                    }), D.setData({
                        isShowClassification: !0,
                        "classification.tabs": m
                    })) : D.setData({
                        isShowClassification: !1
                    });
                    var p = a.theme || 0, _ = 1e3 * a.rushtime || 0, f = a.index_share_switch || 0, y = a.is_show_list_count || 0, w = a.is_show_list_timer || 0, x = a.index_service_switch || 0, v = a.index_switch_search || 0;
                    1 != a.is_comunity_rest || D.data.needAuth || wx.showModal({
                        title: "温馨提示",
                        content: "团长休息中，欢迎下次光临!",
                        showCancel: !1,
                        confirmColor: "#F75451",
                        confirmText: "好的",
                        success: function(t) {}
                    }), D.postion = a.postion, D.setData({
                        notice_list: o,
                        slider_list: i,
                        index_lead_image: s,
                        theme: p,
                        indexBottomImage: a.index_bottom_image || "",
                        shop_info: h,
                        loadOver: !0,
                        rushEndTime: _,
                        commingNum: a.comming_goods_total,
                        isShowShareBtn: f,
                        isShowListCount: y,
                        isShowListTimer: w,
                        is_comunity_rest: a.is_comunity_rest,
                        index_change_cate_btn: r,
                        isShowContactBtn: x,
                        index_switch_search: v,
                        is_show_new_buy: a.is_show_new_buy || 0,
                        qgtab: t.data.qgtab || {},
                        notice_setting: a.notice_setting || {},
                        index_hide_headdetail_address: a.index_hide_headdetail_address || 0,
                        is_show_spike_buy: a.is_show_spike_buy || 0,
                        hide_community_change_btn: a.hide_community_change_btn || 0,
                        hide_top_community: a.hide_top_community || 0,
                        index_qgtab_text: a.index_qgtab_text,
                        ishow_index_copy_text: a.ishow_index_copy_text || 0,
                        newComerRefresh: !0
                    });
                }
            }
        });
    },
    confrimChangeCommunity: function() {
        var t = this, a = this.data.changeCommunity;
        app.globalData.community = a, wcache.put("community", a), this.$data = _extends({}, this.$data, {
            overPageNum: 1,
            loadOver: !1,
            hasOverGoods: !1,
            countDownMap: {},
            actEndMap: {},
            timer: {},
            stickyFlag: !1
        }), this.hasRefeshin = !1, this.setData({
            showChangeCommunity: !1,
            community: a,
            rushList: [],
            pageNum: 1
        }, function() {
            t.loadPage(), t.addhistory();
        });
    },
    closeChangeCommunity: function() {
        this.setData({
            showChangeCommunity: !1
        });
    },
    load_goods_data: function() {
        var t = wx.getStorageSync("token"), l = this, a = wx.getStorageSync("community"), e = l.data.classificationId;
        this.$data.isLoadData = !0, console.log("load_goods_begin "), l.hasRefeshin || l.$data.loadOver ? l.load_over_gps_goodslist() : (console.log("load_goods_in "), 
        this.hasRefeshin = !0, l.setData({
            loadMore: !0
        }), app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "index.load_gps_goodslist",
                token: t,
                pageNum: l.data.pageNum,
                head_id: a.communityId,
                gid: e,
                per_page: 12
            },
            dataType: "json",
            success: function(t) {
                if (1 == l.data.pageNum && l.setData({
                    cate_info: t.data.cate_info || {}
                }), 0 == t.data.code) {
                    var a = "";
                    if (1 == t.data.is_show_list_timer) for (var e in a = l.transTime(t.data.list), 
                    l.$data.countDownMap) l.initCountDown(l.$data.countDownMap[e]); else {
                        var o = l.data.rushList;
                        a = o.concat(t.data.list);
                    }
                    var i = t.data, s = i.full_money, n = i.full_reducemoney, d = i.is_open_fullreduction, c = i.is_open_vipcard_buy, r = {
                        full_money: s,
                        full_reducemoney: n,
                        is_open_fullreduction: d
                    };
                    1 == l.data.pageNum && l.setData({
                        copy_text_arr: i.copy_text_arr || []
                    }), l.hasRefeshin = !1, l.setData({
                        rushList: a,
                        pageNum: l.data.pageNum + 1,
                        loadMore: !1,
                        reduction: r,
                        tip: "",
                        is_open_vipcard_buy: c || 0
                    }, function() {
                        1 == l.isFirst && (l.isFirst++, a.length && !l.$data.stickyTop && (wx.createSelectorQuery().select(".tab-nav").boundingClientRect(function(t) {
                            if (t && t.top) wcache.put("tabPos", t), l.$data.stickyTop = t.top + t.height, l.$data.stickyBackTop = t.top; else {
                                var a = wcache.get("tabPos", !1);
                                a && (l.$data.stickyTop = a.top + a.height, l.$data.stickyBackTop = a.top);
                            }
                        }).exec(), l.$data.scrollTop > l.$data.stickyTop && wx.pageScrollTo({
                            duration: 0,
                            scrollTop: l.$data.stickyTop + 4
                        }))), l.getScrollHeight(), 2 == l.data.pageNum && t.data.list.length < 10 && (console.log("load_over_goods_list_begin"), 
                        l.$data.loadOver = !0, l.hasRefeshin = !0, l.setData({
                            loadMore: !0
                        }, function() {
                            l.load_over_gps_goodslist();
                        }));
                    });
                } else 1 == t.data.code ? (l.$data.loadOver = !0, l.load_over_gps_goodslist()) : 2 == t.data.code && l.setData({
                    needAuth: !0,
                    couponRefresh: !1
                });
            },
            complete: function() {
                l.$data.isLoadData = !1, wx.hideLoading();
            }
        }));
    },
    transTime: function(t) {
        var a = this;
        return 0 === (e = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : 0) && t.map(function(t) {
            t.end_time *= 1e3, a.$data.countDownMap[t.end_time] = t.end_time, a.$data.actEndMap[t.end_time] = t.end_time <= new Date().getTime() || 0 == t.spuCanBuyNum;
        }), a.data.rushList.concat(t);
    },
    load_over_gps_goodslist: function() {
        var t = wx.getStorageSync("token"), o = this, a = wx.getStorageSync("community"), e = o.data.classificationId;
        !o.$data.hasOverGoods && o.$data.loadOver ? (o.$data.hasOverGoods = !0, o.setData({
            loadMore: !0
        }), app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "index.load_over_gps_goodslist",
                token: t,
                pageNum: o.$data.overPageNum,
                head_id: a.communityId,
                gid: e
            },
            dataType: "json",
            success: function(t) {
                if (0 == t.data.code) {
                    var a = o.transTime(t.data.list);
                    for (var e in o.$data.countDownMap) o.initCountDown(o.$data.countDownMap[e]);
                    o.$data.hasOverGoods = !1, o.$data.overPageNum += 1, o.setData({
                        rushList: a,
                        loadMore: !1,
                        tip: ""
                    }, function() {
                        1 == o.isFirst && (o.isFirst++, a.length && !o.$data.stickyTop && (wx.createSelectorQuery().select(".tab-nav").boundingClientRect(function(t) {
                            if (t && t.top) wcache.put("tabPos", t), o.$data.stickyTop = t.top + t.height, o.$data.stickyBackTop = t.top; else {
                                var a = wcache.get("tabPos", !1);
                                a && (o.$data.stickyTop = a.top + a.height, o.$data.stickyBackTop = a.top);
                            }
                        }).exec(), o.$data.scrollTop > o.$data.stickyTop && wx.pageScrollTo({
                            duration: 0,
                            scrollTop: o.$data.stickyTop + 4
                        }))), o.getScrollHeight();
                    });
                } else 1 == t.data.code ? (1 == o.$data.overPageNum && 0 == o.data.rushList.length && o.setData({
                    showEmpty: !0
                }), o.setData({
                    loadMore: !1,
                    tip: "^_^已经到底了"
                })) : 2 == t.data.code && o.setData({
                    needAuth: !0,
                    couponRefresh: !1
                });
                o.$data.isLoadData = !1;
            }
        })) : o.$data.isLoadData = !1;
    },
    classificationChange: function(t) {
        console.log(t.detail.e), wx.showLoading();
        var a = this;
        this.$data = _extends({}, this.$data, {
            overPageNum: 1,
            loadOver: !1,
            hasOverGoods: !1,
            countDownMap: {},
            actEndMap: {},
            timer: {}
        }), this.hasRefeshin = !1, this.setData({
            rushList: [],
            showEmpty: !1,
            pageNum: 1,
            "classification.activeIndex": t.detail.e,
            classificationId: t.detail.a
        }, function() {
            this.$data.stickyFlag && a.$data.scrollTop != a.$data.stickyTop + 5 && wx.pageScrollTo({
                scrollTop: a.$data.stickyTop + 5,
                duration: 0
            }), a.load_goods_data();
        });
    },
    commingClassificationChange: function(t) {
        wx.showLoading();
        var a = this;
        a.tpage = 1, this.$data = _extends({}, this.$data, {
            hasCommingGoods: !0
        }), this.setData({
            showCommingEmpty: !1,
            commingList: [],
            "commingClassification.activeIndex": t.detail.e,
            commingClassificationId: t.detail.a
        }, function() {
            this.$data.stickyFlag && a.$data.scrollTop != a.$data.stickyTop + 5 && wx.pageScrollTo({
                scrollTop: a.$data.stickyTop + 5,
                duration: 0
            }), a.getCommingList();
        });
    },
    tabSwitch: function(t) {
        var a = this, e = 1 * t.currentTarget.dataset.idx;
        this.setData({
            tabIdx: e
        }, function() {
            1 == e && (a.$data.stickyFlag && a.$data.scrollTop != a.$data.stickyTop + 5 && wx.pageScrollTo({
                scrollTop: a.$data.stickyTop + 5,
                duration: 0
            }), 1 == a.tpage && a.getCommingList());
        });
    },
    getCommingList: function() {
        this.data.commigLoadMore && wx.showLoading();
        var t = wx.getStorageSync("token"), e = this, a = wx.getStorageSync("community"), o = this.data.commingClassificationId || 0;
        e.$data.isLoadData = !0, e.$data.hasCommingGoods ? (e.$data.hasCommingGoods = !1, 
        e.setData({
            commigLoadMore: !0
        }), app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "index.load_comming_goodslist",
                token: t,
                pageNum: e.tpage,
                head_id: a.communityId,
                gid: o
            },
            dataType: "json",
            success: function(t) {
                if (wx.hideLoading(), 0 == t.data.code) {
                    var a = t.data.list;
                    a = e.data.commingList.concat(a), e.$data.hasCommingGoods = !0, e.tpage += 1, e.setData({
                        commingList: a,
                        commigLoadMore: !1,
                        commigTip: ""
                    }, function() {
                        e.getScrollHeight();
                    });
                } else 1 == t.data.code ? (1 == e.tpage && 0 == e.data.commingList.length && e.setData({
                    showCommingEmpty: !0
                }), e.setData({
                    commigLoadMore: !1,
                    commigTip: "^_^已经到底了"
                })) : 2 == t.data.code && e.setData({
                    needAuth: !0,
                    couponRefresh: !1
                });
                e.$data.isLoadData = !1;
            }
        })) : (e.$data.isLoadData = !1, !e.data.commigLoadMore && wx.hideLoading());
    },
    openSku: function(t) {
        if (this.authModal()) {
            var a = t.detail, e = a.actId, o = a.skuList;
            this.setData({
                addCar_goodsid: e
            });
            var i = o.list || [], s = [];
            if (0 < i.length) {
                for (var n = 0; n < i.length; n++) {
                    var d = i[n].option_value[0], c = {
                        name: d.name,
                        id: d.option_value_id,
                        index: n,
                        idx: 0
                    };
                    s.push(c);
                }
                for (var r = "", l = 0; l < s.length; l++) l == s.length - 1 ? r += s[l].id : r = r + s[l].id + "_";
                var u = o.sku_mu_list[r];
                this.setData({
                    sku: s,
                    sku_val: 1,
                    cur_sku_arr: u,
                    skuList: a.skuList,
                    visible: !0,
                    showSku: !0
                });
            } else {
                var h = a.allData;
                this.setData({
                    sku: [],
                    sku_val: 1,
                    skuList: [],
                    cur_sku_arr: h
                });
                var m = {
                    detail: {
                        formId: ""
                    }
                };
                m.detail.formId = "the formId is a mock one", this.gocarfrom(m);
            }
        }
    },
    focus: function() {
        this.data.focusFlag = !0;
    },
    canBuyFn: function(a, e) {
        var o = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : {}, i = this.data.skuList[e].canBuyNum - a, s = {
            value: a
        };
        i <= 10 && (s.canBuyMsg = "还可以购买 " + i + " 件"), this.data.canBuyMsg && 10 < i && (s.canBuyMsg = ""), 
        this.setData(t({}, s, o));
    },
    changeNumber: function(t) {
        var a = t.detail;
        this.data.focusFlag = !1, a && this.canBuyFn(a.value, this.data.current);
    },
    goOrder: function() {
        var o = this;
        o.data.can_car && (o.data.can_car = !1);
        var t = wx.getStorageSync("token"), a = wx.getStorageSync("community"), e = o.data.addCar_goodsid, i = a.communityId, s = o.data.sku_val, n = o.data.cur_sku_arr, d = "";
        n && n.option_item_ids && (d = n.option_item_ids), app.util.request({
            url: "entry/wxapp/user",
            data: {
                controller: "car.add",
                token: t,
                goods_id: e,
                community_id: i,
                quantity: s,
                sku_str: d,
                buy_type: "dan",
                pin_id: 0,
                is_just_addcar: 1
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
                    var a = t.data.max_quantity || "";
                    0 < a && o.setData({
                        sku_val: a
                    });
                    var e = t.data.msg;
                    wx.showToast({
                        title: e,
                        icon: "none",
                        duration: 2e3
                    });
                } else {
                    o.closeSku(), (0, status.cartNum)(t.data.total), o.setData({
                        cartNum: t.data.total
                    }), wx.showToast({
                        title: "已加入购物车",
                        image: "../../images/addShopCart.png"
                    });
                }
            }
        });
    },
    gocarfrom: function(t) {
        wx.showLoading(), a.collectFormIds(t.detail.formId), this.goOrder();
    },
    closeSku: function() {
        this.setData({
            visible: 0,
            stopClick: !1
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
    setNum: function(t) {
        var a = t.currentTarget.dataset.type, e = 1, o = 1 * this.data.sku_val;
        "add" == a ? e = o + 1 : "decrease" == a && 1 < o && (e = o - 1);
        var i = this.data.sku, s = this.data.skuList;
        if (0 < i.length) for (var n = "", d = 0; d < i.length; d++) d == i.length - 1 ? n += i[d].id : n = n + i[d].id + "_";
        0 < s.length ? e > s.sku_mu_list[n].canBuyNum && (e -= 1) : e > this.data.cur_sku_arr.canBuyNum && (e -= 1);
        this.setData({
            sku_val: e
        });
    },
    skuConfirm: function() {
        this.closeSku(), (0, status.cartNum)().then(function(t) {
            0 == t.code && that.setData({
                cartNum: t.data
            });
        });
    },
    backTop: function() {
        this.stickyFlag = !1, wx.pageScrollTo({
            scrollTop: 0
        });
    },
    goLink: function(t) {
        var a = t.currentTarget.dataset.link;
        a && wx.navigateTo({
            url: a
        });
    },
    getNavigat: function() {
        var e = this;
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "index.get_navigat"
            },
            dataType: "json",
            success: function(t) {
                if (0 == t.data.code) {
                    var a = t.data.data || [];
                    e.setData({
                        navigat: a
                    });
                }
            }
        });
    },
    goNavUrl: function(t) {
        var a = t.currentTarget.dataset.idx, e = this.data, o = e.navigat, i = e.needAuth;
        if (0 < o.length) {
            var s = o[a].link, n = o[a].type;
            if (util.checkRedirectTo(s, i)) return void this.authModal();
            if (0 == n) wx.navigateTo({
                url: "/lionfish_comshop/pages/web-view?url=" + encodeURIComponent(s)
            }); else if (1 == n) -1 != s.indexOf("lionfish_comshop/pages/index/index") || -1 != s.indexOf("lionfish_comshop/pages/order/shopCart") || -1 != s.indexOf("lionfish_comshop/pages/user/me") || -1 != s.indexOf("lionfish_comshop/pages/type/index") ? wx.switchTab({
                url: s
            }) : wx.navigateTo({
                url: s
            }); else if (2 == n) {
                o[a].appid && wx.navigateToMiniProgram({
                    appId: o[a].appid,
                    path: s,
                    extraData: {},
                    envVersion: "release",
                    success: function(t) {},
                    fail: function(t) {
                        console.log(t);
                    }
                });
            } else if (3 == n) {
                var d = this.data.classification, c = d && d.tabs, r = s, l = c.findIndex(function(t) {
                    return t.id == r;
                });
                if (-1 != l) {
                    var u = {
                        detail: {
                            e: l,
                            a: r
                        }
                    };
                    this.classificationChange(u);
                }
            } else 4 == n && (app.globalData.typeCateId = s, wx.switchTab({
                url: "/lionfish_comshop/pages/type/index"
            }));
        }
    },
    goBannerUrl: function(t) {
        var a = t.currentTarget.dataset.idx, e = this.data, o = e.slider_list, i = e.needAuth;
        if (0 < o.length) {
            var s = o[a].link, n = o[a].linktype;
            if (util.checkRedirectTo(s, i)) return void this.authModal();
            if (0 == n) s && wx.navigateTo({
                url: "/lionfish_comshop/pages/web-view?url=" + encodeURIComponent(s)
            }); else if (1 == n) -1 != s.indexOf("lionfish_comshop/pages/index/index") || -1 != s.indexOf("lionfish_comshop/pages/order/shopCart") || -1 != s.indexOf("lionfish_comshop/pages/user/me") || -1 != s.indexOf("lionfish_comshop/pages/type/index") ? s && wx.switchTab({
                url: s
            }) : s && wx.navigateTo({
                url: s
            }); else if (2 == n) {
                o[a].appid && wx.navigateToMiniProgram({
                    appId: o[a].appid,
                    path: s,
                    extraData: {},
                    envVersion: "release",
                    success: function(t) {},
                    fail: function(t) {
                        console.log(t);
                    }
                });
            }
        }
    },
    onPullDownRefresh: function() {
        var t = this;
        this.setData({
            couponRefresh: !1,
            newComerRefresh: !1
        }), this.tpage = 1, this.$data = _extends({}, this.$data, {
            overPageNum: 1,
            loadOver: !1,
            hasOverGoods: !1,
            countDownMap: {},
            actEndMap: {},
            timer: {},
            stickyFlag: !1,
            hasCommingGoods: !0
        }), this.hasRefeshin = !1, this.setData({
            rushList: [],
            commingList: [],
            tabIdx: 0,
            pageNum: 1,
            couponRefresh: !0,
            newComerRefresh: !0
        }, function() {
            t.loadPage();
        }), wx.stopPullDownRefresh();
    },
    onReachBottom: function(t) {
        0 == this.data.tabIdx ? this.load_goods_data() : this.getCommingList();
    },
    getCommunityPos: function(t) {
        var a = this;
        app.util.request({
            url: "entry/wxapp/user",
            data: {
                controller: "index.get_community_position",
                communityId: t
            },
            dataType: "json",
            method: "POST",
            success: function(t) {
                0 == t.data.code && (a.postion = t.data.postion);
            }
        });
    },
    gotoMap: function() {
        var t = this.data.community, a = this.postion || {
            lat: 0,
            lon: 0
        }, e = parseFloat(a.lon), o = parseFloat(a.lat), i = t.disUserName, s = t.fullAddress + "(" + t.communityName + ")";
        wx.openLocation({
            latitude: o,
            longitude: e,
            name: i,
            address: s,
            scale: 28
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
    goResult: function(t) {
        var a = t.detail.value.replace(/\s+/g, "");
        a ? wx.navigateTo({
            url: "/lionfish_comshop/pages/type/result?keyword=" + a
        }) : wx.showToast({
            title: "请输入关键词",
            icon: "none"
        });
    },
    toggleCoupon: function() {
        this.setData({
            showCouponModal: !this.data.showCouponModal,
            hasAlertCoupon: !1
        });
    },
    changeCartNum: function(t) {
        var a = t.detail;
        (0, status.cartNum)(this.setData({
            cartNum: a
        }));
    },
    copyText: function(t) {
        var a = this.data.copy_text_arr, e = this.data.community, o = "-团长信息-\r\n小区：" + e.communityName + "\r\n团长：" + e.disUserName + "\r\n自提点：" + (e.address || e.communityAddress || e.fullAddress) + "\r\n\r\n今日推荐\r\n";
        a.length && a.forEach(function(t, a) {
            o += a + 1 + ".【" + t.goods_name + "】  团购价" + t.price + "\r\n", o += "~~~~~~~~~~~~~~~~~~~~\r\n";
        });
        var i = this;
        wx.setClipboardData({
            data: o,
            success: function(t) {
                wx.getClipboardData({
                    success: function(t) {
                        i.setData({
                            showCopyText: !1
                        }), wx.showToast({
                            title: "复制成功"
                        });
                    }
                });
            }
        });
    },
    showCopyTextHandle: function(t) {
        var a = t.currentTarget.dataset.status;
        this.setData({
            showCopyText: a
        });
    },
    getCoupon: function() {
        var n = this, t = wx.getStorageSync("token");
        t && app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "goods.get_seller_quan",
                token: t
            },
            dataType: "json",
            success: function(t) {
                var a = t.data.quan_list, e = !1, o = !1;
                "[object Object]" == Object.prototype.toString.call(a) && 0 < Object.keys(a).length && (e = !0), 
                "[object Array]" == Object.prototype.toString.call(a) && 0 < a.length && (e = !0);
                var i = t.data.alert_quan_list || [];
                "[object Object]" == Object.prototype.toString.call(i) && 0 < Object.keys(i).length && (o = !0), 
                "[object Array]" == Object.prototype.toString.call(i) && 0 < i.length && (o = !0);
                var s = 0;
                "[object Object]" == Object.prototype.toString.call(i) && 0 < Object.keys(i).length ? Object.keys(i).forEach(function(t) {
                    s += 1 * i[t].credit;
                }) : "[object Array]" == Object.prototype.toString.call(i) && 0 < i.length && i.forEach(function(t) {
                    s += 1 * t.credit;
                }), n.setData({
                    quan: t.data.quan_list || [],
                    alert_quan_list: i,
                    hasCoupon: e,
                    hasAlertCoupon: o,
                    showCouponModal: o,
                    totalAlertMoney: s.toFixed(2)
                });
            }
        });
    },
    receiveCoupon: function(t) {
        if (this.authModal()) {
            var o = t.currentTarget.dataset.quan_id, i = t.currentTarget.dataset.type || 0, a = wx.getStorageSync("token"), s = [];
            s = 1 == i ? this.data.alert_quan_list : this.data.quan;
            var n = this;
            app.util.request({
                url: "entry/wxapp/index",
                data: {
                    controller: "goods.getQuan",
                    token: a,
                    quan_id: o
                },
                dataType: "json",
                success: function(t) {
                    if (0 == t.data.code) wx.showToast({
                        title: t.data.msg || "被抢光了",
                        icon: "none"
                    }); else if (1 == t.data.code) wx.showToast({
                        title: "被抢光了",
                        icon: "none"
                    }); else if (2 == t.data.code) {
                        wx.showToast({
                            title: "已领取",
                            icon: "none"
                        });
                        var a = [];
                        for (var e in s) s[e].id == o && (s[e].is_get = 1), a.push(s[e]);
                        n.setData({
                            quan: a
                        });
                    } else if (4 == t.data.code) wx.showToast({
                        title: "新人专享",
                        icon: "none"
                    }); else if (3 == t.data.code) {
                        a = [];
                        for (var e in s) s[e].id == o && (s[e].is_get = 1), a.push(s[e]);
                        1 == i ? n.setData({
                            alert_quan_list: a
                        }) : n.setData({
                            quan: a
                        }), wx.showToast({
                            title: "领取成功"
                        });
                    } else t.data.code;
                }
            });
        }
    },
    goUse: function(t) {
        this.setData({
            showCouponModal: !1,
            hasAlertCoupon: !1
        });
        var a = t.currentTarget.dataset.idx, e = this.data.alert_quan_list || [];
        if (console.log(Object.keys(e).length), Object.keys(e).length >= a) if (0 == e[a].is_limit_goods_buy) wx.switchTab({
            url: "/lionfish_comshop/pages/index/index"
        }); else if (1 == e[a].is_limit_goods_buy) {
            var o = e[a].limit_goods_list, i = "";
            i = 1 < o.split(",").length ? "/lionfish_comshop/pages/type/result?type=2&good_ids=" + o : "/lionfish_comshop/pages/goods/goodsDetail?id=" + o, 
            wx.navigateTo({
                url: i
            });
        } else if (2 == e[a].is_limit_goods_buy) {
            var s = e[a].goodscates || 0;
            wx.navigateTo({
                url: "/lionfish_comshop/pages/type/result?type=1&gid=" + s
            });
        }
    },
    get_type_topic: function() {
        var e = this;
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "goods.get_category_col_list"
            },
            dataType: "json",
            success: function(t) {
                if (0 == t.data.code) {
                    var a = t.data.data || [];
                    e.setData({
                        typeTopicList: a
                    });
                }
            }
        });
    },
    getPinList: function() {
        var n = this;
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "group.get_pintuan_list",
                is_index: 1
            },
            dataType: "json",
            success: function(t) {
                if (0 == t.data.code) {
                    var a = {}, e = t.data, o = e.list, i = e.pintuan_index_coming_img, s = e.pintuan_index_show;
                    a.list = o || [], a.img = i || "", a.show = s || 0, n.setData({
                        pinList: a
                    });
                }
            }
        });
    },
    onShareAppMessage: function(t) {
        this.setData({
            is_share_html: !0
        });
        var a = wx.getStorageSync("community").communityId, e = wx.getStorageSync("member_id");
        return console.log("首页分享地址："), console.log(a, e), {
            title: this.data.shop_info.title,
            path: "lionfish_comshop/pages/index/index?community_id=" + a + "&share_id=" + e,
            imageUrl: this.data.shop_info.shop_index_share_image,
            success: function() {},
            fail: function() {}
        };
    }
}));