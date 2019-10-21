Component({
    properties: {
        goodDetail: {
            type: Object,
            value: {
                spuImages: [],
                spuName: "",
                limitMemberNum: 0,
                limitOrderNum: 0,
                quantity: 0,
                stockNum: 0,
                targetTime: "",
                integerPrice: "0",
                decimalPrice: "0"
            }
        },
        showTitle: String,
        endTime: String
    },
    data: {
        showDay: !0,
        showTitle: ""
    },
    methods: {
        actEnd: function() {
            var t = void 0;
            "willSale" === this.data.showTitle ? (this.setData({
                showTitle: "onSale"
            }), t = 0) : "onSale" === this.data.showTitle && (this.setData({
                showTitle: "endSale"
            }), t = 2), this.triggerEvent("actEnd", t);
        }
    }
});