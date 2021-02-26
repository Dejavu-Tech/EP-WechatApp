var util = require('../../utils/util.js');
var wcache = require('../../utils/wcache.js');
var app = getApp();
var flag = true;

Component({
  properties: {
    needAuth: {
      type: Boolean,
      value: false
    },
    needPosition: {
      type: Boolean,
      value: true
    },
    navBackUrl: {
      type: String,
      value: '',
      observer: function (t) {
        if (t) app.globalData.navBackUrl = t;
      }
    }
  },
  data: {
    btnLoading: false,
    isIpx: false,
    auth_bg: '',
    loaded: false
  },
  attached: function() {
    this.getBg();
    app.globalData.isIpx && this.setData({
      isIpx: true
    });
  },
  methods: {
    getBg: function(){
      let that = this;
      let auth_bg = wcache.get('auth_bg', false);
      if (!auth_bg){
        app.util.request({
          'url': 'entry/wxapp/index',
          'data': {
            controller: 'index.get_auth_bg'
          },
          dataType: 'json',
          success: function (res) {
            that.setData({ loaded: true })
            if (res.data.code == 0) {
              wcache.put('auth_bg', res.data.data, 600);
              res.data.data && that.setData({ auth_bg: res.data.data })
            }
          }
        })
      } else {
        that.setData({ auth_bg, loaded: true })
      }
    },
    bindGetUserInfo: function (t) {
      var that = this;
      if (!this.data.btnLoading) {
        var n = t.detail;
        if(this.setData({btnLoading: true}), "getUserInfo:ok" === n.errMsg){
          util.login_prosime(that.data.needPosition).then(function(){
            console.log("授权成功")
            that.setData({ btnLoading: false });
            wx.showToast({
              title: '登录成功',
              icon: 'success',
              duration: 2000
            })
            that.triggerEvent("authSuccess");
          }).catch(function(){
            console.log('授权失败')
          })
        } else {
          wx.showToast({
            title: "授权失败，为了完整体验，获取更多优惠活动，需要您的授权。",
            icon: "none"
          });
          this.setData({btnLoading: false});
        }
      }
    },
    bindGetUserInfoTwo: function (t) {
      var that = this;
      wx.showLoading({ title: '授权中' });
      if (flag) {
        flag = false;
        var n = t.detail;
        if ("getUserInfo:ok" === n.errMsg) {
          util.login_prosime().then(function () {
            console.log("授权成功")
            wx.hideLoading();
            flag = true;
            wx.showToast({
              title: '登录成功',
              icon: 'success',
              duration: 2000
            })
            that.triggerEvent("authSuccess");
          }).catch(function () {
            flag = true;
            wx.hideLoading();
            console.log('授权失败')
          })
        } else {
          wx.hideLoading();
          wx.showToast({
            title: "授权失败，为了完整体验，获取更多优惠活动，需要您的授权。",
            icon: "none"
          });
          flag = true;
        }
      }
    }
    // openSetting: function () {
    //   location.openSetting().then(function (t) {
    //     app.globalData.location = {
    //       lat: t.latitude,
    //       lng: t.longitude
    //     };
    //     app.globalData.community.communityId || wx.redirectTo({
    //       url: "/eaterplanet_ecommerce/pages/position/communities"
    //     });
    //     app.globalData.canGetGPS = true;
    //   });
    // }
  }
});
