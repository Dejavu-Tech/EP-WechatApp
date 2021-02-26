function e(e, r, t) {
  return r in e ? Object.defineProperty(e, r, {
    value: t,
    enumerable: !0,
    configurable: !0,
    writable: !0
  }) : e[r] = t, e;
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
    confirmGoodsVisible: false
  },
  onLoad: function () {
    this.setData({
      userInfo: app.globalData.userInfo
    });
  },
  methods: {
    callDialog: function (r) {
      var t = r.target.dataset, 
      o = t.show, 
      n = t.cancel;
      this.setData(e({}, "" + (o || n), !!o));
    },
    /**
     * 申请售后
     */
    applyForService: function () {
      var e = this.data, 
        t = e.orderNo, o = e.orderId, n = e.orderSkuId, u = e.skuSpec, a = e.skuImage, d = e.skuName, s = e.salePrice, i = (e.skuNum,
        {
          orderNo: t,
          orderId: o,
          orderSkuId: n,
          skuDesc: u,
          skuImage: a,
          skuName: d,
          salePrice: s
        });
      wx.showLoading({
        title: "加载中..."
      });
      // (0, r.default)("/shop-order/myorder/refund/check", {
      //   orderSkuId: n
      // }).then(function (e) {
      //   wx.hideLoading(), wx.navigateTo({
      //     url: "/pages/refund/refundApply?canRefundGoods=" + e.body.canRefundGoods + "&dataInfo=" + JSON.stringify(i)
      //   });
      // });
    },
    goComment: function () {
      var e = this.data, r = e.spuId, t = e.skuImage, o = e.skuName, n = {
        spuId: r,
        orderId: e.orderId,
        orderSkuId: e.orderSkuId,
        skuSpec: e.skuSpec,
        goodsImg: t,
        goodsName: o
      };
      wx.navigateTo({
        url: "/pages/order/evaluate?param=" + JSON.stringify(n)
      });
    },
    /**
     * 确认提货
     */
    confirmGoods: function () {
      var e = this;
      wx.showLoading({
        title: "加载中..."
      });
      // (0, r.default)("/shop-order/order/sign", {
      //   orderNo: this.data.orderNo,
      //   orderSkuId: this.data.orderSkuId
      // }).then(function (r) {
      //   wx.showToast({
      //     title: "已提货成功",
      //     icon: "none",
      //     success: function () {
      //       setTimeout(function () {
      //         e.triggerEvent("goodsConfirmed");
      //       }, 1500);
      //     }
      //   });
      // }).catch(function (e) {
      //   console.log(e);
      // });
      this.setData({
        confirmGoodsVisible: false
      });
    }
  }
});