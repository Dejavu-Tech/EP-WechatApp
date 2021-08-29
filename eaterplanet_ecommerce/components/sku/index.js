var a = require("../../utils/public"), app = getApp();
var util = require('../../utils/util.js');

Component({
  properties: {
    visible: {
      type: Boolean,
      value: false,
      observer: function (t) {
        t && this.setData({
          value: 1,
          loading: false
        })
      }
    },
    cur_sku_arr: {
      type: Object,
      value: {}
    },
    skuList: {
      type: Object,
      value: {}
    },
    sku_val: {
      type: Number,
      value: 1
    },
    sku: {
      type: Array,
      value: []
    },
    goodsid: {
      type: Number,
      value: 0
    },
    type: {
      type: Number,
      value: 0
    },
    buyType: {
      type: String,
      value: ''
    },
    soliId: {
      type: Number,
      value: 0
    },
    vipInfo: {
      type: Object,
      value: {
        is_open_vipcard_buy: 0, 
        is_vip_card_member: 0, 
        is_member_level_buy: 0
      }
    },
    skin: {
      type: Object,
      value: {
        color: '#ff5344',
        subColor: '#ed7b3a',
        lighter: '#fff9f4'
      }
    }
  },
  focusFlag: false,
  data: {
    value: 1,
    loading: false,
    showLimitTip: false,
    showLimitType: 0
  },
  methods: {
    close: function () {
      this.setData({showLimitTip: false})
      this.triggerEvent("cancel");
    },
    selectSku: function (event) {
      var that = this;
      let str = event.currentTarget.dataset.type;
      let obj = str.split("_");
      let { sku, cur_sku_arr, skuList, sku_val } = this.data;
      let temp = {
        name: obj[3],
        id: obj[2],
        index: obj[0],
        idx: obj[1]
      };
      sku.splice(obj[0], 1, temp);
      var id = '';
      for (let i = 0; i < sku.length; i++) {
        if (i == sku.length - 1) {
          id = id + sku[i]['id'];
        } else {
          id = id + sku[i]['id'] + "_";
        }
      }
      cur_sku_arr = Object.assign(cur_sku_arr, skuList.sku_mu_list[id]);

      let h = {};
      h.noEougnStock = false;
      sku_val = sku_val || 1;
      let canBuyNum = cur_sku_arr.canBuyNum*1;
      if(sku_val > canBuyNum) {
        h.sku_val = canBuyNum==0?1:canBuyNum;
        (canBuyNum>0) && wx.showToast({
          title: `最多只能购买${cur_sku_arr.canBuyNum}件`,
          icon: 'none'
        })
      }

      let { car_quantity, goods_start_count } = this.data.cur_sku_arr;
      if(car_quantity && car_quantity>=goods_start_count) goods_start_count=1;
      // 库存小于起购数量  按钮变灰  数量变起购
      if(canBuyNum<goods_start_count) {
        h.sku_val = goods_start_count;
        h.noEougnStock = true;
      } else {
        h.sku_val = goods_start_count;
      }

      if(this.data.buyType=='integral') {
        h.sku_val = 1;
      }

      that.setData({
        cur_sku_arr,
        sku,
        showLimitTip: false,
        showLimitType: 0,
        ...h
      })
    },

    /**
     * 数量加减
    */
    setNum: function (event) {
      let types = event.currentTarget.dataset.type;
      var that = this;
      var num = 1;
      let sku_val = this.data.sku_val * 1;
      let showLimitTip = false;
      let showLimitType = 0;
      if (types == 'add') {
        num = sku_val + 1;
        let {one_limit_count, total_limit_count, oneday_limit_count} = this.data.cur_sku_arr;
        if(one_limit_count>0 && num > one_limit_count) {
          wx.showToast({
            title: `您本次只能购买${one_limit_count}份`,
            icon: 'none'
          })
          num = one_limit_count;
          showLimitTip = true;
          showLimitType = 1;
        } else if(oneday_limit_count>0 && num > oneday_limit_count) {
          wx.showToast({
            title: `您今天只能购买${oneday_limit_count}份`,
            icon: 'none'
          })
          num = oneday_limit_count;
          showLimitTip = true;
          showLimitType = 2;
        } else if(total_limit_count>0 && num > total_limit_count) {
          wx.showToast({
            title: `您最多只能购买${total_limit_count}份`,
            icon: 'none'
          })
          num = total_limit_count;
          showLimitTip = true;
          showLimitType = 3;
        }
      } else if (types == 'decrease') {
        let { car_quantity, goods_start_count } = this.data.cur_sku_arr;
        if(car_quantity && car_quantity>=goods_start_count) goods_start_count=1;
        if (sku_val > 1) {
          num = sku_val - 1;
          if(num<goods_start_count){
            num = goods_start_count;
            wx.showToast({
              title: `${goods_start_count}件起售`,
              icon: 'none'
            })
          }
        }
      }

      let arr = that.data.sku;
      var options = this.data.skuList;

      if (arr.length > 0) {
        var id = '';
        for (let i = 0; i < arr.length; i++) {
          if (i == arr.length - 1) {
            id = id + arr[i]['id'];
          } else {
            id = id + arr[i]['id'] + "_";
          }
        }
      }

      if (options.length > 0) {
        let cur_sku_arr = options.sku_mu_list[id];
        let max = cur_sku_arr['canBuyNum'];
        if (num > max) {
          num = num - 1;
          wx.showToast({
            title: `最多只能购买${max}件`,
            icon: 'none'
          })
        }
      } else {
        let cur_sku_arr = this.data.cur_sku_arr;
        if (num > cur_sku_arr['canBuyNum']) {
          num = num - 1;
        }
      }
      this.setData({
        sku_val: num,
        showLimitTip,
        showLimitType
      })
    },

    gocarfrom: function (e) {
      var that = this;
      wx.showLoading();
      a.collectFormIds(e.detail.formId);
      that.goOrder();
    },

    goOrder: function () {
      let that = this;
      let tdata = that.data;
      if (tdata.can_car) tdata.can_car = false;

      var token = wx.getStorageSync('token');
      var community = wx.getStorageSync('community');
      var community_id = community.communityId;

      var goods_id = tdata.goodsid;
      var quantity = tdata.sku_val;
      var cur_sku_arr = tdata.cur_sku_arr;

      var sku_str = '';
      var is_just_addcar = 1;
      if (cur_sku_arr && cur_sku_arr.option_item_ids) sku_str = cur_sku_arr.option_item_ids;

      let buy_type = this.data.buyType ? this.data.buyType: 'dan';
      if(buy_type=='integral') is_just_addcar = 0;

      // 接龙
      let soli_id = this.data.soliId || '';

      let data = {
        goods_id,
        community_id,
        quantity,
        sku_str,
        buy_type,
        pin_id: 0,
        is_just_addcar,
        soli_id
      }
      util.addCart(data).then(res=>{
        if(res.showVipModal==1) {
          let { pop_vipmember_buyimage } = res.data;
          wx.hideLoading();
          that.triggerEvent("vipModal", { pop_vipmember_buyimage, showVipModal: true, visible: false });
        } else if (res.data.code == 3 || res.data.code == 7) {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 2000
          })
        } else {
          if (buy_type =='integral'){
            if (res.data.code == 6) {
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
          } else {
            if (res.data.code == 4) {
              wx.showToast({
                title: '您未登录',
                duration: 2000,
                success: () => {
                  that.setData({
                    needAuth: true
                  })
                }
              })
            } else if (res.data.code == 6) {
              let max_quantity = res.data.max_quantity || '';
              (max_quantity > 0) && that.setData({
                sku_val: max_quantity
              })
              var msg = res.data.msg;
              wx.showToast({
                title: msg,
                icon: 'none',
                duration: 2000
              })
            } else {
              if (is_just_addcar == 1) {
                that.close();
                wx.hideLoading();
                // 接龙商品
                if (buy_type == 'soitaire') {
                  let { goods_total_count, total } = res.data;
                  that.triggerEvent("changeCartNum", { goods_total_count, total, goods_id });
                } else {
                  res.data.total && that.triggerEvent("changeCartNum", res.data.total);
                }
                wx.showToast({
                  title: "已加入购物车",
                  image: "../../images/addShopCart.png"
                })
              } else {
                var pages_all = getCurrentPages();
                if (pages_all.length > 3) {
                  wx.redirectTo({
                    url: '/eaterplanet_ecommerce/pages/buy/index?type=' + tdata.order.buy_type
                  })
                } else {
                  wx.navigateTo({
                    url: '/eaterplanet_ecommerce/pages/buy/index?type=' + tdata.order.buy_type
                  })
                }
              }
            }
          }
        }
      })
    },

    // 输入框获得焦点
    handleFocus: function () {
      this.focusFlag = true;
    },

    handleBlur: function (t) {
      let a = t.detail;
      let val = parseInt(a.value);
      if (val == '' || isNaN(val)) {
        let { car_quantity, goods_start_count } = this.data.cur_sku_arr;
        if(car_quantity && car_quantity>=goods_start_count){
          goods_start_count=1;
        } else {
          wx.showToast({
            title: `${goods_start_count}件起售`,
            icon: 'none'
          })
        }
        this.setData({ sku_val: goods_start_count })
      }
    },

    // 监控输入框变化
    changeNumber: function (t) {
      let { cur_sku_arr, sku_val } = this.data;
      let max = cur_sku_arr.stock * 1;
      let a = t.detail;
      this.focusFlag = false;
      let showLimitTip = false;
      let showLimitType = 0;
      let { car_quantity, goods_start_count } = this.data.cur_sku_arr;
      if(car_quantity && car_quantity>=goods_start_count) goods_start_count=1;
      if (a) {
        let val = parseInt(a.value);
        val = val < 1 ? 1 : val;
        // 限购
        let {one_limit_count, total_limit_count, oneday_limit_count} = cur_sku_arr;
        if(one_limit_count>0 && val > one_limit_count) {
          wx.showToast({
            title: `您本次只能购买${one_limit_count}份`,
            icon: 'none'
          })
          sku_val = one_limit_count;
          showLimitTip = true;
          showLimitType = 1;
        } else if(oneday_limit_count>0 && val > oneday_limit_count) {
          wx.showToast({
            title: `您今天只能购买${oneday_limit_count}份`,
            icon: 'none'
          })
          sku_val = oneday_limit_count;
          showLimitTip = true;
          showLimitType = 2;
        } else if(total_limit_count>0 && val > total_limit_count) {
          wx.showToast({
            title: `您最多只能购买${total_limit_count}份`,
            icon: 'none'
          })
          sku_val = total_limit_count;
          showLimitTip = true;
          showLimitType = 3;
        } else if (val > max) {
          wx.showToast({
            title: `最多只能购买${max}件`,
            icon: 'none'
          })
          sku_val = max;
        } else {
          if(val<goods_start_count){
            val = goods_start_count;
            wx.showToast({
              title: `${goods_start_count}件起售`,
              icon: 'none'
            })
          }
          sku_val = val;
        }
      }
      this.setData({
        sku_val,
        showLimitTip,
        showLimitType
      })
    }
  }
});
