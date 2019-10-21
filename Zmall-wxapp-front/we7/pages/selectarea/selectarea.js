var _util = require("../utils/util"), API = "http://japi.zto.cn/zto/api_utf8/baseArea?msg_type=GET_AREA&data=", selectArea = {
    addDot: function(e) {
        e instanceof Array && e.map(function(e) {
            return 4 < e.fullName.length ? e.fullNameDot = e.fullName.slice(0, 4) + "..." : e.fullNameDot = e.fullName, 
            e;
        });
    },
    load: function(a) {
        a.setData({
            isShow: !1
        }), (0, _util.Promise)(wx.request, {
            url: API + "0",
            method: "GET"
        }).then(function(e) {
            var t = e.data.result[0];
            return selectArea.addDot(e.data.result), a.setData({
                proviceData: e.data.result,
                "selectedProvince.index": 0,
                "selectedProvince.code": t.code,
                "selectedProvince.fullName": t.fullName
            }), (0, _util.Promise)(wx.request, {
                url: API + t.code,
                method: "GET"
            });
        }).then(function(e) {
            var t = e.data.result[0];
            return selectArea.addDot(e.data.result), a.setData({
                cityData: e.data.result,
                "selectedCity.index": 0,
                "selectedCity.code": t.code,
                "selectedCity.fullName": t.fullName
            }), (0, _util.Promise)(wx.request, {
                url: API + t.code,
                method: "GET"
            });
        }).then(function(e) {
            var t = e.data.result[0];
            selectArea.addDot(e.data.result), a.setData({
                districtData: e.data.result,
                "selectedDistrict.index": 0,
                "selectedDistrict.code": t.code,
                "selectedDistrict.fullName": t.fullName
            });
        }).catch(function(e) {
            console.log(e);
        });
    },
    tapProvince: function(t, a) {
        var l = t.currentTarget.dataset;
        (0, _util.Promise)(wx.request, {
            url: API + l.code,
            method: "GET"
        }).then(function(e) {
            return selectArea.addDot(e.data.result), a.setData({
                cityData: e.data.result,
                "selectedProvince.code": l.code,
                "selectedProvince.fullName": l.fullName,
                "selectedCity.code": e.data.result[0].code,
                "selectedCity.fullName": e.data.result[0].fullName
            }), (0, _util.Promise)(wx.request, {
                url: API + e.data.result[0].code,
                method: "GET"
            });
        }).then(function(e) {
            selectArea.addDot(e.data.result), a.setData({
                districtData: e.data.result,
                "selectedProvince.index": t.currentTarget.dataset.index,
                "selectedCity.index": 0,
                "selectedDistrict.index": 0,
                "selectedDistrict.code": e.data.result[0].code,
                "selectedDistrict.fullName": e.data.result[0].fullName
            });
        }).catch(function(e) {
            console.log(e);
        });
    },
    tapCity: function(t, a) {
        var l = t.currentTarget.dataset;
        (0, _util.Promise)(wx.request, {
            url: API + l.code,
            method: "GET"
        }).then(function(e) {
            selectArea.addDot(e.data.result), a.setData({
                districtData: e.data.result,
                "selectedCity.index": t.currentTarget.dataset.index,
                "selectedCity.code": l.code,
                "selectedCity.fullName": l.fullName,
                "selectedDistrict.index": 0,
                "selectedDistrict.code": e.data.result[0].code,
                "selectedDistrict.fullName": e.data.result[0].fullName
            });
        }).catch(function(e) {
            console.log(e);
        });
    },
    tapDistrict: function(e, t) {
        var a = e.currentTarget.dataset;
        t.setData({
            "selectedDistrict.index": e.currentTarget.dataset.index,
            "selectedDistrict.code": a.code,
            "selectedDistrict.fullName": a.fullName
        });
    },
    confirm: function(e, t) {
        t.setData({
            address: t.data.selectedProvince.fullName + " " + t.data.selectedCity.fullName + " " + t.data.selectedDistrict.fullName,
            isShow: !1
        });
    },
    cancel: function(e) {
        e.setData({
            isShow: !1
        });
    },
    choosearea: function(e) {
        e.setData({
            isShow: !0
        });
    }
};

module.exports = {
    SA: selectArea
};