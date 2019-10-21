var _createClass = function() {
    function o(t, e) {
        for (var i = 0; i < e.length; i++) {
            var o = e[i];
            o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), 
            Object.defineProperty(t, o.key, o);
        }
    }
    return function(t, e, i) {
        return e && o(t.prototype, e), i && o(t, i), t;
    };
}();

function _classCallCheck(t, e) {
    if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function");
}

var ERROR_CONF = {
    KEY_ERR: 311,
    KEY_ERR_MSG: "key格式错误",
    PARAM_ERR: 310,
    PARAM_ERR_MSG: "请求参数信息有误",
    SYSTEM_ERR: 600,
    SYSTEM_ERR_MSG: "系统错误",
    WX_ERR_CODE: 1e3,
    WX_OK_CODE: 200
}, BASE_URL = "https://apis.map.qq.com/ws/", URL_SEARCH = BASE_URL + "place/v1/search", URL_SUGGESTION = BASE_URL + "place/v1/suggestion", URL_GET_GEOCODER = BASE_URL + "geocoder/v1/", URL_CITY_LIST = BASE_URL + "district/v1/list", URL_AREA_LIST = BASE_URL + "district/v1/getchildren", URL_DISTANCE = BASE_URL + "distance/v1/", Utils = {
    location2query: function(t) {
        if ("string" == typeof t) return t;
        for (var e = "", i = 0; i < t.length; i++) {
            var o = t[i];
            e && (e += ";"), o.location && (e = e + o.location.lat + "," + o.location.lng), 
            o.latitude && o.longitude && (e = e + o.latitude + "," + o.longitude);
        }
        return e;
    },
    getWXLocation: function(t, e, i) {
        wx.getLocation({
            type: "gcj02",
            success: t,
            fail: e,
            complete: i
        });
    },
    getLocationParam: function(t) {
        "string" == typeof t && (t = 2 === t.split(",").length ? {
            latitude: t.split(",")[0],
            longitude: t.split(",")[1]
        } : {});
        return t;
    },
    polyfillParam: function(t) {
        t.success = t.success || function() {}, t.fail = t.fail || function() {}, t.complete = t.complete || function() {};
    },
    checkParamKeyEmpty: function(t, e) {
        if (!t[e]) {
            var i = this.buildErrorConfig(ERROR_CONF.PARAM_ERR, ERROR_CONF.PARAM_ERR_MSG + e + "参数格式有误");
            return t.fail(i), t.complete(i), !0;
        }
        return !1;
    },
    checkKeyword: function(t) {
        return !this.checkParamKeyEmpty(t, "keyword");
    },
    checkLocation: function(t) {
        var e = this.getLocationParam(t.location);
        if (!e || !e.latitude || !e.longitude) {
            var i = this.buildErrorConfig(ERROR_CONF.PARAM_ERR, ERROR_CONF.PARAM_ERR_MSG + " location参数格式有误");
            return t.fail(i), t.complete(i), !1;
        }
        return !0;
    },
    buildErrorConfig: function(t, e) {
        return {
            status: t,
            message: e
        };
    },
    buildWxRequestConfig: function(i, t) {
        var o = this;
        return t.header = {
            "content-type": "application/json"
        }, t.method = "GET", t.success = function(t) {
            var e = t.data;
            0 === e.status ? i.success(e) : i.fail(e);
        }, t.fail = function(t) {
            t.statusCode = ERROR_CONF.WX_ERR_CODE, i.fail(o.buildErrorConfig(ERROR_CONF.WX_ERR_CODE, result.errMsg));
        }, t.complete = function(t) {
            switch (+t.statusCode) {
              case ERROR_CONF.WX_ERR_CODE:
                i.complete(o.buildErrorConfig(ERROR_CONF.WX_ERR_CODE, t.errMsg));
                break;

              case ERROR_CONF.WX_OK_CODE:
                var e = t.data;
                0 === e.status ? i.complete(e) : i.complete(o.buildErrorConfig(e.status, e.message));
                break;

              default:
                i.complete(o.buildErrorConfig(ERROR_CONF.SYSTEM_ERR, ERROR_CONF.SYSTEM_ERR_MSG));
            }
        }, t;
    },
    locationProcess: function(e, t, i, o) {
        var r = this;
        (i = i || function(t) {
            t.statusCode = ERROR_CONF.WX_ERR_CODE, e.fail(r.buildErrorConfig(ERROR_CONF.WX_ERR_CODE, t.errMsg));
        }, o = o || function(t) {
            t.statusCode == ERROR_CONF.WX_ERR_CODE && e.complete(r.buildErrorConfig(ERROR_CONF.WX_ERR_CODE, t.errMsg));
        }, e.location) ? r.checkLocation(e) && t(Utils.getLocationParam(e.location)) : r.getWXLocation(t, i, o);
    }
}, QQMapWX = function() {
    function e(t) {
        if (_classCallCheck(this, e), !t.key) throw Error("key值不能为空");
        this.key = t.key;
    }
    return _createClass(e, [ {
        key: "search",
        value: function(e) {
            if (e = e || {}, Utils.polyfillParam(e), Utils.checkKeyword(e)) {
                var i = {
                    keyword: e.keyword,
                    orderby: e.orderby || "_distance",
                    page_size: e.page_size || 10,
                    page_index: e.page_index || 1,
                    output: "json",
                    key: this.key
                };
                e.address_format && (i.address_format = e.address_format), e.filter && (i.filter = e.filter);
                var o = e.distance || "1000", r = e.auto_extend || 1;
                Utils.locationProcess(e, function(t) {
                    i.boundary = "nearby(" + t.latitude + "," + t.longitude + "," + o + "," + r + ")", 
                    wx.request(Utils.buildWxRequestConfig(e, {
                        url: URL_SEARCH,
                        data: i
                    }));
                });
            }
        }
    }, {
        key: "getSuggestion",
        value: function(t) {
            if (t = t || {}, Utils.polyfillParam(t), Utils.checkKeyword(t)) {
                var e = {
                    keyword: t.keyword,
                    region: t.region || "全国",
                    region_fix: t.region_fix || 0,
                    policy: t.policy || 0,
                    output: "json",
                    key: this.key
                };
                wx.request(Utils.buildWxRequestConfig(t, {
                    url: URL_SUGGESTION,
                    data: e
                }));
            }
        }
    }, {
        key: "reverseGeocoder",
        value: function(e) {
            e = e || {}, Utils.polyfillParam(e);
            var i = {
                coord_type: e.coord_type || 5,
                get_poi: e.get_poi || 0,
                output: "json",
                key: this.key
            };
            e.poi_options && (i.poi_options = e.poi_options);
            Utils.locationProcess(e, function(t) {
                i.location = t.latitude + "," + t.longitude, wx.request(Utils.buildWxRequestConfig(e, {
                    url: URL_GET_GEOCODER,
                    data: i
                }));
            });
        }
    }, {
        key: "geocoder",
        value: function(t) {
            if (t = t || {}, Utils.polyfillParam(t), !Utils.checkParamKeyEmpty(t, "address")) {
                var e = {
                    address: t.address,
                    output: "json",
                    key: this.key
                };
                wx.request(Utils.buildWxRequestConfig(t, {
                    url: URL_GET_GEOCODER,
                    data: e
                }));
            }
        }
    }, {
        key: "getCityList",
        value: function(t) {
            t = t || {}, Utils.polyfillParam(t);
            var e = {
                output: "json",
                key: this.key
            };
            wx.request(Utils.buildWxRequestConfig(t, {
                url: URL_CITY_LIST,
                data: e
            }));
        }
    }, {
        key: "getDistrictByCityId",
        value: function(t) {
            if (t = t || {}, Utils.polyfillParam(t), !Utils.checkParamKeyEmpty(t, "id")) {
                var e = {
                    id: t.id || "",
                    output: "json",
                    key: this.key
                };
                wx.request(Utils.buildWxRequestConfig(t, {
                    url: URL_AREA_LIST,
                    data: e
                }));
            }
        }
    }, {
        key: "calculateDistance",
        value: function(e) {
            if (e = e || {}, Utils.polyfillParam(e), !Utils.checkParamKeyEmpty(e, "to")) {
                var i = {
                    mode: e.mode || "walking",
                    to: Utils.location2query(e.to),
                    output: "json",
                    key: this.key
                };
                e.from && (e.location = e.from), Utils.locationProcess(e, function(t) {
                    i.from = t.latitude + "," + t.longitude, wx.request(Utils.buildWxRequestConfig(e, {
                        url: URL_DISTANCE,
                        data: i
                    }));
                });
            }
        }
    } ]), e;
}();

module.exports = QQMapWX;