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
    clearTimer: {
      type: Boolean,
      value: false
    },
    skin: {
      type: Object
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    disabled: false,
    list: [],
    pageNum: 1,
    noMore: false,
    rushEndTime: 0
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
          controller: 'index.load_spikebuy_goodslist',
          token: token,
          pageNum: that.data.pageNum,
          head_id: cur_community.communityId
        },
        dataType: 'json',
        success: function (res) {
          if (res.data.code == 0) {
            let oldList = that.data.list;
            let list = oldList.concat(res.data.list);
            let is_show_spike_buy_time = res.data.is_show_spike_buy_time;
            //取最大时间
            let rushEndTime = that.getTime(list);
            console.log(rushEndTime)
            that.setData({ list, rushEndTime, is_show_spike_buy_time })
          } else {
            that.setData({ noMore: true })
          }
        }
      })
    },
    getMore: function () {
      if (this.data.noMore) return;
      let that = this;
      let pageNum = that.data.pageNum + 1;
      console.log(pageNum)
      this.setData({ pageNum },
        () => {
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
          marketPrice: spuItem.marketPrice,
          oneday_limit_count: spuItem.oneday_limit_count,
          total_limit_count: spuItem.total_limit_count,
          one_limit_count: spuItem.one_limit_count
        }
      })
    },
    getTime: function (list) {
      let that = this;
      let end_time = 0;
      let e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0;
      e === 0 && list.map(function (t) {
        t.end_time *= 1000;
        end_time = (t.end_time > end_time) ? t.end_time : end_time;
      })
      return end_time;
    }
  }
})
