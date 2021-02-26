var app = getApp();
var canHexiao = true;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    salesroom_id: '',
    hxNum: 1
  },
  salesroom_id: '',
  code: '',
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
    let code = options.code || '';
    this.code = code;
    this.salesroom_id = options.salesroom_id || '';
    this.getHexiaoInfo(code);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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

  getHexiaoInfo: function(hexiao_volume_code) {
    let token = wx.getStorageSync('token');
    app.util.ProReq('hexiao.hexiao_order_info', { token, hexiao_volume_code }).then(res => {
      let { orders, order_goods_count, order_goods_saleshexiao_list } = res.data;
      this.setData({
        orders, order_goods_count, order_goods_saleshexiao_list
      })
    }).catch(err => {
      console.log(err)
      wx.showModal({
        title: '提示',
        content: err.msg || '请求出错',
        showCancel: false,
        confirmColor: '#ff5041',
        complete: function() {
          app.util.navigateBack({});
        }
      });
    })
  },

  goHexiao: function(event) {
    let hexiao_id = event.currentTarget.dataset.id || '';
    let type = event.currentTarget.dataset.type || 0;
    let token = wx.getStorageSync('token');
    let salesroom_id = this.salesroom_id;
    let data = { token, hexiao_id, salesroom_id };
    if(type==0) {
      // 按订单核销
      if(!canHexiao) return;
      canHexiao = false;
      this.orderHexiao(data);
    } else {
      // 按次数核销 弹窗显示具体信息
      this.getNumHexiaoInfo(data);
    }
  },

  /**
   * 获取按次数核销信息
   * @param {*} data 
   */
  getNumHexiaoInfo: function(data){
    wx.showLoading();
    app.util.ProReq('hexiao.get_hxgoods_bytimes', data).then(res => {
      wx.hideLoading();
      let { hexiao_record_list, order_goods_info, saleshexiao_info } = res.data;
      this.setData({ hexiao_record_list, order_goods_info, saleshexiao_info, showHexiaoModal: true })
    }).catch(err => {
      console.log(err)
      app.util.message(err.msg || '请求出错', '', 'error');
    })
  },

  /**
   * 按订单核销
   * @param {*} data 
   */
  orderHexiao: function(data) {
    wx.showLoading();
    app.util.ProReq('hexiao.hx_order_goods', data).then(res => {
      canHexiao = true;
      app.util.message('核销成功', '', 'error');
      this.getHexiaoInfo(this.code);
    }).catch(err => {
      console.log(err)
      canHexiao = true;
      app.util.message(err.msg || '请求出错', '', 'error');
    })
  },

  /**
   * 按次数核销
   * @param {*} data 
   */
  numHexiao: function(event) {
    let hexiao_id = event.currentTarget.dataset.id || '';
    let token = wx.getStorageSync('token');
    let salesroom_id = this.salesroom_id;
    let hx_times = this.data.hxNum;
    let data = { token, hexiao_id, salesroom_id, hx_times };
    wx.showLoading();
    app.util.ProReq('hexiao.hx_order_goods_bytimes', data).then(res => {
      wx.hideLoading();
      this.handleHexiaoModal();
      app.util.message('核销成功', '', 'error');
      this.getHexiaoInfo(this.code);
    }).catch(err => {
      console.log(err)
      wx.hideLoading();
      app.util.message(err.msg || '请求出错', '', 'error');
    })
  },

  /**
   * 全部订单核销
   * @param {*} event 
   */
  allHexiao: function(event) {
    this.actionConfirm('确认全部核销').then(()=>{
      let order_id = this.data.orders.order_id;
      let token = wx.getStorageSync('token');
      let salesroom_id = this.salesroom_id;
      app.util.ProReq('hexiao.all_hx_order', { token, order_id, salesroom_id }).then(res => {
        this.getHexiaoInfo(this.code);
      }).catch(err => {
        console.log(err)
        app.util.message(err.msg || '请求出错', '', 'error');
      })
    });
  },

  /**
   * 次数核销弹窗
   */
  handleHexiaoModal: function() {
    this.setData({
      showHexiaoModal: !this.data.showHexiaoModal,
      hxNum: 1
    })
  },

  /**
   * 输入框改变监控
   * @param {*} t 
   */
  changeNumber: function (t) {
    var e = t.detail;
    console.log(e)
    e&&this.setData({ hxNum: e.value })
  },

  /**
   * 输入极值限制
   * @param {*} t 
   */
  outOfMax: function (t) {
    // var e = t.detail;
    wx.showToast({
      title: "不能再多了~",
      icon: "none"
    })
  }
})