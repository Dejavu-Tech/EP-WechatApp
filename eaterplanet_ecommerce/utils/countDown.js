function t(obj, attr, newAttr) {
  return attr in obj ? Object.defineProperty(obj, attr, {
    value: newAttr,
    enumerable: true,
    configurable: true,
    writable: true
  }) : obj[attr] = newAttr, obj;
}


var timeFormat = require("timeFormat"),
  app = getApp();

exports.default = {
  initCountDown: function (e) {
    var that = this,
      r = {
        day: "0",
        second: "00",
        minute: "00",
        hour: "00"
      };
    if (e - new Date().getTime() <= 0) {
      var i;
      this.setData((i = {}, t(i, "countDownMap." + e, r), t(i, "actEndMap." + e, !0), i));
    } else {
      this.$data.timer[e] = app.globalData.timer.add(function () {
        that.interval(e);
      });
    }
  },
  interval: function (t) {
    var n = {}, r = t - new Date().getTime();

    if (r <= 0) {
      return app.globalData.timer.remove(this.$data.timer[t]),
        this.$data.actEndMap[t] || (n["actEndMap." + t] = true),
        n["countDownMap." + t] = {
          day: "0",
          second: "00",
          minute: "00",
          hour: "00"
        },
        void this.setData(n);
    }
    var i = Math.ceil(r / 1000),
      o = parseInt(i / 86400),
      u = i % 86400,
      s = (0, timeFormat.formatNumber)(parseInt(u / 3600));
    u %= 3600;
    var d = {
      day: o,
      hour: s,
      minute: (0, timeFormat.formatNumber)(parseInt(u / 60)),
      second: (0, timeFormat.formatNumber)(u % 60)
    };
    this.$data.actEndMap[t] && (n["actEndMap." + t] = !1), n["countDownMap." + t] = d, this.setData(n);
  }
};