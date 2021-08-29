// eaterplanet_ecommerce/components/cashon_delivery/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    paymentCode: {
      type: String,
      value: ""
    },
    codeImg: {
      type: String,
      value: ""
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    showTipDialog: false,
    showImgDialog: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleTipDialog() {
      this.setData({
        showTipDialog: !this.data.showTipDialog
      })
    },
    handleImgDialog() {
      this.setData({
        showImgDialog: !this.data.showImgDialog
      })
    }
  }
})
