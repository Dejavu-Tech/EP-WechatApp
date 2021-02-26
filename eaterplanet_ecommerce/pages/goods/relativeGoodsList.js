Component({
  properties: {
    list: {
      type: Array,
      value: []
    },
    needAuth: {
      type: Boolean,
      value: false
    }
  },

  data: {
    disabled: false
  },

  methods: {
    openSku: function (e) {
      if (this.data.needAuth) {
        this.triggerEvent("authModal");
        return;
      }
      let idx = e.currentTarget.dataset.idx;
      this.setData({ disabled: false })
      let spuItem = this.data.list[idx];
      this.triggerEvent("openSku", {
        actId: spuItem.actId,
        skuList: spuItem.skuList,
        promotionDTO: spuItem.promotionDTO || '',
        allData: {
          spuName: spuItem.spuName,
          skuImage: spuItem.skuImage,
          actPrice: spuItem.actPrice,
          canBuyNum: spuItem.spuCanBuyNum,
          stock: spuItem.spuCanBuyNum,
          marketPrice: spuItem.marketPrice,
          oneday_limit_count: spuItem.oneday_limit_count,
          total_limit_count: spuItem.total_limit_count,
          one_limit_count: spuItem.one_limit_count,
          goods_start_count: spuItem.goods_start_count
        }
      })
    }
  }
})
