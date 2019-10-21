var _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
    return typeof e;
} : function(e) {
    return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
};

function e(e) {
    var r = {
        omitExtraWLInCodeBlocks: {
            defaultValue: !1,
            describe: "Omit the default extra whiteline added to code blocks",
            type: "boolean"
        },
        noHeaderId: {
            defaultValue: !1,
            describe: "Turn on/off generated header id",
            type: "boolean"
        },
        prefixHeaderId: {
            defaultValue: !1,
            describe: "Specify a prefix to generated header ids",
            type: "string"
        },
        headerLevelStart: {
            defaultValue: !1,
            describe: "The header blocks level start",
            type: "integer"
        },
        parseImgDimensions: {
            defaultValue: !1,
            describe: "Turn on/off image dimension parsing",
            type: "boolean"
        },
        simplifiedAutoLink: {
            defaultValue: !1,
            describe: "Turn on/off GFM autolink style",
            type: "boolean"
        },
        literalMidWordUnderscores: {
            defaultValue: !1,
            describe: "Parse midword underscores as literal underscores",
            type: "boolean"
        },
        strikethrough: {
            defaultValue: !1,
            describe: "Turn on/off strikethrough support",
            type: "boolean"
        },
        tables: {
            defaultValue: !1,
            describe: "Turn on/off tables support",
            type: "boolean"
        },
        tablesHeaderId: {
            defaultValue: !1,
            describe: "Add an id to table headers",
            type: "boolean"
        },
        ghCodeBlocks: {
            defaultValue: !0,
            describe: "Turn on/off GFM fenced code blocks support",
            type: "boolean"
        },
        tasklists: {
            defaultValue: !1,
            describe: "Turn on/off GFM tasklist support",
            type: "boolean"
        },
        smoothLivePreview: {
            defaultValue: !1,
            describe: "Prevents weird effects in live previews due to incomplete input",
            type: "boolean"
        },
        smartIndentationFix: {
            defaultValue: !1,
            description: "Tries to smartly fix identation in es6 strings",
            type: "boolean"
        }
    };
    if (!1 === e) return JSON.parse(JSON.stringify(r));
    var t = {};
    for (var n in r) r.hasOwnProperty(n) && (t[n] = r[n].defaultValue);
    return t;
}

function r(e, r) {
    var t = r ? "Error in " + r + " extension->" : "Error in unnamed extension", a = {
        valid: !0,
        error: ""
    };
    s.helper.isArray(e) || (e = [ e ]);
    for (var o = 0; o < e.length; ++o) {
        var i = t + " sub-extension " + o + ": ", l = e[o];
        if ("object" !== (void 0 === l ? "undefined" : n(l))) return a.valid = !1, a.error = i + "must be an object, but " + (void 0 === l ? "undefined" : n(l)) + " given", 
        a;
        if (!s.helper.isString(l.type)) return a.valid = !1, a.error = i + 'property "type" must be a string, but ' + n(l.type) + " given", 
        a;
        var c = l.type = l.type.toLowerCase();
        if ("language" === c && (c = l.type = "lang"), "html" === c && (c = l.type = "output"), 
        "lang" !== c && "output" !== c && "listener" !== c) return a.valid = !1, a.error = i + "type " + c + ' is not recognized. Valid values: "lang/language", "output/html" or "listener"', 
        a;
        if ("listener" === c) {
            if (s.helper.isUndefined(l.listeners)) return a.valid = !1, a.error = i + '. Extensions of type "listener" must have a property called "listeners"', 
            a;
        } else if (s.helper.isUndefined(l.filter) && s.helper.isUndefined(l.regex)) return a.valid = !1, 
        a.error = i + c + ' extensions must define either a "regex" property or a "filter" method', 
        a;
        if (l.listeners) {
            if ("object" !== n(l.listeners)) return a.valid = !1, a.error = i + '"listeners" property must be an object but ' + n(l.listeners) + " given", 
            a;
            for (var u in l.listeners) if (l.listeners.hasOwnProperty(u) && "function" != typeof l.listeners[u]) return a.valid = !1, 
            a.error = i + '"listeners" property must be an hash of [event name]: [callback]. listeners.' + u + " must be a function but " + n(l.listeners[u]) + " given", 
            a;
        }
        if (l.filter) {
            if ("function" != typeof l.filter) return a.valid = !1, a.error = i + '"filter" must be a function, but ' + n(l.filter) + " given", 
            a;
        } else if (l.regex) {
            if (s.helper.isString(l.regex) && (l.regex = new RegExp(l.regex, "g")), !l.regex instanceof RegExp) return a.valid = !1, 
            a.error = i + '"regex" property must either be a string or a RegExp object, but ' + n(l.regex) + " given", 
            a;
            if (s.helper.isUndefined(l.replace)) return a.valid = !1, a.error = i + '"regex" extensions must implement a replace string or function', 
            a;
        }
    }
    return a;
}

function t(e, r) {
    return "~E" + r.charCodeAt(0) + "E";
}

var n = "function" == typeof Symbol && "symbol" == _typeof(Symbol.iterator) ? function(e) {
    return void 0 === e ? "undefined" : _typeof(e);
} : function(e) {
    return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : void 0 === e ? "undefined" : _typeof(e);
}, s = {}, a = {}, o = {}, i = e(!0), l = {
    github: {
        omitExtraWLInCodeBlocks: !0,
        prefixHeaderId: "user-content-",
        simplifiedAutoLink: !0,
        literalMidWordUnderscores: !0,
        strikethrough: !0,
        tables: !0,
        tablesHeaderId: !0,
        ghCodeBlocks: !0,
        tasklists: !0
    },
    vanilla: e(!0)
};

s.helper = {}, s.extensions = {}, s.setOption = function(e, r) {
    return i[e] = r, this;
}, s.getOption = function(e) {
    return i[e];
}, s.getOptions = function() {
    return i;
}, s.resetOptions = function() {
    i = e(!0);
}, s.setFlavor = function(e) {
    if (l.hasOwnProperty(e)) {
        var r = l[e];
        for (var t in r) r.hasOwnProperty(t) && (i[t] = r[t]);
    }
}, s.getDefaultOptions = function(r) {
    return e(r);
}, s.subParser = function(e, r) {
    if (s.helper.isString(e)) {
        if (void 0 === r) {
            if (a.hasOwnProperty(e)) return a[e];
            throw Error("SubParser named " + e + " not registered!");
        }
        a[e] = r;
    }
}, s.extension = function(e, t) {
    if (!s.helper.isString(e)) throw Error("Extension 'name' must be a string");
    if (e = s.helper.stdExtName(e), s.helper.isUndefined(t)) {
        if (!o.hasOwnProperty(e)) throw Error("Extension named " + e + " is not registered!");
        return o[e];
    }
    "function" == typeof t && (t = t()), s.helper.isArray(t) || (t = [ t ]);
    var n = r(t, e);
    if (!n.valid) throw Error(n.error);
    o[e] = t;
}, s.getAllExtensions = function() {
    return o;
}, s.removeExtension = function(e) {
    delete o[e];
}, s.resetExtensions = function() {
    o = {};
}, s.validateExtension = function(e) {
    var t = r(e, null);
    return !!t.valid || (console.warn(t.error), !1);
}, s.hasOwnProperty("helper") || (s.helper = {}), s.helper.isString = function(e) {
    return "string" == typeof e || e instanceof String;
}, s.helper.isFunction = function(e) {
    return e && "[object Function]" === {}.toString.call(e);
}, s.helper.forEach = function(e, r) {
    if ("function" == typeof e.forEach) e.forEach(r); else for (var t = 0; t < e.length; t++) r(e[t], t, e);
}, s.helper.isArray = function(e) {
    return e.constructor === Array;
}, s.helper.isUndefined = function(e) {
    return void 0 === e;
}, s.helper.stdExtName = function(e) {
    return e.replace(/[_-]||\s/g, "").toLowerCase();
}, s.helper.escapeCharactersCallback = t, s.helper.escapeCharacters = function(e, r, n) {
    var s = "([" + r.replace(/([\[\]\\])/g, "\\$1") + "])";
    n && (s = "\\\\" + s);
    var a = new RegExp(s, "g");
    return e.replace(a, t);
};

var c = function(e, r, t, n) {
    var s, a, o, i, l, c = n || "", u = -1 < c.indexOf("g"), p = new RegExp(r + "|" + t, "g" + c.replace(/g/g, "")), h = new RegExp(r, c.replace(/g/g, "")), d = [];
    do {
        for (s = 0; o = p.exec(e); ) if (h.test(o[0])) s++ || (i = (a = p.lastIndex) - o[0].length); else if (s && !--s) {
            l = o.index + o[0].length;
            var f = {
                left: {
                    start: i,
                    end: a
                },
                match: {
                    start: a,
                    end: o.index
                },
                right: {
                    start: o.index,
                    end: l
                },
                wholeMatch: {
                    start: i,
                    end: l
                }
            };
            if (d.push(f), !u) return d;
        }
    } while (s && (p.lastIndex = a));
    return d;
};

s.helper.matchRecursiveRegExp = function(e, r, t, n) {
    for (var s = c(e, r, t, n), a = [], o = 0; o < s.length; ++o) a.push([ e.slice(s[o].wholeMatch.start, s[o].wholeMatch.end), e.slice(s[o].match.start, s[o].match.end), e.slice(s[o].left.start, s[o].left.end), e.slice(s[o].right.start, s[o].right.end) ]);
    return a;
}, s.helper.replaceRecursiveRegExp = function(e, r, t, n, a) {
    if (!s.helper.isFunction(r)) {
        var o = r;
        r = function() {
            return o;
        };
    }
    var i = c(e, t, n, a), l = e, u = i.length;
    if (0 < u) {
        var p = [];
        0 !== i[0].wholeMatch.start && p.push(e.slice(0, i[0].wholeMatch.start));
        for (var h = 0; h < u; ++h) p.push(r(e.slice(i[h].wholeMatch.start, i[h].wholeMatch.end), e.slice(i[h].match.start, i[h].match.end), e.slice(i[h].left.start, i[h].left.end), e.slice(i[h].right.start, i[h].right.end))), 
        h < u - 1 && p.push(e.slice(i[h].wholeMatch.end, i[h + 1].wholeMatch.start));
        i[u - 1].wholeMatch.end < e.length && p.push(e.slice(i[u - 1].wholeMatch.end)), 
        l = p.join("");
    }
    return l;
}, s.helper.isUndefined(console) && (console = {
    warn: function(e) {
        alert(e);
    },
    log: function(e) {
        alert(e);
    },
    error: function(e) {
        throw e;
    }
}), s.Converter = function(t) {
    function a(e, t) {
        if (t = t || null, s.helper.isString(e)) {
            if (t = e = s.helper.stdExtName(e), s.extensions[e]) return console.warn("DEPRECATION WARNING: " + e + " is an old extension that uses a deprecated loading method.Please inform the developer that the extension should be updated!"), 
            void function(e, t) {
                "function" == typeof e && (e = e(new s.Converter())), s.helper.isArray(e) || (e = [ e ]);
                var n = r(e, t);
                if (!n.valid) throw Error(n.error);
                for (var a = 0; a < e.length; ++a) switch (e[a].type) {
                  case "lang":
                    p.push(e[a]);
                    break;

                  case "output":
                    h.push(e[a]);
                    break;

                  default:
                    throw Error("Extension loader error: Type unrecognized!!!");
                }
            }(s.extensions[e], e);
            if (s.helper.isUndefined(o[e])) throw Error('Extension "' + e + '" could not be loaded. It was either not found or is not a valid extension.');
            e = o[e];
        }
        "function" == typeof e && (e = e()), s.helper.isArray(e) || (e = [ e ]);
        var n = r(e, t);
        if (!n.valid) throw Error(n.error);
        for (var a = 0; a < e.length; ++a) {
            switch (e[a].type) {
              case "lang":
                p.push(e[a]);
                break;

              case "output":
                h.push(e[a]);
            }
            if (e[a].hasOwnProperty(d)) for (var i in e[a].listeners) e[a].listeners.hasOwnProperty(i) && c(i, e[a].listeners[i]);
        }
    }
    function c(e, r) {
        if (!s.helper.isString(e)) throw Error("Invalid argument in converter.listen() method: name must be a string, but " + (void 0 === e ? "undefined" : n(e)) + " given");
        if ("function" != typeof r) throw Error("Invalid argument in converter.listen() method: callback must be a function, but " + (void 0 === r ? "undefined" : n(r)) + " given");
        d.hasOwnProperty(e) || (d[e] = []), d[e].push(r);
    }
    var u = {}, p = [], h = [], d = {};
    !function() {
        for (var e in t = t || {}, i) i.hasOwnProperty(e) && (u[e] = i[e]);
        if ("object" !== (void 0 === t ? "undefined" : n(t))) throw Error("Converter expects the passed parameter to be an object, but " + (void 0 === t ? "undefined" : n(t)) + " was passed instead.");
        for (var r in t) t.hasOwnProperty(r) && (u[r] = t[r]);
        u.extensions && s.helper.forEach(u.extensions, a);
    }(), this._dispatch = function(e, r, t, n) {
        if (d.hasOwnProperty(e)) for (var s = 0; s < d[e].length; ++s) {
            var a = d[e][s](e, r, this, t, n);
            a && void 0 !== a && (r = a);
        }
        return r;
    }, this.listen = function(e, r) {
        return c(e, r), this;
    }, this.makeHtml = function(r) {
        if (!r) return r;
        var e, t, n, a = {
            gHtmlBlocks: [],
            gHtmlMdBlocks: [],
            gHtmlSpans: [],
            gUrls: {},
            gTitles: {},
            gDimensions: {},
            gListLevel: 0,
            hashLinkCounts: {},
            langExtensions: p,
            outputModifiers: h,
            converter: this,
            ghCodeBlocks: []
        };
        return r = (r = (r = (r = r.replace(/~/g, "~T")).replace(/\$/g, "~D")).replace(/\r\n/g, "\n")).replace(/\r/g, "\n"), 
        u.smartIndentationFix && (t = (e = r).match(/^\s*/)[0].length, n = new RegExp("^\\s{0," + t + "}", "gm"), 
        r = e.replace(n, "")), r = r, r = s.subParser("detab")(r, u, a), r = s.subParser("stripBlankLines")(r, u, a), 
        s.helper.forEach(p, function(e) {
            r = s.subParser("runExtension")(e, r, u, a);
        }), r = s.subParser("hashPreCodeTags")(r, u, a), r = s.subParser("githubCodeBlocks")(r, u, a), 
        r = s.subParser("hashHTMLBlocks")(r, u, a), r = s.subParser("hashHTMLSpans")(r, u, a), 
        r = s.subParser("stripLinkDefinitions")(r, u, a), r = s.subParser("blockGamut")(r, u, a), 
        r = s.subParser("unhashHTMLSpans")(r, u, a), r = (r = (r = s.subParser("unescapeSpecialChars")(r, u, a)).replace(/~D/g, "$$")).replace(/~T/g, "~"), 
        s.helper.forEach(h, function(e) {
            r = s.subParser("runExtension")(e, r, u, a);
        }), r;
    }, this.setOption = function(e, r) {
        u[e] = r;
    }, this.getOption = function(e) {
        return u[e];
    }, this.getOptions = function() {
        return u;
    }, this.addExtension = function(e, r) {
        a(e, r = r || null);
    }, this.useExtension = function(e) {
        a(e);
    }, this.setFlavor = function(e) {
        if (l.hasOwnProperty(e)) {
            var r = l[e];
            for (var t in r) r.hasOwnProperty(t) && (u[t] = r[t]);
        }
    }, this.removeExtension = function(e) {
        s.helper.isArray(e) || (e = [ e ]);
        for (var r = 0; r < e.length; ++r) {
            for (var t = e[r], n = 0; n < p.length; ++n) p[n] === t && p[n].splice(n, 1);
            for (;0 < h.length; ++n) h[0] === t && h[0].splice(n, 1);
        }
    }, this.getAllExtensions = function() {
        return {
            language: p,
            output: h
        };
    };
}, s.subParser("anchors", function(e, r, f) {
    var t = function(e, r, t, n, a, o, i, l) {
        s.helper.isUndefined(l) && (l = ""), e = r;
        var c = t, u = n.toLowerCase(), p = a, h = l;
        if (!p) if (u || (u = c.toLowerCase().replace(/ ?\n/g, " ")), p = "#" + u, s.helper.isUndefined(f.gUrls[u])) {
            if (!(-1 < e.search(/\(\s*\)$/m))) return e;
            p = "";
        } else p = f.gUrls[u], s.helper.isUndefined(f.gTitles[u]) || (h = f.gTitles[u]);
        var d = '<a href="' + (p = s.helper.escapeCharacters(p, "*_", !1)) + '"';
        return "" !== h && null !== h && (h = h.replace(/"/g, "&quot;"), d += ' title="' + (h = s.helper.escapeCharacters(h, "*_", !1)) + '"'), 
        d + ">" + c + "</a>";
    };
    return e = (e = (e = (e = f.converter._dispatch("anchors.before", e, r, f)).replace(/(\[((?:\[[^\]]*]|[^\[\]])*)][ ]?(?:\n[ ]*)?\[(.*?)])()()()()/g, t)).replace(/(\[((?:\[[^\]]*]|[^\[\]])*)]\([ \t]*()<?(.*?(?:\(.*?\).*?)?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/g, t)).replace(/(\[([^\[\]]+)])()()()()()/g, t), 
    f.converter._dispatch("anchors.after", e, r, f);
}), s.subParser("autoLinks", function(e, r, t) {
    function n(e, r) {
        var t = r;
        return /^www\./i.test(r) && (r = r.replace(/^www\./i, "http://www.")), '<a href="' + r + '">' + t + "</a>";
    }
    function a(e, r) {
        var t = s.subParser("unescapeSpecialChars")(r);
        return s.subParser("encodeEmailAddress")(t);
    }
    return e = (e = (e = t.converter._dispatch("autoLinks.before", e, r, t)).replace(/<(((https?|ftp|dict):\/\/|www\.)[^'">\s]+)>/gi, n)).replace(/<(?:mailto:)?([-.\w]+@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+)>/gi, a), 
    r.simplifiedAutoLink && (e = (e = e.replace(/\b(((https?|ftp|dict):\/\/|www\.)[^'">\s]+\.[^'">\s]+)(?=\s|$)(?!["<>])/gi, n)).replace(/(?:^|[ \n\t])([A-Za-z0-9!#$%&'*+-/=?^_`\{|}~\.]+@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+)(?:$|[ \n\t])/gi, a)), 
    t.converter._dispatch("autoLinks.after", e, r, t);
}), s.subParser("blockGamut", function(e, r, t) {
    e = t.converter._dispatch("blockGamut.before", e, r, t), e = s.subParser("blockQuotes")(e, r, t), 
    e = s.subParser("headers")(e, r, t);
    var n = s.subParser("hashBlock")("<hr />", r, t);
    return e = (e = (e = e.replace(/^[ ]{0,2}([ ]?\*[ ]?){3,}[ \t]*$/gm, n)).replace(/^[ ]{0,2}([ ]?\-[ ]?){3,}[ \t]*$/gm, n)).replace(/^[ ]{0,2}([ ]?_[ ]?){3,}[ \t]*$/gm, n), 
    e = s.subParser("lists")(e, r, t), e = s.subParser("codeBlocks")(e, r, t), e = s.subParser("tables")(e, r, t), 
    e = s.subParser("hashHTMLBlocks")(e, r, t), e = s.subParser("paragraphs")(e, r, t), 
    t.converter._dispatch("blockGamut.after", e, r, t);
}), s.subParser("blockQuotes", function(e, n, a) {
    return e = (e = a.converter._dispatch("blockQuotes.before", e, n, a)).replace(/((^[ \t]{0,3}>[ \t]?.+\n(.+\n)*\n*)+)/gm, function(e, r) {
        var t = r;
        return t = (t = (t = t.replace(/^[ \t]*>[ \t]?/gm, "~0")).replace(/~0/g, "")).replace(/^[ \t]+$/gm, ""), 
        t = s.subParser("githubCodeBlocks")(t, n, a), t = (t = (t = s.subParser("blockGamut")(t, n, a)).replace(/(^|\n)/g, "$1  ")).replace(/(\s*<pre>[^\r]+?<\/pre>)/gm, function(e, r) {
            var t = r;
            return (t = t.replace(/^  /gm, "~0")).replace(/~0/g, "");
        }), s.subParser("hashBlock")("<blockquote>\n" + t + "\n</blockquote>", n, a);
    }), a.converter._dispatch("blockQuotes.after", e, n, a);
}), s.subParser("codeBlocks", function(e, i, l) {
    e = l.converter._dispatch("codeBlocks.before", e, i, l);
    return e = (e = (e += "~0").replace(/(?:\n\n|^)((?:(?:[ ]{4}|\t).*\n+)+)(\n*[ ]{0,3}[^ \t\n]|(?=~0))/g, function(e, r, t) {
        var n = r, a = t, o = "\n";
        return n = s.subParser("outdent")(n), n = s.subParser("encodeCode")(n), n = (n = (n = s.subParser("detab")(n)).replace(/^\n+/g, "")).replace(/\n+$/g, ""), 
        i.omitExtraWLInCodeBlocks && (o = ""), n = "<pre><code>" + n + o + "</code></pre>", 
        s.subParser("hashBlock")(n, i, l) + a;
    })).replace(/~0/, ""), l.converter._dispatch("codeBlocks.after", e, i, l);
}), s.subParser("codeSpans", function(e, r, t) {
    return void 0 === (e = t.converter._dispatch("codeSpans.before", e, r, t)) && (e = ""), 
    e = e.replace(/(^|[^\\])(`+)([^\r]*?[^`])\2(?!`)/gm, function(e, r, t, n) {
        var a = n;
        return a = (a = a.replace(/^([ \t]*)/g, "")).replace(/[ \t]*$/g, ""), r + "<code>" + (a = s.subParser("encodeCode")(a)) + "</code>";
    }), t.converter._dispatch("codeSpans.after", e, r, t);
}), s.subParser("detab", function(e) {
    return (e = (e = (e = (e = e.replace(/\t(?=\t)/g, "    ")).replace(/\t/g, "~A~B")).replace(/~B(.+?)~A/g, function(e, r) {
        for (var t = r, n = 4 - t.length % 4, s = 0; s < n; s++) t += " ";
        return t;
    })).replace(/~A/g, "    ")).replace(/~B/g, "");
}), s.subParser("encodeAmpsAndAngles", function(e) {
    return (e = e.replace(/&(?!#?[xX]?(?:[0-9a-fA-F]+|\w+);)/g, "&amp;")).replace(/<(?![a-z\/?\$!])/gi, "&lt;");
}), s.subParser("encodeBackslashEscapes", function(e) {
    return (e = e.replace(/\\(\\)/g, s.helper.escapeCharactersCallback)).replace(/\\([`*_{}\[\]()>#+-.!])/g, s.helper.escapeCharactersCallback);
}), s.subParser("encodeCode", function(e) {
    return e = (e = (e = e.replace(/&/g, "&amp;")).replace(/</g, "&lt;")).replace(/>/g, "&gt;"), 
    s.helper.escapeCharacters(e, "*_{}[]\\", !1);
}), s.subParser("encodeEmailAddress", function(e) {
    var t = [ function(e) {
        return "&#" + e.charCodeAt(0) + ";";
    }, function(e) {
        return "&#x" + e.charCodeAt(0).toString(16) + ";";
    }, function(e) {
        return e;
    } ];
    return (e = '<a href="' + (e = (e = "mailto:" + e).replace(/./g, function(e) {
        if ("@" === e) e = t[Math.floor(2 * Math.random())](e); else if (":" !== e) {
            var r = Math.random();
            e = .9 < r ? t[2](e) : .45 < r ? t[1](e) : t[0](e);
        }
        return e;
    })) + '">' + e + "</a>").replace(/">.+:/g, '">');
}), s.subParser("escapeSpecialCharsWithinTagAttributes", function(e) {
    return e.replace(/(<[a-z\/!$]("[^"]*"|'[^']*'|[^'">])*>|<!(--.*?--\s*)+>)/gi, function(e) {
        var r = e.replace(/(.)<\/?code>(?=.)/g, "$1`");
        return s.helper.escapeCharacters(r, "\\`*_", !1);
    });
}), s.subParser("githubCodeBlocks", function(e, a, o) {
    return a.ghCodeBlocks ? (e = o.converter._dispatch("githubCodeBlocks.before", e, a, o), 
    e = (e = (e += "~0").replace(/(?:^|\n)```(.*)\n([\s\S]*?)\n```/g, function(e, r, t) {
        var n = a.omitExtraWLInCodeBlocks ? "" : "\n";
        return t = s.subParser("encodeCode")(t), t = "<pre><code" + (r ? ' class="' + r + " language-" + r + '"' : "") + ">" + (t = (t = (t = s.subParser("detab")(t)).replace(/^\n+/g, "")).replace(/\n+$/g, "")) + n + "</code></pre>", 
        t = s.subParser("hashBlock")(t, a, o), "\n\n~G" + (o.ghCodeBlocks.push({
            text: e,
            codeblock: t
        }) - 1) + "G\n\n";
    })).replace(/~0/, ""), o.converter._dispatch("githubCodeBlocks.after", e, a, o)) : e;
}), s.subParser("hashBlock", function(e, r, t) {
    return e = e.replace(/(^\n+|\n+$)/g, ""), "\n\n~K" + (t.gHtmlBlocks.push(e) - 1) + "K\n\n";
}), s.subParser("hashElement", function(e, r, n) {
    return function(e, r) {
        var t = r;
        return t = (t = (t = t.replace(/\n\n/g, "\n")).replace(/^\n/, "")).replace(/\n+$/g, ""), 
        "\n\n~K" + (n.gHtmlBlocks.push(t) - 1) + "K\n\n";
    };
}), s.subParser("hashHTMLBlocks", function(e, r, a) {
    for (var t = [ "pre", "div", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "table", "dl", "ol", "ul", "script", "noscript", "form", "fieldset", "iframe", "math", "style", "section", "header", "footer", "nav", "article", "aside", "address", "audio", "canvas", "figure", "hgroup", "output", "video", "p" ], n = 0; n < t.length; ++n) e = s.helper.replaceRecursiveRegExp(e, function(e, r, t, n) {
        var s = e;
        return -1 !== t.search(/\bmarkdown\b/) && (s = t + a.converter.makeHtml(r) + n), 
        "\n\n~K" + (a.gHtmlBlocks.push(s) - 1) + "K\n\n";
    }, "^(?: |\\t){0,3}<" + t[n] + "\\b[^>]*>", "</" + t[n] + ">", "gim");
    return (e = (e = e.replace(/(\n[ ]{0,3}(<(hr)\b([^<>])*?\/?>)[ \t]*(?=\n{2,}))/g, s.subParser("hashElement")(e, r, a))).replace(/(<!--[\s\S]*?-->)/g, s.subParser("hashElement")(e, r, a))).replace(/(?:\n\n)([ ]{0,3}(?:<([?%])[^\r]*?\2>)[ \t]*(?=\n{2,}))/g, s.subParser("hashElement")(e, r, a));
}), s.subParser("hashHTMLSpans", function(e, r, t) {
    for (var n = s.helper.matchRecursiveRegExp(e, "<code\\b[^>]*>", "</code>", "gi"), a = 0; a < n.length; ++a) e = e.replace(n[a][0], "~L" + (t.gHtmlSpans.push(n[a][0]) - 1) + "L");
    return e;
}), s.subParser("unhashHTMLSpans", function(e, r, t) {
    for (var n = 0; n < t.gHtmlSpans.length; ++n) e = e.replace("~L" + n + "L", t.gHtmlSpans[n]);
    return e;
}), s.subParser("hashPreCodeTags", function(e, r, o) {
    return s.helper.replaceRecursiveRegExp(e, function(e, r, t, n) {
        var a = t + s.subParser("encodeCode")(r) + n;
        return "\n\n~G" + (o.ghCodeBlocks.push({
            text: e,
            codeblock: a
        }) - 1) + "G\n\n";
    }, "^(?: |\\t){0,3}<pre\\b[^>]*>\\s*<code\\b[^>]*>", "^(?: |\\t){0,3}</code>\\s*</pre>", "gim");
}), s.subParser("headers", function(e, l, c) {
    function u(e) {
        var r, t = e.replace(/[^\w]/g, "").toLowerCase();
        return c.hashLinkCounts[t] ? r = t + "-" + c.hashLinkCounts[t]++ : (r = t, c.hashLinkCounts[t] = 1), 
        !0 === n && (n = "section"), s.helper.isString(n) ? n + r : r;
    }
    e = c.converter._dispatch("headers.before", e, l, c);
    var n = l.prefixHeaderId, p = isNaN(parseInt(l.headerLevelStart)) ? 1 : parseInt(l.headerLevelStart), r = l.smoothLivePreview ? /^(.+)[ \t]*\n={2,}[ \t]*\n+/gm : /^(.+)[ \t]*\n=+[ \t]*\n+/gm, t = l.smoothLivePreview ? /^(.+)[ \t]*\n-{2,}[ \t]*\n+/gm : /^(.+)[ \t]*\n-+[ \t]*\n+/gm;
    return e = (e = (e = e.replace(r, function(e, r) {
        var t = s.subParser("spanGamut")(r, l, c), n = l.noHeaderId ? "" : ' id="' + u(r) + '"', a = "<h" + p + n + ">" + t + "</h" + p + ">";
        return s.subParser("hashBlock")(a, l, c);
    })).replace(t, function(e, r) {
        var t = s.subParser("spanGamut")(r, l, c), n = l.noHeaderId ? "" : ' id="' + u(r) + '"', a = p + 1, o = "<h" + a + n + ">" + t + "</h" + a + ">";
        return s.subParser("hashBlock")(o, l, c);
    })).replace(/^(#{1,6})[ \t]*(.+?)[ \t]*#*\n+/gm, function(e, r, t) {
        var n = s.subParser("spanGamut")(t, l, c), a = l.noHeaderId ? "" : ' id="' + u(t) + '"', o = p - 1 + r.length, i = "<h" + o + a + ">" + n + "</h" + o + ">";
        return s.subParser("hashBlock")(i, l, c);
    }), c.converter._dispatch("headers.after", e, l, c);
}), s.subParser("images", function(e, r, d) {
    function t(e, r, t, n, a, o, i, l) {
        var c = d.gUrls, u = d.gTitles, p = d.gDimensions;
        if (t = t.toLowerCase(), l || (l = ""), "" === n || null === n) {
            if ("" !== t && null !== t || (t = r.toLowerCase().replace(/ ?\n/g, " ")), n = "#" + t, 
            s.helper.isUndefined(c[t])) return e;
            n = c[t], s.helper.isUndefined(u[t]) || (l = u[t]), s.helper.isUndefined(p[t]) || (a = p[t].width, 
            o = p[t].height);
        }
        r = r.replace(/"/g, "&quot;"), r = s.helper.escapeCharacters(r, "*_", !1);
        var h = '<img.vue src="' + (n = s.helper.escapeCharacters(n, "*_", !1)) + '" alt="' + r + '"';
        return l && (l = l.replace(/"/g, "&quot;"), h += ' title="' + (l = s.helper.escapeCharacters(l, "*_", !1)) + '"'), 
        a && o && (h += ' width="' + (a = "*" === a ? "auto" : a) + '"', h += ' height="' + (o = "*" === o ? "auto" : o) + '"'), 
        h + " />";
    }
    return e = (e = (e = d.converter._dispatch("images.before", e, r, d)).replace(/!\[([^\]]*?)] ?(?:\n *)?\[(.*?)]()()()()()/g, t)).replace(/!\[(.*?)]\s?\([ \t]*()<?(\S+?)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*(?:(['"])(.*?)\6[ \t]*)?\)/g, t), 
    d.converter._dispatch("images.after", e, r, d);
}), s.subParser("italicsAndBold", function(e, r, t) {
    return e = t.converter._dispatch("italicsAndBold.before", e, r, t), e = r.literalMidWordUnderscores ? (e = (e = (e = e.replace(/(^|\s|>|\b)__(?=\S)([\s\S]+?)__(?=\b|<|\s|$)/gm, "$1<strong>$2</strong>")).replace(/(^|\s|>|\b)_(?=\S)([\s\S]+?)_(?=\b|<|\s|$)/gm, "$1<em>$2</em>")).replace(/(\*\*)(?=\S)([^\r]*?\S[*]*)\1/g, "<strong>$2</strong>")).replace(/(\*)(?=\S)([^\r]*?\S)\1/g, "<em>$2</em>") : (e = e.replace(/(\*\*|__)(?=\S)([^\r]*?\S[*_]*)\1/g, "<strong>$2</strong>")).replace(/(\*|_)(?=\S)([^\r]*?\S)\1/g, "<em>$2</em>"), 
    t.converter._dispatch("italicsAndBold.after", e, r, t);
}), s.subParser("lists", function(e, p, h) {
    function i(e, r) {
        h.gListLevel++, e = e.replace(/\n{2,}$/, "\n");
        var u = /\n[ \t]*\n(?!~0)/.test(e += "~0");
        return e = (e = e.replace(/(\n)?(^[ \t]*)([*+-]|\d+[.])[ \t]+((\[(x|X| )?])?[ \t]*[^\r]+?(\n{1,2}))(?=\n*(~0|\2([*+-]|\d+[.])[ \t]+))/gm, function(e, r, t, n, a, o, i) {
            i = i && "" !== i.trim();
            var l = s.subParser("outdent")(a, p, h), c = "";
            return o && p.tasklists && (c = ' class="task-list-item" style="list-style-type: none;"', 
            l = l.replace(/^[ \t]*\[(x|X| )?]/m, function() {
                var e = '<input type="checkbox" disabled style="margin: 0px 0.35em 0.25em -1.6em; vertical-align: middle;"';
                return i && (e += " checked"), e + ">";
            })), r || -1 < l.search(/\n{2,}/) ? (l = s.subParser("githubCodeBlocks")(l, p, h), 
            l = s.subParser("blockGamut")(l, p, h)) : (l = (l = s.subParser("lists")(l, p, h)).replace(/\n$/, ""), 
            l = u ? s.subParser("paragraphs")(l, p, h) : s.subParser("spanGamut")(l, p, h)), 
            "\n<li" + c + ">" + l + "</li>\n";
        })).replace(/~0/g, ""), h.gListLevel--, r && (e = e.replace(/\s+$/, "")), e;
    }
    function a(e, n, s) {
        var a = "ul" === n ? /^ {0,2}\d+\.[ \t]/gm : /^ {0,2}[*+-][ \t]/gm, r = [], o = "";
        if (-1 !== e.search(a)) {
            !function e(r) {
                var t = r.search(a);
                -1 !== t ? (o += "\n\n<" + n + ">" + i(r.slice(0, t), !!s) + "</" + n + ">\n\n", 
                a = "ul" == (n = "ul" === n ? "ol" : "ul") ? /^ {0,2}\d+\.[ \t]/gm : /^ {0,2}[*+-][ \t]/gm, 
                e(r.slice(t))) : o += "\n\n<" + n + ">" + i(r, !!s) + "</" + n + ">\n\n";
            }(e);
            for (var t = 0; t < r.length; ++t) ;
        } else o = "\n\n<" + n + ">" + i(e, !!s) + "</" + n + ">\n\n";
        return o;
    }
    e = h.converter._dispatch("lists.before", e, p, h), e += "~0";
    var r = /^(([ ]{0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(~0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/gm;
    return h.gListLevel ? e = e.replace(r, function(e, r, t) {
        return a(r, -1 < t.search(/[*+-]/g) ? "ul" : "ol", !0);
    }) : (r = /(\n\n|^\n?)(([ ]{0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(~0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/gm, 
    e = e.replace(r, function(e, r, t, n) {
        return a(t, -1 < n.search(/[*+-]/g) ? "ul" : "ol");
    })), e = e.replace(/~0/, ""), h.converter._dispatch("lists.after", e, p, h);
}), s.subParser("outdent", function(e) {
    return (e = e.replace(/^(\t|[ ]{1,4})/gm, "~0")).replace(/~0/g, "");
}), s.subParser("paragraphs", function(e, r, t) {
    for (var n = (e = (e = (e = t.converter._dispatch("paragraphs.before", e, r, t)).replace(/^\n+/g, "")).replace(/\n+$/g, "")).split(/\n{2,}/g), a = [], o = n.length, i = 0; i < o; i++) {
        var l = n[i];
        0 <= l.search(/~(K|G)(\d+)\1/g) || (l = (l = s.subParser("spanGamut")(l, r, t)).replace(/^([ \t]*)/g, "<p>"), 
        l += "</p>"), a.push(l);
    }
    for (o = a.length, i = 0; i < o; i++) {
        for (var c = "", u = a[i], p = !1; 0 <= u.search(/~(K|G)(\d+)\1/); ) {
            var h = RegExp.$1, d = RegExp.$2;
            c = (c = "K" === h ? t.gHtmlBlocks[d] : p ? s.subParser("encodeCode")(t.ghCodeBlocks[d].text) : t.ghCodeBlocks[d].codeblock).replace(/\$/g, "$$$$"), 
            u = u.replace(/(\n\n)?~(K|G)\d+\2(\n\n)?/, c), /^<pre\b[^>]*>\s*<code\b[^>]*>/.test(u) && (p = !0);
        }
        a[i] = u;
    }
    return e = (e = (e = a.join("\n\n")).replace(/^\n+/g, "")).replace(/\n+$/g, ""), 
    t.converter._dispatch("paragraphs.after", e, r, t);
}), s.subParser("runExtension", function(e, r, t, n) {
    if (e.filter) r = e.filter(r, n.converter, t); else if (e.regex) {
        var s = e.regex;
        !s instanceof RegExp && (s = new RegExp(s, "g")), r = r.replace(s, e.replace);
    }
    return r;
}), s.subParser("spanGamut", function(e, r, t) {
    return e = t.converter._dispatch("spanGamut.before", e, r, t), e = s.subParser("codeSpans")(e, r, t), 
    e = s.subParser("escapeSpecialCharsWithinTagAttributes")(e, r, t), e = s.subParser("encodeBackslashEscapes")(e, r, t), 
    e = s.subParser("images")(e, r, t), e = s.subParser("anchors")(e, r, t), e = s.subParser("autoLinks")(e, r, t), 
    e = s.subParser("encodeAmpsAndAngles")(e, r, t), e = s.subParser("italicsAndBold")(e, r, t), 
    e = (e = s.subParser("strikethrough")(e, r, t)).replace(/  +\n/g, " <br />\n"), 
    t.converter._dispatch("spanGamut.after", e, r, t);
}), s.subParser("strikethrough", function(e, r, t) {
    return r.strikethrough && (e = (e = t.converter._dispatch("strikethrough.before", e, r, t)).replace(/(?:~T){2}([\s\S]+?)(?:~T){2}/g, "<del>$1</del>"), 
    e = t.converter._dispatch("strikethrough.after", e, r, t)), e;
}), s.subParser("stripBlankLines", function(e) {
    return e.replace(/^[ \t]+$/gm, "");
}), s.subParser("stripLinkDefinitions", function(e, l, c) {
    return (e = (e += "~0").replace(/^ {0,3}\[(.+)]:[ \t]*\n?[ \t]*<?(\S+?)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*\n?[ \t]*(?:(\n*)["|'(](.+?)["|')][ \t]*)?(?:\n+|(?=~0))/gm, function(e, r, t, n, a, o, i) {
        return r = r.toLowerCase(), c.gUrls[r] = s.subParser("encodeAmpsAndAngles")(t), 
        o ? o + i : (i && (c.gTitles[r] = i.replace(/"|'/g, "&quot;")), l.parseImgDimensions && n && a && (c.gDimensions[r] = {
            width: n,
            height: a
        }), "");
    })).replace(/~0/, "");
}), s.subParser("tables", function(e, v, m) {
    if (!v.tables) return e;
    return e = (e = m.converter._dispatch("tables.before", e, v, m)).replace(/^[ \t]{0,3}\|?.+\|.+\n[ \t]{0,3}\|?[ \t]*:?[ \t]*(?:-|=){2,}[ \t]*:?[ \t]*\|[ \t]*:?[ \t]*(?:-|=){2,}[\s\S]+?(?:\n\n|~0)/gm, function(e) {
        var r, t = e.split("\n");
        for (r = 0; r < t.length; ++r) /^[ \t]{0,3}\|/.test(t[r]) && (t[r] = t[r].replace(/^[ \t]{0,3}\|/, "")), 
        /\|[ \t]*$/.test(t[r]) && (t[r] = t[r].replace(/\|[ \t]*$/, ""));
        var n, a, o, i, l, c = t[0].split("|").map(function(e) {
            return e.trim();
        }), u = t[1].split("|").map(function(e) {
            return e.trim();
        }), p = [], h = [], d = [], f = [];
        for (t.shift(), t.shift(), r = 0; r < t.length; ++r) "" !== t[r].trim() && p.push(t[r].split("|").map(function(e) {
            return e.trim();
        }));
        if (c.length < u.length) return e;
        for (r = 0; r < u.length; ++r) d.push((n = u[r], /^:[ \t]*--*$/.test(n) ? ' style="text-align:left;"' : /^--*[ \t]*:[ \t]*$/.test(n) ? ' style="text-align:right;"' : /^:[ \t]*--*[ \t]*:$/.test(n) ? ' style="text-align:center;"' : ""));
        for (r = 0; r < c.length; ++r) s.helper.isUndefined(d[r]) && (d[r] = ""), h.push((a = c[r], 
        o = d[r], i = void 0, i = "", a = a.trim(), v.tableHeaderId && (i = ' id="' + a.replace(/ /g, "_").toLowerCase() + '"'), 
        "<th" + i + o + ">" + (a = s.subParser("spanGamut")(a, v, m)) + "</th>\n"));
        for (r = 0; r < p.length; ++r) {
            for (var g = [], b = 0; b < h.length; ++b) s.helper.isUndefined(p[r][b]), g.push((l = p[r][b], 
            "<td" + d[b] + ">" + s.subParser("spanGamut")(l, v, m) + "</td>\n"));
            f.push(g);
        }
        return function(e, r) {
            for (var t = "<table>\n<thead>\n<tr>\n", n = e.length, s = 0; s < n; ++s) t += e[s];
            for (t += "</tr>\n</thead>\n<tbody>\n", s = 0; s < r.length; ++s) {
                t += "<tr>\n";
                for (var a = 0; a < n; ++a) t += r[s][a];
                t += "</tr>\n";
            }
            return t + "</tbody>\n</table>\n";
        }(h, f);
    }), m.converter._dispatch("tables.after", e, v, m);
}), s.subParser("unescapeSpecialChars", function(e) {
    return e.replace(/~E(\d+)E/g, function(e, r) {
        var t = parseInt(r);
        return String.fromCharCode(t);
    });
}), module.exports = s;