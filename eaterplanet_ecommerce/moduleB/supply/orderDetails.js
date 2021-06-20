let app = getApp();
var status = require('../../utils/index.js');

Page({
  mixins: [require('static/orderMixin.js')],
  data: {
    common_header_backgroundimage: app.globalData.common_header_backgroundimage,
    changePrice: 0
  },
  id: '',
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
    let id = options.id || '';
    if(!id) {
      app.util.message('参数错误', '/eaterplanet_ecommerce/moduleB/supply/orderManage', 'error');
      return;
    }
    this.id = id;
    status.setGroupInfo().then((groupInfo) => {
      this.setData({ groupInfo })
    });
    this.initFn(id);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  initFn: function(){
    this.setData({showRaderList: false});
    wx.showLoading();
    let id = this.id;
    let token = wx.getStorageSync('token');
    app.util.ProReq('order.order_info', {token, id, is_supply: 1}).then(res=>{
      let order = res.data;
      let { is_hidden_orderlist_phone, presale_info } = res;

      let { real_total, shipping_fare, voucher_credit, fullreduction_money } = order.order_info;
      var goodsTotal = parseFloat(real_total) - parseFloat(shipping_fare);
      let disAmount = parseFloat(voucher_credit) + parseFloat(fullreduction_money);
      disAmount = (disAmount > goodsTotal) ? goodsTotal : disAmount;

      let changePrice = 0;
      if(order.order_info.is_change_price==1) {
        changePrice = Math.abs(order.order_info.admin_change_price);
      }

      let levelAmount = 0;
      let order_goods_list = order.order_goods_list;
      if(order_goods_list&&order_goods_list.length) {
        order_goods_list.forEach(function(item){
          let total = item.total * 1;
          let old_total = item.old_total * 1;
          if (item.is_level_buy==1 || item.is_vipcard_buy==1) {
            levelAmount += old_total - total;
          }
        })
      }

      presale_info = Object.keys(presale_info).length ? presale_info : '';

      this.setData({
        order,
        is_hidden_orderlist_phone,
        goodsTotal: goodsTotal.toFixed(2),
        disAmount: disAmount.toFixed(2),
        levelAmount: levelAmount.toFixed(2),
        changePrice: changePrice.toFixed(2),
        presale_info
      })
    }).catch(err=>{
      app.util.message(err.msg, 'switchTo:/eaterplanet_ecommerce/pages/user/me', 'error');
    })
  },

  callTelphone: function (t) {
    var e = this;
    this.data.isCalling || (this.data.isCalling = true, wx.makePhoneCall({
      phoneNumber: t.currentTarget.dataset.phone,
      complete: function () {
        e.data.isCalling = false;
      }
    }));
  },

  goExpress: function(){
    let order_id = this.data.order.order_info.order_id;
    wx.navigateTo({
      url: '/eaterplanet_ecommerce/pages/order/goods_express?id=' + order_id,
    })
  },

  hideExpModal: function(){
    this.setData({
      showExpModal: false
    })
  }

})
