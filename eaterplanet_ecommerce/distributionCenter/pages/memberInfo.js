var app = getApp();
var util = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  member_id: 0,
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
    var that = this;
    let member_id = options.memberId || 0;
    if (!member_id) {
      wx.showToast({
        title: '参数错误',
        icon: 'none'
      })
      setTimeout(()=>{
        wx.redirectTo({
          url: '/eaterplanet_ecommerce/distributionCenter/pages/member',
        })
      }, 1000)
      return;
    }
    this.member_id = member_id;
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    util.check_login_new().then((res) => {
      if (!res) {
        wx.showModal({
          title: '提示',
          content: '您还未登录',
          showCancel: false,
          success(res) {
            if (res.confirm) {
              wx.switchTab({
                url: '/eaterplanet_ecommerce/pages/user/me',
              })
            }
          }
        })
      } else {
        that.getData();
      }
    })
  },

  /**
   * 授权成功回调
   */
  authSuccess: function () {
    let that = this;
    this.setData({
      needAuth: false
    }, () => {
      that.getData();
    })
  },

  getData: function(){
    wx.showLoading();
    var token = wx.getStorageSync('token');
    let that = this;
    app.util.request({
      url: 'entry/wxapp/user',
      data: {
        controller: 'distribution.get_parent_agent_info_bymemberid',
        token: token,
        member_id: that.member_id
      },
      dataType: 'json',
      success: function (res) {
        wx.hideLoading();
        if (res.data.code == 0) {
          console.log(res.data.data)
          that.setData({
            info: res.data.data
          })
        }else{
          wx.showModal({
            title: '提示',
            content: res.data.msg,
            showCancel: false,
            success(res) {
              if (res.confirm) {
                console.log('用户点击确定')
                wx.reLaunch({
                  url: '/eaterplanet_ecommerce/pages/user/me',
                })
              }
            }
          })
        }
      }
    })
  }
})
