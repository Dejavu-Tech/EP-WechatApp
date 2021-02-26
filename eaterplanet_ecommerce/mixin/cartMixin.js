var a = require("../utils/public");
var app = getApp();
var status = require('../utils/index.js');
var util = require('../utils/util.js');

module.exports = {
  data: {
    visible: false,
    stopClick: false
  },

  vipModal: function(t) {
    this.setData(t.detail)
  },

  authModal: function () {
    if (this.data.needAuth) {
      this.setData({ showAuthModal: !this.data.showAuthModal });
      return false;
    }
    return true;
  },

  openSku: function(t) {
    if (!this.authModal()) return;
    var that = this;
    let idx = t.currentTarget.dataset.idx;
    let rushList = this.data.list;
    let spuItem = rushList[idx];

    var goods_id = spuItem.actId;
    var options = spuItem.skuList;
    that.setData({
      addCar_goodsid: goods_id
    })

    let list = options.list || [];
    let arr = [];
    if (list.length > 0) {
      for (let i = 0; i < list.length; i++) {
        let sku = list[i]['option_value'][0];
        let temp = {
          name: sku['name'],
          id: sku['option_value_id'],
          index: i,
          idx: 0
        };
        arr.push(temp);
      }
      //把单价剔除出来begin

      var id = '';
      for (let i = 0; i < arr.length; i++) {
        if (i == arr.length - 1) {
          id = id + arr[i]['id'];
        } else {
          id = id + arr[i]['id'] + "_";
        }
      }
      var cur_sku_arr = options.sku_mu_list[id];
      cur_sku_arr.oneday_limit_count = spuItem.oneday_limit_count || 0;
      cur_sku_arr.total_limit_count = spuItem.total_limit_count || 0;
      cur_sku_arr.one_limit_count = spuItem.one_limit_count || 0;
      cur_sku_arr.goods_start_count = spuItem.goods_start_count || 1;

      that.setData({
        sku: arr,
        sku_val: 1,
        cur_sku_arr: cur_sku_arr,
        skuList: spuItem.skuList,
        visible: true,
        showSku: true
      });
    } else {
      let goodsInfo = spuItem;
      that.setData({
        sku: [],
        sku_val: 1,
        skuList: [],
        cur_sku_arr: goodsInfo
      })
      let formIds = {
        detail: {
          formId: ""
        }
      };
      formIds.detail.formId = "the formId is a mock one";
      that.gocarfrom(formIds, idx);
    }
  },

  /**
   * 确认加入购物车
   */
  gocarfrom: function (e, idx=0) {
    var that = this;
    wx.showLoading();
    a.collectFormIds(e.detail.formId);
    that.goOrder(idx);
  },

  goOrder: function (idx) {
    let that = this;
    let tdata = that.data;
    if (tdata.can_car) {
      tdata.can_car = false;
    }
    var token = wx.getStorageSync('token');
    var community = wx.getStorageSync('community');
    var community_id = community.communityId;

    var goods_id = tdata.addCar_goodsid;
    var quantity = tdata.sku_val;
    var cur_sku_arr = tdata.cur_sku_arr;
    let list = tdata.list;

    var sku_str = '';
    var is_just_addcar = 1;

    if (cur_sku_arr && cur_sku_arr.option_item_ids) {
      sku_str = cur_sku_arr.option_item_ids;
    }

    let data= {
      goods_id,
      community_id,
      quantity,
      sku_str,
      buy_type: 'dan',
      pin_id: 0,
      is_just_addcar
    }

    util.addCart(data).then(res=>{
      if(res.showVipModal==1) {
        wx.hideLoading();
        let { pop_vipmember_buyimage } = res.data;
        that.setData({ pop_vipmember_buyimage, showVipModal: true, visible: false });
      } else {
        if (res.data.code == 3) {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 2000
          })
        } else if (res.data.code == 4) {
          wx.showToast({
            title: '您未登录',
            duration: 2000,
            success: () => {
              that.setData({
                needAuth: true
              })
            }
          })
        } else if (res.data.code == 6 || res.data.code == 7) {
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
            list[idx].car_count = res.data.cur_count || 0;
            that.setData({ 
              cartNum: res.data.total || 0,
              list
            })
            that.closeSku();
            status.indexListCarCount(goods_id, res.data.cur_count);
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
    })

  },

  changeCartNum(e) {
    let cartNum = e.detail || 0;
    cartNum && this.setData({ cartNum })
  },

  /**
   * 关闭购物车选项卡
   */
  closeSku: function() {
    this.setData({
      visible: false,
      stopClick: false
    });
  },

  changeNumber: function (t) {
    var e = t.detail;
    e && this.addCart(e);
  },

  outOfMax: function (t) {
    console.log(t)
    // var e = t.detail, canBuyNum = this.data.spuItem.spuCanBuyNum;
    // if (this.data.number >= canBuyNum) {
    wx.showToast({
      title: "不能购买更多啦",
      icon: "none"
    })
    // }
  },

  addCart: function (t) {
    // {value: 2, type: "plus/minus"}
    let idx = t.idx;
    let list = this.data.list;
    var token = wx.getStorageSync('token');
    var community = wx.getStorageSync('community');
    var goods_id = list[idx].actId;
    var community_id = community.communityId;
    let that = this;
    if (t.type == 'plus') {
      let data= {
        goods_id,
        community_id,
        quantity: 1,
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
            list[idx].car_count = max_quantity;
            (max_quantity > 0) && that.setData({ list })
            wx.showToast({
              title: res.data.msg,
              icon: 'none',
              duration: 2000
            })
          } else if (res.data.code == 6 || res.data.code == 7) {
            let max_quantity = res.data.max_quantity || '';
            list[idx].car_count = max_quantity;
            (max_quantity > 0) && that.setData({ cartNum: res.data.total || 0, list })
            var msg = res.data.msg;
            wx.showToast({
              title: msg,
              icon: 'none',
              duration: 2000
            })
          } else {
            list[idx].car_count = res.data.cur_count;
            that.setData({ cartNum: res.data.total || 0, list })
            wx.showToast({
              title: "已加入购物车",
              image: "../../images/addShopCart.png"
            })
            status.indexListCarCount(goods_id, res.data.cur_count);
          }
        }
      })
    } else {
      app.util.request({
        url: 'entry/wxapp/user',
        data: {
          controller: 'car.reduce_car_goods',
          token: token,
          goods_id: goods_id,
          community_id: community_id,
          quantity: 1,
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
            list[idx].car_count = res.data.cur_count;
            that.setData({ list, cartNum: res.data.total || 0 })
            status.indexListCarCount(goods_id, res.data.cur_count);
          }
        }
      })
    }
  }

}
