// eaterplanet_ecommerce/components/moneyFormat/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    money: {
      type: Number,
      observer: function (e) {
        var s = (e / 100).toFixed(2);
        this.setData({
          showMoney: s
        });
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    showMoney: 0
  },
  externalClasses: ["i-class"]
})
