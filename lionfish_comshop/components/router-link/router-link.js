Component({
    properties: {
        url: String,
        type: String,
        disabled: {
            type: Boolean,
            value: !1
        },
        delta: {
            type: Number,
            value: 1
        }
    },
    externalClasses: [ "router-class" ],
    data: {
        canClick: !0
    },
    methods: {
        routerLink: function() {
            var t = this;
            if (console.log(this.data), !this.data.disabled && this.data.canClick) if (this.data.url) {
                this.setData({
                    canClick: !1
                });
                var e = {
                    url: this.data.url,
                    success: function(e) {
                        t.triggerEvent("on-success", e);
                    },
                    fail: function(e) {
                        console.warn("routerLink Error:", e), t.triggerEvent("on-error", e);
                    },
                    complete: function() {
                        setTimeout(function() {
                            t.setData({
                                canClick: !0
                            });
                        }, 400);
                    }
                }, a = this.data.url;
                switch (-1 == a.indexOf("lionfish_comshop/pages/index/index") && -1 == a.indexOf("lionfish_comshop/pages/order/shopCart") && -1 == a.indexOf("lionfish_comshop/pages/user/me") && -1 == a.indexOf("lionfish_comshop/pages/type/index") || this.setData({
                    type: "switch"
                }), this.data.type) {
                  case "redirect":
                    wx.redirectTo(e);
                    break;

                  case "switch":
                    wx.switchTab(e);
                    break;

                  case "navigateback":
                    wx.navigateBack({
                        delta: this.data.delta,
                        success: function(e) {
                            t.triggerEvent("on-success", e);
                        },
                        fail: function(e) {
                            console.warn("routerLink Error:", e);
                        },
                        complete: function() {
                            t.setData({
                                canClick: !1
                            });
                        }
                    });
                    break;

                  case "relaunch":
                    wx.reLaunch(e);
                    break;

                  default:
                    wx.navigateTo(e);
                }
            } else console.warn("url 不能为空");
        }
    }
});