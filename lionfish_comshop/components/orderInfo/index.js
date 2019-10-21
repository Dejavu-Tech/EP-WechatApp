Component({
    properties: {
        orderInfo: {
            type: Object,
            observer: function(t) {
                var o = 1 * t.real_total, e = (t.total, parseFloat(o) - parseFloat(t.shipping_fare)), a = parseFloat(t.voucher_credit) + parseFloat(t.fullreduction_money);
                a = e < a ? e : a, this.setData({
                    goodsTotal: e.toFixed(2),
                    disAmount: a.toFixed(2)
                });
            }
        }
    },
    data: {
        disAmount: 0,
        goodsTotal: 0
    }
});