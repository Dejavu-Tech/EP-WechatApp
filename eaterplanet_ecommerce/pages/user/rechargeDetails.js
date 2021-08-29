var app = getApp();
var util = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    showData: 1,
    loadText: '加载中',
    remark: [
      '',
      '前台充值',
      '',
      '余额支付',
      '订单退款',
      '后台充值',
      '商品退款',
      '',
      '后台扣除',
      '分销提现至余额',
      '团长提现至余额',
      '拼团佣金提现至余额',
      '配送佣金提现到余额',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '礼品卡兑换',
      '拼团返利'
    ]
  },
  page: 1,
  no_data: 0,
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
    util.check_login() ? this.setData({ is_login: true }) : this.setData({ is_login: false });
    this.getData();
  },

  /**
   * 授权成功回调
   */
  authSuccess: function () {
    wx.reLaunch({
      url: '/eaterplanet_ecommerce/pages/user/rechargeDetails',
    })
  },

  getData: function(){
    var token = wx.getStorageSync('token');
    let that = this;
    wx.showLoading();
    this.setData({ isHideLoadMore: false })
    app.util.request({
      'url': 'entry/wxapp/index',
      'data': {
        controller: 'user.get_user_charge_flow',
        token: token,
        page: that.page
      },
      dataType: 'json',
      success: function (res) {
        wx.hideLoading();
        if(res.data.code==0){
          var list = that.data.list;
          list = list.concat(res.data.data);
          that.setData({ list, isHideLoadMore: true })
        } else if (res.data.code == 1) {
          if (that.data.list.length == 0 && that.page == 1) that.setData({ showData: 0});
          that.no_data = 1;
          that.setData({ isHideLoadMore: true })
          return false;
        } else if (res.data.code == 2) {
          that.setData({ is_login: false })
        }
      },
      fail: (error)=>{
        console.log(error)
        wx.showLoading();
      }
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.no_data == 1) return false;
    this.page += 1;
    this.getData();
    this.setData({
      isHideLoadMore: false
    })
  }
})
