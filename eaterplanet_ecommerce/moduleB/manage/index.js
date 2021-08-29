var app = getApp();
var util = require('../../utils/util.js');

Page({
  data: {
    type: 0,
    showTipDialog: false,
    showTimeModal: false,
    isPickerRender: false,
    isPickerShow: false,
    startTime: new Date().toLocaleDateString(),
    endTime: new Date().toLocaleDateString(),
    pickerConfig: {
      endDate: true,
      column: "day",
      dateLimit: true,
      initStartTime: new Date().toLocaleDateString(),
      initEndTime: new Date().toLocaleDateString(),
      limitStartTime: "2015-05-06",
      limitEndTime: "2065-05-06"
    }
  },
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
  onLoad: function (options) {

  },

  onShow: function () {
    this.getData();
  },

  getData: function () {
    wx.showLoading();
    let token = wx.getStorageSync('token');
    app.util.ProReq('platformmobile.getIndexData', {
      token
    }).then(res => {
      wx.hideLoading();
      wx.stopPullDownRefresh();
      let {
        business_data,
        goods_data,
        sales_data,
        todayOrderData,
        user_data
      } = res;
      this.setData({
        business_data,
        goods_data,
        sales_data,
        todayOrderData,
        user_data,
        type: 0
      })
    }).catch(err => {
      wx.hideLoading();
      wx.stopPullDownRefresh();
      app.util.message(err.message || '请求出错', 'switchTo:/eaterplanet_ecommerce/pages/user/me', 'error');
    })
  },

  sortData: function () {
    // type  0 全部,1 今日 ,2 昨日 ,3 7日， 4 时间段
    // begin_time
    // end_time
    let { type, startTime, endTime } = this.data;
    wx.showLoading();
    let token = wx.getStorageSync('token');
    app.util.ProReq('platformmobile.searchAnalySalesByTime', {
      token,
      type,
      begin_time: startTime,
      end_time: endTime
    }).then(res => {
      wx.hideLoading();
    }).catch(err => {
      wx.hideLoading();
      this.setData({
        sales_data: err.sales_data
      })
    })
  },

  changeNav: function (e) {
    let type = e.currentTarget.dataset.type || 0;
    this.setData({
      type,
      startTime: "",
      endTime: ""
    }, ()=>{
      this.sortData();
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getData();
  },

  confirmMessage: function () {
    this.setData({
      showTipDialog: !this.data.showTipDialog
    })
  },

  handleModal: function () {
    this.setData({
      showTimeModal: !this.data.showTimeModal
    })
  },

  pickerShow: function () {
    this.setData({
      isPickerShow: true,
      isPickerRender: true,
      chartHide: true
    });
  },

  pickerHide: function () {
    this.setData({
      isPickerShow: false,
      chartHide: false
    });
  },

  bindPickerChange: function (e) {
    this.getData(this.data.sensorList[e.detail.value].id);
    this.setData({
      index: e.detail.value,
      sensorId: this.data.sensorList[e.detail.value].id
    });
  },

  setPickerTime: function (val) {
    let data = val.detail;
    this.setData({
      type: 4,
      startTime: data.startTime,
      endTime: data.endTime
    }, ()=>{
      this.sortData();
    });
  }
})
