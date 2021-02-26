let app = getApp();

module.exports = {
  data: {
    index: 0,
    shipping_no: '',
    expInfo: '',
    showRaderList: false,
    selectOrderId: ''
  },

  actionConfirm: function(content) {
    return new Promise((resolve, reject)=>{
      wx.showModal({
        title: '提示',
        content,
        showCancel: true,
        success: (result) => {
          if (result.confirm) {
            resolve();
          } else if (result.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    })
  },

  /**
   * 获取快递列表
   * @param {*} e 
   */
  getExpList: function(e) {
    this.actionConfirm('确认此订单发货吗？').then(()=>{
      let token = wx.getStorageSync('token');
      let order_id = e.currentTarget.dataset.id || '';
      wx.showLoading();
      app.util.ProReq('supplymobile.get_express_list', {token, order_id}).then(res=>{
        //快递列表
        let expInfo = { order_id, ...res.data };
        this.setData({
          expInfo,
          showExpModal: true
        })
        //弹窗
      }).catch(err=>{
        app.util.message(err.msg, '', 'error');
      })
    })
  },

  bindPickerChange: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value
    })
  },

  bindKeyInput: function (e) {
    this.setData({
      shipping_no: e.detail.value
    })
  },

  /**
   * 快递确认配送
   * @param {*} order_id 
   */
  expSend: function(e) {
    console.log(e)
    let token = wx.getStorageSync('token');
    let order_id = e.currentTarget.dataset.id || '';
    let { expInfo, index, shipping_no } = this.data;
    let express_id = expInfo && expInfo.express_list[index].id || '';
    if(express_id=='') {
      wx.showToast({
        title: '请选择物流公司',
        icon: 'none'
      })
      return;
    }
    if(shipping_no=='') {
      wx.showToast({
        title: '请输入物流单号',
        icon: 'none'
      })
      return;
    }
    wx.showLoading();
    app.util.ProReq('supplymobile.do_send_order_express', {token, order_id, express_id, shipping_no}).then(res=>{
      wx.showToast({ title: '确认配送成功' })
      this.setData({ shipping_no: '', showExpModal: false, index: 0, expInfo: '' })
      this.initFn();
    }).catch(err=>{
      app.util.message(err.msg, '', 'error');
    })
  },

  /**
   * 团长确认配送
   * @param {*} e 
   */
  tuanSend: function(e) {
    this.actionConfirm('确认此订单发货吗？').then(()=>{
      let token = wx.getStorageSync('token');
      let order_id = e.currentTarget.dataset.id || '';
      wx.showLoading();
      order_id && app.util.ProReq('supplymobile.supply_do_opsend_tuanz', {token, order_id}).then(res=>{
        wx.showToast({ title: '确认配送成功' })
        this.initFn();
      }).catch(err=>{
        app.util.message(err.msg, '', 'error');
      })
    });
  },

  /**
   * 同城配送确认配送
   * @param {*} e 
   */
  localtownSend: function(e) {
    this.actionConfirm('确认此订单发货吗？').then(()=>{
      let token = wx.getStorageSync('token');
      let order_id = e.currentTarget.dataset.id || '';
      wx.showLoading();
      order_id && app.util.ProReq('order.order_delivery', {token, order_id, is_supply: 1}).then(res=>{
        wx.showToast({ title: '确认配送成功' })
        this.initFn();
      }).catch(err=>{
        app.util.message(err.msg, '', 'error');
      })
    });
  },

  /**
   * 确认送达团长
   * @param {*} e 
   */
  tuanOver: function(e) {
    this.actionConfirm('确认送达团长吗？').then(()=>{
      let token = wx.getStorageSync('token');
      let order_id = e.currentTarget.dataset.id || '';
      wx.showLoading();
      order_id && app.util.ProReq('supplymobile.supply_do_tuanz_over', {token, order_id}).then(res=>{
        this.initFn();
      }).catch(err=>{
        app.util.message(err.msg, '', 'error');
      })
    });
  },

  /**
   * 团长/快递确认收货 最后一步
   * @param {*} e 
   */
  opreceive: function(e) {
    this.actionConfirm('确认订单收货吗？').then(()=>{
      let token = wx.getStorageSync('token');
      let order_id = e.currentTarget.dataset.id || '';
      wx.showLoading();
      order_id && app.util.ProReq('supplymobile.supply_do_opreceive', {token, order_id}).then(res=>{
        wx.showToast({ title: '确认收货成功' })
        this.initFn();
      }).catch(err=>{
        app.util.message(err.msg, '', 'error');
      })
    });
  },

  goLink: function (event) {
    let link = event.currentTarget.dataset.link;
    var pages_all = getCurrentPages();
    if (pages_all.length > 3) {
      wx.redirectTo({
        url: link
      })
    } else {
      wx.navigateTo({
        url: link
      })
    }
  },

  /**
   * 确认付款
   */
  confirmPay: function(e) {
    this.actionConfirm('确认此订单已付款吗？').then(()=>{
      let token = wx.getStorageSync('token');
      let order_id = e.currentTarget.dataset.id || '';
      wx.showLoading();
      order_id && app.util.ProReq('order.order_pay', {token, order_id, is_supply:1}).then(res=>{
        wx.showToast({ title: '付款成功' })
        this.initFn();
      }).catch(err=>{
        app.util.message(err.msg, '', 'error');
      })
    });
  },

  /**
   * 显示配送员列表
   */
  chooseRider: function(e) {
    let selectOrderId = e.currentTarget.dataset.id || '';
    this.setData({
      selectOrderId,
      showRaderList: true
    })
  },

  closeRiderList: function() {
    this.setData({
      selectOrderId: '',
      showRaderList: false
    })
  }
}