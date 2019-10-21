var startTag = /^<([-A-Za-z0-9_]+)((?:\s+[a-zA-Z_:][-a-zA-Z0-9_:.]*(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/, endTag = /^<\/([-A-Za-z0-9_]+)[^>]*>/, attr = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g, empty = makeMap("area,base,basefont,br,col,frame,hr,img,input,link,meta,param,embed,command,keygen,source,track,wbr"), block = makeMap("a,address,article,applet,aside,audio,blockquote,button,canvas,center,dd,del,dir,div,dl,dt,fieldset,figcaption,figure,footer,form,frameset,h1,h2,h3,h4,h5,h6,header,hgroup,hr,iframe,ins,isindex,li,map,menu,noframes,noscript,object,ol,output,p,pre,section,script,table,tbody,td,tfoot,th,thead,tr,ul,video"), inline = makeMap("abbr,acronym,applet,b,basefont,bdo,big,br,button,cite,code,del,dfn,em,font,i,iframe,img,input,ins,kbd,label,map,object,q,s,samp,script,select,small,span,strike,strong,sub,sup,textarea,tt,u,var"), closeSelf = makeMap("colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr"), fillAttrs = makeMap("checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected"), special = makeMap("script,style"), HTMLParser = function(e, n) {
    var t, a, r, s = [], i = e;
    for (s.last = function() {
        return this[this.length - 1];
    }; e; ) {
        if (a = !0, s.last() && special[s.last()]) e = e.replace(new RegExp("([\\s\\S]*?)</" + s.last() + "[^>]*>"), function(e, t) {
            return t = t.replace(/<!--([\s\S]*?)-->|<!\[CDATA\[([\s\S]*?)]]>/g, "$1$2"), n.chars && n.chars(t), 
            "";
        }), c("", s.last()); else if (0 == e.indexOf("\x3c!--") ? 0 <= (t = e.indexOf("--\x3e")) && (n.comment && n.comment(e.substring(4, t)), 
        e = e.substring(t + 3), a = !1) : 0 == e.indexOf("</") ? (r = e.match(endTag)) && (e = e.substring(r[0].length), 
        r[0].replace(endTag, c), a = !1) : 0 == e.indexOf("<") && (r = e.match(startTag)) && (e = e.substring(r[0].length), 
        r[0].replace(startTag, o), a = !1), a) {
            var l = (t = e.indexOf("<")) < 0 ? e : e.substring(0, t);
            e = t < 0 ? "" : e.substring(t), n.chars && n.chars(l);
        }
        if (e == i) throw "Parse Error: " + e;
        i = e;
    }
    function o(e, t, a, r) {
        if (t = t.toLowerCase(), block[t]) for (;s.last() && inline[s.last()]; ) c("", s.last());
        if (closeSelf[t] && s.last() == t && c("", t), (r = empty[t] || !!r) || s.push(t), 
        n.start) {
            var i = [];
            a.replace(attr, function(e, t) {
                var a = arguments[2] ? arguments[2] : arguments[3] ? arguments[3] : arguments[4] ? arguments[4] : fillAttrs[t] ? t : "";
                i.push({
                    name: t,
                    value: a,
                    escaped: a.replace(/(^|[^\\])"/g, '$1\\"')
                });
            }), n.start && n.start(t, i, r);
        }
    }
    function c(e, t) {
        if (t) for (a = s.length - 1; 0 <= a && s[a] != t; a--) ; else var a = 0;
        if (0 <= a) {
            for (var r = s.length - 1; a <= r; r--) n.end && n.end(s[r]);
            s.length = a;
        }
    }
    c();
};

function makeMap(e) {
    for (var t = {}, a = e.split(","), r = 0; r < a.length; r++) t[a[r]] = !0;
    return t;
}

var global = {}, debug = function() {};

function q(e) {
    return '"' + e + '"';
}

function removeDOCTYPE(e) {
    return e.replace(/<\?xml.*\?>\n/, "").replace(/<!doctype.*\>\n/, "").replace(/<!DOCTYPE.*\>\n/, "");
}

global.html2json = function(e) {
    e = removeDOCTYPE(e);
    var n = [], s = {
        node: "root",
        child: []
    };
    return HTMLParser(e, {
        start: function(e, t, a) {
            debug(e, t, a);
            var r = {
                node: "element",
                tag: e
            };
            if (0 !== t.length && (r.attr = t.reduce(function(e, t) {
                var a = t.name, r = t.value;
                return r.match(/ /) && (r = r.split(" ")), e[a] ? Array.isArray(e[a]) ? e[a].push(r) : e[a] = [ e[a], r ] : e[a] = r, 
                e;
            }, {})), a) {
                var i = n[0] || s;
                void 0 === i.child && (i.child = []), i.child.push(r);
            } else n.unshift(r);
        },
        end: function(e) {
            debug(e);
            var t = n.shift();
            if (t.tag !== e && console.error("invalid state: mismatch end tag"), 0 === n.length) s.child.push(t); else {
                var a = n[0];
                void 0 === a.child && (a.child = []), a.child.push(t);
            }
        },
        chars: function(e) {
            debug(e);
            var t = {
                node: "text",
                text: e
            };
            if (0 === n.length) s.child.push(t); else {
                var a = n[0];
                void 0 === a.child && (a.child = []), a.child.push(t);
            }
        },
        comment: function(e) {
            debug(e);
            var t = {
                node: "comment",
                text: e
            }, a = n[0];
            void 0 === a.child && (a.child = []), a.child.push(t);
        }
    }), s;
}, global.json2html = function t(a) {
    var e = "";
    a.child && (e = a.child.map(function(e) {
        return t(e);
    }).join(""));
    var r = "";
    if (a.attr && "" !== (r = Object.keys(a.attr).map(function(e) {
        var t = a.attr[e];
        return Array.isArray(t) && (t = t.join(" ")), e + "=" + q(t);
    }).join(" ")) && (r = " " + r), "element" === a.node) {
        var i = a.tag;
        return -1 < [ "area", "base", "basefont", "br", "col", "frame", "hr", "img", "input", "isindex", "link", "meta", "param", "embed" ].indexOf(i) ? "<" + a.tag + r + "/>" : "<" + a.tag + r + ">" + e + ("</" + a.tag + ">");
    }
    return "text" === a.node ? a.text : "comment" === a.node ? "\x3c!--" + a.text + "--\x3e" : "root" === a.node ? e : void 0;
};

var html2wxwebview = function(e) {
    var t = global.html2json(e);
    return t = parseHtmlNode(t), t = arrangeNode(t);
}, arrangeNode = function(e) {
    for (var t = [], a = [], r = 0, i = e.length; r < i; r++) if (0 == r) {
        if ("view" == e[r].type) continue;
        t.push(e[r]);
    } else if ("view" == e[r].type) {
        if (0 < t.length) {
            var n = {
                type: "view",
                child: t
            };
            a.push(n);
        }
        t = [];
    } else if ("img" == e[r].type) {
        if (0 < t.length) {
            n = {
                type: "view",
                child: t
            };
            a.push(n);
        }
        var s = e[r].attr;
        e[r].attr.width && -1 === e[r].attr.width.indexOf("%") && -1 === e[r].attr.width.indexOf("px") && (e[r].attr.width = e[r].attr.width + "px"), 
        e[r].attr.height && -1 === e[r].attr.height.indexOf("%") && -1 === e[r].attr.height.indexOf("px") && (e[r].attr.height = e[r].attr.height + "px");
        n = {
            type: "img",
            attr: s
        };
        a.push(n), t = [];
    } else if (t.push(e[r]), r == i - 1) {
        n = {
            type: "view",
            child: t
        };
        a.push(n);
    }
    return a;
}, parseHtmlNode = function(e) {
    var n = [];
    return function e(t) {
        var a = {};
        if ("root" == t.node) ; else if ("element" == t.node) switch (t.tag) {
          case "a":
            a = {
                type: "a",
                text: t.child[0].text
            };
            break;

          case "img":
            a = {
                type: "img",
                text: t.text
            };
            break;

          case "p":
          case "div":
            a = {
                type: "view",
                text: t.text
            };
        } else "text" == t.node && (a = {
            type: "text",
            text: t.text
        });
        if (t.attr && (a.attr = t.attr), 0 != Object.keys(a).length && n.push(a), "a" != t.tag) {
            var r = t.child;
            if (r) for (var i in r) e(r[i]);
        }
    }(e), n;
};

module.exports = {
    html2json: html2wxwebview
};