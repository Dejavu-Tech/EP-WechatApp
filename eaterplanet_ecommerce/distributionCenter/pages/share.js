var util = require('../../utils/util.js');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    poster: '',
    imageSize: {
      imageWidth: "100%",
      imageHeight: 600
    },
    is_share_html: true,
    member_info: {}
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
    wx.setNavigationBarTitle({
      title: '我的二维码'
    })
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
        that.getMemberInfo();
        that.getData();
      }
    })
  },

    onLoad: function(e) {
        var t = this;
        util.check_login_new().then(function(e) {
            e ? (t.getMemberInfo(), t.getData()) : wx.showModal({
                title: "提示",
                content: "您还未登录",
                showCancel: !1,
                success: function(e) {
                    e.confirm && wx.switchTab({
                        url: "/eaterplanet_ecommerce/pages/user/me"
                    });
                }
            });
        });
    },
  /**
   * 授权成功回调
   */
  authSuccess: function () {
    let that = this;
    this.setData({
      needAuth: false
    }, () => {
      that.getMemberInfo();
      that.getData();
    })
  },

  /**
   * 图片信息
   */
  imageLoad: function (e) {
    var imageSize = util.imageUtil(e)
    this.setData({
      imageSize
    })
  },

  getMemberInfo: function () {
    var token = wx.getStorageSync('token');
    let that = this;
    app.util.request({
      'url': 'entry/wxapp/user',
      'data': {
        controller: 'user.get_user_info',
        token: token
      },
      dataType: 'json',
      success: function (res) {
        if (res.data.code == 0) {
          let member_info = res.data.data;
          //开启分销
          if (res.data.commiss_level > 0) {
            //还差多少人升级
            let commiss_share_member_update = res.data.commiss_share_member_update * 1;
            let share_member_count = res.data.share_member_count * 1;
            let need_num_update = res.data.commiss_share_member_update * 1 - res.data.share_member_count * 1;
            let commiss_diy_name = res.data.commiss_diy_name || '分销';
            // wx.setNavigationBarTitle({
            //   title: '会员' + commiss_diy_name,
            // })

            that.setData({
              member_info,
              commiss_level: res.data.commiss_level,
              commiss_sharemember_need: res.data.commiss_sharemember_need,
              commiss_share_member_update,
              share_member_count,
              need_num_update,
              commiss_diy_name
            });
          } else {
            wx.showModal({
              title: '提示',
              content: '未开启分销',
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
        } else {
          //is_login
          that.setData({
            is_login: false
          })
          wx.setStorage({
            key: "member_id",
            data: null
          })
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  getData: function(){
    wx.showLoading();
    var token = wx.getStorageSync('token');
    let that = this;
    app.util.request({
      url: 'entry/wxapp/user',
      data: {
        controller: 'distribution.get_haibao',
        token: token
      },
      dataType: 'json',
      success: function (res) {
        wx.hideLoading();
        if (res.data.code == 0) {
          that.setData({ poster: res.data.commiss_qrcode })
        } else {
          that.setData({
            needAuth: true
          })
        }
      }
    })
  },

  toggleShare: function(){
    let is_share_html = this.data.is_share_html;
    this.setData({ is_share_html: !is_share_html })
  },

  prevImg: function(e){
    let image_path = e.currentTarget.dataset.src;
    wx.previewImage({
      current: image_path, // 当前显示图片的http链接
      urls: [image_path] // 需要预览的图片http链接列表
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    this.setData({ is_share_html: true })
    var community = wx.getStorageSync('community');
    var community_id = community.communityId;
    var member_id = wx.getStorageSync('member_id');
    console.log(community_id, member_id);
    return {
      title: '',
      path: "eaterplanet_ecommerce/pages/index/index?community_id=" + community_id + '&share_id=' + member_id,
      imageUrl: '',
      success: function () { },
      fail: function () { }
    };
  }
})
