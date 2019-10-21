Object.defineProperty(exports, "__esModule", {
    value: !0
});

var _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(t) {
    return typeof t;
} : function(t) {
    return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
}, _createClass = function() {
    function i(t, e) {
        for (var n = 0; n < e.length; n++) {
            var i = e[n];
            i.enumerable = i.enumerable || !1, i.configurable = !0, "value" in i && (i.writable = !0), 
            Object.defineProperty(t, i.key, i);
        }
    }
    return function(t, e, n) {
        return e && i(t.prototype, e), n && i(t, n), t;
    };
}();

function _classCallCheck(t, e) {
    if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function");
}

var WxValidate = function() {
    function n() {
        var t = 0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : {}, e = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : {};
        _classCallCheck(this, n), Object.assign(this, {
            data: {},
            rules: t,
            messages: e
        }), this.__init();
    }
    return _createClass(n, [ {
        key: "__init",
        value: function() {
            this.__initMethods(), this.__initDefaults(), this.__initData();
        }
    }, {
        key: "__initData",
        value: function() {
            this.form = {}, this.errorList = [];
        }
    }, {
        key: "__initDefaults",
        value: function() {
            this.defaults = {
                messages: {
                    required: "这是必填字段。",
                    email: "请输入有效的电子邮件地址。",
                    tel: "请输入11位的手机号码。",
                    url: "请输入有效的网址。",
                    date: "请输入有效的日期。",
                    dateISO: "请输入有效的日期（ISO），例如：2009-06-23，1998/01/22。",
                    number: "请输入有效的数字。",
                    digits: "只能输入数字。",
                    idcard: "请输入18位的有效身份证。",
                    equalTo: this.formatTpl("输入值必须和 {0} 相同。"),
                    contains: this.formatTpl("输入值必须包含 {0}。"),
                    minlength: this.formatTpl("最少要输入 {0} 个字符。"),
                    maxlength: this.formatTpl("最多可以输入 {0} 个字符。"),
                    rangelength: this.formatTpl("请输入长度在 {0} 到 {1} 之间的字符。"),
                    min: this.formatTpl("请输入不小于 {0} 的数值。"),
                    max: this.formatTpl("请输入不大于 {0} 的数值。"),
                    range: this.formatTpl("请输入范围在 {0} 到 {1} 之间的数值。")
                }
            };
        }
    }, {
        key: "__initMethods",
        value: function() {
            var n = this;
            n.methods = {
                required: function(t, e) {
                    if (!n.depend(e)) return "dependency-mismatch";
                    if ("number" == typeof t) t = t.toString(); else if ("boolean" == typeof t) return !0;
                    return 0 < t.length;
                },
                email: function(t) {
                    return n.optional(t) || /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(t);
                },
                tel: function(t) {
                    return n.optional(t) || /^1[23456789]\d{9}$/.test(t);
                },
                url: function(t) {
                    return n.optional(t) || /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(t);
                },
                date: function(t) {
                    return n.optional(t) || !/Invalid|NaN/.test(new Date(t).toString());
                },
                dateISO: function(t) {
                    return n.optional(t) || /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/.test(t);
                },
                number: function(t) {
                    return n.optional(t) || /^(?:-?\d+|-?\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(t);
                },
                digits: function(t) {
                    return n.optional(t) || /^\d+$/.test(t);
                },
                idcard: function(t) {
                    return n.optional(t) || /^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/.test(t);
                },
                equalTo: function(t, e) {
                    return n.optional(t) || t === n.data[e];
                },
                contains: function(t, e) {
                    return n.optional(t) || 0 <= t.indexOf(e);
                },
                minlength: function(t, e) {
                    return n.optional(t) || t.length >= e;
                },
                maxlength: function(t, e) {
                    return n.optional(t) || t.length <= e;
                },
                rangelength: function(t, e) {
                    return n.optional(t) || t.length >= e[0] && t.length <= e[1];
                },
                min: function(t, e) {
                    return n.optional(t) || e <= t;
                },
                max: function(t, e) {
                    return n.optional(t) || t <= e;
                },
                range: function(t, e) {
                    return n.optional(t) || t >= e[0] && t <= e[1];
                }
            };
        }
    }, {
        key: "addMethod",
        value: function(t, e, n) {
            this.methods[t] = e, this.defaults.messages[t] = void 0 !== n ? n : this.defaults.messages[t];
        }
    }, {
        key: "isValidMethod",
        value: function(t) {
            var e = [];
            for (var n in this.methods) n && "function" == typeof this.methods[n] && e.push(n);
            return -1 !== e.indexOf(t);
        }
    }, {
        key: "formatTpl",
        value: function(n, t) {
            var e = this;
            return 1 === arguments.length ? function() {
                var t = Array.from(arguments);
                return t.unshift(n), e.formatTpl.apply(this, t);
            } : (void 0 === t || (2 < arguments.length && t.constructor !== Array && (t = Array.from(arguments).slice(1)), 
            t.constructor !== Array && (t = [ t ]), t.forEach(function(t, e) {
                n = n.replace(new RegExp("\\{" + e + "\\}", "g"), function() {
                    return t;
                });
            })), n);
        }
    }, {
        key: "depend",
        value: function(t) {
            switch (void 0 === t ? "undefined" : _typeof(t)) {
              case "boolean":
                t = t;
                break;

              case "string":
                t = !!t.length;
                break;

              case "function":
                t = t();

              default:
                t = !0;
            }
            return t;
        }
    }, {
        key: "optional",
        value: function(t) {
            return !this.methods.required(t) && "dependency-mismatch";
        }
    }, {
        key: "customMessage",
        value: function(t, e) {
            var n = this.messages[t], i = "object" === (void 0 === n ? "undefined" : _typeof(n));
            if (n && i) return n[e.method];
        }
    }, {
        key: "defaultMessage",
        value: function(t, e) {
            var n = this.customMessage(t, e) || this.defaults.messages[e.method], i = void 0 === n ? "undefined" : _typeof(n);
            return "undefined" === i ? n = "Warning: No message defined for " + e.method + "." : "function" === i && (n = n.call(this, e.parameters)), 
            n;
        }
    }, {
        key: "formatTplAndAdd",
        value: function(t, e, n) {
            var i = this.defaultMessage(t, e);
            this.errorList.push({
                param: t,
                msg: i,
                value: n
            });
        }
    }, {
        key: "checkParam",
        value: function(t, e, n) {
            var i = null !== (this.data = n)[t] && void 0 !== n[t] ? n[t] : "";
            for (var a in e) if (this.isValidMethod(a)) {
                var r = {
                    method: a,
                    parameters: e[a]
                }, o = this.methods[a](i, r.parameters);
                if ("dependency-mismatch" === o) continue;
                if (this.setValue(t, a, o, i), !o) {
                    this.formatTplAndAdd(t, r, i);
                    break;
                }
            }
        }
    }, {
        key: "setView",
        value: function(t) {
            this.form[t] = {
                $name: t,
                $valid: !0,
                $invalid: !1,
                $error: {},
                $success: {},
                $viewValue: ""
            };
        }
    }, {
        key: "setValue",
        value: function(t, e, n, i) {
            var a = this.form[t];
            a.$valid = n, a.$invalid = !n, a.$error[e] = !n, a.$success[e] = n, a.$viewValue = i;
        }
    }, {
        key: "checkForm",
        value: function(t) {
            for (var e in this.__initData(), this.rules) this.setView(e), this.checkParam(e, this.rules[e], t);
            return this.valid();
        }
    }, {
        key: "valid",
        value: function() {
            return 0 === this.size();
        }
    }, {
        key: "size",
        value: function() {
            return this.errorList.length;
        }
    }, {
        key: "validationErrors",
        value: function() {
            return this.errorList;
        }
    } ]), n;
}();

exports.default = WxValidate;