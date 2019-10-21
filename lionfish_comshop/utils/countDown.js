function t(t, a, e) {
    return a in t ? Object.defineProperty(t, a, {
        value: e,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : t[a] = e, t;
}

var timeFormat = require("timeFormat"), app = getApp();

exports.default = {
    initCountDown: function(a) {
        var e, r = this;
        a - new Date().getTime() <= 0 ? this.setData((t(e = {}, "countDownMap." + a, {
            day: "0",
            second: "00",
            minute: "00",
            hour: "00"
        }), t(e, "actEndMap." + a, !0), e)) : this.$data.timer[a] = app.globalData.timer.add(function() {
            r.interval(a);
        });
    },
    interval: function(t) {
        var a = {}, e = t - new Date().getTime();
        if (e <= 0) return app.globalData.timer.remove(this.$data.timer[t]), this.$data.actEndMap[t] || (a["actEndMap." + t] = !0), 
        a["countDownMap." + t] = {
            day: "0",
            second: "00",
            minute: "00",
            hour: "00"
        }, void this.setData(a);
        var r = Math.ceil(e / 1e3), n = parseInt(r / 86400), i = r % 86400, o = (0, timeFormat.formatNumber)(parseInt(i / 3600));
        i %= 3600;
        var m = {
            day: n,
            hour: o,
            minute: (0, timeFormat.formatNumber)(parseInt(i / 60)),
            second: (0, timeFormat.formatNumber)(i % 60)
        };
        this.$data.actEndMap[t] && (a["actEndMap." + t] = !1), a["countDownMap." + t] = m, 
        this.setData(a);
    }
};