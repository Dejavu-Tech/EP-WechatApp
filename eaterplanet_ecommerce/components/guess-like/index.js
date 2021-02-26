var app = getApp();
var status = require('../../utils/index.js');
var util = require('../../utils/util.js');

Component({
  externalClasses: ["i-class"],
  properties: {
    updateCart: {
      type: Number,
      value: 0,
      observer: function (val) {
        if (val>0) {
          this.updateCartNum();
        }
      }
    },
    likeTitle: {
      type: String,
      value: '大家常买'
    },
    controller: {
      type: 'String',
      value: 'index.load_gps_goodslist'
    },
    gid: {
      type: 'Number',
      value: 0
    }
  },

  data: {
    disabled: false,
    list: [],
    show_goods_guess_like: 1,
    _lock: false
  },

  attached: function() {
    console.log('guess like attached');
    this.setData({_lock: true },()=>{
      this.initFn();
    })
  },

  pageLifetimes: {
    show: function () {
      this.data._lock || this.initFn();
      console.log('guess like show');
    }
  },

  methods: {
    initFn: function(){
      let that = this;
      this.setData({list: []}, ()=>{
        that.getData();
        that.updateCartNum();
      })
    },
    getData: function () {
      var token = wx.getStorageSync('token');
      var that = this;
      var cur_community = wx.getStorageSync('community');
      let { controller, gid }= this.data;
      app.util.request({
        'url': 'entry/wxapp/index',
        'data': {
          controller,
          token: token,
          pageNum: 1,
          is_random: 1,
          head_id: cur_community.communityId || '',
          id: gid
        },
        dataType: 'json',
        success: function (res) {
          if (res.data.code == 0) {
            let oldList = that.data.list;
            let list = res.data.list || [];
            list = oldList.concat(list);
            let show_goods_guess_like = 1;
            if (gid) show_goods_guess_like = res.data.show_goods_guess_like || 0;
            that.setData({ list, show_goods_guess_like, _lock: false })
          } else {
            that.setData({ noMore: true, _lock: false })
          }
        }
      })
    },
    openSku: function (e) {
      let idx = e.currentTarget.dataset.idx;
      this.setData({ disabled: false })
      let spuItem = this.data.list[idx];
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
            marketPrice: spuItem.marketPrice,
            oneday_limit_count: spuItem.oneday_limit_count,
            total_limit_count: spuItem.total_limit_count,
            one_limit_count: spuItem.one_limit_count,
            goods_start_count: spuItem.goods_start_count
          }
        })
      } else {
        this.addCart({ value: 1, type: "plus", idx });
      }
    },
    changeNumber: function (t) {
      var e = t.detail;
      e && this.addCart(e);
    },
    outOfMax: function (t) {
      var e = t.detail, idx = t.idx, list = this.data.list, spuItem = list[idx], canBuyNum = spuItem.spuCanBuyNum;
      if (list[idx].car_count >= canBuyNum) {
        wx.showToast({
          title: "不能购买更多啦",
          icon: "none"
        })
      }
    },
    addCart: function (t) {
      var token = wx.getStorageSync('token');
      var community = wx.getStorageSync('community');
      let idx = t.idx;
      let list = this.data.list;
      let spuItem = list[idx];
      var goods_id = spuItem.actId;
      var community_id = community.communityId;
      let goods_start_count = spuItem.goods_start_count;
      let number = spuItem.car_count || 0;
      let quantity = 1;

      let that = this;
      if (t.type == 'plus') {
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
            if (res.data.code == 3 || res.data.code == 7) {
              wx.showToast({
                title: res.data.msg,
                icon: 'none',
                duration: 2000
              })
            } else if (res.data.code == 6) {
              let max_quantity = res.data.max_quantity || '';
              list[idx].car_count = res.data.max_quantity || 0;
              (max_quantity > 0) && that.setData({ list })
              var msg = res.data.msg;
              wx.showToast({
                title: msg,
                icon: 'none',
                duration: 2000
              })
            } else {
              that.triggerEvent("changeCartNum", res.data.total);
              list[idx].car_count = res.data.cur_count || 0;
              that.setData({ list })
              wx.showToast({
                title: "已加入购物车",
                image: "../../images/addShopCart.png"
              })
              status.indexListCarCount(goods_id, res.data.cur_count);
            }
          }
        })
      } else {
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
            } else {
              that.triggerEvent("changeCartNum", res.data.total);
              list[idx].car_count = res.data.cur_count || 0;
              that.setData({ list })
              status.indexListCarCount(goods_id, res.data.cur_count);
            }
          }
        })
      }
    },
    updateCartNum: function () {
      let goodsListCarCount = app.globalData.goodsListCarCount; //[{ actId: 84, num: 2}]
      let list = this.data.list;
      if (goodsListCarCount.length > 0 && list.length > 0) {
        goodsListCarCount.forEach(function (item) {
          let k = list.findIndex((n) => n.actId == item.actId);
          if (k != -1 && list[k].skuList.length === 0) {
            let newNum = item.num * 1;
            list[k].car_count = newNum >= 0 ? newNum : 0;
          }
        })
        this.setData({ list })
      }
    }
  }
})
