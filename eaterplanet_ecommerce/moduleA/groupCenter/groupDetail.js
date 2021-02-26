var app = getApp();
var util = require('../../utils/util.js');
var status = require('../../utils/index.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    order: {},
    groupInfo: {
      group_name: '社区',
      owner_name: '团长',
      localtown_modifypickingname: '包装费'
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    status.setGroupInfo().then((groupInfo) => {
      that.setData({ groupInfo })
    });

    let is_share = options.is_share || 0;

    this.setData({
      orderId: options.groupOrderId,
      is_share:is_share
    });

    if (util.check_login()) {
      this.setData({ needAuth: false })
    } else {
      this.setData({ needAuth: true });
    }
    wx.showLoading({
      title: "加载中...",
      mask: true
    });
    this.getData();
  },

  authSuccess: function () {
    let that = this;
    this.setData({
      needAuth: false
    }, ()=>{
      that.getData();
    })
  },

  /**
   * 获取数据
   */
  getData: function(){
    var that = this;
    var token = wx.getStorageSync('token');

    if (this.data.orderId){
      app.util.request({
        url: 'entry/wxapp/index',
        data: {
          controller: 'order.order_head_info',
          token: token,
          is_share:this.data.is_share,
          id: this.data.orderId
        },
        dataType: 'json',
        success: function (res) {
          wx.hideLoading();
          if (res.data.code == 0) {
            let order = res.data.data;
            let commision = 0;

            //计算合计佣金和结算状态
            let is_statements_state = 0;
            let statements_end_date = '';
            let head_shipping_fare = 0; // 配送费
            order && order.order_goods_list && order.order_goods_list.forEach(function (item) {
              commision += parseFloat(item.commision);
              head_shipping_fare += parseFloat(item.head_shipping_fare);
              if(item.is_statements_state==1) {
                is_statements_state = 1;
                statements_end_date = item.statements_end_date;
              }
            })
            let { open_aftersale, open_aftersale_time } = res.data;
            that.setData({
              order: res.data.data,
              commision: commision.toFixed(2),
              is_statements_state,
              statements_end_date,
              head_shipping_fare,
              open_aftersale,
              open_aftersale_time
            });
            that.caclGoodsTot(res.data.data);
          }
        }
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '订单不存在',
        showCancel: false,
        success(res) {
          if (res.confirm) {
            wx.redirectTo({
              url: '/eaterplanet_ecommerce/moduleA/groupCenter/groupList',
            })
          }
        }
      })
    }
  },

  caclGoodsTot: function(order){
    if(order && order.order_goods_list) {
      let order_goods_list = order.order_goods_list;
      let goodsTot = 0;
      Object.keys(order_goods_list).forEach(k=>{
        if(order_goods_list[k].is_vipcard_buy==1 || order_goods_list[k].is_level_buy) {
          goodsTot += order_goods_list[k].total;
        } else {
          goodsTot += order_goods_list[k].real_total;
        }
      })
      this.setData({ goodsTot: goodsTot.toFixed(2) })
    }
  },

  /**
   * 状态判断
   */
  swithState: function (e) {
    switch (e) {
      case "-1":
        break;
      case "0":
        this.setData({
          orderStatusName: "待成团"
        });
        break;
      case "1":
        this.setData({
          orderStatusName: "待配送"
        });
        break;
      case "2":
        this.setData({
          orderStatusName: "待收货"
        });
        break;
      case "3":
        this.setData({
          orderStatusName: "待提货"
        });
        break;
      case "4":
        this.setData({
          orderStatusName: "已完成"
        });
        break;
      case "6":
        this.setData({
          orderStatusName: "待采购"
        });
    }
  },

  handleTipDialog: function(){
    this.setData({
      showTipDialog: !this.data.showTipDialog
    })
  }
})
