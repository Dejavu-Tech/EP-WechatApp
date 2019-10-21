Component({
    timer: null,
    properties: {
        maxPayTime: {
            type: Number
        },
        createTime: {
            type: String,
            observer: function(t) {
                var a = this, r = 60 * this.data.maxPayTime, i = void 0, n = void 0, s = void 0, e = function() {
                    var e = Date.parse(new Date()) / 1e3;
                    0 <= (s = parseInt(r - (e - t))) && (i = parseInt(s / 60), n = parseFloat(s % 60), 
                    i = 10 <= i ? i : "0" + i, n = 10 <= n ? n : "0" + n), a.setData({
                        showTimeCount: (i || "00") + ":" + (n || "00")
                    });
                };
                e(), this.timer = setInterval(function() {
                    s <= 0 ? (a.timer && clearInterval(a.timer), a.triggerEvent("timeOut")) : e();
                }, 1e3);
            }
        }
    },
    data: {
        showTimeCount: ""
    },
    detached: function() {
        clearInterval(this.timer);
    },
    externalClasses: [ "count-down" ]
});