var app = getApp();
var util = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    tab_index: 1,
    virtcard_publish: ''
  },
  listPage: 1,
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
    this.getData();
  },

  getData: function () {
    app.util.ProReq('virtualcard.index', {}).then(res => {
      let { virtcard_publish } = res.data;
      this.setData({
        virtcard_publish
      })
    })
  },

  preFormSubmit: function(e) {
    wx.showLoading();
    this.formSubmit(e);
  },
  formSubmit: util.debounce(function(e) {
    console.log('form发生了submit事件，携带数据为：', e[0].detail.value)
    let token = wx.getStorageSync('token');
    let code_sn = e[0].detail.value.code;
    app.util.ProReq('virtualcard.subCodeSn', { token, code_sn }).then(res => {
      app.util.message(res.message || '兑换成功', '', 'error');

    }).catch(err => {
      console.log(err)
      err.code==1&&app.util.message(err.message || '请先登录', 'switchTo:/eaterplanet_ecommerce/pages/user/me', 'error');
      err.code==2&&app.util.message(err.message || '兑换失败，请重试', '', 'error');
    })
  }),

  tabchange: function (e) {
    var index = e.currentTarget.dataset.index;
    this.listPage = 1;
    this.setData({
      list: [],
      tab_index: index
    })
    if(index==2) {
      this.getList();
    }
  },

  getList() {
    let _this = this;
    let token = wx.getStorageSync('token');
    let data = {
      token,
      pageNum: _this.listPage
    };
    wx.showLoading();
    app.util.ProReq('virtualcard.loadUseRecord', data)
      .then(res => {
        _this.listLoading = false;
        wx.stopPullDownRefresh();
        let h = {};
        if (_this.listPage == 1) {
          h.list = res.data;
          res.data.length==0?(h.noData=true):'';
        } else {
          h.list = [..._this.data.list, ...res.data];
        }
        if (res.data.length > 0) {
          _this.listPage += 1;
        } else {
          _this.listPage = 0;
        }
        if(res.data.length < 10) {
          h.noMore = true;
        }
        this.setData(h);
        wx.hideLoading();
      })
      .catch(err => {
        wx.hideLoading();
        if(err.code==1) {
          app.util.message(err.message || '请先登录', 'switchTo:/eaterplanet_ecommerce/pages/user/me', 'error');
        } else {
          let h = {};
          _this.listPage==1?(h.noData=true):'';
          this.setData({
            listLoading: false,
            noMore: true,
            ...h,
          })
        }
        wx.stopPullDownRefresh();
      });
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if(!this.data.noData&&!this.data.noMore) {
      this.getList();
    }
  },

  handleRuleModal() {
    this.setData({
      showRulesPopup: !this.data.showRulesPopup
    })
  }
})
