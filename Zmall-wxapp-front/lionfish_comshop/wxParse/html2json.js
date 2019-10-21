function e(e) {
    for (var t = {}, r = e.split(","), s = 0; s < r.length; s++) t[r[s]] = !0;
    return t;
}

function t(e) {
    return e.replace(/<\?xml.*\?>\n/, "").replace(/<.*!doctype.*\>\n/, "").replace(/<.*!DOCTYPE.*\>\n/, "");
}

function r(e) {
    return e.replace(/\r?\n+/g, "").replace(/<!--.*?-->/gi, "").replace(/\/\*.*?\*\//gi, "").replace(/[ ]+</gi, "<");
}

function s(e) {
    var t = [];
    if (0 == n.length || !i) return (d = {}).node = "text", d.text = e, [ d ];
    e = e.replace(/\[([^\[\]]+)\]/g, ":$1:");
    for (var r = new RegExp("[:]"), s = e.split(r), a = 0; a < s.length; a++) {
        var l = s[a], d = {};
        i[l] ? (d.node = "element", d.tag = "emoji", d.text = i[l], d.baseSrc = o) : (d.node = "text", 
        d.text = l), t.push(d);
    }
    return t;
}

var a = "https", n = "", o = "", i = {}, l = require("./wxDiscode.js"), d = require("./htmlparser.js"), c = (e("area,base,basefont,br,col,frame,hr,img.vue,input,link,meta,param,embed,command,keygen,source,track,wbr"), 
e("br,a,code,address,article,applet,aside,audio,blockquote,button,canvas,center,dd,del,dir,div,dl,dt,fieldset,figcaption,figure,footer,form,frameset,h1,h2,h3,h4,h5,h6,header,hgroup,hr,iframe,ins,isindex,li,map,menu,noframes,noscript,object,ol,output,p,pre,section,script,table,tbody,td,tfoot,th,thead,tr,ul,video")), u = e("abbr,acronym,applet,b,basefont,bdo,big,button,cite,del,dfn,em,font,i,iframe,img.vue,input,ins,kbd,label,map,object,q,s,samp,script,select,small,span,strike,strong,sub,sup,textarea,tt,u,var"), p = e("colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr");

e("checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected"), 
e("wxxxcode-style,script,style,view,scroll-view,block"), module.exports = {
    html2json: function(e, f) {
        e = r(e = t(e)), e = l.strDiscode(e);
        var h = [], v = {
            node: f,
            nodes: [],
            images: [],
            imageUrls: []
        }, x = 0;
        return d(e, {
            start: function(e, t, r) {
                var n = {
                    node: "element",
                    tag: e
                };
                if (0 === h.length ? (n.index = x.toString(), x += 1) : (void 0 === (m = h[0]).nodes && (m.nodes = []), 
                n.index = m.index + "." + m.nodes.length), c[e] ? n.tagType = "block" : u[e] ? n.tagType = "inline" : p[e] && (n.tagType = "closeSelf"), 
                0 !== t.length && (n.attr = t.reduce(function(e, t) {
                    var r = t.name, s = t.value;
                    return "class" == r && (n.classStr = s), "style" == r && (n.styleStr = s), s.match(/ /) && (s = s.split(" ")), 
                    e[r] ? Array.isArray(e[r]) ? e[r].push(s) : e[r] = [ e[r], s ] : e[r] = s, e;
                }, {})), "img" === n.tag) {
                    n.imgIndex = v.images.length;
                    var s = n.attr.src;
                    "" == s[0] && s.splice(0, 1), s = l.urlToHttpUrl(s, a), n.attr.src = s, n.from = f, 
                    v.images.push(n), v.imageUrls.push(s);
                }
                if ("font" === n.tag) {
                    var o = [ "x-small", "small", "medium", "large", "x-large", "xx-large", "-webkit-xxx-large" ], i = {
                        color: "color",
                        face: "font-family",
                        size: "font-size"
                    };
                    for (var d in n.attr.style || (n.attr.style = []), n.styleStr || (n.styleStr = ""), 
                    i) if (n.attr[d]) {
                        var g = "size" === d ? o[n.attr[d] - 1] : n.attr[d];
                        n.attr.style.push(i[d]), n.attr.style.push(g), n.styleStr += i[d] + ": " + g + ";";
                    }
                }
                if ("source" === n.tag && (v.source = n.attr.src), r) {
                    var m = h[0] || v;
                    void 0 === m.nodes && (m.nodes = []), m.nodes.push(n);
                } else h.unshift(n);
            },
            end: function(e) {
                var t = h.shift();
                if (t.tag !== e && console.error("invalid state: mismatch end tag"), "video" === t.tag && v.source && (t.attr.src = v.source, 
                delete v.source), 0 === h.length) v.nodes.push(t); else {
                    var r = h[0];
                    void 0 === r.nodes && (r.nodes = []), r.nodes.push(t);
                }
            },
            chars: function(e) {
                var t = {
                    node: "text",
                    text: e,
                    textArray: s(e)
                };
                if (0 === h.length) t.index = x.toString(), x += 1, v.nodes.push(t); else {
                    var r = h[0];
                    void 0 === r.nodes && (r.nodes = []), t.index = r.index + "." + r.nodes.length, 
                    r.nodes.push(t);
                }
            },
            comment: function(e) {}
        }), v;
    },
    emojisInit: function() {
        var e = 0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : "", t = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : "/wxParse/emojis/", r = arguments[2];
        n = e, o = t, i = r;
    }
};