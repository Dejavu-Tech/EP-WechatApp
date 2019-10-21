var _WxValidate = require("../../utils/WxValidate.js"), _WxValidate2 = _interopRequireDefault(_WxValidate);

function _interopRequireDefault(e) {
    return e && e.__esModule ? e : {
        default: e
    };
}

var app = getApp(), util = require("../../utils/util.js"), u = !0;

Page({
    data: {
        imgGroup: [],
        otherImgGroup: [],
        imgMax: 4
    },
    onLoad: function(e) {
        this.initValidate();
    },
    onShow: function() {},
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
                required: "请填写店铺名称",
                minlength: "请输入正确的店铺名称"
            },
            head_mobile: {
                required: "请填写手机号",
                tel: "请填写正确的手机号"
            }
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
    chooseImage: function() {
        u = !1;
    },
    changeImg: function(e) {
        u = e.detail.len === e.detail.value.length, this.setData({
            imgGroup: e.detail.value
        });
    },
    chooseImageOther: function() {
        u = !1;
    },
    changeImgOther: function(e) {
        u = e.detail.len === e.detail.value.length, this.setData({
            otherImgGroup: e.detail.value
        });
    },
    showModal: function(e) {
        wx.showModal({
            content: e.msg,
            showCancel: !1
        });
    },
    formSubmit: function(e) {
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
    },
    onShareAppMessage: function() {}
});