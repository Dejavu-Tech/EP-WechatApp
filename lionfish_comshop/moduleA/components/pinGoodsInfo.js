Component({
    externalClasses: [ "i-class", "i-class-identity" ],
    properties: {
        isOrder: {
            type: Boolean,
            value: !1
        },
        goodsInfo: {
            type: Object,
            value: {
                danprice: "0.00",
                goods_images: "",
                name: "",
                pin_count: "2",
                pinprice: "0.00",
                productprice: "0.00",
                seller_count: 0,
                subtitle: "",
                me_is_head: 1
            }
        },
        me_is_head: {
            type: Boolean,
            value: !1
        }
    },
    methods: {
        goDetail: function() {
            var e = this.data, o = e.isOrder, i = e.goodsInfo.goods_id || "";
            if (i && !o) {
                var s = "/lionfish_comshop/moduleA/pin/goodsDetail?id=" + i;
                3 < getCurrentPages().length ? wx.redirectTo({
                    url: s
                }) : wx.navigateTo({
                    url: s
                });
            }
        }
    }
});