var app = getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    refresh: {
      type: Boolean,
      value: false,
      observer: function (t) {
        if (t) this.setData({ list: [] }), this.getData();
      }
    },
    showPos: {
      type: Number,
      value: 0
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    disabled: false,
    list: [],
    placeholdeImg: app.globalData.placeholdeImg
  },

  attached() {
    this.getData();
  },

  /**
   * 组件的方法列表
   */
  methods: {
    getData: function () {
      var token = wx.getStorageSync('token');
      var that = this;
      var cur_community = wx.getStorageSync('community');
      app.util.request({
        'url': 'entry/wxapp/index',
        'data': {
          controller: 'marketing.get_special_list',
          token: token,
          head_id: cur_community.communityId
        },
        dataType: 'json',
        success: function (res) {
          if (res.data.code == 0) {
            let list = res.data.data;
            that.setData({ list })
          }
        }
      })
    },
    goSpecial: function(e){
      let id = e.currentTarget.dataset.id;
      id && wx.navigateTo({
        url: `/eaterplanet_ecommerce/moduleA/special/index?id=${id}`,
      })
    },
    openSku: function (e) {
      let idx = e.currentTarget.dataset.idx;
      let gidx = e.currentTarget.dataset.gidx;
      this.setData({ disabled: false })
      let spuItem = this.data.list[idx].list[gidx];
      this.triggerEvent("openSku", {
        actId: spuItem.actId,
        skuList: spuItem.skuList,
        promotionDTO: spuItem.promotionDTO || '',
        is_take_vipcard: spuItem.is_take_vipcard,
        is_mb_level_buy: spuItem.is_mb_level_buy,
        allData: {
          spuName: spuItem.spuName,
          skuImage: spuItem.skuImage,
          actPrice: spuItem.actPrice,
          canBuyNum: spuItem.spuCanBuyNum,
          stock: spuItem.spuCanBuyNum,
          marketPrice: spuItem.marketPrice
        }
      })
    }
  }
})
