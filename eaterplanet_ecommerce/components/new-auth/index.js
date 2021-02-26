var util = require('../../utils/util.js');
var location = require('../../utils/Location.js');
var app = getApp();

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
  attached: function () {
    this.setData({
      skin: getApp().globalData.skin,
    })
    this.getBg();
  },
  data: {
    btnLoading: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  methods: {
    getBg: function () {
      let that = this;
      app.util.request({
        'url': 'entry/wxapp/index',
        'data': {
          controller: 'index.get_newauth_bg'
        },
        dataType: 'json',
        success: function (res) {
          that.setData({ loaded: true })
          if (res.data.code == 0) {
            let { newauth_bg_image, newauth_confirm_image, newauth_cancel_image } = res.data.data;
            that.setData({ newauth_bg_image, newauth_confirm_image, newauth_cancel_image })
          }
        }
      })
    },
    close: function () {
      this.triggerEvent("cancel");
    },
    bindGetUserInfo: function (t) {
      var that = this;
      if (!this.data.btnLoading) {
        var n = t.detail;
        if (this.setData({ btnLoading: true }), "getUserInfo:ok" === n.errMsg) {
          util.login_prosime(that.data.needPosition).then(function () {
            console.log("授权成功")
            that.setData({ btnLoading: false });
            wx.showToast({
              title: '登录成功',
              icon: 'success',
              duration: 2000
            })
            that.triggerEvent("authSuccess");
            app.globalData.changedCommunity = true;
            //检查获取位置权限
            that.data.needPosition && location.getGps();
          }).catch(function () {
            that.triggerEvent("cancel");
            console.log('授权失败');
          })
        } else {
          wx.showToast({
            title: "授权失败，为了完整体验，获取更多优惠活动，需要您的授权。",
            icon: "none"
          });
          this.triggerEvent("cancel");
          this.setData({ btnLoading: false });
        }
      }
    },
    checkWxLogin: function() {
      return new Promise((resolve, reject) => {
        wx.getSetting({
          success(res) {
            if (!res.authSetting['scope.userInfo']) {
              return reject({
                authSetting: false
              });
            } else {
              wx.getStorage({
                key: 'token',
                success(token) {
                  util.check_login_new().then(isLogin=>{
                    if (isLogin) {
                      // 已登录未过期
                      return resolve(false);
                      console.log('已登录未过期')
                    } else {
                      console.log('过期')
                      if (token) {
                        return resolve(token);
                      } else {
                        return reject(res);
                      }
                    }
                  })
                },
                fail(res) {
                  return reject(res);
                }
              })
            }
          },
          fail(res) {
            return reject(res);
          }
        })
      })
    }
  }
});