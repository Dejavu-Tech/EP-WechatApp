var app = getApp();
var util = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    community_id: '',
    name: '',
    mobile: '',
    is_login: true
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
    util.check_login() ? this.setData({ is_login: true }) : this.setData({ is_login: false });
    var scene = decodeURIComponent(options.scene);
    if (scene != 'undefined') {
      let community_id = scene;
      this.setData({ community_id })
    } else {
      wx.showModal({
        title: '提示',
        content: '无效二维码，请重新获取！',
        showCancel: false,
        success(res) {
          if (res.confirm) {
            wx.redirectTo({
              url: '/eaterplanet_ecommerce/pages/index/index',
            })
          }
        }
      })
    }
  },

  /**
   * 授权成功回调
   */
  authSuccess: function () {
    this.setData({ is_login: true })
  },

  bindInfo: function(){
    var that = this;
    var token = wx.getStorageSync('token');

    let name = this.data.name;
    let mobile = this.data.mobile;
    let community_id = this.data.community_id;

    if (name == '') {
      wx.showToast({
        title: '请输入姓名！',
        icon: 'none'
      })
      return false;
    }
    if (mobile == '' || !(/^1(3|4|5|6|7|8|9)\d{9}$/.test(mobile))) {
      wx.showToast({
        title: '手机号码有误',
        icon: 'none'
      })
      return false;
    }
    wx.showLoading();
    app.util.request({
      'url': 'entry/wxapp/index',
      'data': {
        controller: 'community.bind_community_member_do',
        token: token,
        community_id: community_id,
        name,
        mobile
      },
      dataType: 'json',
      success: function (res) {
        if(res.data.code==0) {
          wx.showToast({
            title: '绑定成功',
            icon: 'none'
          },()=>{
            wx.redirectTo({
              url: '/eaterplanet_ecommerce/pages/user/me',
            })
          })
        }
      }
    })
  },

  getName: function(e){
    console.log(e)
    let name = e.detail.value;
    this.setData({ name })
  },

  getMobile: function (e) {
    console.log(e)
    let mobile = e.detail.value;
    this.setData({ mobile })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  }
})
