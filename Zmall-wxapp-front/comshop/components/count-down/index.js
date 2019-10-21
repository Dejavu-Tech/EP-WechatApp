var t = require("../../utils/timeFormat");

Component({
    properties: {
        target: {
            type: String,
            observer: function(t) {
                this.init(t);
            }
        },
        showDay: Boolean,
        beginTime: String,
        callback: String,
        format: Array,
        clearTimer: Boolean
    },
    externalClasses: [ "countdown-class", "item-class" ],
    data: {
        time: {
            day: "0",
            second: "00",
            minute: "00",
            hour: "00"
        },
        resultFormat: [],
        changeFormat: !1,
        timeStamp: 0,
        timer: null
    },
    methods: {
        init: function(t) {
            if (t - new Date().getTime() <= 0) return this.setData({
                time: {
                    day: "0",
                    second: "00",
                    minute: "00",
                    hour: "00"
                }
            }), void this.triggerEvent("callback");
            this.interval(t);
        },
        interval: function(e) {
            var i = this, a = e - new Date().getTime();
            if (a <= 0) return clearTimeout(this.data.timer), this.triggerEvent("callback"), 
            void this.setData({
                time: {
                    day: "0",
                    second: "00",
                    minute: "00",
                    hour: "00"
                }
            });
            var r = Math.ceil(a / 1e3), n = parseInt(r / 86400), o = r % 86400, s = (0, t.formatNumber)(parseInt(o / 3600));
            o %= 3600;
            var m = {
                day: n,
                hour: s,
                minute: (0, t.formatNumber)(parseInt(o / 60)),
                second: (0, t.formatNumber)(o % 60)
            };
            this.setData({
                time: m
            }), this.data.timer = setTimeout(function() {
                i.interval(e);
            }, 1e3);
        }
    },
    detached: function() {
        clearTimeout(this.data.timer);
    }
});