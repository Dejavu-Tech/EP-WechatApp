var _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(n) {
    return typeof n;
} : function(n) {
    return n && "function" == typeof Symbol && n.constructor === Symbol && n !== Symbol.prototype ? "symbol" : typeof n;
};

(function() {
    var e = Array.prototype, o = Object.prototype, n = Function.prototype, u = e.push, a = e.slice, p = o.toString, r = o.hasOwnProperty, t = Array.isArray, i = Object.keys, c = n.bind, f = Object.create, l = function() {}, h = function n(t) {
        return t instanceof n ? t : this instanceof n ? void (this._wrapped = t) : new n(t);
    };
    (module.exports = h).VERSION = "1.8.2";
    var s = function(u, i, n) {
        if (void 0 === i) return u;
        switch (null == n ? 3 : n) {
          case 1:
            return function(n) {
                return u.call(i, n);
            };

          case 2:
            return function(n, t) {
                return u.call(i, n, t);
            };

          case 3:
            return function(n, t, r) {
                return u.call(i, n, t, r);
            };

          case 4:
            return function(n, t, r, e) {
                return u.call(i, n, t, r, e);
            };
        }
        return function() {
            return u.apply(i, arguments);
        };
    }, v = function(n, t, r) {
        return null == n ? h.identity : h.isFunction(n) ? s(n, t, r) : h.isObject(n) ? h.matcher(n) : h.property(n);
    };
    h.iteratee = function(n, t) {
        return v(n, t, 1 / 0);
    };
    var y = function(c, f) {
        return function(n) {
            var t = arguments.length;
            if (t < 2 || null == n) return n;
            for (var r = 1; r < t; r++) for (var e = arguments[r], u = c(e), i = u.length, o = 0; o < i; o++) {
                var a = u[o];
                f && void 0 !== n[a] || (n[a] = e[a]);
            }
            return n;
        };
    }, d = function(n) {
        if (!h.isObject(n)) return {};
        if (f) return f(n);
        l.prototype = n;
        var t = new l();
        return l.prototype = null, t;
    }, g = Math.pow(2, 53) - 1, m = function(n) {
        var t = null != n && n.length;
        return "number" == typeof t && 0 <= t && t <= g;
    };
    function b(a) {
        return function(n, t, r, e) {
            t = s(t, e, 4);
            var u = !m(n) && h.keys(n), i = (u || n).length, o = 0 < a ? 0 : i - 1;
            return arguments.length < 3 && (r = n[u ? u[o] : o], o += a), function(n, t, r, e, u, i) {
                for (;0 <= u && u < i; u += a) {
                    var o = e ? e[u] : u;
                    r = t(r, n[o], o, n);
                }
                return r;
            }(n, t, r, u, o, i);
        };
    }
    h.each = h.forEach = function(n, t, r) {
        var e, u;
        if (t = s(t, r), m(n)) for (e = 0, u = n.length; e < u; e++) t(n[e], e, n); else {
            var i = h.keys(n);
            for (e = 0, u = i.length; e < u; e++) t(n[i[e]], i[e], n);
        }
        return n;
    }, h.map = h.collect = function(n, t, r) {
        t = v(t, r);
        for (var e = !m(n) && h.keys(n), u = (e || n).length, i = Array(u), o = 0; o < u; o++) {
            var a = e ? e[o] : o;
            i[o] = t(n[a], a, n);
        }
        return i;
    }, h.reduce = h.foldl = h.inject = b(1), h.reduceRight = h.foldr = b(-1), h.find = h.detect = function(n, t, r) {
        var e;
        if (void 0 !== (e = m(n) ? h.findIndex(n, t, r) : h.findKey(n, t, r)) && -1 !== e) return n[e];
    }, h.filter = h.select = function(n, e, t) {
        var u = [];
        return e = v(e, t), h.each(n, function(n, t, r) {
            e(n, t, r) && u.push(n);
        }), u;
    }, h.reject = function(n, t, r) {
        return h.filter(n, h.negate(v(t)), r);
    }, h.every = h.all = function(n, t, r) {
        t = v(t, r);
        for (var e = !m(n) && h.keys(n), u = (e || n).length, i = 0; i < u; i++) {
            var o = e ? e[i] : i;
            if (!t(n[o], o, n)) return !1;
        }
        return !0;
    }, h.some = h.any = function(n, t, r) {
        t = v(t, r);
        for (var e = !m(n) && h.keys(n), u = (e || n).length, i = 0; i < u; i++) {
            var o = e ? e[i] : i;
            if (t(n[o], o, n)) return !0;
        }
        return !1;
    }, h.contains = h.includes = h.include = function(n, t, r) {
        return m(n) || (n = h.values(n)), 0 <= h.indexOf(n, t, "number" == typeof r && r);
    }, h.invoke = function(n, r) {
        var e = a.call(arguments, 2), u = h.isFunction(r);
        return h.map(n, function(n) {
            var t = u ? r : n[r];
            return null == t ? t : t.apply(n, e);
        });
    }, h.pluck = function(n, t) {
        return h.map(n, h.property(t));
    }, h.where = function(n, t) {
        return h.filter(n, h.matcher(t));
    }, h.findWhere = function(n, t) {
        return h.find(n, h.matcher(t));
    }, h.max = function(n, e, t) {
        var r, u, i = -1 / 0, o = -1 / 0;
        if (null == e && null != n) for (var a = 0, c = (n = m(n) ? n : h.values(n)).length; a < c; a++) r = n[a], 
        i < r && (i = r); else e = v(e, t), h.each(n, function(n, t, r) {
            u = e(n, t, r), (o < u || u === -1 / 0 && i === -1 / 0) && (i = n, o = u);
        });
        return i;
    }, h.min = function(n, e, t) {
        var r, u, i = 1 / 0, o = 1 / 0;
        if (null == e && null != n) for (var a = 0, c = (n = m(n) ? n : h.values(n)).length; a < c; a++) (r = n[a]) < i && (i = r); else e = v(e, t), 
        h.each(n, function(n, t, r) {
            ((u = e(n, t, r)) < o || u === 1 / 0 && i === 1 / 0) && (i = n, o = u);
        });
        return i;
    }, h.shuffle = function(n) {
        for (var t, r = m(n) ? n : h.values(n), e = r.length, u = Array(e), i = 0; i < e; i++) (t = h.random(0, i)) !== i && (u[i] = u[t]), 
        u[t] = r[i];
        return u;
    }, h.sample = function(n, t, r) {
        return null == t || r ? (m(n) || (n = h.values(n)), n[h.random(n.length - 1)]) : h.shuffle(n).slice(0, Math.max(0, t));
    }, h.sortBy = function(n, e, t) {
        return e = v(e, t), h.pluck(h.map(n, function(n, t, r) {
            return {
                value: n,
                index: t,
                criteria: e(n, t, r)
            };
        }).sort(function(n, t) {
            var r = n.criteria, e = t.criteria;
            if (r !== e) {
                if (e < r || void 0 === r) return 1;
                if (r < e || void 0 === e) return -1;
            }
            return n.index - t.index;
        }), "value");
    };
    var _ = function(o) {
        return function(e, u, n) {
            var i = {};
            return u = v(u, n), h.each(e, function(n, t) {
                var r = u(n, t, e);
                o(i, n, r);
            }), i;
        };
    };
    h.groupBy = _(function(n, t, r) {
        h.has(n, r) ? n[r].push(t) : n[r] = [ t ];
    }), h.indexBy = _(function(n, t, r) {
        n[r] = t;
    }), h.countBy = _(function(n, t, r) {
        h.has(n, r) ? n[r]++ : n[r] = 1;
    }), h.toArray = function(n) {
        return n ? h.isArray(n) ? a.call(n) : m(n) ? h.map(n, h.identity) : h.values(n) : [];
    }, h.size = function(n) {
        return null == n ? 0 : m(n) ? n.length : h.keys(n).length;
    }, h.partition = function(n, e, t) {
        e = v(e, t);
        var u = [], i = [];
        return h.each(n, function(n, t, r) {
            (e(n, t, r) ? u : i).push(n);
        }), [ u, i ];
    }, h.first = h.head = h.take = function(n, t, r) {
        if (null != n) return null == t || r ? n[0] : h.initial(n, n.length - t);
    }, h.initial = function(n, t, r) {
        return a.call(n, 0, Math.max(0, n.length - (null == t || r ? 1 : t)));
    }, h.last = function(n, t, r) {
        if (null != n) return null == t || r ? n[n.length - 1] : h.rest(n, Math.max(0, n.length - t));
    }, h.rest = h.tail = h.drop = function(n, t, r) {
        return a.call(n, null == t || r ? 1 : t);
    }, h.compact = function(n) {
        return h.filter(n, h.identity);
    };
    var j = function n(t, r, e, u) {
        for (var i = [], o = 0, a = u || 0, c = t && t.length; a < c; a++) {
            var f = t[a];
            if (m(f) && (h.isArray(f) || h.isArguments(f))) {
                r || (f = n(f, r, e));
                var l = 0, s = f.length;
                for (i.length += s; l < s; ) i[o++] = f[l++];
            } else e || (i[o++] = f);
        }
        return i;
    };
    function x(i) {
        return function(n, t, r) {
            t = v(t, r);
            for (var e = null != n && n.length, u = 0 < i ? 0 : e - 1; 0 <= u && u < e; u += i) if (t(n[u], u, n)) return u;
            return -1;
        };
    }
    h.flatten = function(n, t) {
        return j(n, t, !1);
    }, h.without = function(n) {
        return h.difference(n, a.call(arguments, 1));
    }, h.uniq = h.unique = function(n, t, r, e) {
        if (null == n) return [];
        h.isBoolean(t) || (e = r, r = t, t = !1), null != r && (r = v(r, e));
        for (var u = [], i = [], o = 0, a = n.length; o < a; o++) {
            var c = n[o], f = r ? r(c, o, n) : c;
            t ? (o && i === f || u.push(c), i = f) : r ? h.contains(i, f) || (i.push(f), u.push(c)) : h.contains(u, c) || u.push(c);
        }
        return u;
    }, h.union = function() {
        return h.uniq(j(arguments, !0, !0));
    }, h.intersection = function(n) {
        if (null == n) return [];
        for (var t = [], r = arguments.length, e = 0, u = n.length; e < u; e++) {
            var i = n[e];
            if (!h.contains(t, i)) {
                for (var o = 1; o < r && h.contains(arguments[o], i); o++) ;
                o === r && t.push(i);
            }
        }
        return t;
    }, h.difference = function(n) {
        var t = j(arguments, !0, !0, 1);
        return h.filter(n, function(n) {
            return !h.contains(t, n);
        });
    }, h.zip = function() {
        return h.unzip(arguments);
    }, h.unzip = function(n) {
        for (var t = n && h.max(n, "length").length || 0, r = Array(t), e = 0; e < t; e++) r[e] = h.pluck(n, e);
        return r;
    }, h.object = function(n, t) {
        for (var r = {}, e = 0, u = n && n.length; e < u; e++) t ? r[n[e]] = t[e] : r[n[e][0]] = n[e][1];
        return r;
    }, h.indexOf = function(n, t, r) {
        var e = 0, u = n && n.length;
        if ("number" == typeof r) e = r < 0 ? Math.max(0, u + r) : r; else if (r && u) return n[e = h.sortedIndex(n, t)] === t ? e : -1;
        if (t != t) return h.findIndex(a.call(n, e), h.isNaN);
        for (;e < u; e++) if (n[e] === t) return e;
        return -1;
    }, h.lastIndexOf = function(n, t, r) {
        var e = n ? n.length : 0;
        if ("number" == typeof r && (e = r < 0 ? e + r + 1 : Math.min(e, r + 1)), t != t) return h.findLastIndex(a.call(n, 0, e), h.isNaN);
        for (;0 <= --e; ) if (n[e] === t) return e;
        return -1;
    }, h.findIndex = x(1), h.findLastIndex = x(-1), h.sortedIndex = function(n, t, r, e) {
        for (var u = (r = v(r, e, 1))(t), i = 0, o = n.length; i < o; ) {
            var a = Math.floor((i + o) / 2);
            r(n[a]) < u ? i = a + 1 : o = a;
        }
        return i;
    }, h.range = function(n, t, r) {
        arguments.length <= 1 && (t = n || 0, n = 0), r = r || 1;
        for (var e = Math.max(Math.ceil((t - n) / r), 0), u = Array(e), i = 0; i < e; i++, 
        n += r) u[i] = n;
        return u;
    };
    var w = function(n, t, r, e, u) {
        if (!(e instanceof t)) return n.apply(r, u);
        var i = d(n.prototype), o = n.apply(i, u);
        return h.isObject(o) ? o : i;
    };
    h.bind = function(t, r) {
        if (c && t.bind === c) return c.apply(t, a.call(arguments, 1));
        if (!h.isFunction(t)) throw new TypeError("Bind must be called on a function");
        var e = a.call(arguments, 2);
        return function n() {
            return w(t, n, r, this, e.concat(a.call(arguments)));
        };
    }, h.partial = function(i) {
        var o = a.call(arguments, 1);
        return function n() {
            for (var t = 0, r = o.length, e = Array(r), u = 0; u < r; u++) e[u] = o[u] === h ? arguments[t++] : o[u];
            for (;t < arguments.length; ) e.push(arguments[t++]);
            return w(i, n, this, this, e);
        };
    }, h.bindAll = function(n) {
        var t, r, e = arguments.length;
        if (e <= 1) throw new Error("bindAll must be passed function names");
        for (t = 1; t < e; t++) n[r = arguments[t]] = h.bind(n[r], n);
        return n;
    }, h.memoize = function(u, i) {
        var n = function n(t) {
            var r = n.cache, e = "" + (i ? i.apply(this, arguments) : t);
            return h.has(r, e) || (r[e] = u.apply(this, arguments)), r[e];
        };
        return n.cache = {}, n;
    }, h.defer = h.partial(h.delay = function(n, t) {
        var r = a.call(arguments, 2);
        return setTimeout(function() {
            return n.apply(null, r);
        }, t);
    }, h, 1), h.throttle = function(r, e, u) {
        var i, o, a, c = null, f = 0;
        u || (u = {});
        var l = function() {
            f = !1 === u.leading ? 0 : h.now(), c = null, a = r.apply(i, o), c || (i = o = null);
        };
        return function() {
            var n = h.now();
            f || !1 !== u.leading || (f = n);
            var t = e - (n - f);
            return i = this, o = arguments, t <= 0 || e < t ? (c && (clearTimeout(c), c = null), 
            f = n, a = r.apply(i, o), c || (i = o = null)) : c || !1 === u.trailing || (c = setTimeout(l, t)), 
            a;
        };
    }, h.debounce = function(r, e, u) {
        var i, o, a, c, f, t = function n() {
            var t = h.now() - c;
            t < e && 0 <= t ? i = setTimeout(n, e - t) : (i = null, u || (f = r.apply(a, o), 
            i || (a = o = null)));
        };
        return function() {
            a = this, o = arguments, c = h.now();
            var n = u && !i;
            return i || (i = setTimeout(t, e)), n && (f = r.apply(a, o), a = o = null), f;
        };
    }, h.wrap = function(n, t) {
        return h.partial(t, n);
    }, h.negate = function(n) {
        return function() {
            return !n.apply(this, arguments);
        };
    }, h.compose = function() {
        var r = arguments, e = r.length - 1;
        return function() {
            for (var n = e, t = r[e].apply(this, arguments); n--; ) t = r[n].call(this, t);
            return t;
        };
    }, h.after = function(n, t) {
        return function() {
            if (--n < 1) return t.apply(this, arguments);
        };
    }, h.once = h.partial(h.before = function(n, t) {
        var r;
        return function() {
            return 0 < --n && (r = t.apply(this, arguments)), n <= 1 && (t = null), r;
        };
    }, 2);
    var A = !{
        toString: null
    }.propertyIsEnumerable("toString"), O = [ "valueOf", "isPrototypeOf", "toString", "propertyIsEnumerable", "hasOwnProperty", "toLocaleString" ];
    function k(n, t) {
        var r = O.length, e = n.constructor, u = h.isFunction(e) && e.prototype || o, i = "constructor";
        for (h.has(n, i) && !h.contains(t, i) && t.push(i); r--; ) (i = O[r]) in n && n[i] !== u[i] && !h.contains(t, i) && t.push(i);
    }
    h.keys = function(n) {
        if (!h.isObject(n)) return [];
        if (i) return i(n);
        var t = [];
        for (var r in n) h.has(n, r) && t.push(r);
        return A && k(n, t), t;
    }, h.allKeys = function(n) {
        if (!h.isObject(n)) return [];
        var t = [];
        for (var r in n) t.push(r);
        return A && k(n, t), t;
    }, h.values = function(n) {
        for (var t = h.keys(n), r = t.length, e = Array(r), u = 0; u < r; u++) e[u] = n[t[u]];
        return e;
    }, h.mapObject = function(n, t, r) {
        t = v(t, r);
        for (var e, u = h.keys(n), i = u.length, o = {}, a = 0; a < i; a++) o[e = u[a]] = t(n[e], e, n);
        return o;
    }, h.pairs = function(n) {
        for (var t = h.keys(n), r = t.length, e = Array(r), u = 0; u < r; u++) e[u] = [ t[u], n[t[u]] ];
        return e;
    }, h.invert = function(n) {
        for (var t = {}, r = h.keys(n), e = 0, u = r.length; e < u; e++) t[n[r[e]]] = r[e];
        return t;
    }, h.functions = h.methods = function(n) {
        var t = [];
        for (var r in n) h.isFunction(n[r]) && t.push(r);
        return t.sort();
    }, h.extend = y(h.allKeys), h.extendOwn = h.assign = y(h.keys), h.findKey = function(n, t, r) {
        t = v(t, r);
        for (var e, u = h.keys(n), i = 0, o = u.length; i < o; i++) if (t(n[e = u[i]], e, n)) return e;
    }, h.pick = function(n, t, r) {
        var e, u, i = {}, o = n;
        if (null == o) return i;
        h.isFunction(t) ? (u = h.allKeys(o), e = s(t, r)) : (u = j(arguments, !1, !1, 1), 
        e = function(n, t, r) {
            return t in r;
        }, o = Object(o));
        for (var a = 0, c = u.length; a < c; a++) {
            var f = u[a], l = o[f];
            e(l, f, o) && (i[f] = l);
        }
        return i;
    }, h.omit = function(n, t, r) {
        if (h.isFunction(t)) t = h.negate(t); else {
            var e = h.map(j(arguments, !1, !1, 1), String);
            t = function(n, t) {
                return !h.contains(e, t);
            };
        }
        return h.pick(n, t, r);
    }, h.defaults = y(h.allKeys, !0), h.create = function(n, t) {
        var r = d(n);
        return t && h.extendOwn(r, t), r;
    }, h.clone = function(n) {
        return h.isObject(n) ? h.isArray(n) ? n.slice() : h.extend({}, n) : n;
    }, h.tap = function(n, t) {
        return t(n), n;
    }, h.isMatch = function(n, t) {
        var r = h.keys(t), e = r.length;
        if (null == n) return !e;
        for (var u = Object(n), i = 0; i < e; i++) {
            var o = r[i];
            if (t[o] !== u[o] || !(o in u)) return !1;
        }
        return !0;
    };
    h.isEqual = function(n, t) {
        return function n(t, r, e, u) {
            if (t === r) return 0 !== t || 1 / t == 1 / r;
            if (null == t || null == r) return t === r;
            t instanceof h && (t = t._wrapped), r instanceof h && (r = r._wrapped);
            var i = p.call(t);
            if (i !== p.call(r)) return !1;
            switch (i) {
              case "[object RegExp]":
              case "[object String]":
                return "" + t == "" + r;

              case "[object Number]":
                return +t != +t ? +r != +r : 0 == +t ? 1 / +t == 1 / r : +t == +r;

              case "[object Date]":
              case "[object Boolean]":
                return +t == +r;
            }
            var o = "[object Array]" === i;
            if (!o) {
                if ("object" != (void 0 === t ? "undefined" : _typeof(t)) || "object" != (void 0 === r ? "undefined" : _typeof(r))) return !1;
                var a = t.constructor, c = r.constructor;
                if (a !== c && !(h.isFunction(a) && a instanceof a && h.isFunction(c) && c instanceof c) && "constructor" in t && "constructor" in r) return !1;
            }
            u = u || [];
            for (var f = (e = e || []).length; f--; ) if (e[f] === t) return u[f] === r;
            if (e.push(t), u.push(r), o) {
                if ((f = t.length) !== r.length) return !1;
                for (;f--; ) if (!n(t[f], r[f], e, u)) return !1;
            } else {
                var l, s = h.keys(t);
                if (f = s.length, h.keys(r).length !== f) return !1;
                for (;f--; ) if (l = s[f], !h.has(r, l) || !n(t[l], r[l], e, u)) return !1;
            }
            return e.pop(), u.pop(), !0;
        }(n, t);
    }, h.isEmpty = function(n) {
        return null == n || (m(n) && (h.isArray(n) || h.isString(n) || h.isArguments(n)) ? 0 === n.length : 0 === h.keys(n).length);
    }, h.isElement = function(n) {
        return !(!n || 1 !== n.nodeType);
    }, h.isArray = t || function(n) {
        return "[object Array]" === p.call(n);
    }, h.isObject = function(n) {
        var t = void 0 === n ? "undefined" : _typeof(n);
        return "function" === t || "object" === t && !!n;
    }, h.each([ "Arguments", "Function", "String", "Number", "Date", "RegExp", "Error" ], function(t) {
        h["is" + t] = function(n) {
            return p.call(n) === "[object " + t + "]";
        };
    }), h.isArguments(arguments) || (h.isArguments = function(n) {
        return h.has(n, "callee");
    }), "function" != typeof /./ && "object" != ("undefined" == typeof Int8Array ? "undefined" : _typeof(Int8Array)) && (h.isFunction = function(n) {
        return "function" == typeof n || !1;
    }), h.isFinite = function(n) {
        return isFinite(n) && !isNaN(parseFloat(n));
    }, h.isNaN = function(n) {
        return h.isNumber(n) && n !== +n;
    }, h.isBoolean = function(n) {
        return !0 === n || !1 === n || "[object Boolean]" === p.call(n);
    }, h.isNull = function(n) {
        return null === n;
    }, h.isUndefined = function(n) {
        return void 0 === n;
    }, h.has = function(n, t) {
        return null != n && r.call(n, t);
    }, h.noConflict = function() {
        return root._ = previousUnderscore, this;
    }, h.identity = function(n) {
        return n;
    }, h.constant = function(n) {
        return function() {
            return n;
        };
    }, h.noop = function() {}, h.property = function(t) {
        return function(n) {
            return null == n ? void 0 : n[t];
        };
    }, h.propertyOf = function(t) {
        return null == t ? function() {} : function(n) {
            return t[n];
        };
    }, h.matcher = h.matches = function(t) {
        return t = h.extendOwn({}, t), function(n) {
            return h.isMatch(n, t);
        };
    }, h.times = function(n, t, r) {
        var e = Array(Math.max(0, n));
        t = s(t, r, 1);
        for (var u = 0; u < n; u++) e[u] = t(u);
        return e;
    }, h.random = function(n, t) {
        return null == t && (t = n, n = 0), n + Math.floor(Math.random() * (t - n + 1));
    }, h.now = Date.now || function() {
        return new Date().getTime();
    };
    var S = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;",
        "`": "&#x60;"
    }, F = h.invert(S), E = function(t) {
        var r = function(n) {
            return t[n];
        }, n = "(?:" + h.keys(t).join("|") + ")", e = RegExp(n), u = RegExp(n, "g");
        return function(n) {
            return n = null == n ? "" : "" + n, e.test(n) ? n.replace(u, r) : n;
        };
    };
    h.escape = E(S), h.unescape = E(F), h.result = function(n, t, r) {
        var e = null == n ? void 0 : n[t];
        return void 0 === e && (e = r), h.isFunction(e) ? e.call(n) : e;
    };
    var I = 0;
    h.uniqueId = function(n) {
        var t = ++I + "";
        return n ? n + t : t;
    }, h.templateSettings = {
        evaluate: /<%([\s\S]+?)%>/g,
        interpolate: /<%=([\s\S]+?)%>/g,
        escape: /<%-([\s\S]+?)%>/g
    };
    var M = /(.)^/, N = {
        "'": "'",
        "\\": "\\",
        "\r": "r",
        "\n": "n",
        "\u2028": "u2028",
        "\u2029": "u2029"
    }, B = /\\|'|\r|\n|\u2028|\u2029/g, T = function(n) {
        return "\\" + N[n];
    };
    h.template = function(i, n, t) {
        !n && t && (n = t), n = h.defaults({}, n, h.templateSettings);
        var r = RegExp([ (n.escape || M).source, (n.interpolate || M).source, (n.evaluate || M).source ].join("|") + "|$", "g"), o = 0, a = "__p+='";
        i.replace(r, function(n, t, r, e, u) {
            return a += i.slice(o, u).replace(B, T), o = u + n.length, t ? a += "'+\n((__t=(" + t + "))==null?'':_.escape(__t))+\n'" : r ? a += "'+\n((__t=(" + r + "))==null?'':__t)+\n'" : e && (a += "';\n" + e + "\n__p+='"), 
            n;
        }), a += "';\n", n.variable || (a = "with(obj||{}){\n" + a + "}\n"), a = "var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};\n" + a + "return __p;\n";
        try {
            var e = new Function(n.variable || "obj", "_", a);
        } catch (n) {
            throw n.source = a, n;
        }
        var u = function(n) {
            return e.call(this, n, h);
        }, c = n.variable || "obj";
        return u.source = "function(" + c + "){\n" + a + "}", u;
    }, h.chain = function(n) {
        var t = h(n);
        return t._chain = !0, t;
    };
    var R = function(n, t) {
        return n._chain ? h(t).chain() : t;
    };
    h.mixin = function(r) {
        h.each(h.functions(r), function(n) {
            var t = h[n] = r[n];
            h.prototype[n] = function() {
                var n = [ this._wrapped ];
                return u.apply(n, arguments), R(this, t.apply(h, n));
            };
        });
    }, h.mixin(h), h.each([ "pop", "push", "reverse", "shift", "sort", "splice", "unshift" ], function(t) {
        var r = e[t];
        h.prototype[t] = function() {
            var n = this._wrapped;
            return r.apply(n, arguments), "shift" !== t && "splice" !== t || 0 !== n.length || delete n[0], 
            R(this, n);
        };
    }), h.each([ "concat", "join", "slice" ], function(n) {
        var t = e[n];
        h.prototype[n] = function() {
            return R(this, t.apply(this._wrapped, arguments));
        };
    }), h.prototype.valueOf = h.prototype.toJSON = h.prototype.value = function() {
        return this._wrapped;
    }, h.prototype.toString = function() {
        return "" + this._wrapped;
    };
}).call(void 0);