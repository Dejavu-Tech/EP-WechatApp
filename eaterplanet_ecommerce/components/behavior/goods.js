var t = require("../../utils/public");
var util = require('../../utils/util.js');
var status = require('../../utils/index.js');
var app = getApp();

module.exports = Behavior({
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
        let url = `/eaterplanet_ecommerce/pages/goods/goodsDetail?id=${t.actId}`;
        // if (t && t.is_video) url = `/eaterplanet_ecommerce/moduleA/video/detail?&id=${t.actId}`;
        this.setData({ url });
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
    isShowListCount: {
      type: Number,
      value: 0
    },
    changeCarCount: {
      type: Boolean,
      value: false,
      observer: function (t) {
        if (t) this.setData({ number: this.data.spuItem.car_count || 0 });
      }
    },
    needAuth: {
      type: Boolean,
      value: false
    },
    is_open_vipcard_buy: {
      type: Number,
      value: 0
    },
    canLevelBuy: {
      type: Boolean,
      value: false
    },
    isShowListTimer: {
      type: Boolean,
      value: true
    },
    showPickTime: {
      type: Boolean,
      value: false
    },
    skin: {
      type: Object
    },
    saleUnit: {
      type: String
    }
  },
  attached() {
    this.setData({ placeholdeImg: app.globalData.placeholdeImg})
  },
  data: {
    disabled: false,
    placeholdeImg: '',
    number: 0,
    url: ''
  },
  ready: function () {
    this.setData({
      number: this.data.spuItem.car_count || 0
    });
  },
  methods: {
    openSku: function() {
      if (this.data.needAuth) {
        this.triggerEvent("authModal", true);
        return;
      }
      console.log( 'step1');
      this.setData({
        stopClick:true,
        disabled:false
      })
      let spuItem = this.data.spuItem;
      if (this.data.spuItem.skuList.length === void 0) {
        this.triggerEvent("openSku", {
          actId:spuItem.actId,
          skuList: spuItem.skuList,
          promotionDTO: spuItem.promotionDTO,
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
            one_limit_count: spuItem.one_limit_count,
            goods_start_count: spuItem.goods_start_count
          }
        });
      } else {
        this.addCart({ value: 1, type: "plus" });
      }
    },
    countDownEnd: function() {
      this.setData({
        actEnd: true
      });
    },
    submit2: function(e) {
      (0, t.collectFormIds)(e.detail.formId);
    },
    changeNumber: function (t) {
      var e = t.detail;
      e && this.addCart(e);
    },
    outOfMax: function (t) {
      var e = t.detail;
      let { spuCanBuyNum, one_limit_count } = this.data.spuItem;
      let canBuyNum = spuCanBuyNum<one_limit_count ? spuCanBuyNum: one_limit_count;
      if(this.data.number >= canBuyNum) {
        wx.showToast({
          title: "不能购买更多啦",
          icon: "none"
        })
      }
    },
    addCart: function (t) {
      // {value: 2, type: "plus/minus"}
      var token = wx.getStorageSync('token');
      var community = wx.getStorageSync('community');
      let spuItem = this.data.spuItem;
      var goods_id = spuItem.actId;
      var community_id = community.communityId;
      let { car_count, goods_start_count } = spuItem;
      let quantity = 1;
      let number = this.data.number || 0;

      let that = this;
      if (t.type =='plus'){
        if(number<goods_start_count) {
          quantity = goods_start_count-number;
        }
        let data = {
          goods_id,
          community_id,
          quantity,
          sku_str: '',
          buy_type: 'dan',
          pin_id: 0,
          is_just_addcar: 1
        }
        util.addCart(data).then(res=>{
          if(res.showVipModal==1) {
            let { pop_vipmember_buyimage } = res.data;
            that.triggerEvent("vipModal", { pop_vipmember_buyimage, showVipModal: true, visible: false });
          } else {
            if (res.data.code == 3) {
              let max_quantity = res.data.max_quantity || '';
              (max_quantity > 0) && that.setData({ number: that.data.number })
              wx.showToast({
                title: res.data.msg,
                icon: 'none',
                duration: 2000
              })
            } else if (res.data.code == 4) {
              that.setData({ needAuth: true })
              that.triggerEvent("authModal", true);
            } else if (res.data.code == 6 || res.data.code == 7) {
              let max_quantity = res.data.max_quantity || '';
              (max_quantity > 0) && that.setData({ number: that.data.number })
              var msg = res.data.msg;
              wx.showToast({
                title: msg,
                icon: 'none',
                duration: 2000
              })
            } else {
              that.triggerEvent("changeCartNum", res.data.total);
              that.setData({ number: res.data.cur_count })
              wx.showToast({
                title: "已加入购物车",
                image: "../../images/addShopCart.png"
              })
              status.indexListCarCount(goods_id, res.data.cur_count);
            }
          }
        })
      } else {
        console.log('goods_start_count',goods_start_count)
        console.log('number',number)
        if(number<=goods_start_count) {
          quantity = number;
        }

        app.util.request({
          url: 'entry/wxapp/user',
          data: {
            controller: 'car.reduce_car_goods',
            token: token,
            goods_id: goods_id,
            community_id: community_id,
            quantity,
            sku_str: '',
            buy_type: 'dan',
            pin_id: 0,
            is_just_addcar: 1
          },
          dataType: 'json',
          method: 'POST',
          success: function (res) {
            if (res.data.code == 3) {
              wx.showToast({
                title: res.data.msg,
                icon: 'none',
                duration: 2000
              })
            } else if (res.data.code == 4) {
              if (that.data.needAuth) {
                that.setData({ needAuth: true })
                that.triggerEvent("authModal", true);
                return;
              }
            } else {
              that.triggerEvent("changeCartNum", res.data.total);
              that.setData({ number: res.data.cur_count })
              status.indexListCarCount(goods_id, res.data.cur_count);
            }
          }
        })
      }

    },
    goDetails: function(t){
      let goodsid = t.currentTarget.dataset.id || '';
      let img = t.currentTarget.dataset.img || '';
      let url = '/eaterplanet_ecommerce/pages/goods/goodsDetail?id='+goodsid;
      util.getStorageImage(img).then(res=>{
        wx.navigateTo({ url })
      }).catch(err=>{
        wx.navigateTo({ url })
      });
    }
  }
});
