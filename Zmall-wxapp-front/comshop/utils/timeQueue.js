var _createClass = function() {
    function n(e, t) {
        for (var i = 0; i < t.length; i++) {
            var n = t[i];
            n.enumerable = n.enumerable || !1, n.configurable = !0, "value" in n && (n.writable = !0), 
            Object.defineProperty(e, n.key, n);
        }
    }
    return function(e, t, i) {
        return t && n(e.prototype, t), i && n(e, i), e;
    };
}();

function _classCallCheck(e, t) {
    if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
}

exports.default = function() {
    function t(e) {
        _classCallCheck(this, t), this.queue = {}, this.timer = -1;
    }
    return _createClass(t, [ {
        key: "action",
        value: function() {
            if ("{}" !== JSON.stringify(this.queue)) {
                for (var e in this.queue) this.queue[e][0]();
                this.timer = -1, this.begin();
            } else this.stop();
        }
    }, {
        key: "add",
        value: function(e) {
            var t = "" + new Date().getTime() + Math.ceil(1e3 * Math.random());
            return this.queue["" + t] = [ e ], -1 === this.timer && this.start(), t;
        }
    }, {
        key: "remove",
        value: function(e) {
            delete this.queue["" + e], "{}" === JSON.stringify(this.queue) && (this.timer = -1);
        }
    }, {
        key: "del",
        value: function() {
            this.queue = {}, "{}" === JSON.stringify(this.queue) && (this.timer = -1);
        }
    }, {
        key: "stop",
        value: function() {
            clearTimeout(this.timer), this.timer = -1;
        }
    }, {
        key: "start",
        value: function() {
            -1 < this.timer || this.action();
        }
    }, {
        key: "begin",
        value: function() {
            var e = this;
            this.timer = setTimeout(function() {
                e.action();
            }, 1e3);
        }
    } ]), t;
}();