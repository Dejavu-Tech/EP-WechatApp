// eaterplanet_ecommerce/components/vipPrice.js
Component({
  properties: {
    price: {
      type: null,
      value: '0',
      observer: function(t){
        let prePrice = t;
        if(Object.prototype.toString.call(t) === '[object Array]') {
          prePrice = t.join('.');
        }
        this.setData({ prePrice })
      }
    },
    type: {
      type: String,
      value: '0' // 1等级折扣
    }
  },
  data: {
    prePrice: 0
  }
})
