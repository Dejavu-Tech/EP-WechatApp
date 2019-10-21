Component({
    properties: {
        list: {
            type: Array,
            value: []
        },
        needAuth: {
            type: Boolean,
            value: !1
        }
    },
    data: {
        disabled: !1
    },
    methods: {
        openSku: function(t) {
            if (this.data.needAuth) this.triggerEvent("authModal"); else {
                var e = t.currentTarget.dataset.idx;
                this.setData({
                    disabled: !1
                });
                var a = this.data.list[e];
                this.triggerEvent("openSku", {
                    actId: a.actId,
                    skuList: a.skuList,
                    promotionDTO: a.promotionDTO || "",
                    allData: {
                        spuName: a.spuName,
                        skuImage: a.skuImage,
                        actPrice: a.actPrice,
                        canBuyNum: a.spuCanBuyNum,
                        stock: a.spuCanBuyNum,
                        marketPrice: a.marketPrice
                    }
                });
            }
        }
    }
});