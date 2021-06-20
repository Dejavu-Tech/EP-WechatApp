// eaterplanet_ecommerce/components/new-comer/index.js
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
        let that = this;
        if (t) this.setData({ pageNum: 1, noMore: false, list: [] }, () => { that.getData() })
      }
    },
    skin: {
      type: Object
    },
    diyData: {
      type: Object
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    disabled: false,
    list: [],
    pageNum: 1,
    noMore: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    getData: function() {
      var token = wx.getStorageSync('token');
      var that = this;
      var cur_community = wx.getStorageSync('community');
      app.util.request({
        'url': 'entry/wxapp/index',
        'data': {
          controller: 'index.load_new_buy_goodslist',
          token: token,
          pageNum: that.data.pageNum,
          head_id: cur_community.communityId
        },
        dataType: 'json',
        success: function (res) {
          if (res.data.code == 0) {
            let oldList = that.data.list;
            let list = oldList.concat(res.data.list);
            that.setData({ list })
          } else {
            that.setData({ noMore: true })
          }
        }
      })
    },
    getMore: function(){
      if(this.data.noMore) return;
      let that = this;
      let pageNum = that.data.pageNum+1;
      console.log(pageNum)
      this.setData({ pageNum },
      ()=>{
        that.getData();
      })
    },
    openSku: function (e) {
      let idx = e.currentTarget.dataset.idx;
      this.setData({ disabled: false })
      let spuItem = this.data.list[idx];
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
