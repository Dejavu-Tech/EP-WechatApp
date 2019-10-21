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
            var a = this;
            this.data.isCalling || (this.data.isCalling = !0, wx.makePhoneCall({
                phoneNumber: e.currentTarget.dataset.phone,
                complete: function() {
                    a.data.isCalling = !1;
                }
            }));
        },
        goExpress: function() {
            var e = this.data.order.order_info.order_id;
            wx.navigateTo({
                url: "/lionfish_comshop/pages/order/goods_express?id=" + e
            });
        }
    }
});