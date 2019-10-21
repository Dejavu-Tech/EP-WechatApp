function e(e) {
    return e && e.__esModule ? e : {
        default: e
    };
}

function t(e, t, a) {
    return t in e ? Object.defineProperty(e, t, {
        value: a,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[t] = a, e;
}

function a(e) {
    var t = e.target.dataset.src, a = e.target.dataset.from;
    void 0 !== a && 0 < a.length && wx.previewImage({
        current: t,
        urls: this.data[a].imageUrls
    });
}

function i(e, r) {
    return e && e.length ? e.map(function(e) {
        if ("img" === e.tag || "image" === e.tag) {
            var t = e.attr.src, a = wx.getSystemInfoSync();
            e.attr.src = t + "?imageView2/2/w/" + Math.ceil(a.windowWidth * a.pixelRatio) + "/ignore-error/1";
        }
        return e.nodes && e.nodes.length && (e.nodes = i(e.nodes, r)), e;
    }) : [];
}

function r(e) {
    var t = e.target.dataset.from, a = e.target.dataset.idx;
    void 0 !== t && 0 < t.length && n(e, a, this, t);
}

function n(e, a, i, r) {
    var n, d = i.data[r];
    if (d && 0 != d.images.length) {
        var s = d.images, g = o(e.detail.width, e.detail.height, i, r), l = s[a].index, h = "" + r, m = !0, u = !1, f = void 0;
        try {
            for (var v, w = l.split(".")[Symbol.iterator](); !(m = (v = w.next()).done); m = !0) h += ".nodes[" + v.value + "]";
        } catch (e) {
            u = !0, f = e;
        } finally {
            try {
                !m && w.return && w.return();
            } finally {
                if (u) throw f;
            }
        }
        var c = h + ".width", x = h + ".height";
        i.setData((t(n = {}, c, g.imageWidth), t(n, x, g.imageheight), n));
    }
}

function o(e, t, a, i) {
    var r, n = 0, o = 0, d = {}, s = a.data[i].view.imagePadding;
    return (r = g - 2 * s) < e ? (o = (n = r) * t / e, d.imageWidth = n, d.imageheight = o) : (d.imageWidth = e, 
    d.imageheight = t), d;
}

var d = e(require("./showdown.js")), s = e(require("./html2json.js")), g = 0, l = 0;

wx.getSystemInfo({
    success: function(e) {
        g = e.windowWidth, l = e.windowHeight;
    }
}), module.exports = {
    wxParse: function() {
        var e = 0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : "wxParseData", t = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : "html", n = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : "", o = arguments[3], g = arguments[4], l = arguments[5], h = o, m = {};
        if ("html" == t) m = s.default.html2json(n, e); else if ("md" == t || "markdown" == t) {
            var u = new d.default.Converter().makeHtml(n);
            m = s.default.html2json(u, e);
        }
        m.nodes = i(m.nodes, l), m.view = {}, void (m.view.imagePadding = 0) !== g && (m.view.imagePadding = g);
        var f = {};
        f[e] = m, h.setData(f), h.wxParseImgLoad = r, h.wxParseImgTap = a;
    },
    wxParseTemArray: function(e, t, a, i) {
        for (var r = [], n = i.data, o = null, d = 0; d < a; d++) {
            var s = n[t + d].nodes;
            r.push(s);
        }
        e = e || "wxParseTemArray", (o = JSON.parse('{"' + e + '":""}'))[e] = r, i.setData(o);
    },
    emojisInit: function() {
        var e = 0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : "", t = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : "/wxParse/emojis/", a = arguments[2];
        s.default.emojisInit(e, t, a);
    }
};