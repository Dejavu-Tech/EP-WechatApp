var util = require('../../utils/util.js');
var app = getApp();

Component({
  properties: {
    spuItem: {
      type: Object,
      value: {
        spuId: "",
        skuId: "",
        spuImage: "",
        spuName: "",
        endTime: 0,
        beginTime: "",
        actPrice: ["", ""],
        marketPrice: ["", ""],
        spuCanBuyNum: "",
        soldNum: "",
        actId: "",
        limitMemberNum: "",
        limitOrderNum: "",
        serverTime: "",
        isLimit: false,
        skuList: [],
        spuDescribe: "",
        is_take_fullreduction: 0,
        label_info: "",
        car_count: 0
      },
      observer: function (t) {
        let totNum = t.soldNum + t.spuCanBuyNum*1;
        let precent = parseInt((t.soldNum / totNum)*100) || 0;
        this.setData({ precent })
      }
    },
    actEnd: {
      type: Boolean,
      value: false
    },
    needAuth: {
      type: Boolean,
      value: false
    },
    theme: {
      type: Number,
      value: 0
    }, 
    begin: {
      type: Number,
      value: 1
    },
    skin: {
      type: Object
    }
  },
  attached() {
    this.setData({ placeholdeImg: app.globalData.placeholdeImg })
  },
  data: {
    disabled: false,
    placeholdeImg: '',
    precent: 0,
    goods_sale_unit: app.globalData.goods_sale_unit
  },
  methods: {
    openSku: function () {
      wx.navigateTo({
        url: '/eaterplanet_ecommerce/pages/goods/goodsDetail?id=' + this.data.spuItem.actId,
      })
      // if (this.data.needAuth) {
      //   this.triggerEvent("authModal", true);
      //   return;
      // }
      console.log('抢购')
    }
  }
});
