var _data;

function _defineProperty(t, e, a) {
    return e in t ? Object.defineProperty(t, e, {
        value: a,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : t[e] = a, t;
}

var app = getApp();

Page({
    data: (_data = {
        currentTab: 0,
        pageSize: 10,
        navList: [ {
            name: "全部",
            status: "0"
        }, {
            name: "待确认",
            status: "1"
        }, {
            name: "已确认",
            status: "2"
        }, {
            name: "无效",
            status: "3"
        } ],
        distributionList: [],
        loadText: "没有更多记录了~",
        containerHeight: 0,
        chooseDate: "",
        chooseDateTime: "",
        data: "",
        estimate: "",
        permoney: 0,
        communnityId: ""
    }, _defineProperty(_data, "loadText", ""), _defineProperty(_data, "disUserId", ""), 
    _defineProperty(_data, "no_order", 0), _defineProperty(_data, "page", 1), _defineProperty(_data, "hide_tip", !0), 
    _defineProperty(_data, "order", []), _defineProperty(_data, "tip", "正在加载"), _data),
    onLoad: function(t) {
        var e = wx.getSystemInfoSync();
        this.setData({
            containerHeight: e.windowHeight - Math.round(e.windowHeight / 375 * 55)
        });
    },
    onReady: function() {},
    onShow: function() {
        var t = new Date(), e = t.getFullYear(), a = t.getMonth() + 1, o = Date.parse(t);
        this.setData({
            page: 1,
            order: [],
            chooseDate: e + "年" + a + "月",
            chooseDateTime: o
        }), this.getData(), this.get_month_money();
    },
    get_month_money: function() {
        var t = this.data.chooseDate, e = this, a = wx.getStorageSync("token");
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "order.order_commission",
                token: a,
                chooseDate: t
            },
            method: "post",
            dataType: "json",
            success: function(t) {
                0 == t.data.code ? e.setData({
                    permoney: t.data.money
                }) : e.setData({
                    permoney: 0
                });
            }
        });
    },
    getData: function() {
        wx.showLoading({
            title: "加载中...",
            mask: !0
        }), this.setData({
            isHideLoadMore: !0
        }), this.data.no_order = 1;
        var o = this, t = this.data.chooseDate, e = wx.getStorageSync("token"), a = this.data.currentTab, n = -1;
        0 == a ? n = -1 : 1 == a ? n = 22 : 2 == a ? n = 6 : 3 == a && (n = 357), app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "order.orderlist",
                is_tuanz: 1,
                token: e,
                chooseDate: t,
                page: o.data.page,
                order_status: n
            },
            method: "post",
            dataType: "json",
            success: function(t) {
                if (0 != t.data.code) return o.setData({
                    isHideLoadMore: !0
                }), wx.hideLoading(), !1;
                console.log(o.data.page);
                var e = t.data.data, a = o.data.order.concat(e);
                o.setData({
                    order: a,
                    hide_tip: !0,
                    no_order: 0
                }), wx.hideLoading();
            }
        });
    },
    refresh: function() {
        var t = this;
        this.setData({
            page: 1,
            order: []
        }, function() {
            t.getData();
        });
    },
    onHide: function() {},
    bindChange: function(t) {
        var e = this;
        this.setData({
            currentTab: 1 * t.detail.current
        }), this.setData({
            order: [],
            page: 1,
            no_order: 0
        }, function() {
            console.log("我变啦"), e.getData();
        });
    },
    switchNav: function(t) {
        if (this.data.currentTab === 1 * t.target.dataset.current) return !1;
        this.setData({
            currentTab: 1 * t.target.dataset.current
        });
    },
    onUnload: function() {},
    onPullDownRefresh: function() {
        this.getData();
    },
    bindDateChange: function(t) {
        console.log("picker发送选择改变，携带值为", t.detail.value), this.setData({
            date: t.detail.value
        });
        var e = this.data.date.split("-"), a = Date.parse(this.data.date);
        this.setData({
            chooseDate: e[0] + "年" + e[1] + "月",
            chooseDateTime: a,
            order: [],
            page: 1,
            no_order: 0
        }), this.getData(), this.get_month_money();
    },
    getCurrentList: function() {
        if (console.log(this.data.no_order), 1 == this.data.no_order) return !1;
        this.data.page += 1, this.getData(), this.setData({
            isHideLoadMore: !1
        });
    },
    onReachBottom: function() {
        if (console.log(this.data.no_order), 1 == this.data.no_order) return !1;
        this.data.page += 1, this.getData(), this.setData({
            isHideLoadMore: !1
        });
    },
    onShareAppMessage: function() {}
});