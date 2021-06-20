// eaterplanet_ecommerce/pages/order/shopCart.js
var util = require('../../utils/util.js');
var status = require('../../utils/index.js');
var a = require("../../utils/public");
var app = getApp();
var addFlag = 1;

Page({
  mixins: [require('../../mixin/globalMixin.js')],
  data: {
    allselect: false,
    community_id: 0,
    allnum: 0,
    allcount: "0.00",
    recount: "0.00",
    carts: {},
    isEmpty: false,
    needAuth: false,
    cartNum: 0,
    isIpx: false,
    disAmount: 0,
    totalAmount: 0,
    tabIdx: 0,
    updateCart: 0,
    invalidCarts: {},
    tabList: [],
    groupInfo: {
      group_name: '社区',
      owner_name: '团长'
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {
    let that = this;
    status.setGroupInfo().then((groupInfo) => { that.setData({ groupInfo }) });
    wx.hideTabBar();
    wx.showLoading();
  },

  /**
   * 授权成功回调
   */
  authSuccess: function() {
    wx.reLaunch({
      url: '/eaterplanet_ecommerce/pages/order/shopCart',
    })
  },

  authModal: function () {
    if (this.data.needAuth) {
      this.setData({ showAuthModal: !this.data.showAuthModal });
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let that = this;
    util.check_login_new().then((res) => {
      console.log(res)
      if (res) {
        var community = wx.getStorageSync('community');
        var community_id = community.communityId || '';
        that.setData({
          needAuth: false,
          isEmpty: false,
          tabbarRefresh: true,
          community_id: community_id,
          isIpx: app.globalData.isIpx
        });
        (0, status.cartNum)('', true).then((res) => {
          res.code == 0 && that.setData({
            cartNum: res.data
          })
        });
        that.showCartGoods();
      } else {
        that.setData({ needAuth: true, isEmpty: true });
        wx.hideLoading();
      }
    })
  },

  /**
   * 获取购物车信息20190604
   */
  showCartGoods: function(){
    let that = this;
    var community = wx.getStorageSync('community');
    var community_id = community.communityId;
    console.log('onshow购物车里面的community_id:');
    that.setData({ community_id: community_id })
    var token = wx.getStorageSync('token');
    app.util.request({
      'url': 'entry/wxapp/index',
      'data': {
        controller: 'car.show_cart_goods',
        token: token,
        community_id: community_id,
        buy_type: 'dan',
      },
      dataType: 'json',
      success: function (res) {
        // wx.hideLoading();
        setTimeout(function(){ wx.hideLoading(); },1000);
        if (res.data.code == 0) {
          //20190720
          let mult_carts = res.data.mult_carts || [];
          let carts = {};
          let tabIdx = that.data.tabIdx;
          let showTab = false;

          // tab名称自定义
          let { shopcar_tab_express_name, shopcar_tab_all_name } = res.data;
          let tabList = [
            { id: 0, name: shopcar_tab_all_name || '全部商品', enabled: false },
            { id: 1, name: shopcar_tab_express_name || '快递商品', enabled: false },
            { id: 2, name: '到店核销', enabled: false },
            { id: 3, name: '同城配送', enabled: false }
          ];

          //20200220
          let mulCartArr = Object.keys(mult_carts);
          let objLen = mulCartArr.length;
          if (objLen > 1){
            showTab = true;
            mulCartArr.forEach((item)=>{
              tabList[item].enabled = true;
            })
            carts = mult_carts[tabIdx] || {};
          } else if(objLen==1) {
            tabIdx = mulCartArr[0];
            carts = mult_carts[tabIdx] || {};
          }

          let isEmpty = true;
          if (Object.keys(carts).length != 0) {
            isEmpty = false;
            carts = that.sortCarts(carts);
          }
          let { 
            man_free_tuanzshipping, 
            delivery_tuanz_money, 
            is_comunity_rest, 
            open_man_orderbuy, 
            man_orderbuy_money,
            is_show_guess_like,
            is_open_vipcard_buy,
            is_vip_card_member,
            vipcard_save_money,
            modify_vipcard_name,
            is_member_level_buy,
            level_save_money,
            open_tuan_ship,
            full_list,
            is_open_fullreduction,
            localtown_moneytype_fixed_deliverymoney,
            localtown_moneytype_fixed_freemoney
          } = res.data;

          that.setData({
            tabIdx,
            carts,
            mult_carts,
            showTab,
            isEmpty,
            is_comunity_rest,
            open_man_orderbuy,
            man_orderbuy_money: man_orderbuy_money * 1,
            is_show_guess_like,
            man_free_tuanzshipping, // 需要金额
            delivery_tuanz_money, //配送费
            is_open_vipcard_buy,
            is_vip_card_member,
            vipcard_save_money,
            modify_vipcard_name: modify_vipcard_name?modify_vipcard_name:'天机会员',
            is_member_level_buy,
            level_save_money,
            tabList,
            open_tuan_ship,
            full_list,
            is_open_fullreduction,
            localtown_moneytype_fixed_deliverymoney,
            localtown_moneytype_fixed_freemoney
          })
          that.xuan_func();
        } else {
          that.setData({
            needAuth: true,
            isEmpty: true
          })
        }
      }
    })
  },

  onHide: function() {
    this.setData({
      tabbarRefresh: false
    })
    console.log('onHide')
  },

  /**
   * 商品排序
   */
  sortCarts: function(carts) {
    // 先剔除失效（保留原有结构）=>再分出满减
    let is_open_fullreduction = 0;
    let full_reducemoney = 0;
    let full_money = 0;
    let invalidCarts = {};
    let hasInvalid = 0;

    for (let i in carts) {
      is_open_fullreduction = carts[i].is_open_fullreduction;
      full_reducemoney = carts[i].full_reducemoney;
      full_money = carts[i].full_money;
      invalidCarts[i] = {
        id: carts[i].id,
        shopcarts: []
      };

      let shopcarts = carts[i].shopcarts;
      let oriShopcarts = [];
      shopcarts.forEach(function(item, index) {
        if(item.can_buy==0 || item.option_can_buy==0) {
          invalidCarts[i].shopcarts.push(item);
          hasInvalid += 1;
        } else {
          oriShopcarts.push(item);
        }
      })
      carts[i].shopcarts = oriShopcarts;
      oriShopcarts.sort(function(x, y) {
        if (x.can_man_jian < y.can_man_jian) {
          return 1;
        }
        if (x.can_man_jian > y.can_man_jian) {
          return -1;
        }
        return 0;
      });
    }
    this.setData({
      is_open_fullreduction,
      full_reducemoney,
      full_money,
      invalidCarts,
      hasInvalid
    });
    return carts;
  },

  xuan_func: function() {
    var allnum = 0;
    var allcount = 0

    var flag = 1;
    var allselect = false;
    var all_cant_buy = 1;
    for (var i in this.data.carts) {
      var count = 0;
      this.data.carts[i].goodstypeselect = 0;
      this.data.carts[i].goodstype = this.data.carts[i].shopcarts.length;

      for (var j = 0; j < this.data.carts[i].shopcarts.length; j++) {
        let shopcartsItem = this.data.carts[i].shopcarts[j];
        if (shopcartsItem.isselect == false && shopcartsItem.can_buy == 1 && shopcartsItem.can_buy == 1 && shopcartsItem.option_can_buy == 1) flag = 0;
        if (shopcartsItem.isselect && shopcartsItem.can_buy == 1 && shopcartsItem.can_buy == 1 && shopcartsItem.option_can_buy == 1) {
          all_cant_buy = 0;
          //20190927
          count = this.calcVipPrice(count, shopcartsItem);
          this.data.carts[i].goodstypeselect++;
          allnum = parseInt(allnum) + parseInt(shopcartsItem.goodsnum);
        }

        if (shopcartsItem.can_buy == 0) shopcartsItem.isselect = false;
      }
      this.data.carts[i].count = count.toFixed(2);
      allcount = allcount + count;
    }
    if (flag == 1 && all_cant_buy == 0) { //是全部选中
      allselect = true;
    }
    this.setData({
      allselect: allselect,
      allnum: allnum,
      allcount: allcount.toFixed(2),
      carts: this.data.carts
    });
    this.calcAmount();
  },

  //编辑点击事件处理函数
  edit: function(e) {
    var index = parseInt(e.target.dataset.index);
    this.data.carts[index].caredit = "none";
    this.data.carts[index].finish = "inline";
    for (var i = 0; i < this.data.carts[index].shopcarts.length; i++) {
      this.data.carts[index].shopcarts[i].edit = "none";
      this.data.carts[index].shopcarts[i].finish = "inline";
      this.data.carts[index].shopcarts[i].description = "onedit-description";
      this.data.carts[index].shopcarts[i].cartype = "block";
    }
    this.setData({
      carts: this.data.carts
    })

  },

  //完成点击事件处理函数
  finish: function(e) {
    var index = parseInt(e.target.dataset.index);
    this.data.carts[index].caredit = "inline";
    this.data.carts[index].finish = "none";
    for (var i = 0; i < this.data.carts[index].shopcarts.length; i++) {
      this.data.carts[index].shopcarts[i].edit = "inline";
      this.data.carts[index].shopcarts[i].finish = "none";
      this.data.carts[index].shopcarts[i].description = "description";
      this.data.carts[index].shopcarts[i].cartype = "inline";
    }
    this.setData({
      carts: this.data.carts
    })
  },

  goLink: function(event) {
    let link = event.currentTarget.dataset.link;
    wx.navigateTo({
      url: link
    })

  },

  goGoods: function(event) {
    let id = event.currentTarget.dataset.type;

    var pages_all = getCurrentPages();
    if (pages_all.length > 3) {
      wx.redirectTo({
        url: '/Snailfish_shop/pages/goods/index?id=' + id
      })
    } else {
      wx.navigateTo({
        url: '/Snailfish_shop/pages/goods/index?id=' + id
      })
    }

  },

  //店铺点击选择事件
  shopselect: function(e) {
    var index = parseInt(e.target.dataset.index);
    var allselect = this.data.allselect;
    var isselect = this.data.carts[index].isselect;
    var allnum = 0;
    var allcount = 0.00;
    var count = 0.00;
    if (isselect == true) { //店铺为选中状态
      this.data.carts[index].isselect = false;
      allselect = false;
      for (var i = 0; i < this.data.carts[index].shopcarts.length; i++) { //循环商店下商品，改成不选中
        if (this.data.carts[index].shopcarts[i].isselect == true) {
          this.data.carts[index].shopcarts[i].isselect = false;
          allnum = parseInt(allnum) + parseInt(this.data.carts[index].shopcarts[i].goodsnum);
          this.data.carts[index].goodstypeselect = this.data.carts[index].goodstypeselect - 1;
        }

      }
      allnum = this.data.allnum - allnum; //去除不选中商店的产品数量
      allcount = parseFloat(this.data.allcount) - parseFloat(this.data.carts[index].count);
      this.data.carts[index].count = "0.00";
      this.setData({
        carts: this.data.carts,
        allnum: allnum,
        allcount: allcount.toFixed(2),
        allselect: allselect
      });
    } else {
      var addcount = 0.00;
      this.data.carts[index].isselect = true;
      for (var i = 0; i < this.data.carts[index].shopcarts.length; i++) {
        let goodsItem = this.data.carts[index].shopcarts[i];
        if (goodsItem.isselect == false) {
          goodsItem.isselect = true;
          this.data.carts[index].goodstypeselect = this.data.carts[index].goodstypeselect + 1;
          allnum = parseInt(allnum) + parseInt(goodsItem.goodsnum);
          addcount = this.calcVipPrice(addcount, goodsItem);
        }
        // 20190927
        count = this.calcVipPrice(count, goodsItem);
      }
      allnum = this.data.allnum + allnum;
      allcount = parseFloat(this.data.allcount) + addcount;
      this.data.carts[index].count = count.toFixed(2);
      var flag = 1;
      for (var i in this.data.carts) {
        for (var j = 0; j < this.data.carts[i].shopcarts.length; j++)
          if (this.data.carts[i].shopcarts[j].isselect == false)
            flag = 0;
      }
      if (flag == 1) { //是全部选中
        allselect = true;
      }
      this.setData({
        carts: this.data.carts,
        allnum: allnum,
        allcount: allcount.toFixed(2),
        allselect: allselect
      });
    }
    this.go_record();
  },

  //点击商品选中事件函数
  goodsselect: function(e) {
    var parentid = parseInt(e.target.dataset.parentid);
    var index = parseInt(e.target.dataset.index);
    var allselect = this.data.allselect;
    let goodsItem = this.data.carts[parentid].shopcarts[index];
    var isselect = goodsItem.isselect;

    if (isselect == true) { //商品选中状态
      goodsItem.isselect = false;
      if (allselect)
        allselect = false;

      this.data.carts[parentid].goodstypeselect = parseInt(this.data.carts[parentid].goodstypeselect) - 1;
      if (this.data.carts[parentid].goodstypeselect <= 0) { //选中商品为0
        this.data.carts[parentid].isselect = false;
      }
      var allnum = parseInt(this.data.allnum) - parseInt(goodsItem.goodsnum);
      // 20190927
      var allcount = this.calcVipPrice(this.data.allcount, goodsItem, '', 'red');
      var count = this.calcVipPrice(this.data.carts[parentid].count, goodsItem, '', 'red');

      this.data.carts[parentid].count = count.toFixed(2);
      this.setData({
        carts: this.data.carts,
        allnum: allnum,
        allcount: allcount.toFixed(2),
        allselect: allselect
      });
    } else { //商品为非选中状态
      goodsItem.isselect = true;
      this.data.carts[parentid].goodstypeselect = parseInt(this.data.carts[parentid].goodstypeselect) + 1;

      if (this.data.carts[parentid].goodstypeselect > 0) { //选中商品个数大于0
        this.data.carts[parentid].isselect = true;
      }
      var flag = 1;
      for (var i in this.data.carts) {
        console.log('in');
        for (var j = 0; j < this.data.carts[i].shopcarts.length; j++)
          if (this.data.carts[i].shopcarts[j].isselect == false && this.data.carts[i].shopcarts[j].can_buy == 1 && this.data.carts[i].shopcarts[j].option_can_buy == 1) flag = 0;
      }

      if (flag == 1) { //全部商品选中
        allselect = true;
      }
      var allnum = parseInt(this.data.allnum) + parseInt(goodsItem.goodsnum);
      // 20190927
      var allcount = this.calcVipPrice(this.data.allcount, goodsItem);
      var count = this.calcVipPrice(this.data.carts[parentid].count, goodsItem);

      this.data.carts[parentid].count = count.toFixed(2);
      this.setData({
        carts: this.data.carts,
        allnum: allnum,
        allcount: allcount.toFixed(2),
        allselect: allselect
      });
    }
    this.go_record();
  },

  //全部选中事件函数
  allselect: function(e) {
    var allselect = this.data.allselect;
    var carts = this.data.carts;

    if (allselect) { //点击前为全部选中状态
      allselect = false;
      var allnum = 0;
      var allcount = 0.00;
      for (var i in this.data.carts) {
        this.data.carts[i].count = "0.00";
        this.data.carts[i].isselect = false;
        this.data.carts[i].goodstypeselect = 0;
        for (var j in this.data.carts[i].shopcarts)
          this.data.carts[i].shopcarts[j].isselect = false;
      }
      this.setData({
        carts: this.data.carts,
        allnum: allnum,
        allcount: allcount.toFixed(2),
        allselect: allselect
      });
    } else { //点击前为不全部选址状态
      allselect = true;
      var allnum = 0;
      var allcount = 0.00;

      for (var i in this.data.carts) {
        var count = 0;
        this.data.carts[i].isselect = true;
        let shopcarts = this.data.carts[i].shopcarts;
        this.data.carts[i].goodstypeselect = shopcarts.length;
        for (var j in shopcarts) {
          if (shopcarts[j].can_buy == 1 && shopcarts[j].option_can_buy == 1) {
            //20190927
            count = this.calcVipPrice(count, shopcarts[j]);
            allnum = parseInt(allnum) + parseInt(this.data.carts[i].shopcarts[j].goodsnum);
            shopcarts[j].isselect = true;
          }
        }
        this.data.carts[i].count = count.toFixed(2);
        allcount = allcount + count;
      }

      this.setData({
        carts: this.data.carts,
        allnum: allnum,
        allcount: allcount.toFixed(2),
        allselect: allselect
      });
    }
    this.go_record();
  },

  //减少商品数量函数
  regoodsnum: function(e) {
    var parentid = parseInt(e.currentTarget.dataset.parentid);
    var index = parseInt(e.currentTarget.dataset.index);
    let updateCart = this.data.updateCart;
    let goodsItem = this.data.carts[parentid].shopcarts[index];

    // 起购数量
    let goods_start_count = goodsItem.goods_start_count || 1;

    var that = this;
    var goodsnum = goodsItem.goodsnum;
    if (goodsnum == 1 || goodsnum<=goods_start_count) { //减少前商品数量为1
      that.cofirm_del(parentid, index);
    } else { //减少前商品的数量不为1
      if (goodsItem.isselect == true) { //商品为选中状态
        var allnum = parseInt(this.data.allnum) - 1;
        //20190927
        var allcount = this.calcVipPrice(that.data.allcount, goodsItem, 1, 'red');
        var count = this.calcVipPrice(this.data.carts[parentid].count, goodsItem, 1, 'red');

        that.data.carts[parentid].count = count.toFixed(2);
        goodsItem.goodsnum = goodsItem.goodsnum - 1;
        this.setData({
          carts: this.data.carts,
          allnum: allnum,
          allcount: allcount.toFixed(2)
        });
      } else { //商品为非选中状态
        goodsItem.goodsnum = parseInt(goodsItem.goodsnum) - 1;
        this.setData({
          carts: this.data.carts
        });
      }
    }
    if (goodsItem.goodstype == '') {
      let goodsnum = goodsItem.goodsnum * 1;
      let gid = e.currentTarget.dataset.gid;
      status.indexListCarCount(gid, goodsnum);
      that.setData({ updateCart: updateCart + 1 })
    }
    let cur_car_key = goodsItem.key || '';
    that.go_record(cur_car_key);
  },

  /**
   * 确认删除提示框
   */
  cofirm_del: function(parentid, index, type = 1) {
    let that = this;
    let updateCart = this.data.updateCart;
    let goodsItem = that.data.carts[parentid].shopcarts[index];
    // 起购数量
    let goods_start_count = goodsItem.goods_start_count || 1;
    let content = '';
    if(goods_start_count>1) content =`该商品的起购数是${goods_start_count},`;
    wx.showModal({
      title: '提示',
      content: content + '确定删除这件商品吗？',
            confirmColor: "#4facfe",
      success: function(res) {
        if (res.confirm) {
          if (goodsItem.goodstype == '') {
            let gid = goodsItem.id;
            status.indexListCarCount(gid, 0);
            that.setData({ updateCart: updateCart + 1 })
          }
          var del_car_keys = goodsItem.key;
          // 起购数量
          let goodsnum = goodsItem.goodsnum;
          let reduceNum = goods_start_count;
          if(goodsnum<goods_start_count) {
            reduceNum = goodsnum;
          }

          if (goodsItem.isselect == true) { //商品为选中状态
            var allnum = that.data.allnum - reduceNum;

            // 20190927
            var allcount = that.calcVipPrice(that.data.allcount, goodsItem, reduceNum, 'red');
            var count = that.calcVipPrice(that.data.carts[parentid].count, goodsItem, reduceNum, 'red');

            that.data.carts[parentid].count = count.toFixed(2);
            that.data.carts[parentid].goodstype = that.data.carts[parentid].goodstype - 1;
            that.data.carts[parentid].goodstypeselect = that.data.carts[parentid].goodstypeselect - 1
            if (that.data.carts[parentid].goodstype == 0) { //购物车商店商品类别为0，去掉这个商店
              let carts = that.data.carts;
              delete carts[parentid];
              if (Object.keys(carts).length == 0) that.setData({
                isEmpty: true
              })
            } else { //不为0，去掉这个商品
              that.data.carts[parentid].shopcarts.splice(index, 1);
              //判断全选状态，有失效商品20190212
              that.isAllSelect();
            }
            that.setData({
              carts: that.data.carts,
              allnum: allnum,
              allcount: allcount.toFixed(2),
            });
          } else { //商品为非选中状态
            that.data.carts[parentid].goodstype = that.data.carts[parentid].goodstype - 1;
            if (that.data.carts[parentid].goodstype == 0) {
              let carts = that.data.carts;
              delete carts[parentid];
              if (Object.keys(carts).length == 0) that.setData({
                isEmpty: true
              })
            } else {
              that.data.carts[parentid].shopcarts.splice(index, 1);
            }
            that.setData({
              carts: that.data.carts
            });
          }
          that.del_car_goods(del_car_keys);
          that.calcAmount();
        } else {
          console.log('取消删除')
        }
      }
    })
  },

  /**
   * 20190212
   * 删除选中商品，存在失效商品全选状态判断
   */
  isAllSelect: function() {
    var flag = 1,
      allselect = false,
      carts = this.data.carts,
      isCanBuy = 0;
    for (let i in carts) {
      for (let j = 0; j < carts[i].shopcarts.length; j++) {
        if (carts[i].shopcarts[j].can_buy == 1 && carts[i].shopcarts[j].option_can_buy == 1) isCanBuy = 1;
        if (carts[i].shopcarts[j].isselect == false && carts[i].shopcarts[j].can_buy == 1 && carts[i].shopcarts[j].option_can_buy == 1) flag = 0;
      }
    }
    // console.log(flag);
    if (flag == 1 && isCanBuy == 1) allselect = true;

    this.setData({
      allselect: allselect
    })
  },


  //添加商品数量函数
  addgoodsnum: function(e) {

    if (addFlag == 0) return;
    addFlag = 0;
    var parentid = parseInt(e.currentTarget.dataset.parentid);
    var index = parseInt(e.currentTarget.dataset.index);
    var that = this;
    let goodsItem = this.data.carts[parentid].shopcarts[index];
    var max_quantity = parseInt(goodsItem.max_quantity);

    if (goodsItem.isselect == true) { //商品为选中状态
      var allnum = parseInt(this.data.allnum) + 1;
      // 20190927
      var allcount = this.calcVipPrice(this.data.allcount, goodsItem, 1);
      var count = this.calcVipPrice(this.data.carts[parentid].count, goodsItem, 1);
      that.data.carts[parentid].count = count.toFixed(2);

      if (goodsItem.goodsnum < max_quantity) {
        goodsItem.goodsnum = parseInt(goodsItem.goodsnum) + 1;
      } else {
        addFlag = 1;
        goodsItem.goodsnum = max_quantity;
        allnum--;
        var msg = '最多购买' + max_quantity + '个';
        wx.showToast({
          title: msg,
          icon: 'none',
          duration: 2000
        })
        return false;
      }

      this.setData({
        carts: this.data.carts,
        allnum: allnum,
        allcount: allcount.toFixed(2)
      });
    } else { //商品为非选中状态
      if (parseInt(goodsItem.goodsnum) < max_quantity) {
        goodsItem.goodsnum = parseInt(goodsItem.goodsnum) + 1;
      } else {
        addFlag = 1;
        var msg = '最多购买' + max_quantity + '个';
        wx.showToast({
          title: msg,
          icon: 'none',
          duration: 2000
        })
        return false;
      }
    }

    var token = wx.getStorageSync('token');
    var keys_arr = [];
    var all_keys_arr = [];
    var allnum = this.data.allnum;

    var carts = this.data.carts;

    for (var i in carts) {
      for (var j in carts[i]['shopcarts']) {
        keys_arr.push(carts[i]['shopcarts'][j]['key']);
        all_keys_arr.push(carts[i]['shopcarts'][j]['key'] + '_' + carts[i]['shopcarts'][j]['goodsnum']);
      }
    }

    let updateCart = this.data.updateCart || 0;
    app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'car.checkout_flushall',
        token: token,
        car_key: keys_arr,
        community_id: that.data.community_id,
        all_keys_arr: all_keys_arr,
        cur_car_key: goodsItem.key || ''
      },
      method: 'POST',
      dataType: 'json',
      success: function(msg) {
        if (msg.data.code == 0) {
          that.setData({
            carts: that.data.carts
          });
          (0, status.cartNum)('', true).then((res) => {
            res.code == 0 && that.setData({
              cartNum: res.data
            })
          });
          if (goodsItem.goodstype == '') {
            let goodsnum = goodsItem.goodsnum * 1;
            let gid = e.currentTarget.dataset.gid;
            status.indexListCarCount(gid, goodsnum);
            that.setData({ updateCart: updateCart + 1 })
          }
        } else {
          goodsItem.goodsnum = parseInt(goodsItem.goodsnum) - 1;
          if (goodsItem.isselect == true) {
            // 20190927
            var allcount_new = that.calcVipPrice(that.data.allcount, goodsItem, 1, 'red');
            var count_new = that.calcVipPrice(that.data.carts[parentid].count, goodsItem, 1, 'red');

            that.data.carts[parentid].count = count_new.toFixed(2);
            allnum--;
            that.setData({
              allnum: allnum,
              allcount: allcount_new.toFixed(2)
            });
          }
          that.setData({
            carts: that.data.carts
          });

          wx.showToast({
            title: msg.data.msg,
            icon: 'none',
            duration: 2000
          })
        }
        addFlag = 1;
        that.calcAmount();
      }
    })
  },

  /**
   * 输入框监控
   */
  changeNumber: function(e) {
    if (Object.keys(this.data.carts).length<=0) return;
    wx.hideLoading();
    var that = this;
    var parentid = parseInt(e.currentTarget.dataset.parentid);
    var index = parseInt(e.currentTarget.dataset.index);
    var iptVal = e.detail.value;
    var newCount = that.count_goods(parentid, index);
    let goodsItem = this.data.carts[parentid].shopcarts[index];
    let lastGoodsnum = goodsItem.goodsnum;
    console.log(iptVal);
    let updateCart = this.data.updateCart || 0;
    if (iptVal > 0) {
      var max_quantity = parseInt(goodsItem.max_quantity);
      if (iptVal > max_quantity) {
        iptVal = max_quantity;
        wx.showToast({
          title: '不能购买更多啦',
          icon: 'none'
        })
      }
      goodsItem.goodsnum = iptVal;
      if (that.data.carts[parentid].shopcarts[index].isselect == true) { //商品为选中状态
        newCount = that.count_goods(parentid, index);
      }
      this.setData({
        carts: this.data.carts,
        allnum: newCount.allnum,
        allcount: newCount.allcount
      });

      var token = wx.getStorageSync('token');
      var keys_arr = [];
      var all_keys_arr = [];
      var allnum = this.data.allnum;
      var carts = this.data.carts;

      for (var i in carts) {
        for (var j in carts[i]['shopcarts']) {
          keys_arr.push(carts[i]['shopcarts'][j]['key']);
          all_keys_arr.push(carts[i]['shopcarts'][j]['key'] + '_' + carts[i]['shopcarts'][j]['goodsnum']);
        }
      }

      app.util.request({
        'url': 'entry/wxapp/index',
        'data': {
          controller: 'car.checkout_flushall',
          token,
          car_key: keys_arr,
          community_id: that.data.community_id,
          all_keys_arr: all_keys_arr,
          cur_car_key: goodsItem.key || ''
        },
        method: 'POST',
        dataType: 'json',
        success: function(msg) {
          if (msg.data.code == 0) {
            that.setData({
              carts: that.data.carts
            });
            (0, status.cartNum)('', true).then((res) => {
              res.code == 0 && that.setData({
                cartNum: res.data
              })
            });
            if (that.data.carts[parentid].shopcarts[index].goodstype == '') {
              let goodsnum = that.data.carts[parentid].shopcarts[index].goodsnum * 1;
              let gid = that.data.carts[parentid].shopcarts[index].id;
              status.indexListCarCount(gid, goodsnum);
              that.setData({ updateCart: updateCart + 1 })
            }
            that.go_record();
          } else {
            that.data.carts[parentid].shopcarts[index].goodsnum = lastGoodsnum;
            if (that.data.carts[parentid].shopcarts[index].isselect == true) { //商品为选中状态
              newCount = that.count_goods(parentid, index);
            }
            that.setData({
              carts: that.data.carts,
              allnum: newCount.allnum,
              allcount: newCount.allcount
            });

            wx.showToast({
              title: msg.data.msg,
              icon: 'none',
              duration: 2000
            })
          }
        }
      })
    } else {
      wx.hideLoading();
      this.data.carts[parentid].shopcarts[index].goodsnum = 1;
      if (that.data.carts[parentid].shopcarts[index].isselect == true) { //商品为选中状态
        newCount = that.count_goods(parentid, index);
      }
      this.setData({
        carts: this.data.carts,
        allnum: newCount.allnum,
        allcount: newCount.allcount
      });
      var token = wx.getStorageSync('token');
      var keys_arr = [];
      var all_keys_arr = [];
      var allnum = this.data.allnum;
      var carts = this.data.carts;

      for (var i in carts) {
        for (var j in carts[i]['shopcarts']) {
          keys_arr.push(carts[i]['shopcarts'][j]['key']);
          all_keys_arr.push(carts[i]['shopcarts'][j]['key'] + '_' + carts[i]['shopcarts'][j]['goodsnum']);
        }
      }

      app.util.request({
        'url': 'entry/wxapp/index',
        'data': {
          controller: 'car.checkout_flushall',
          'token': token,
          'car_key': keys_arr,
          community_id: that.data.community_id,
          'all_keys_arr': all_keys_arr,
          cur_car_key: goodsItem.key || ''
        },
        method: 'POST',
        dataType: 'json',
        success: function(msg) {
          if (msg.data.code == 0) {
            that.setData({
              carts: that.data.carts
            });
            (0, status.cartNum)('', true).then((res) => {
              res.code == 0 && that.setData({
                cartNum: res.data
              })
            });
            if (that.data.carts[parentid].shopcarts[index].goodstype == '') {
              let goodsnum = that.data.carts[parentid].shopcarts[index].goodsnum * 1;
              let gid = that.data.carts[parentid].shopcarts[index].id;
              status.indexListCarCount(gid, goodsnum);
              that.setData({ updateCart: updateCart + 1 })
            }
            that.go_record();
          }
        }
      })
      that.cofirm_del(parentid, index);
    }
  },

  count_goods: function(parentid, index) {
    let that = this;
    let carts = this.data.carts;
    // let cart = carts[parentid];
    let allnum = 0;
    let allcount = 0;

    for (let carsKey of Object.keys(carts)) {
      let cart = carts[carsKey];
      cart.shopcarts.forEach(function (item, idx) {
        if (item.isselect) {
          allcount = that.calcVipPrice(allcount, item);
          allnum += parseInt(item.goodsnum);
        }
      })
    }

    return {
      allnum,
      allcount: allcount.toFixed(2)
    }
  },

  //删除商品函数
  delgoods: function(e) {
    var parentid = parseInt(e.target.dataset.parentid);
    var index = parseInt(e.target.dataset.index);
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确定删除这件商品吗？',
            confirmColor: "#4facfe",
      success: function(res) {
        if (res.confirm) {
          let goodsItem = that.data.carts[parentid].shopcarts[index];
          var del_car_keys = goodsItem.key;
          if (goodsItem.isselect == true) { //商品为选中状态
            var allnum = parseInt(that.data.allnum) - parseInt(goodsItem.goodsnum);
            // 20190927
            var allcount = that.calcVipPrice(that.data.allcount, goodsItem, 1, 'red');
            var count = that.calcVipPrice(that.data.carts[parentid].count, goodsItem, 1, 'red');

            that.data.carts[parentid].count = count.toFixed(2);
            that.data.carts[parentid].goodstype = that.data.carts[parentid].goodstype - 1;
            that.data.carts[parentid].goodstypeselect = that.data.carts[parentid].goodstypeselect - 1
            if (that.data.carts[parentid].goodstype == 0) {
              console.log(parentid);
              //that.data.carts.splice(parentid, 1)
              that.data.carts[parentid].shopcarts.splice(index, 1);
            } else {
              that.data.carts[parentid].shopcarts.splice(index, 1);
            }
            var num = 0;
            for (var i = 0; i < that.data.carts.length; i++) {
              for (var j = 0; j < that.data.carts[i].shopcarts.length; j++) {
                num = num + that.data.carts[i].shopcarts[j].goodsnum;
              }
            }
            if (allnum == num)
              that.data.allselect = true;
            that.setData({
              carts: that.data.carts,
              allnum: allnum,
              allcount: allcount.toFixed(2),
              allselect: that.data.allselect
            });
          } else { //商品为选中状态
            that.data.carts[parentid].goodstype = that.data.carts[parentid].goodstype - 1;
            if (that.data.carts[parentid].goodstype == 0) {
              that.data.carts[parentid].shopcarts.splice(index, 1);
            } else {
              that.data.carts[parentid].shopcarts.splice(index, 1);
            }
            var num = 0;
            for (var i = 0; i < that.data.carts.length; i++) {
              for (var j = 0; j < that.data.carts[i].shopcarts.length; j++) {
                num = num + that.data.carts[i].shopcarts[j].goodsnum;
              }
            }
            if (that.data.allnum == num)
              that.data.allselect = true;
            that.setData({
              carts: that.data.carts,
              allselect: that.data.allselect
            });
          }

          if (that.data.carts[parentid].shopcarts.length == 0) {
            delete that.data.carts[parentid];
            if (Object.keys(that.data.carts).length == 0) {
              that.setData({
                carts: []
              });
            }
          }
          //删除商品
          that.del_car_goods(del_car_keys);
        }
      }
    })
    this.go_record();
  },

  del_car_goods: function (carkey, isLose=0) {
    var token = wx.getStorageSync('token');
    var that = this;
    let updateCart = this.data.updateCart;
    console.log('del_car_goods:开始');

    var community = wx.getStorageSync('community');
    var community_id = community.communityId;
    console.log('缓存中的：' + community_id);
    console.log('使用中的：' + that.data.community_id);
    app.util.request({
      'url': 'entry/wxapp/index',
      'data': {
        controller: 'car.del_car_goods',
        carkey: carkey,
        community_id: that.data.community_id,
        token: token
      },
      method: 'POST',
      dataType: 'json',
      success: function(msg) {
        if (msg.data.code == 0 && isLose != 1) {
          (0, status.cartNum)('', true).then((res) => {
            res.code == 0 && that.setData({
              cartNum: res.data,
              updateCart: updateCart + 1
            });
          });
        }
      }
    })
  },

  /**
   * 提示不可购买并提示是否删除
   */
  delete: function (e) {
    var parentid = parseInt(e.currentTarget.dataset.parentid);
    var index = parseInt(e.currentTarget.dataset.index);
    var isLost = e.currentTarget.dataset.islost || 0;
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确认删除这件商品吗？',
            confirmColor: "#4facfe",
      success: function(res) {
        if (res.confirm) {
          if (isLost==1) {
            let {hasInvalid,invalidCarts} = that.data;
            console.log(parentid)
            let del_car_keys = invalidCarts[parentid].shopcarts[index].key;
            invalidCarts[parentid].shopcarts.splice(index, 1);
            hasInvalid -= 1;
            that.setData({ invalidCarts, hasInvalid });
            that.del_car_goods(del_car_keys, 1);
          } else {
            let carts = that.data.carts;
            let del_car_keys = carts[parentid].shopcarts[index].key;
            carts[parentid].shopcarts.splice(index, 1);
            that.setData({
              carts: carts
            });
            if (carts[parentid].shopcarts.length == 0) {
              delete carts[parentid];
              if (Object.keys(carts).length == 0) {
                that.setData({
                  carts: {}
                });
              }
            }
            //删除商品
            that.del_car_goods(del_car_keys);
          }
        }
      }
    })
  },

  //清空失效商品函数
  clearlose: function() {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确认清空失效商品吗？',
            confirmColor: "#4facfe",
      success: function(res) {
        if (res.confirm) {
          let invalidCarts = that.data.invalidCarts;

          for (let idx in invalidCarts) {
            let shopcarts = invalidCarts[idx].shopcarts;
            shopcarts.forEach(function(item){
              let del_car_keys = item.key;
              that.del_car_goods(del_car_keys, 1);
            })
          }
          that.setData({
            hasInvalid: 0,
            invalidCarts: {}
          });
        }
      }
    })
  },

  //记录购物车状态值，为了下次进来还是和上次一样
  go_record: function(cur_car_key='') {
    var that = this;
    var token = wx.getStorageSync('token');
    var keys_arr = [];
    var all_keys_arr = [];
    var allnum = this.data.allnum;
    var carts = this.data.carts;

    for (var i in carts) {
      for (var j in carts[i]['shopcarts']) {
        if (carts[i]['shopcarts'][j]['isselect']) {
          keys_arr.push(carts[i]['shopcarts'][j]['key']);
        }
        all_keys_arr.push(carts[i]['shopcarts'][j]['key'] + '_' + carts[i]['shopcarts'][j]['goodsnum']);
      }
    }

    app.util.request({
      'url': 'entry/wxapp/index',
      'data': {
        controller: 'car.checkout_flushall',
        token: token,
        car_key: keys_arr,
        community_id: that.data.community_id,
        all_keys_arr: all_keys_arr,
        cur_car_key
      },
      method: 'POST',
      dataType: 'json',
      success: function(msg) {
        if (msg.data.code == 0) {
          // todo
          (0, status.cartNum)('', true).then((res) => {
            res.code == 0 && that.setData({
              cartNum: res.data
            })
          });
        } else {
          wx.showToast({
            title: msg.data.msg,
            icon: 'none',
            duration: 2000
          })
        }

      }
    })
    that.calcAmount();
  },

  //结算跳转页面函数
  toorder: function() {
    var token = wx.getStorageSync('token');
    var keys_arr = [];
    var all_keys_arr = [];
    var that = this;

    var allnum = this.data.allnum;
    if (allnum > 0) {
      var carts = this.data.carts;
      for (var i in carts) {
        for (var j in carts[i]['shopcarts']) {
          if (carts[i]['shopcarts'][j]['isselect']) {
            keys_arr.push(carts[i]['shopcarts'][j]['key']);
          }

          all_keys_arr.push(carts[i]['shopcarts'][j]['key'] + '_' + carts[i]['shopcarts'][j]['goodsnum']);
        }
      }

      app.util.request({
        'url': 'entry/wxapp/index',
        'data': {
          controller: 'car.checkout_flushall',
          token: token,
          community_id: that.data.community_id,
          car_key: keys_arr,
          all_keys_arr: all_keys_arr
        },
        method: 'POST',
        dataType: 'json',
        success: function(msg) {
          if (msg.data.code == 0) {
            let is_limit = msg.data.data || 0;
            wx.navigateTo({
              url: '/eaterplanet_ecommerce/pages/order/placeOrder?type=dan&is_limit=' + is_limit
            })
          } else {
            that.showCartGoods();
            wx.showToast({
              title: msg.data.msg,
              icon: 'none',
              duration: 2000
            })
          }
        }
      })

    } else {
      wx.showModal({
        title: '提示',
        content: '请选择您要购买的商品',
            confirmColor: "#4facfe",
        success: function(res) {
          if (res.confirm) {

          }
        }
      })
    }

  },

  goindex: function() {
    wx.switchTab({
      url: '/eaterplanet_ecommerce/pages/index/index',
    })
  },

  /**
   * 计算优惠
   */
  calcAmount: function() {
    let {
      is_open_vipcard_buy,
      is_vip_card_member,
      carts,
      delivery_tuanz_money,
      man_free_tuanzshipping,
      full_list,
      allcount,
      tabIdx
    } = this.data;
    let totalAmount = 0; //合计
    let disAmount = 0; //优惠
    let diffMoney = 0; //差多少可满减
    let cartsArr = Object.keys(carts);
    let allReducGoods = []; //所有满减商品
    let full_money = 0;
    let full_reducemoney = 0;
    let isCanManJian = 0;

    // 免配送费
    let deliveryGoodsTot = 0;
    let selectGoodsTot = 0; //商品价格合计

    // 开通vip优惠提示
    let vipFee = 0;
    let levelFee = 0;
    let localtown_fee_list = tabIdx==3?{}:''; //同城配送起送优惠信息

    cartsArr.forEach(key => {
      let cart = carts[key];
      let shopcarts = cart.shopcarts;
      full_money = cart.full_money * 1;
      full_reducemoney = cart.full_reducemoney * 1;
      let localtown_fixed_list = cart.localtown_fixed_list || '';
      let curSelectGoodsTot = 0; //当前平台选中商品合计
      // 1选提取所有的满减商品
      shopcarts.forEach(function(item) {
        if (item.isselect && item.can_man_jian) {
          allReducGoods.push(item);
        }
        if (item.isselect && man_free_tuanzshipping > 0 && delivery_tuanz_money > 0) {
          if (is_open_vipcard_buy == 1 && is_vip_card_member == 1 && item.is_take_vipcard == 1) {
            accordTot += item.card_price * item.goodsnum * 1;
          } else if (item.is_mb_level_buy == 1){
            accordTot += item.levelprice * item.goodsnum * 1;
          } else {
            accordTot += item.currntprice * item.goodsnum * 1;
          }
        }

        //vip优惠
        if (is_open_vipcard_buy == 1 && is_vip_card_member == 1 && item.is_take_vipcard == 1 && item.isselect) {
          vipFee += (item.currntprice - item.card_price) * item.goodsnum * 1;
        } else if (item.is_mb_level_buy == 1 && item.isselect) {
          //等级优惠
          levelFee += (item.currntprice - item.levelprice) * item.goodsnum * 1;
        }

        //自营商品满减配送费商品合计
        if (item.isselect && item.store_id==0) {
          if (is_open_vipcard_buy == 1 && is_vip_card_member == 1 && item.is_take_vipcard == 1) {
            deliveryGoodsTot += item.card_price * item.goodsnum * 1;
          } else if (item.is_mb_level_buy == 1){
            deliveryGoodsTot += item.levelprice * item.goodsnum * 1;
          } else {
            deliveryGoodsTot += item.currntprice * item.goodsnum * 1;
          }
        }

        // 商品合计
        if (item.isselect) {
          selectGoodsTot += item.currntprice * item.goodsnum * 1;
        }

        //同城配送
        if (item.isselect && tabIdx==3) {
          curSelectGoodsTot += item.currntprice * item.goodsnum * 1;
        }
      })
      if(tabIdx==3){
        let { localtown_moneytype_fixed_deliverymoney, localtown_moneytype_fixed_freemoney } = localtown_fixed_list;
        let localtownCanBuy = localtown_moneytype_fixed_deliverymoney - curSelectGoodsTot; //>0显示起送差额
        let localtownManJian = localtown_moneytype_fixed_freemoney - curSelectGoodsTot; //>0显示免配送差额
        localtown_fee_list[key] = {};
        localtown_fee_list[key].localtownCanBuy = localtownCanBuy.toFixed(2);
        localtown_fee_list[key].localtownManJian = localtownManJian.toFixed(2);
        localtown_fee_list[key].localtown_moneytype_fixed_deliverymoney = localtown_moneytype_fixed_deliverymoney;
        localtown_fee_list[key].localtown_moneytype_fixed_freemoney = localtown_moneytype_fixed_freemoney;
      }
    })

    // 计算满减金额
    let accordTot = 0;
    allReducGoods.forEach(function(item) {
      if (item.isselect && item.can_man_jian) {
        if (is_open_vipcard_buy == 1 && is_vip_card_member == 1 && item.is_take_vipcard==1) {
          accordTot += item.card_price * item.goodsnum * 1;
        } else if (item.is_mb_level_buy == 1){
          accordTot += item.levelprice * item.goodsnum * 1;
        } else {
          accordTot += item.currntprice * item.goodsnum * 1;
        }
        isCanManJian = 1;
      }
    })

    let currentMjIdx = -1; //当前满减索引
    full_list.forEach((item, index)=>{
      if(accordTot >= item.full_money) {
        full_money = item.full_money*1;
        full_reducemoney = item.full_reducemoney*1;
        full_list[index].disable = true;
        currentMjIdx = index;
      } else {
        full_list[index].disable = false;
      }
    })
    // 未满足
    let cur_full_item = null;
    // 已享
    let sucess_full_item = null;
    let tot_full_len = full_list.length || 0;
    if(currentMjIdx==-1){
      cur_full_item = full_list[0];
    } else {
      if(currentMjIdx<tot_full_len) {
        if(currentMjIdx+1!=tot_full_len) cur_full_item = full_list[currentMjIdx+1];
        sucess_full_item = full_list[currentMjIdx];
      } else {
        sucess_full_item = full_list[currentMjIdx];
      }
    }

    if (accordTot >= full_money) {
      disAmount += full_reducemoney;
    } else {
      diffMoney = full_money - accordTot;
    }

    let nextDiffMoney = 0;
    if(full_list.length > currentMjIdx+1) {
      nextDiffMoney = full_list[currentMjIdx+1].full_money*1 - accordTot;
    }

    // 优惠金额（包含满减，会员等级优惠）
    disAmount += vipFee + levelFee;

    totalAmount = (allcount * 1 - disAmount).toFixed(2);
    totalAmount = totalAmount <= 0 ? 0 : totalAmount;

    let canbuy_tot = allcount * 1; //合计 计算满多少下单使用
    let canbuy_other = canbuy_tot - this.data.man_orderbuy_money;
    let vipTotal = selectGoodsTot;
    let levelToTal = selectGoodsTot;

    // 团长满配送费
    let diffDeliveryMoney = 0;
    if (deliveryGoodsTot < man_free_tuanzshipping*1) {
      diffDeliveryMoney = man_free_tuanzshipping*1 - deliveryGoodsTot;
    }

    // 同城配送
    let localtownCanBuy = true; //是否可以结算
    if(tabIdx==3) {
      Object.keys(localtown_fee_list).forEach(idx=>{
        if(localtown_fee_list[idx].localtownCanBuy>0&&carts[idx].isselect) localtownCanBuy = false;
      })
    }

    console.log('=====carts=====', Object.keys(carts))
    // let cartsNull = false;
    // if(Object.keys(carts).length==0){cartsNull = true;}
    this.setData({
      // cartsNull,
      isCanManJian,
      canbuy_tot,
      totalAmount,
      disAmount: disAmount.toFixed(2),
      diffMoney: diffMoney.toFixed(2),
      canbuy_other: canbuy_other.toFixed(2),
      diffDeliveryMoney: diffDeliveryMoney.toFixed(2),
      vipFee: vipFee.toFixed(2),
      vipTotal: vipTotal.toFixed(2),
      levelFee: levelFee.toFixed(2),
      levelToTal: levelToTal.toFixed(2),
      full_reducemoney,
      full_list,
      nextDiffMoney: nextDiffMoney.toFixed(2),
      cur_full_item,
      sucess_full_item,
      localtown_fee_list,
      localtownCanBuy
    })
  },

  /**
   * vip商品价格计算
   * count: 原来总价
   * good: 商品
   * num: 数量,
   * type: add 加减
   */
  calcVipPrice: function(count, good, num=0, type="add"){
    let { is_open_vipcard_buy, is_vip_card_member, canLevelBuy } = this.data;
    let goodsNum = num > 0 ? num : parseFloat(good.goodsnum);
    if (type === 'red') goodsNum = -1*goodsNum;
    count = parseFloat(count);
    // if (is_open_vipcard_buy == 1 && is_vip_card_member == 1 && good.is_take_vipcard==1 ) {
    //   return count += parseFloat(good.card_price) * goodsNum;
    // } else if (canLevelBuy && good.is_mb_level_buy == 1){
    //   return count += parseFloat(good.levelprice) * goodsNum;
    // }else {
      return count += parseFloat(good.currntprice) * goodsNum;
    // }
  },

  /**
   * 大家常卖
   */
  openSku: function(t) {
    var that = this,
      e = t.detail;
    var goods_id = e.actId;
    var options = e.skuList;
    that.setData({
      addCar_goodsid: goods_id
    })
    let list = options.list || [];
    let arr = [];
    let goods_start_count = e.allData.goods_start_count || 1;
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
      var id = '';
      for (let i = 0; i < arr.length; i++) {
        if (i == arr.length - 1) {
          id = id + arr[i]['id'];
        } else {
          id = id + arr[i]['id'] + "_";
        }
      }

      var cur_sku_arr = options.sku_mu_list[id];
      cur_sku_arr.oneday_limit_count = e.allData.oneday_limit_count || 0;
      cur_sku_arr.total_limit_count = e.allData.total_limit_count || 0;
      cur_sku_arr.one_limit_count = e.allData.one_limit_count || 0;
      cur_sku_arr.goods_start_count = e.allData.goods_start_count || 1;

      that.setData({
        sku: arr,
        sku_val: goods_start_count,
        cur_sku_arr: cur_sku_arr,
        skuList: e.skuList,
        visible: true,
        showSku: true
      });
    } else {
      let goodsInfo = e.allData;
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
      that.gocarfrom(formIds);
    }
  },

  /**
   * 确认加入购物车
   */
  gocarfrom: function(e) {
    var that = this;
    var is_just_addcar = 1;
    wx.showLoading();
    a.collectFormIds(e.detail.formId);
    that.goOrder();
  },

  changeCartNum(e) {
    let cartNum = e.detail || 0;
    let updateCart = this.data.updateCart;
    this.showCartGoods();
    this.setData({
      cartNum: cartNum,
      updateCart: updateCart + 1
    })
  },

  goOrder: function() {
    var that = this;
    if (that.data.can_car) {
      that.data.can_car = false;
    }
    var token = wx.getStorageSync('token');
    var community = wx.getStorageSync('community');

    var goods_id = that.data.addCar_goodsid;
    var community_id = community.communityId;
    var quantity = that.data.sku_val;
    var cur_sku_arr = that.data.cur_sku_arr;
    var sku_str = '';
    var is_just_addcar = 1;
    let updateCart = that.data.updateCart;

    if (cur_sku_arr && cur_sku_arr.option_item_ids) {
      sku_str = cur_sku_arr.option_item_ids;
    }

    let data = {
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
        let { pop_vipmember_buyimage } = res.data;
        wx.hideLoading();
        that.setData({ pop_vipmember_buyimage, showVipModal: true, visible: false })
      } else {
        if (res.data.code == 3 || res.data.code == 7) {
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
                needAuth: true, isEmpty: true
              })
            }
          })
        } else if (res.data.code == 6) {
          let max_quantity = res.data.max_quantity || '';
          (max_quantity > 0) && that.setData({
            sku_val: max_quantity,
            updateCart: updateCart + 1
          })
          var msg = res.data.msg;
          wx.showToast({
            title: msg,
            icon: 'none',
            duration: 2000
          })
        } else {
          if (is_just_addcar == 1) {
            that.closeSku();
            that.showCartGoods();
            status.indexListCarCount(goods_id, res.data.cur_count);
            (0, status.cartNum)(res.data.total);
            that.setData({
              cartNum: res.data.total,
              updateCart: updateCart + 1
            })
            wx.showToast({
              title: "已加入购物车",
              image: "../../images/addShopCart.png"
            })
          }
        }
      }
    }).catch(res=>{
      app.util.message(res||'请求失败', '', 'error');
    })
  },

  selectSku: function(event) {
    var that = this;
    let str = event.currentTarget.dataset.type;
    let obj = str.split("_");
    let arr = that.data.sku;
    let temp = {
      name: obj[3],
      id: obj[2],
      index: obj[0],
      idx: obj[1]
    };
    arr.splice(obj[0], 1, temp);
    that.setData({
      sku: arr
    })
    var id = '';
    for (let i = 0; i < arr.length; i++) {
      if (i == arr.length - 1) {
        id = id + arr[i]['id'];
      } else {
        id = id + arr[i]['id'] + "_";
      }
    }

    var { skuList, cur_sku_arr } = this.data;
    cur_sku_arr = Object.assign(cur_sku_arr, skuList.sku_mu_list[id]);

    that.setData({
      cur_sku_arr: cur_sku_arr
    });
  },

  /**
   * 数量加减
   */
  setNum: function(event) {
    let types = event.currentTarget.dataset.type;
    var that = this;
    var num = 1;
    let sku_val = this.data.sku_val * 1;
    if (types == 'add') {
      num = sku_val + 1;
    } else if (types == 'decrease') {
      let goods_start_count = this.data.cur_sku_arr.goods_start_count || 1;
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
      if (num > cur_sku_arr['canBuyNum']) {
        num = num - 1;
      }
    } else {
      let cur_sku_arr = this.data.cur_sku_arr;
      if (num > cur_sku_arr['canBuyNum']) {
        num = num - 1;
      }
    }

    this.setData({
      sku_val: num
    })
  },

  skuConfirm: function() {
    this.closeSku(), (0, status.cartNum)().then((res) => {
      res.code == 0 && that.setData({
        cartNum: res.data
      })
    });
  },

  /**
   * 关闭购物车选项卡
   */
  closeSku: function() {
    this.setData({
      visible: 0,
      stopClick: false,
    });
  },

  /**
   * 切换
   */
  changeTabs: function(e){
    let that = this;
    let idx = e.currentTarget.dataset.idx || 0;
    let { tabIdx, carts, mult_carts } = this.data;
    if (tabIdx != idx) {
      mult_carts[tabIdx] = carts;
      carts = mult_carts[idx];
      let isEmpty = true;
      if (carts&&Object.keys(carts).length != 0)  isEmpty = false;
      this.setData({
        tabIdx: idx,
        mult_carts,
        isEmpty,
        carts
      }, ()=>{
        that.xuan_func();
      })
    }
  },

  vipModal: function(t) {
    this.setData(t.detail)
  }

})
