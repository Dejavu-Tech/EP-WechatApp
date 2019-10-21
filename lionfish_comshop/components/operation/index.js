function e(e, t, r) {
    return t in e ? Object.defineProperty(e, t, {
        value: r,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[t] = r, e;
}

var app = getApp();

Component({
    properties: {
        orderStatus: {
            type: Number
        },
        orderSkuStatus: {
            type: Number
        },
        isCanRefund: {
            type: Number
        },
        canEvaluate: {
            type: Number
        },
        orderNo: {
            type: String
        },
        orderId: {
            type: String
        },
        orderSkuId: {
            type: String
        },
        skuSpec: {
            type: String
        },
        skuImage: {
            type: String
        },
        skuName: {
            type: String
        },
        salePrice: {
            type: String
        },
        spuId: {
            type: String
        },
        skuNum: {
            type: Number
        },
        skuId: {
            type: String
        }
    },
    data: {
        userInfo: {},
        confirmGoodsVisible: !1
    },
    onLoad: function() {
        this.setData({
            userInfo: app.globalData.userInfo
        });
    },
    methods: {
        callDialog: function(t) {
            var r = t.target.dataset, a = r.show, o = r.cancel;
            this.setData(e({}, "" + (a || o), !!a));
        },
        applyForService: function() {
            var e = this.data, t = e.orderNo, r = e.orderId, a = e.orderSkuId, o = e.skuSpec, s = e.skuImage, u = e.skuName, i = e.salePrice;
            e.skuNum;
            wx.showLoading({
                title: "加载中..."
            });
        },
        goComment: function() {
            var e = this.data, t = e.spuId, r = e.skuImage, a = e.skuName, o = {
                spuId: t,
                orderId: e.orderId,
                orderSkuId: e.orderSkuId,
                skuSpec: e.skuSpec,
                goodsImg: r,
                goodsName: a
            };
            wx.navigateTo({
                url: "/pages/order/evaluate?param=" + JSON.stringify(o)
            });
        },
        confirmGoods: function() {
            wx.showLoading({
                title: "加载中..."
            }), this.setData({
                confirmGoodsVisible: !1
            });
        }
    }
});