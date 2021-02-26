var util = require('../../../utils/util.js');

Component({
  externalClasses: ["i-class"],
  properties: {
    item: {
      type: Object,
      value: {}
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    disabled: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    openSku: function () {
      this.setData({ disabled: false })
      let spuItem = this.data.item;
      if (spuItem.skuList.length === void 0) {
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
            marketPrice: spuItem.marketPrice
          }
        })
      } else {
        this.addCart({ value: 1, type: "plus" });
      }
    },
    addCart: function (t) {
      wx.showLoading();
      var community = wx.getStorageSync('community');
      let spuItem = this.data.item;
      var goods_id = spuItem.actId;
      var community_id = community.communityId;
      if (t.type == 'plus') {
        let data = {
          goods_id,
          community_id,
          quantity: 1,
          sku_str: '',
          buy_type: 'dan',
          pin_id: 0,
          is_just_addcar: 1,
          buy_type: 'integral'
        }
        util.addCart(data).then(res=>{
          wx.hideLoading();
          if(res.showVipModal==1) {
            let { pop_vipmember_buyimage } = res.data;
            that.triggerEvent("vipModal", { pop_vipmember_buyimage, showVipModal: true, visible: false });
          } else {
            if (res.data.code == 3 || res.data.code == 7) {
              wx.showToast({
                title: res.data.msg,
                icon: 'none',
                duration: 2000
              })
            } else if (res.data.code == 6) {
              // 积分不足
              var msg = res.data.msg;
              wx.showToast({
                title: msg,
                icon: 'none',
                duration: 2000
              })
            } else {
              //跳转结算页面
              wx.navigateTo({
                url: `/eaterplanet_ecommerce/pages/order/placeOrder?type=integral`,
              })
            }
          }
        })
      }
    }
  }
})
