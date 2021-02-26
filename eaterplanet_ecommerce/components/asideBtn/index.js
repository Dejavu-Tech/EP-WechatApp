// eaterplanet_ecommerce/components/cartBtn/index.js
Component({
  externalClasses: ["i-class", "i-icon"],
  properties: {
    showHome: {
      type: Boolean,
      value: false
    },
    showShare: {
      type: Boolean,
      value: false
    },
    showContact: {
      type: Boolean,
      value: false
    },
    cartNum: {
      type: Number,
      value: 0
    }
  },

  methods: {
    goLink: function (e) {
      let url = e.currentTarget.dataset.link;
      wx.switchTab({ url })
    }
  }
})
