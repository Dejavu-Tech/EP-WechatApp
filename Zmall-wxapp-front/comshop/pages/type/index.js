var _extends = Object.assign || function(t) {
    for (var a = 1; a < arguments.length; a++) {
        var e = arguments[a];
        for (var o in e) Object.prototype.hasOwnProperty.call(e, o) && (t[o] = e[o]);
    }
    return t;
}, app = getApp(), a = require("../../utils/public"), status = require("../../utils/index.js"), util = require("../../utils/util.js"), wcache = require("../../utils/wcache.js");

Page({
    data: {
        cartNum: 0,
        rushCategoryData: {
            tabs: [],
            activeIndex: 0
        },
        rushList: [],
        categoryScrollBarTop: 0,
        resetScrollBarTop: 50,
        loadMore: !0,
        loadText: "加载中...",
        scrollViewHeight: 0,
        isFirstCategory: !0,
        isLastCategory: !1,
        pageEmpty: !1,
        active_sub_index: 0,
        needPosition: !0
    },
    $data: {
        options: {},
        rushCategoryId: "",
        pageNum: 1,
        actIds: [],
        loading: !0,
        isScrollTop: !0,
        isScrollBottom: !1,
        scrollInfo: null,
        isSetCategoryScrollBarTop: !0,
        touchStartPos: {
            pageX: 0,
            pageY: 0
        }
    },
    isFirst: 0,
    onLoad: function(o) {
        wx.showLoading(), wx.hideTabBar(), status.setNavBgColor();
        var t = app.globalData.isIpx, s = this;
        if (this.getScrollViewHeight(), this.setData({
            subCateHeight: this.getPx(44),
            isIpx: !!t
        }), console.log("options", o), o && 0 != Object.keys(o).length) {
            var i = wx.getStorageSync("community").communityId || "";
            "undefined" != (s.$data.options = o).share_id && 0 < o.share_id && wcache.put("share_id", o.share_id), 
            "undefined" != o.community_id && 0 < o.community_id && app.util.request({
                url: "entry/wxapp/index",
                data: {
                    controller: "index.get_community_info",
                    community_id: o.community_id
                },
                dataType: "json",
                success: function(t) {
                    var a = wx.getStorageSync("token");
                    if (0 == t.data.code) {
                        var e = t.data.data;
                        o.community_id != i && ("" == i ? (wcache.put("community", e), s.setData({
                            needPosition: !1
                        })) : s.setData({
                            showChangeCommunity: !0,
                            changeCommunity: e
                        }));
                    }
                    a && s.addhistory();
                }
            });
        }
        this.$data.rushCategoryId = app.globalData.typeCateId || 0, app.globalData.typeCateId = 0, 
        this.get_cate_list();
    },
    onShow: function() {
        var n = this;
        n.setData({
            tabbarRefresh: !0
        }), util.check_login_new().then(function(t) {
            if (t) {
                if ((0, status.cartNum)("", !0).then(function(t) {
                    0 == t.code && n.setData({
                        cartNum: t.data
                    });
                }), 1 <= n.isFirst) {
                    var a = app.globalData.goodsListCarCount, o = n.data.rushList;
                    if (0 < a.length && 0 < o.length) {
                        var s = !1;
                        a.forEach(function(a) {
                            var t = o.findIndex(function(t) {
                                return t.actId == a.actId;
                            });
                            if (-1 != t && 0 === o[t].skuList.length) {
                                var e = 1 * a.num;
                                o[t].car_count = 0 <= e ? e : 0, s = !0;
                            }
                        }), n.setData({
                            rushList: o,
                            changeCarCount: s
                        });
                    }
                    if (n.$data.rushCategoryId = app.globalData.typeCateId || 0, app.globalData.typeCateId = 0, 
                    n.$data.rushCategoryId) {
                        var e = n.data.rushCategoryData, i = e.tabs, r = n.$data.rushCategoryId;
                        e.activeIndex = i.findIndex(function(t) {
                            return t.id == r;
                        }) || 0, n.setData({
                            rushCategoryData: e
                        }, function() {
                            n.setCategory(e.activeIndex);
                        });
                    }
                }
            } else n.setData({
                needAuth: !0
            });
        }), n.isFirst++;
    },
    authSuccess: function() {
        this.$data = _extends({}, this.$data, {
            options: {},
            rushCategoryId: "",
            pageNum: 1,
            actIds: [],
            loading: !0,
            isScrollTop: !0,
            isScrollBottom: !1,
            scrollInfo: null,
            isSetCategoryScrollBarTop: !0,
            touchStartPos: {
                pageX: 0,
                pageY: 0
            }
        });
        var t = this;
        this.setData({
            needAuth: !1,
            showAuthModal: !1,
            rushList: [],
            categoryScrollBarTop: 0,
            resetScrollBarTop: 50,
            loadMore: !0,
            loadText: "加载中...",
            isFirstCategory: !0,
            isLastCategory: !1,
            pageEmpty: !1,
            active_sub_index: 0
        }, function() {
            t.get_cate_list();
        });
    },
    authModal: function() {
        this.data.needAuth && this.setData({
            showAuthModal: !this.data.showAuthModal
        });
    },
    confrimChangeCommunity: function() {
        var t = this, a = this.data.changeCommunity;
        app.globalData.community = a, wcache.put("community", a), this.setData({
            showChangeCommunity: !1,
            needPosition: !1
        }, function() {
            t.addhistory();
        });
    },
    closeChangeCommunity: function() {
        this.setData({
            showChangeCommunity: !1
        });
    },
    goSelectCommunity: function() {
        wx.redirectTo({
            url: "/lionfish_comshop/pages/position/community"
        });
    },
    addhistory: function() {
        var a = 0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : 0, t = 0;
        0 == a ? t = wx.getStorageSync("community").communityId || "" : t = a;
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
    getHistoryCommunity: function() {
        var s = this, t = wx.getStorageSync("token");
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "index.load_history_community",
                token: t
            },
            dataType: "json",
            success: function(t) {
                if (0 == t.data.code) {
                    console.log("getHistoryCommunity");
                    var a = t.data.list;
                    0 != Object.keys(a).length && 0 != a.communityId || !0;
                    var e = a && a.fullAddress && a.fullAddress.split("省");
                    a = Object.assign({}, a, {
                        address: e[1]
                    }), wcache.put("community", a), app.globalData.community = a;
                } else {
                    var o = s.options;
                    void 0 !== o && o.community_id && (console.log("新人加入分享进来的社区id:", s.options), s.addhistory(o.community_id));
                }
            }
        });
    },
    onPullDownRefresh: function() {
        this.initPageData();
    },
    initPageData: function() {
        var t = this;
        this.setData({
            isFirstCategory: !0,
            isLastCategory: !1,
            rushList: [],
            resetScrollBarTop: 50
        }, function() {
            t.getHotList();
        });
    },
    scrollBottom: function() {
        var t = this.$data.loading;
        this.data.canNext;
        t || (this.$data.loading = !0, this.getHotList());
    },
    touchstart: function(t) {
        if (t.changedTouches && t.changedTouches[0]) {
            var a = t.changedTouches[0], e = a.pageX, o = a.pageY;
            this.$data.touchStartPos = {
                pageX: e,
                pageY: o
            };
        }
    },
    touchend: function(t) {
        var a = this;
        if (t.changedTouches && t.changedTouches[0]) {
            var e = t.changedTouches[0], o = e.pageX, s = e.pageY, i = this.$data.touchStartPos, r = i.pageX, n = i.pageY, d = this.$data, u = d.isScrollTop, c = d.isScrollBottom, l = d.scrollInfo, h = (this.data.rushCategoryData, 
            o - r), g = s - n;
            if (Math.abs(g) > Math.abs(h)) if (0 < g) {
                if (!u) return;
                if (this.setData({
                    resetScrollBarTop: 50
                }), 50 < g) {
                    var p = this.data.rushCategoryData.activeIndex - 1;
                    if (p < 0) return;
                    this.setData({
                        resetScrollBarTop: 50
                    }, function() {
                        a.setCategory(p);
                    });
                }
            } else {
                if (!c || !this.data.canNext) return;
                if (g < -50) {
                    var y = this.data.rushCategoryData, m = y.activeIndex + 1;
                    if (m >= y.tabs.length || !this.$data.scrollInfo) return;
                    this.setData({
                        resetScrollBarTop: l.scrollTop
                    }, function() {
                        a.setCategory(m);
                    });
                }
            } else l && l.scrollTop < 50 && this.setData({
                resetScrollBarTop: 50
            });
        }
    },
    scroll: function(t) {
        var a = t.detail, e = a.scrollTop, o = a.scrollHeight, s = this.data, i = s.scrollViewHeight, r = s.loadMore;
        this.$data.scrollInfo = a, this.$data.isScrollTop = e <= 49, this.$data.isScrollBottom = !r && o - e - i <= 10;
    },
    getScrollViewHeight: function() {
        var a = this;
        wx.createSelectorQuery().select(".search-bar").boundingClientRect(function(t) {
            t.height && a.setData({
                scrollViewHeight: wx.getSystemInfoSync().windowHeight - t.height
            });
        }).exec();
    },
    changeCategory: function(t) {
        var a = t.currentTarget.dataset.index;
        console.log(a), a !== this.data.rushCategoryData.activeIndex && this.setCategory(a);
    },
    setCategory: function(t) {
        var a = this, e = this.data.rushCategoryData, o = e.tabs[t] || {}, s = this.data.scrollViewHeight;
        this.$data.rushCategoryId = o.id || null, this.$data.pageNum = 1, this.$data.isSetCategoryScrollBarTop = !1;
        var i = !t, r = t == e.tabs.length - 1;
        this.setData({
            "rushCategoryData.activeIndex": t,
            resetScrollBarTop: 50,
            categoryScrollBarTop: 50 * t - (s - 50) / 2,
            rushList: [],
            canNext: !1,
            isFirstCategory: i,
            isLastCategory: r,
            active_sub_index: 0,
            showDrop: !1
        }, function() {
            a.getHotList();
        });
    },
    getHotList: function() {
        var a = this, e = this.$data.rushCategoryId;
        this.$data.loading = !0, this.reqPromise().then(function() {
            wx.stopPullDownRefresh();
        }).catch(function() {
            var t = {};
            e || (t.pageEmpty = !0), a.$data.loading = !1, a.setData(t), wx.stopPullDownRefresh();
        });
    },
    reqPromise: function() {
        var n = this;
        return new Promise(function(i, t) {
            var a = wx.getStorageSync("token"), e = wx.getStorageSync("community"), r = n.$data.rushCategoryId;
            app.util.request({
                url: "entry/wxapp/index",
                data: {
                    controller: "index.load_gps_goodslist",
                    token: a,
                    pageNum: n.$data.pageNum,
                    head_id: e.communityId,
                    gid: r,
                    per_page: 50
                },
                dataType: "json",
                success: function(t) {
                    if (0 == t.data.code) {
                        var a = n.data.rushList.concat(t.data.list), e = {
                            full_money: t.data.full_money,
                            full_reducemoney: t.data.full_reducemoney,
                            is_open_fullreduction: t.data.is_open_fullreduction
                        }, o = {
                            rushList: a,
                            pageEmpty: !1,
                            cur_time: t.data.cur_time,
                            reduction: e,
                            rushCategoryData: n.data.rushCategoryData
                        };
                        1 == n.$data.pageNum && (o.resetScrollBarTop = 51), o.loadText = n.data.loadMore ? "加载中..." : "没有更多商品了~", 
                        n.$data.isSetCategoryScrollBarTop && (o.categoryScrollBarTop = 50 * o.rushCategoryData.activeIndex - (n.data.scrollViewHeight - 50) / 2), 
                        n.setData(o, function() {
                            n.$data.loading = !1, n.$data.pageNum += 1, !r && o.rushCategoryData.tabs && o.rushCategoryData.tabs[0] && (n.$data.rushCategoryId = o.rushCategoryData.tabs[0].id);
                        });
                    } else if (1 == t.data.code) {
                        var s = {
                            loadMore: !1,
                            canNext: !0
                        };
                        1 == n.$data.pageNum && (console.log("无数据"), s.pageEmpty = !0), n.setData(s);
                    } else 2 == t.data.code && n.setData({
                        needAuth: !0
                    });
                    i(t);
                }
            });
        });
    },
    getPx: function(t) {
        return Math.round(app.globalData.systemInfo.windowWidth / 375 * t);
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
    onHide: function() {
        this.setData({
            tabbarRefresh: !1,
            changeCarCount: !1
        });
    },
    showDrop: function() {
        this.setData({
            showDrop: !this.data.showDrop
        });
    },
    get_cate_list: function() {
        var n = this;
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "goods.get_category_list"
            },
            dataType: "json",
            success: function(t) {
                if (0 == t.data.code) {
                    var a = t.data.data || [], e = n.$data.rushCategoryId || a && a[0] && a[0].id || 0, o = 0;
                    n.$data.rushCategoryId && (o = a.findIndex(function(t) {
                        return t.id == n.$data.rushCategoryId;
                    })), n.$data.rushCategoryId = e;
                    var s = {
                        tabs: a,
                        activeIndex: o
                    }, i = !s.activeIndex, r = s.activeIndex == s.tabs.length - 1;
                    n.setData({
                        rushCategoryData: s,
                        isFirstCategory: i,
                        isLastCategory: r
                    }, function() {
                        n.initPageData(), wx.hideLoading();
                    });
                }
            }
        });
    },
    change_sub_cate: function(t) {
        var a = this.data.rushCategoryData, e = a.tabs, o = a.activeIndex, s = t.currentTarget.dataset.idx, i = e[o].id, r = (e[o].sub, 
        t.currentTarget.dataset.id || i), n = this.getPx(64) * s;
        console.log(n);
        var d = this;
        d.$data.pageNum = 1, d.$data.rushCategoryId = r, d.setData({
            showDrop: !1,
            active_cate_id: r,
            active_sub_index: s,
            rushList: [],
            scrollLeft: n,
            showEmpty: !1,
            loadMore: !0,
            loadText: "加载中",
            resetScrollBarTop: 50
        }, function() {
            d.getHotList();
        });
    },
    show_search: function() {
        wx.navigateTo({
            url: "/lionfish_comshop/pages/type/search"
        });
    },
    openSku: function(t) {
        var a = t.detail, e = a.actId, o = a.skuList;
        this.setData({
            addCar_goodsid: e
        });
        var s = o.list || [], i = [];
        if (0 < s.length) {
            for (var r = 0; r < s.length; r++) {
                var n = s[r].option_value[0], d = {
                    name: n.name,
                    id: n.option_value_id,
                    index: r,
                    idx: 0
                };
                i.push(d);
            }
            for (var u = "", c = 0; c < i.length; c++) c == i.length - 1 ? u += i[c].id : u = u + i[c].id + "_";
            var l = o.sku_mu_list[u];
            this.setData({
                sku: i,
                sku_val: 1,
                cur_sku_arr: l,
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
            var g = {
                detail: {
                    formId: ""
                }
            };
            g.detail.formId = "the formId is a mock one", this.gocarfrom(g);
        }
    },
    gocarfrom: function(t) {
        wx.showLoading(), a.collectFormIds(t.detail.formId), this.goOrder();
    },
    goOrder: function() {
        var o = this;
        o.data.can_car && (o.data.can_car = !1);
        var t = wx.getStorageSync("token"), a = wx.getStorageSync("community"), e = o.data.addCar_goodsid, s = a.communityId, i = o.data.sku_val, r = o.data.cur_sku_arr, n = "";
        r && r.option_item_ids && (n = r.option_item_ids), app.util.request({
            url: "entry/wxapp/user",
            data: {
                controller: "car.add",
                token: t,
                goods_id: e,
                community_id: s,
                quantity: i,
                sku_str: n,
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
                }); else if (4 == t.data.code) wx.showToast({
                    title: "您未登录",
                    duration: 2e3,
                    success: function() {
                        o.setData({
                            needAuth: !0
                        });
                    }
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
        var r = this.data.skuList.sku_mu_list[s];
        this.setData({
            cur_sku_arr: r
        }), console.log(s);
    },
    setNum: function(t) {
        var a = t.currentTarget.dataset.type, e = 1, o = 1 * this.data.sku_val;
        "add" == a ? e = o + 1 : "decrease" == a && 1 < ku_val && (e = o - 1);
        var s = this.data.sku, i = this.data.skuList;
        if (0 < s.length) for (var r = "", n = 0; n < s.length; n++) n == s.length - 1 ? r += s[n].id : r = r + s[n].id + "_";
        0 < i.length ? e > i.sku_mu_list[r].canBuyNum && (e -= 1) : e > this.data.cur_sku_arr.canBuyNum && (e -= 1);
        this.setData({
            sku_val: e
        });
    },
    closeSku: function() {
        this.setData({
            visible: 0,
            stopClick: !1
        });
    },
    changeCartNum: function(t) {
        var a = t.detail;
        (0, status.cartNum)(this.setData({
            cartNum: a
        }));
    },
    onShareAppMessage: function() {
        var t = wx.getStorageSync("community").communityId || "", a = wx.getStorageSync("member_id") || "";
        return console.log("lionfish_comshop/pages/type/index?community_id=" + t + "&share_id=" + a), 
        {
            path: "lionfish_comshop/pages/type/index?community_id=" + t + "&share_id=" + a,
            success: function() {},
            fail: function() {}
        };
    }
});