var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    showDialog: false
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
   * 点击提现
   */
  cashMoney: function(){
    var pages_all = getCurrentPages();
    if (pages_all.length > 3) {
      wx.redirectTo({
        url: '/eaterplanet_ecommerce/moduleA/groupCenter/editInfo'
      })
    } else {
      wx.navigateTo({
        url: '/eaterplanet_ecommerce/moduleA/groupCenter/editInfo'
      })
    }

  },

  /**
   * 确认对话框
   */
  confirm: function(){
    this.setData({
      showDialog: false
    })
    console.log(111)
  },

  /**
   * 取消对话框
   */
  cancel: function(){
    this.setData({
      showDialog: false
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var token = wx.getStorageSync('token');
    var that = this;
    app.util.request({
      'url': 'entry/wxapp/user',
      'data': {
        controller: 'community.get_community_info',
        'token': token
      },
      dataType: 'json',
      success: function (res) {
        if (res.data.code == 0) {
          let commission_info = res.data.commission_info;
          if(commission_info&&commission_info.mix_total_money) {
            commission_info.mix_total_money = (commission_info.mix_total_money*1).toFixed(2);
          }
          that.setData({
            member_info: res.data.member_info,
            community_info: res.data.community_info,
            commission_info,
            total_order_count: res.data.total_order_count,
            total_member_count: res.data.total_member_count,
            today_order_count: res.data.today_order_count,
            today_effect_order_count: res.data.today_effect_order_count,
            today_pay_order_count: res.data.today_pay_order_count,
            today_pre_total_money: res.data.today_pre_total_money,
            today_all_total_money: res.data.today_all_total_money,
            month_pre_total_money: res.data.month_pre_total_money,
            pre_total_money: res.data.pre_total_money,
            wait_sub_total_money: res.data.wait_sub_total_money,
            dongmoney: res.data.dongmoney,
            tixian_sucess_money: res.data.tixian_sucess_money
          });
        } else {
          //is_login
          wx.reLaunch({
            url: '/eaterplanet_ecommerce/pages/user/me',
          })
        }
      }
    })

  }
})
