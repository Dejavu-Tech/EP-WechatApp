let app = getApp();

module.exports = Behavior({
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
      },
      observer: function (t) {
        let {presale_ding_time_start_int, presale_ding_time_end_int } = t;
        let nowtime = Date.parse(new Date())/1000;
        let saleStatus = 1; //客付定金  0未开始  2已结束
        let h = {};

        if(t.presale_type==0) {
          let { presale_ding_money, actPrice, presale_deduction_money } = t;
          let goodsPrice = (actPrice[0]+'.'+actPrice[1])*1;
          presale_deduction_money = presale_deduction_money>0?presale_deduction_money:presale_ding_money;
          let weikuan = goodsPrice - presale_deduction_money*1;
          presale_ding_money = presale_ding_money.toFixed(2);
          h.dingArr = (presale_ding_money+'').split('.');
          h.weikuan = weikuan.toFixed(2);
        }
        
        if(nowtime<presale_ding_time_start_int) {
          saleStatus = 0;
        } else if(nowtime>presale_ding_time_end_int) {
          saleStatus = 2;
        }
        this.setData({
          saleStatus,
          ...h
        })
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
    placeholdeImg: '',
    weikuan: 0,
    dingArr: ['0', '00'],
    saleStatus: 1
  },
  methods: {
    goLink: function () {
      let id = this.data.spuItem.actId;
      id && wx.navigateTo({
        url: `/eaterplanet_ecommerce/pages/goods/goodsDetail?id=${id}&type=presale`,
      })
    }
  }
})
