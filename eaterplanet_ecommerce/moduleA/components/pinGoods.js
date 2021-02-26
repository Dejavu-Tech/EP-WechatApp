let app = getApp();
Component({
  properties: {
    spuItem: {
      type: Object,
      value: {
        actId: "",
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
        bigImg: '',
        car_count: 0
      }
    },
    isPast: {
      type: Boolean,
      value: false
    },
    actEnd: {
      type: Boolean,
      value: false
    },
    reduction: {
      type: Object,
      value: {
        full_money: '',
        full_reducemoney: '',
        is_open_fullreduction: 0
      }
    },
    skin: Object,
    goods_sale_unit: String
  },
  attached() {
    this.setData({ placeholdeImg: app.globalData.placeholdeImg })
  },
  data: {
    disabled: false,
    placeholdeImg: ''
  },
  methods: {
    goLink: function () {
      let id = this.data.spuItem.actId;
      id && wx.navigateTo({
        url: `/eaterplanet_ecommerce/moduleA/pin/goodsDetail?&id=${id}`,
      })
    }
  }
});
