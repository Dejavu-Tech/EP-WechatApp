// eaterplanet_ecommerce/components/payTimeCountDown/index.js
Component({
  timer: null,
  properties: {
    maxPayTime: {
      type: Number
    },
    createTime: {
      type: String,
      observer: function (e) {
        var t = this, a = 60 * this.data.maxPayTime, i = void 0, r = void 0, n = void 0,
        formatTime = function () {
          var o = Date.parse(new Date())/1000;
          (n = parseInt(a - (o - e))) >= 0 && (i = parseInt(n / 60),
            r = parseFloat(n % 60),
            i = i >= 10 ? i : "0" + i,
            r = r >= 10 ? r : "0" + r),
            t.setData({
              showTimeCount: (i || "00") + ":" + (r || "00")
            });
        };
        formatTime(),
        this.timer = setInterval(function () {
          n <= 0 ? (t.timer && clearInterval(t.timer), t.triggerEvent("timeOut")) : formatTime();
        }, 1000);
      }
    }
  },
  data: {
    showTimeCount: ""
  },
  detached: function() {
    clearInterval(this.timer);
  },
  externalClasses: ["count-down"]
})
