var util = require('../../utils/util.js');
var location = require('../../utils/Location.js');

var app = getApp();
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
const defaultAvatarUrl2 = 'https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132'

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
    },
    nickName: {
      type: String,
      value: '',
    }
  },
  attached: function () {
    this.setData({
      skin: getApp().globalData.skin,
    })
    this.getBg();
  },
  data: {
    nickname: '微信用户',
    avatarUrl: defaultAvatarUrl2,
    image_o: '',
    btnLoading: false,
    loginSuccess: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  methods: {
    onChooseAvatar(e) {
      this.setData({
        avatarUrl: e.detail.avatarUrl
      })
    },
    getBg: function () {
      let that = this;
      app.util.request({
        'url': 'entry/wxapp/index',
        'data': {
          controller: 'index.get_newauth_bg'
        },
        dataType: 'json',
        success: function (res) {
          that.setData({
            loaded: true
          })
          if (res.data.code == 0) {
            let {
              newauth_bg_image,
              newauth_confirm_image,
              newauth_cancel_image
            } = res.data.data;
            that.setData({
              newauth_bg_image,
              newauth_confirm_image,
              newauth_cancel_image
            })
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
        if (this.setData({
          btnLoading: true
        }), "getUserInfo:ok" === n.errMsg) {
          util.login_prosime(that.data.needPosition).then(function () {
            console.log("授权成功")
            that.setData({
              btnLoading: false
            });
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
          this.setData({
            btnLoading: false
          });
        }
      }
    },
    getProfile: function () {
      var that = this;

      if (!that.data.btnLoading) {
        wx.getUserProfile({
          desc: "获取你的昵称、头像、地区及性别",
          success: function (msg) {
            var userInfo = msg.userInfo
            wx.setStorage({
              key: "userInfo",
              data: userInfo
            })
            that.setData({
              btnLoading: true,
            });
            util.login_promise(that.data.needPosition, userInfo).then(res => {
              userInfo.nickName = that.data.nickname
              userInfo.avatarUrl = that.data.avatarUrl
              var member_info = wx.getStorageSync('member_info');
              if (member_info!==null) {
                member_info.username = that.data.nickname
                member_info.avatar = that.data.avatarUrl
              }
              that.setData({ btnLoading: false });
              wx.showToast({
                title: '登录成功',
                icon: 'success',
                duration: 2000
              })
              that.triggerEvent("authSuccess", res);
              console.log("授权成功")
              app.globalData.changedCommunity = true;
              //检查获取位置权限
              that.data.needPosition && location.getGps();
            }).catch(function () {
              that.triggerEvent("cancel");
            })
          },
          fail: () => {
            wx.showToast({
              title: "授权失败，为了完整体验，获取更多优惠活动，需要您的授权。",
              icon: "none"
            });
            that.triggerEvent("cancel");
            that.setData({
              btnLoading: false
            });
          }
        });
      }
    },

    checkWxLogin: function () {
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
                  util.check_login_new().then(isLogin => {
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