// eaterplanet_ecommerce/components/tradeStatus/index.js
require("../../utils/timeFormat");

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    status: {
      type: String
    },
    pickUpTotal: {
      type: Number
    },
    tradeStatusInfo: {
      type: Object
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    maxPayTime: 30
  },

  /**
   * 组件的方法列表
   */
  methods: {
    timeOut: function () {
      this.triggerEvent("timeOut");
    }
  }
})
