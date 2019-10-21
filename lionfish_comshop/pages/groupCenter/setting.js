var _extends = Object.assign || function(e) {
    for (var t = 1; t < arguments.length; t++) {
        var a = arguments[t];
        for (var i in a) Object.prototype.hasOwnProperty.call(a, i) && (e[i] = a[i]);
    }
    return e;
}, _WxValidate = require("../../utils/WxValidate.js"), _WxValidate2 = _interopRequireDefault(_WxValidate);

function _interopRequireDefault(e) {
    return e && e.__esModule ? e : {
        default: e
    };
}

var app = getApp(), util = require("../../utils/util.js"), status = require("../../utils/index.js");

Page({
    data: {
        showEditAvatar: !1,
        showEditUserInfo: !1,
        showEditFinance: !1,
        currentFocus: "",
        rest: 0,
        headInfo: "",
        btnLoading: !1,
        tuanItems: [ {
            name: 0,
            value: "跟随系统"
        }, {
            name: 1,
            value: "开启"
        }, {
            name: 2,
            value: "关闭"
        } ],
        tuanType: [ "跟随系统", "开启", "关闭" ],
        fareItems: [ {
            name: 0,
            value: "跟随系统"
        }, {
            name: 1,
            value: "自定义"
        } ],
        groupInfo: {
            group_name: "社区",
            owner_name: "团长"
        },
        image_o: ""
    },
    is_modify_shipping_method: 0,
    is_modify_shipping_fare: 0,
    onLoad: function(e) {
        var a = this;
        status.setGroupInfo().then(function(e) {
            var t = e && e.owner_name || "团长";
            wx.setNavigationBarTitle({
                title: t + "中心"
            }), a.setData({
                groupInfo: e
            });
        });
        var t = e && (e.id || 0);
        util.check_login() || wx.switchTab({
            url: "/lionfish_comshop/pages/user/me"
        }), t || wx.switchTab({
            url: "/lionfish_comshop/pages/user/me"
        }), this.initValidate(), this.getData(t);
    },
    onShow: function() {},
    radioChange: function(e) {
        console.log(e);
        var t = e.currentTarget.dataset.name;
        if ("method" == t) this.is_modify_shipping_method = e.detail.value; else if ("fare" == t) {
            this.is_modify_shipping_fare = e.detail.value;
            var a = !1;
            1 == e.detail.value && (a = !0), this.setData({
                showFare: a
            });
        }
    },
    initValidate: function() {
        this.WxValidate = new _WxValidate2.default({
            head_name: {
                required: !0,
                minlength: 1
            },
            head_mobile: {
                required: !0,
                tel: !0
            }
        }, {
            head_name: {
                required: "请填写团长名称",
                minlength: "请输入正确的团长名称"
            },
            head_mobile: {
                required: "请填写手机号",
                tel: "请填写正确的手机号"
            }
        });
    },
    getData: function(e) {
        var t = wx.getStorageSync("token"), i = this;
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "community.get_head_info",
                id: e,
                token: t
            },
            dataType: "json",
            success: function(e) {
                if (0 == e.data.code) {
                    var t = e.data.data, a = 1 == t.is_modify_shipping_fare;
                    i.setData({
                        headInfo: t,
                        rest: e.data.data.rest,
                        showFare: a
                    }), i.is_modify_shipping_method = t.is_modify_shipping_method || 0, i.is_modify_shipping_fare = t.is_modify_shipping_fare || 0;
                } else wx.switchTab({
                    url: "/lionfish_comshop/pages/user/me"
                });
            }
        });
    },
    showEdit: function(e) {
        var t = e.currentTarget.dataset.type;
        "avatar" == t ? this.setData({
            showEditAvatar: !0
        }) : "info" == t ? this.setData({
            showEditUserInfo: !0
        }) : "finance" == t && this.setData({
            showEditFinance: !0
        });
    },
    hideEdit: function() {
        this.setData({
            showEditAvatar: !1,
            showEditUserInfo: !1,
            showEditFinance: !1
        });
    },
    iptFocus: function(e) {
        var t = e.currentTarget.dataset.name;
        this.setData({
            currentFocus: t
        });
    },
    iptBlur: function() {
        this.setData({
            currentFocus: ""
        });
    },
    switchChange: function(e) {
        var t = e.detail.value ? 0 : 1, a = this.data.headInfo, i = a && (a.id || 0), s = wx.getStorageSync("token"), o = this;
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "community.set_head_rest",
                id: i,
                token: s,
                rest: t
            },
            dataType: "json",
            success: function(e) {
                0 == e.data.code ? o.setData({
                    rest: t
                }) : 1 == e.data.code ? wx.switchTab({
                    url: "/lionfish_comshop/pages/user/me"
                }) : (o.setData({
                    rest: !t
                }), wx.showToast({
                    title: "修改失败"
                }));
            }
        });
    },
    showModal: function(e) {
        wx.showModal({
            content: e.msg,
            showCancel: !1
        });
    },
    infoFormSubmit: function(e) {
        this.setData({
            btnLoading: !0
        });
        var t = e.detail.value;
        if (!this.WxValidate.checkForm(t)) {
            var a = this.WxValidate.errorList[0];
            return this.showModal(a), this.setData({
                btnLoading: !1
            }), !1;
        }
        var i = this.is_modify_shipping_method, s = this.is_modify_shipping_fare, o = Object.assign({}, t, {
            is_modify_shipping_method: i,
            is_modify_shipping_fare: s
        });
        if (1 == s && 1 * t.shipping_fare <= 0) return wx.showToast({
            title: "请输入配送费",
            icon: "none"
        }), void this.setData({
            btnLoading: !1
        });
        this.modifyHeadInfo(o);
    },
    modifyHeadInfo: function(a) {
        var e = wx.getStorageSync("token"), i = this.data.headInfo, t = i.id, s = this, o = this.data.image_o;
        o && (a.share_wxcode = o), app.util.request({
            url: "entry/wxapp/index",
            data: _extends({
                controller: "community.modify_head_info",
                id: t,
                token: e
            }, a),
            dataType: "json",
            success: function(e) {
                if (0 == e.data.code) {
                    var t = i.share_wxcode;
                    (i = Object.assign({}, i, a)).share_wxcode = t, s.setData({
                        headInfo: i
                    }), s.showModal({
                        msg: "修改成功"
                    });
                } else 1 == e.data.code ? wx.switchTab({
                    url: "/lionfish_comshop/pages/user/me"
                }) : s.showModal({
                    msg: "修改失败"
                });
                s.hideEdit(), s.setData({
                    btnLoading: !1
                });
            }
        });
    },
    choseImg: function() {
        var s = this;
        wx.chooseImage({
            count: 1,
            sizeType: [ "original", "compressed" ],
            sourceType: [ "album", "camera" ],
            success: function(e) {
                var t = e.tempFilePaths;
                wx.showLoading({
                    title: "上传中"
                }), wx.uploadFile({
                    url: app.util.url("entry/wxapp/index", {
                        m: "lionfish_comshop",
                        controller: "goods.doPageUpload"
                    }),
                    filePath: t[0],
                    name: "upfile",
                    formData: {
                        name: t[0]
                    },
                    header: {
                        "content-type": "multipart/form-data"
                    },
                    success: function(e) {
                        wx.hideLoading();
                        var t = JSON.parse(e.data), a = t.image_o, i = t.image_o_full;
                        t.image_thumb;
                        s.setData({
                            "headInfo.share_wxcode": i,
                            image_o: a
                        });
                    }
                });
            }
        });
    }
});