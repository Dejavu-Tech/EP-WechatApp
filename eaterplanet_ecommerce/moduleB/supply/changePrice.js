var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    orders: '',
    order_goods: [],
    priceArr: [],
    orderGoodsIdArr: [],
    goodsTot: 0,
    changePrice: 0
  },
  id: 0,
  cansub: true,
    handlerGobackClick(delta) {
    const pages = getCurrentPages();
    if (pages.length >= 2) {
      wx.navigateBack({
        delta: delta
      });
    } else {
      wx.switchTab({
        url: '/eaterplanet_ecommerce/pages/index/index'
      });
    }
  },
  handlerGohomeClick(url) {
    wx.switchTab({
      url: '/eaterplanet_ecommerce/pages/index/index'
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let id = options.order_id || '';
    if(!id) {
      app.util.message('参数错误', '/eaterplanet_ecommerce/moduleB/supply/orderManage', 'error');
      return;
    }
    this.id = id;
    this.getData(id);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  getData: function(order_id) {
    wx.showLoading();
    let token = wx.getStorageSync('token');
    app.util.ProReq('order.order_change', {token, order_id, is_supply: 1}).then(res=>{
      let orders = res.orders;
      let order_goods = res.order_goods;
      let priceArr = [];
      let orderGoodsIdArr = [];
      order_goods.forEach(item=>{
        orderGoodsIdArr.push(item.order_goods_id);
        priceArr.push(0);
      })
      this.calcGoodsPrice(priceArr, orders);
      this.setData({
        orders,
        order_goods,
        priceArr,
        orderGoodsIdArr
      })
    }).catch(err=>{
      app.util.message(err.msg, 'switchTo:/eaterplanet_ecommerce/pages/user/me', 'error');
    })
  },

  reduceIpt: function(e) {
    let type = e.currentTarget.dataset.type;
    let idx = e.currentTarget.dataset.idx;
    let { priceArr, order_goods } = this.data;
    let goodItem = order_goods[idx];
    let curPrice = priceArr[idx]*1;
    let max = goodItem.max_total*1;
    let min = -max;
    if(type=='add') {
      priceArr[idx] = (curPrice+1).toFixed(2);
    } else {
      if((curPrice-1)<min) {
        wx.showToast({
          title: "改价后的商品实付价格不能低于0.1元",
          icon: "none"
        })
        priceArr[idx] = (min + 0.1).toFixed(2);
      } else {
        priceArr[idx] = (curPrice-1).toFixed(2);
      }
    }
    this.calcGoodsPrice(priceArr);
    this.setData({ priceArr })
  },

  changeNumber: function (e) {
    let idx = e.currentTarget.dataset.idx;
    let val = parseFloat(e.detail.value);
    if(!val) val = 0;
    let { priceArr, order_goods } = this.data;
    let goodItem = order_goods[idx];
    let max = goodItem.max_total*1;
    let min = -max;
    console.log(val)
    if(val<min) {
      wx.showToast({
        title: "改价后的商品实付价格不能低于0.1元",
        icon: "none"
      })
      priceArr[idx] = (min + 0.1).toFixed(2);
    } else {
      priceArr[idx] = val.toFixed(2);
    }
    this.calcGoodsPrice(priceArr);
    this.setData({ priceArr })
  },

  calcGoodsPrice: function(priceArr, orders) {
    if(!orders)  orders = this.data.orders;
    let old_price = orders.old_price*1;
    let buyer_total = orders.buyer_total*1;
    let changePrice = 0;
    priceArr.forEach(item=>{
      changePrice += item*1;
    })
    console.log(old_price)
    buyer_total += changePrice;
    changePrice += orders.changeprice*1;
    this.setData({
      goodsTot: (old_price+changePrice).toFixed(2),
      changePrice: changePrice.toFixed(2),
      buyer_total: buyer_total.toFixed(2)
    })
  },

  subChange: function() {
    if(!this.cansub) return;
    this.cansub = false;
    wx.showLoading();
    let token = wx.getStorageSync('token');
    let order_id = this.id;
    let { priceArr, orderGoodsIdArr } = this.data;
    let order_goods_id = orderGoodsIdArr.join(',');
    let change_price = priceArr.join(',');
    app.util.ProReq('order.order_changeprice', {token, order_id, is_supply: 1, order_goods_id,change_price}).then(res=>{
      wx.showToast({
        title: "改价成功",
        icon: "none"
      })
      setTimeout(() => {
        this.getData(order_id);
        this.cansub = true;
      }, 1500);
    }).catch(err=>{
      this.cansub = true;
      app.util.message(err.msg, '', 'error');
    })
  }
})
