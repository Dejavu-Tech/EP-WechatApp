var _extends = Object.assign || function(r) {
    for (var e = 1; e < arguments.length; e++) {
        var t = arguments[e];
        for (var n in t) Object.prototype.hasOwnProperty.call(t, n) && (r[n] = t[n]);
    }
    return r;
}, _slicedToArray = function(r, e) {
    if (Array.isArray(r)) return r;
    if (Symbol.iterator in Object(r)) return function(r, e) {
        var t = [], n = !0, o = !1, i = void 0;
        try {
            for (var a, c = r[Symbol.iterator](); !(n = (a = c.next()).done) && (t.push(a.value), 
            !e || t.length !== e); n = !0) ;
        } catch (r) {
            o = !0, i = r;
        } finally {
            try {
                !n && c.return && c.return();
            } finally {
                if (o) throw i;
            }
        }
        return t;
    }(r, e);
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
}, originPage = Page;

Page = function(r) {
    var e = r.mixins;
    Array.isArray(e) && (delete r.mixins, r = merge(e, r)), originPage(r);
};

var originProperties = [ "data", "properties", "options" ], originMethods = [ "onLoad", "onReady", "onShow", "onHide", "onUnload", "onPullDownRefresh", "onReachBottom", "onShareAppMessage", "onPageScroll", "onTabItemTap" ];

function merge(r, c) {
    return Object.entries || (Object.entries = function(r) {
        for (var e = Object.keys(r), t = e.length, n = new Array(t); t--; ) n[t] = [ e[t], r[e[t]] ];
        return n;
    }), r.forEach(function(t) {
        if ("[object Object]" !== Object.prototype.toString.call(t)) throw new Error("mixin 类型必须为对象！");
        var r = !0, e = !1, n = void 0;
        try {
            for (var i, o = function() {
                var r = _slicedToArray(i.value, 2), e = r[0], n = r[1];
                if (originProperties.includes(e)) c[e] = _extends({}, n, c[e]); else if (originMethods.includes(e)) {
                    var o = c[e];
                    c[e] = function() {
                        for (var r = arguments.length, e = Array(r), t = 0; t < r; t++) e[t] = arguments[t];
                        return n.call.apply(n, [ this ].concat(e)), o && o.call.apply(o, [ this ].concat(e));
                    };
                } else c = _extends({}, t, c);
            }, a = Object.entries(t)[Symbol.iterator](); !(r = (i = a.next()).done); r = !0) o();
        } catch (r) {
            e = !0, n = r;
        } finally {
            try {
                !r && a.return && a.return();
            } finally {
                if (e) throw n;
            }
        }
    }), c;
}