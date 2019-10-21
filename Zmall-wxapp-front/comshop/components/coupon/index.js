var app = getApp();

Component({
    properties: {
        couponRefresh: {
            type: Boolean,
            value: !1,
            observer: function(t) {
                t && this.getCoupon();
            }
        }
    },
    data: {
        quan: []
    },
    attached: function() {},
    methods: {
        getCoupon: function() {
            var o = this, t = wx.getStorageSync("token");
            app.util.request({
                url: "entry/wxapp/index",
                data: {
                    controller: "goods.get_seller_quan",
                    token: t
                },
                dataType: "json",
                success: function(t) {
                    var e = t.data.quan_list, a = !1;
                    "[object Object]" == Object.prototype.toString.call(e) && 0 < Object.keys(e).length && (a = !0), 
                    "[object Array]" == Object.prototype.toString.call(e) && 0 < e.length && (a = !0), 
                    o.setData({
                        quan: t.data.quan_list || [],
                        hasCoupon: a
                    });
                }
            });
        },
        receiveCoupon: function(t) {
            var o = t.currentTarget.dataset.quan_id, e = wx.getStorageSync("token"), n = this.data.quan, s = this;
            app.util.request({
                url: "entry/wxapp/index",
                data: {
                    controller: "goods.getQuan",
                    token: e,
                    quan_id: o
                },
                dataType: "json",
                success: function(t) {
                    if (1 == t.data.code) wx.showToast({
                        title: "被抢光了",
                        icon: "none"
                    }); else if (2 == t.data.code) {
                        wx.showToast({
                            title: "已领取",
                            icon: "none"
                        });
                        var e = [];
                        for (var a in n) n[a].id == o && (n[a].is_get = 1), e.push(n[a]);
                        s.setData({
                            quan: e
                        });
                    } else if (3 == t.data.code) {
                        e = [];
                        for (var a in n) n[a].id == o && (n[a].is_get = 1), e.push(n[a]);
                        s.setData({
                            quan: e
                        }), wx.showToast({
                            title: "领取成功"
                        });
                    } else t.data.code;
                }
            });
        }
    }
});