Component({
    properties: {
        order: {
            type: Object
        },
        showNickname: {
            type: Boolean,
            default: !1
        },
        hidePhone: {
            type: Number,
            default: 0
        }
    },
    data: {
        isCalling: !1
    },
    methods: {
        callTelphone: function(e) {
            var t = this;
            this.data.isCalling || (this.data.isCalling = !0, wx.makePhoneCall({
                phoneNumber: e.currentTarget.dataset.phone,
                complete: function() {
                    t.data.isCalling = !1;
                }
            }));
        }
    }
});