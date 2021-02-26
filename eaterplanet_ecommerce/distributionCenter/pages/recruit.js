var app = getApp();
var util = require('../../utils/util.js');
var status = require('../../utils/index.js');

Page({
    attached: function() {
        var e = wx.getSystemInfoSync().model;
        (-1 < e.indexOf("iPhone X") || -1 < e.indexOf("unknown<iPhone")) && this.setData({
            isIpx: !0
        }), this.getTabbar();
      },
  mixins: [require('../../mixin/commonMixin.js'), require('../../mixin/globalMixin.js')],
  data: {
    comsissStatus: 0,
    canApply: true
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
    status.setNavBgColor();
    status.setGroupInfo().then((groupInfo) => {
      let commiss_diy_name = groupInfo && groupInfo.commiss_diy_name || '分销';
      wx.setNavigationBarTitle({
        title: `会员${commiss_diy_name}`,
      })
    });
    this.get_instruct();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    util.check_login_new().then((res) => {
      if (res) {
        that.setData({
          needAuth: false
        })
        that.getData();
      } else {
        that.setData({
          needAuth: true
        })
      }
    })
  },

  get_instruct: function() {
    let that = this;
    app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'distribution.get_instruct'
      },
      dataType: 'json',
      success: function (res) {
        if (res.data.code == 0) {
          let article = res.data.content || '';
          that.setData({article})
        }
      }
    })
  },

  getData: function() {
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
        wx.hideLoading();
        if (res.data.code == 0) {
          let member_info = res.data.data;
          let { comsiss_flag, comsiss_state } = member_info;
          let { 
            commiss_level, 
            commiss_sharemember_need, 
            commiss_biaodan_need,
            commiss_share_member_update,
            share_member_count,
            commiss_become_condition
          } = res.data;

          let commiss_diy_name = res.data.commiss_diy_name || '分销';
          wx.setNavigationBarTitle({
            title: `会员${commiss_diy_name}`,
          })

          let params = {};
          let formStatus = 0; //未填写 1 已填写未审核 2 已审核
          let need_num_update = 0; //还差多少人升级
          //开启分销
          if (commiss_level > 0) {
            //分销会员状态
            let comsissStatus = 0; // 1已成为分销会员 2需要分享未达人数 3需要分享已达人数 4需要表单 5等待审核 6不需要审核
            let canApply = false; //可申请
            if (comsiss_flag == 1 && comsiss_state == 1){
              comsissStatus = 1;
            } else {
              //需要分享
              if (commiss_sharemember_need==1){
                need_num_update = commiss_share_member_update * 1 - share_member_count * 1;
                comsissStatus = 2;
                if (need_num_update <= 0) {
                  comsissStatus = 3;
                  canApply = true;
                }
              } else {
                canApply = true;
              }
            }

            params = {
              formStatus,
              need_num_update,
              comsissStatus,
              canApply
            };
          }

          that.setData({
            ...params,
            commiss_diy_name: res.data.commiss_diy_name || '分销'
          });
        } else {
          //is_login
          that.setData({
            needAuth: true
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
   * 授权成功回调
   */
  authSuccess: function() {
    let that = this;
    this.setData({
      needAuth: false
    },()=>{
      that.get_instruct();
      that.getData();
    })
  },

  subCommis: function() {
    if (!this.authModal()) return;
    wx.showLoading();
    var token = wx.getStorageSync('token');
    let that = this;
    app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'distribution.sub_commission_info',
        token
      },
      dataType: 'json',
      success: function (res) {
        wx.hideLoading();
        if (res.data.code == 0) {
          if (res.data.msg == "申请成功，平台将尽快审核"){
            wx.navigateTo({
              url: '/eaterplanet_ecommerce/distributionCenter/pages/apply',
            })
          } else {
            wx.redirectTo({
              url: '/eaterplanet_ecommerce/distributionCenter/pages/me',
            })
          }
        } else {
          if (res.data.msg=="请先登录"){
            that.setData({ needAuth: true })
            return;
          }
          if (res.data.msg == "您未填写表单！") {
            wx.navigateTo({
              url: '/eaterplanet_ecommerce/distributionCenter/pages/apply',
            })
            return;
          }
          wx.showToast({
            title: res.data.msg ? res.data.msg:'申请失败，请重试！',
            icon: 'none'
          })
        }
      }
    })
  },

  goNext: function (e) {
    if (!this.authModal()) return;
    let status = 0;
    let member_info = this.data.member_info || {};
    let comsiss_flag = member_info.comsiss_flag || 0;
    let comsiss_state = member_info.comsiss_state || 0;
    if (comsiss_flag == 1) {
      comsiss_state == 0 ? status = 1 : status = 2;
    }
    let type = e.currentTarget.dataset.type;
    if (type == 'share') {
      wx.navigateTo({
        url: '/eaterplanet_ecommerce/distributionCenter/pages/share',
      })
    } else if (type == 'commiss') {
      if (this.data.comsissStatus == 1) {
        wx.navigateTo({
          url: '/eaterplanet_ecommerce/distributionCenter/pages/me',
        })
      } else if (status == 2) {
        wx.navigateTo({
          url: '/eaterplanet_ecommerce/distributionCenter/pages/me',
        })
      } else {
        wx.navigateTo({
          url: '/eaterplanet_ecommerce/distributionCenter/pages/recruit',
        })
      }
    } else if (type == 'form') {
      if (status == 2) {
        wx.navigateTo({
          url: '/eaterplanet_ecommerce/distributionCenter/pages/me',
        })
      } else {
        wx.navigateTo({
          url: '/eaterplanet_ecommerce/distributionCenter/pages/apply',
        })
      }
    }
  }

})
