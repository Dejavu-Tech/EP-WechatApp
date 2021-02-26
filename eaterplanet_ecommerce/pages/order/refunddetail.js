// pages/order/refunddetail.js
var util = require('../../utils/util.js');
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ref_id: 0,
    order_goods: {}, // 20190712
    order_id: 0,
    order_info: {},
    order_refund: {},
    order_refund_historylist: [],
    refund_images: []
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
  onLoad: function(options) {
    var ref_id = options.id;
    var that = this;
    this.setData({
      ref_id: ref_id
    }, ()=>{
      //20190711
      that.getData();
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.getData();
  },

  sub_cancle: function() {
    var order_id = this.data.order_id;
    var ref_id = this.data.ref_id;
    var token = wx.getStorageSync('token');
    var that = this;
    app.util.request({
      'url': 'entry/wxapp/user',
      'data': {
        controller: 'user.cancel_refund',
        'token': token,
        ref_id: ref_id
      },
      dataType: 'json',
      success: function(res) {
        if (res.data.code == 3) {
          //un login
        } else if (res.data.code == 1) {
          wx.showToast({
            title: '撤销成功',
            icon: 'success',
            duration: 1000,
            success: function(res) {
              wx.redirectTo({
                url: "/eaterplanet_ecommerce/pages/order/order?id=" + order_id
              })
            }
          })
        }
      }
    })


  },

  getData: function() {
    var ref_id = this.data.ref_id;
    var token = wx.getStorageSync('token');
    var that = this;
    app.util.request({
      url: 'entry/wxapp/user',
      data: {
        controller: 'afterorder.refunddetail',
        token,
        ref_id
      },
      dataType: 'json',
      success: function (res) {
        wx.stopPullDownRefresh();
        if (res.data.code == 3) {
          //un login
        } else if (res.data.code == 1) {
          const { order_goods, order_id, order_info, order_refund, order_refund_historylist, refund_images } = res.data;
          that.setData({ order_goods, order_id, order_info, order_refund, order_refund_historylist, refund_images })
        }
      }
    })
  },

  /**
   * 撤销申请
   */
  cancelApply: function () {
    let that = this;
    wx.showModal({
      title: '撤销申请',
      content: '退款申诉一旦撤销就不可恢复，并且不可以再次申请，确定要撤销本次申诉吗？',
      confirmText: '我要撤销',
      confirmColor: '#ff5344',
      cancelText: '暂不撤销',
      cancelColor: '#666666',
      success(res) {
        if (res.confirm) {
          that.sub_cancle();
        }
      }
    })
  },

  /**
   * 修改申请
   */
  editApply: function (){
    const { order_goods, order_refund,  } = this.data;
    let ref_id = order_refund.ref_id || 0;
    let order_id = order_goods.order_id || 0;
    let order_goods_id = order_goods.order_goods_id || 0;

    ref_id && order_id && order_goods_id && wx.navigateTo({
      url: `/eaterplanet_ecommerce/pages/order/refund?ref_id=${ref_id}&id=${order_id}&order_goods_id=${order_goods_id}`,
    })
  }
})
