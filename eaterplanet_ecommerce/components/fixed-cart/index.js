// eaterplanet_ecommerce/components/fixed-cart/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    cartNum: {
      type: Number,
      default: 0
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    goCart: function() {
      wx.switchTab({
        url: '/eaterplanet_ecommerce/pages/order/shopCart',
      })
    }
  }
})
