var app = getApp();
var util = require('../../utils/util.js');
var status = require('../../utils/index.js');

//state 0:拼团中 1:成功 2:失败
//order_status_id 1：已付款 2:拼团中，已付款 3：待付款 5：交易已取消 7：退款

Page({
  mixins: [require('../../mixin/globalMixin.js')],
  data: {
    tabs: [
      { id: 0, name: '全部' },
      { id: 1, name: '拼团中' },
      { id: 2, name: '拼团成功' },
      { id: 3, name: '拼团失败' }
    ],
    order_status: 0,
    showEmpty: false,
    list: [],
    loadMore: true,
    loadText: "加载中...",
    loadOver: false
  },
  pageNum: 1,
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
    status.setNavBgColor();
    this.getData();
  },

  /**
   * 切换导航
   */
  changeTabs: function (e) {
    let that = this;
    let order_status = e.currentTarget.dataset.type || 0;
    this.pageNum = 1;
    this.setData({ order_status, list: [], showEmpty: false, loadMore: true, loadOver: false }, ()=>{
      that.getData();
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    util.check_login_new().then((res) => {
      if (res) {
        this.setData({ needAuth: false });
      } else {
        this.setData({ needAuth: true });
      }
    })
  },

  /**
   * 授权成功回调
   */
  authSuccess: function () {
    let that = this;
    this.pageNum = 1;
    this.setData({
      needAuth: false,
      showEmpty: false,
      list: [],
      loadMore: true,
      loadText: "加载中...",
      loadOver: false
    }, () => {
      that.getData();
    })
  },

  authModal: function () {
    if (this.data.needAuth) {
      this.setData({
        showAuthModal: !this.data.showAuthModal
      });
      return false;
    }
    return true;
  },

  getData: function () {
    wx.showLoading();
    let that = this;
    var token = wx.getStorageSync('token');
    let order_id = this.orderId;
    let pageNum = this.pageNum;
    app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'user.group_orders',
        token,
        page: pageNum,
        type: this.data.order_status
      },
      dataType: 'json',
      success: function (res) {
        wx.hideLoading();
        wx.stopPullDownRefresh();
        if (res.data.code == 0) {
          let list = res.data.data;
          let h = {};
          if (pageNum == 1 && list.length == 0) h.showEmpty = true;

          let oldList = that.data.list;
          list = list.concat(oldList);
          h.list = list;
          h.loadOver = true;
          h.loadText = that.data.loadMore ? "加载中..." : "没有更多商品了~";
          that.setData(h, function () {
            that.pageNum += 1;
          })
        } else {
          let s = { loadMore: false }
          if (pageNum == 1) s.showEmpty = true;
          that.setData( s )
        }
      }
    })
  },

  goLink: function (e) {
    var pages_all = getCurrentPages();
    var url = e.currentTarget.dataset.link;
    let type = e.currentTarget.dataset.type || '';
    if (type == 'ignore'){
      let id = e.currentTarget.dataset.id;
      if (type == 'ignore') url = `/eaterplanet_ecommerce/moduleA/pin/share?id=${id}`;
    }
    if (pages_all.length > 3) {
      wx.redirectTo({ url })
    } else {
      wx.navigateTo({ url })
    }
  },

  /**
   * 取消订单
   */
  cancelOrder: function (event) {
    let id = event.currentTarget.dataset.type;
    var token = wx.getStorageSync('token');
    var that = this;
    wx.showModal({
      title: '取消支付',
      content: '好不容易挑出来，确定要取消吗？',
      confirmColor: '#F75451',
      success(res) {
        if (res.confirm) {
          app.util.request({
            url: 'entry/wxapp/index',
            data: {
              controller: 'order.cancel_order',
              token: token,
              order_id: id
            },
            dataType: 'json',
            success: function (res) {
              wx.showToast({
                title: '取消成功',
                icon: 'success',
                duration: 1000
              })
              that.order();
            }
          })
        }
      }
    })
  },

  order: function (status) {
    var that = this;
    var token = wx.getStorageSync('token');
    this.pageNum = 1;
    this.setData({
      showEmpty: false,
      list: [],
      loadMore: true,
      loadText: "加载中..."
    }, () => {
      that.getData();
    })
  },

  /**
   * 付款
   */
  orderPay: function (event) {
    var that = this;
    var token = wx.getStorageSync('token');
    let id = event.currentTarget.dataset.type;
    wx.showLoading();
    app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'car.wxpay',
        token: token,
        order_id: id
      },
      dataType: 'json',
      method: 'POST',
      success: function (res) {
        wx.hideLoading();
        if (res.data.code == 0) {
          wx.requestPayment({
            appId: res.data.appId,
            timeStamp: res.data.timeStamp,
            nonceStr: res.data.nonceStr,
            package: res.data.package,
            signType: res.data.signType,
            paySign: res.data.paySign,
            success: function (wxres) {
              wx.redirectTo({
                url: '/eaterplanet_ecommerce/moduleA/pin/share?id=' + id
              })
            },
            fail: function (res) {
              console.log(res);
            }
          })
        } else if (res.data.code == 2) {
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
        }
      }
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    let that = this;
    this.pageNum = 1;
    this.setData({
      showEmpty: false,
      list: [],
      loadMore: true,
      loadText: "加载中..."
    }, () => {
      that.getData();
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log('这是我的底线');
    this.data.loadMore && (this.setData({ loadOver: false }), this.getData());
  }
})
