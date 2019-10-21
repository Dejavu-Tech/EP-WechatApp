var app = getApp(), wcache = require("../../utils/wcache.js");

Component({
    properties: {
        currentIdx: {
            type: Number,
            value: 0,
            observer: function(t) {
                if (t) {
                    var e = this.data.tabbar;
                    for (var a in e.list) e.list[a].selected = !1, a == t && (e.list[a].selected = !0);
                    this.setData({
                        tabbar: e
                    });
                }
            }
        },
        cartNum: {
            type: Number,
            value: 0
        },
        tabbarRefresh: {
            type: Boolean,
            value: !1,
            observer: function(t) {
                t && this.getTabbar();
            }
        }
    },
    attached: function() {
        var t = wx.getSystemInfoSync().model;
        (-1 < t.indexOf("iPhone X") || -1 < t.indexOf("unknown<iPhone")) && this.setData({
            isIpx: !0
        }), this.getTabbar();
    },
    data: {
        isIpx: !1,
        tabbar: {
            backgroundColor: "#fff",
            color: "#707070",
            selectedColor: "#ff5344",
            list: [ {
                pagePath: "/lionfish_comshop/pages/index/index",
                text: "",
                iconPath: "",
                selectedIconPath: "",
                selected: !0
            }, {
                pagePath: "/lionfish_comshop/pages/type/index",
                text: "",
                iconPath: "",
                selectedIconPath: "",
                selected: !1
            }, {
                pagePath: "",
                text: "",
                iconPath: "",
                selectedIconPath: "",
                selected: !1
            }, {
                pagePath: "/lionfish_comshop/pages/order/shopCart",
                text: "",
                iconPath: "",
                selectedIconPath: "",
                selected: !1
            }, {
                pagePath: "/lionfish_comshop/pages/user/me",
                text: "",
                iconPath: "",
                selectedIconPath: "",
                selected: !1
            } ]
        },
        open_tabbar_type: 0,
        open_tabbar_out_weapp: 0,
        cartNum: 0,
        tabbar_out_appid: "",
        tabbar_out_link: "",
        tabbar_out_type: 0
    },
    methods: {
        getTabbar: function() {
            var r = this;
            app.util.request({
                url: "entry/wxapp/index",
                data: {
                    controller: "index.get_tabbar"
                },
                dataType: "json",
                success: function(t) {
                    if (0 == t.data.code) {
                        var e = t.data.data, a = r.data.tabbar;
                        a.list[0].text = e.t1 || "首页", a.list[0].iconPath = e.i1 || "/lionfish_comshop/images/icon-tab-index.png", 
                        a.list[0].selectedIconPath = e.s1 || "/lionfish_comshop/images/icon-tab-index-active.png", 
                        a.list[1].text = e.t4 || "分类", a.list[1].iconPath = e.i4 || "/lionfish_comshop/images/icon-tab-type.png", 
                        a.list[1].selectedIconPath = e.s4 || "/lionfish_comshop/images/icon-tab-type-active.png", 
                        a.list[2].text = e.t5, a.list[2].iconPath = e.i5, a.list[2].selectedIconPath = e.s5, 
                        a.list[3].text = e.t2 || "购物车", a.list[3].iconPath = e.i2 || "/lionfish_comshop/images/icon-tab-shop.png", 
                        a.list[3].selectedIconPath = e.s2 || "/lionfish_comshop/images/icon-tab-shop-active.png", 
                        a.list[4].text = e.t3 || "我的", a.list[4].iconPath = e.i3 || "/lionfish_comshop/images/icon-tab-me.png", 
                        a.list[4].selectedIconPath = e.s3 || "/lionfish_comshop/images/icon-tab-me-active.png";
                        var s = t.data.open_tabbar_type || 0, i = t.data.open_tabbar_out_weapp || 0, o = t.data.tabbar_out_appid, n = t.data.tabbar_out_link, p = t.data.tabbar_out_type;
                        a.selectedColor = t.data.wepro_tabbar_selectedColor || "#F75451", r.setData({
                            tabbar: a,
                            open_tabbar_type: s,
                            open_tabbar_out_weapp: i,
                            tabbar_out_appid: o,
                            tabbar_out_link: n,
                            tabbar_out_type: p
                        });
                    } else r.setData({
                        hideTabbar: !0
                    });
                }
            });
        },
        goWeapp: function() {
            var t = this.data.tabbar_out_appid, e = this.data.tabbar_out_link, a = this.data.tabbar_out_type;
            0 == a ? wx.navigateTo({
                url: "/lionfish_comshop/pages/web-view?url=" + encodeURIComponent(e)
            }) : 1 == a ? -1 != e.indexOf("lionfish_comshop/pages/index/index") || -1 != e.indexOf("lionfish_comshop/pages/order/shopCart") || -1 != e.indexOf("lionfish_comshop/pages/user/me") || -1 != e.indexOf("lionfish_comshop/pages/type/index") ? wx.switchTab({
                url: e
            }) : wx.navigateTo({
                url: e
            }) : 2 == a && t && wx.navigateToMiniProgram({
                appId: t,
                path: e,
                extraData: {},
                envVersion: "release",
                success: function(t) {
                    console.log(t);
                }
            });
        }
    }
});