var app = getApp();
var util = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    salesroomIdx: 0,
    salesroom_list: [], 
    today_saleshexiao_count: 0,
    saleshexiao_record_list: []
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getData()
  },

  getData: function () {
    let token = wx.getStorageSync('token');
    app.util.ProReq('hexiao.hexiao_manage', { token }).then(res => {
      let { salesroom_list, today_saleshexiao_count, saleshexiao_record_list, salesroom_member } = res.data;
      let last_salesroom_id = salesroom_member.last_salesroom_id || '';
      let salesroomIdx = 0;
      if(salesroom_list) {
        salesroomIdx = salesroom_list.findIndex(item=>item.id == last_salesroom_id);
      }
      this.setData({
        salesroom_list, today_saleshexiao_count, saleshexiao_record_list,salesroomIdx: salesroomIdx>=0?salesroomIdx:0
      })
    }).catch(err => {
      console.log(err)
      app.util.message(err.msg || '请求出错', 'switchTo:/eaterplanet_ecommerce/pages/user/me', 'error');
    })
  },

  handleHexiaoModal: function() {
    this.setData({
      showHexiaoModal: !this.data.showHexiaoModal
    })
  },

  preFormSubmit: function(e) {
    wx.showLoading();
    this.formSubmit(e);
  },
  formSubmit: util.debounce(function(e) {
    console.log('form发生了submit事件，携带数据为：', e[0].detail.value)
    let code = e[0].detail.value.code;
    this.goDetails(code);
  }),

  goDetails: function(code) {
    let salesroom_id = this.data.salesroom_list[this.data.salesroomIdx].id;
    if(code) {
      wx.navigateTo({
        url: '/eaterplanet_ecommerce/moduleB/writeoff/details?code='+code+'&salesroom_id='+salesroom_id,
        success: function(res) {
          wx.hideLoading();
        }
      })
    } else {
      wx.showToast({
        title: '请输入手机号/券码',
        icon: 'none'
      })
    }
  },

  goScan: function() {
    let that = this;
    wx.scanCode({
      success (res) {
        console.log(res)
        let codeStr = res.result || '';
        let code = codeStr.split('_')[1];
        that.goDetails(code);
      }
    })
  },

  changeMendian: function(e) {
    let token = wx.getStorageSync('token');
    let salesroomIdx = e.currentTarget.dataset.idx;
    let salesroom_id = this.data.salesroom_list[salesroomIdx].id;
    app.util.ProReq('hexiao.hexiao_change_salesroom', { token, salesroom_id }).then(res => {
      this.setData({ salesroomIdx, showHexiaoModal: !this.data.showHexiaoModal })
    }).catch(err => {
      console.log(err)
      app.util.message(err.msg || '切换失败，请重试', '', 'error');
    })
  }

})
