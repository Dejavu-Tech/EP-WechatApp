var app = getApp();

Component({
    externalClasses: [ "i-class" ],
    properties: {
        visible: {
            type: Boolean,
            value: !1,
            observer: function(a) {
                var e = this;
                this.data.closeDelay ? setTimeout(function() {
                    e.setData({
                        isShow: a
                    });
                }, this.data.closeDelay) : this.setData({
                    isShow: a
                });
            }
        },
        maskClosable: {
            type: Boolean,
            value: !0
        },
        scrollUp: {
            type: Boolean,
            value: !0
        },
        closeDelay: {
            type: Number,
            value: 0
        }
    },
    data: {
        isIpx: !1,
        isShow: !1
    },
    attached: function() {
        this.setData({
            isIpx: app.globalData.isIpx
        });
    },
    methods: {
        stopMove: function() {},
        handleClickMask: function() {
            this.data.maskClosable && this.handleClickCancel();
        },
        handleClickCancel: function() {
            this.triggerEvent("cancel");
        }
    }
});