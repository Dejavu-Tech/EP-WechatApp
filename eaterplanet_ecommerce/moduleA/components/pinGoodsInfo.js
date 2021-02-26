// eaterplanet_ecommerce/moduleA/components/pinGoodsInfo.js
Component({
  externalClasses: ["i-class", "i-class-identity"],
  properties: {
    isOrder: {
      type: Boolean,
      value: false
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
      },
      observer: function (m) {
        let price = 0;
        price = ((m && m.price) && (m.price*1).toFixed(2)) || 0;
        this.setData({ price })
      }
    },
    me_is_head: {
      type: Boolean,
      value: false
    },
    skin: {
      type: Object
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    goDetail: function(){
      let { isOrder, goodsInfo } = this.data;
      let goods_id = goodsInfo.goods_id || '';
      if (goods_id && !isOrder) {
        var pages_all = getCurrentPages();
        var url = `/eaterplanet_ecommerce/moduleA/pin/goodsDetail?id=${goods_id}`;
        if (pages_all.length > 3) {
          wx.redirectTo({ url })
        } else {
          wx.navigateTo({ url })
        }
      }
    }
  }
})
