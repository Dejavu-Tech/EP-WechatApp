var util = require('../../utils/util.js');
var location = require('../../utils/Location.js');

var app = getApp();
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
const defaultAvatarUrl2 = 'https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132'

Component({
  properties: {
    showUserProfile: {
      type: Boolean,
      value: false
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
    },
    avatar: {
      type: String,
      value: '',
    }
  },

  attached: function () {
    this.setData({
      skin: getApp().globalData.skin,
    })
    this.getBg();
    let member_info = wx.getStorageSync('member_info');
    if (member_info !== null) {
      this.setData({
        nickname: member_info.username,
        avatarUrl: member_info.avatar
      })
    }
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
    nicknameInput(e) {
      const { value } = e.detail;
      this.setData({
        nickname: value
      })
    },
    getNickname(e) {
      this.setData({
        nickname: e.detail.value
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
    noCover: function () {
      this.triggerEvent("cancel");
    },
    getMemberInfo: function () {
      var token = wx.getStorageSync('token');
      let that = this;
      app.util.request({
        url: 'entry/wxapp/user',
        data: {
          controller: 'user.get_user_info',
          token: token
        },

        dataType: 'json',
        success: function (res) {
          if (!res.data.needAuth) {
            that.setData({
              nickname: res.data.data.username,
              avatarUrl: res.data.data.avatar
            })
          }
        }
      })
    },
    uploaduserInfo: function () {
      var that = this;
      var token = wx.getStorageSync('token');
      wx.uploadFile({
        url: app.util.url('entry/wxapp/index', {
          'm': 'eaterplanet_ecommerce',
          'controller': 'goods.doPageUpload'
        }),
        filePath: that.data.avatarUrl,
        name: 'upfile',
        formData: {
          'name': that.data.avatarUrl
        },
        header: {
          'content-type': 'multipart/form-data'
        },
        success: function (res) {
          let data = JSON.parse(res.data);
          let imgUrl = data.image_o;
          that.setData({
            avatarUrl: imgUrl
          });
        }
      })
      app.util.request({
        url: 'entry/wxapp/user',
        data: {
          controller: 'user.get_user_info',
          token: token
        },
        dataType: 'json',
        success: function (res) {
          let member_info = res.data.data;
          wx.getUserProfile({
            desc: "获取你的昵称、头像、地区及性别",

            success: function (msg) {
              wx.getStorageSync(member_info)
              var userInfo = msg.userInfo
              userInfo['nickName'] = that.data.nickname
              userInfo['avatarUrl'] = that.data.avatarUrl
              member_info['username'] = that.data.nickname
              member_info['avatar'] = that.data.avatarUrl
              that.setData({
                avatarUrl: that.data.avatarUrl,
                nickname: that.data.nickname,
              });
              let invalidAvatars = [defaultAvatarUrl, defaultAvatarUrl2, "", "undefined"];
              let invalidUsernames = ["微信用户", "", "undefined"];
              if (invalidAvatars.includes(member_info.avatar)) {
                wx.showToast({
                  title: "请选择头像",
                  icon: "none"
                });
                return false;
              }
              if (invalidUsernames.includes(member_info.username)) {
                wx.showToast({
                  title: "请修改昵称",
                  icon: "none"
                });
                return false;
              }
              wx.setStorage({
                key: "userInfo",
                data: userInfo
              })
              wx.setStorage({
                key: "member_info",
                data: member_info
              })
              app.util.request({
                url: 'entry/wxapp/user',
                data: {
                  controller: 'user.applogin_do',
                  token,
                  member_info,
                  nickName: member_info.username,
                  avatarUrl: member_info.avatar,
                },
                method: 'post',
                dataType: 'json',
                success: function (res) {
                  let isblack = res.data.isblack || 0;
                  if (isblack == 1) {
                    app.globalData.isblack = 1;
                    wx.removeStorageSync('token');
                    wx.switchTab({
                      url: '/eaterplanet_ecommerce/pages/index/index',
                    })
                  } else {
                    wx.setStorage({
                      key: "member_id",
                      data: res.data.member_id
                    })
                  }
                  that.setData({
                    btnLoading: false,
                    loginSuccess: true
                  });
                  wx.showToast({
                    title: '修改成功',
                    duration: 2000
                  })
                  that.triggerEvent("authSuccess", res);
                  console.log("下一步刷新页面")
                },
              })
            }
          })
        }
      })
    }
  }
});