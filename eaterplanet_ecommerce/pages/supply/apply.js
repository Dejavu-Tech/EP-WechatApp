// eaterplanet_ecommerce/pages/supply/apply.js
var util = require('../../utils/util.js');
var app = getApp();
var status = require('../../utils/index.js');

Page({
  mixins: [require('../../mixin/globalMixin.js')],
  data: {
    image_thumb: '',
    image_o_full: '',
    orign_image: '',
    shopname: '',
    name: '',
    mobile: '',
    product: '',
    state: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    status.setNavBgColor();
    this.getData();
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

  authModal: function () {
    if (this.data.needAuth) {
      this.setData({ showAuthModal: !this.data.showAuthModal });
      return false;
    }
    return true;
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
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    util.check_login_new().then((res) => {
      if (res) {
        this.setData({ needAuth: false });
      } else {
        this.setData({ needAuth: true });
      }
    })
  },

  getData: function(){
    wx.showLoading();
    var token = wx.getStorageSync('token');
    let that = this;
    app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'supply.apply_info',
        token: token
      },
      dataType: 'json',
      method: 'POST',
      success: function (res) {
        wx.hideLoading();
        let code = res.data.code;
        let supply_diy_name = res.data.supply_diy_name || '商户';
        wx.setNavigationBarTitle({
          title: `申请成为${supply_diy_name}`,
        })
        if (code == 0) {
          that.setData({
            state: res.data.data.state || 0,
            supply_diy_name
          })
        } else if(code == 1) {
          that.setData({ supply_diy_name })
          //needAuth
          console.log('needAuth');
        }
      }
    })
  },

  inputShopName: function (e) {
    this.setData({
      shopname: e.detail.value
    })
  },

  inputName: function (e) {
    this.setData({
      name: e.detail.value
    })
  },

  inputMobile: function (e) {
    this.setData({
      mobile: e.detail.value
    })
  },

  inputAdvantage: function (e) {
    this.setData({
      product: e.detail.value
    })
  },

  addImg: function () {
    var that = this;
    wx.chooseMedia({
      count: 1,
      success: function (res) {
        const tempFiles = res.tempFiles;
        var new_thumb_img = that.data.thumb_img;
        wx.showLoading({ title: '上传中' });
        wx.uploadFile({
          url: app.util.url('entry/wxapp/index', {
            'm': 'eaterplanet_ecommerce',
            'controller': 'goods.doPageUpload'
          }),
          filePath: tempFiles[0].tempFilePath,
          name: 'upfile',
          formData: {
            'name': tempFiles[0].tempFilePath
          },
          header: {
            'content-type': 'multipart/form-data'
          },
          success: function (res) {

            wx.hideLoading();
            var data = JSON.parse(res.data);
            var image_thumb = data.image_thumb;
            var image_o_full = data.image_o_full;
            var orign_image = data.image_o;

            that.setData({
              image_thumb: image_thumb,
              image_o_full: image_o_full,
              orign_image: orign_image
            })
          }
        })
      }
    });
  },

  submit: function () {
    if (!this.authModal()) return;
    var token = wx.getStorageSync('token');
    var shopname = this.data.shopname;
    var mobile = this.data.mobile;
    var name = this.data.name;
    var product = this.data.product;
    var that = this;

    if (shopname == '') {
      wx.showToast({
        title: '请填商户名称',
        icon: 'none',
      })
      return false;
    }

    if (name == '') {
      wx.showToast({
        title: '请填写商户联系人',
        icon: 'none',
      })
      return false;
    }

    if (mobile == '' || !(/^1(3|4|5|6|7|8|9)\d{9}$/.test(mobile))) {
      wx.showToast({
        title: '手机号码有误',
        icon: 'none',
      })
      return false;
    }

    var s_data = {
      shopname, name, mobile, product, controller: 'user.supply_apply', 'token': token
    };
    app.util.request({
      'url': 'entry/wxapp/user',
      'data': s_data,
      method: 'post',
      dataType: 'json',
      success: function (res) {
        if (res.data.code == 0) {
          wx.showToast({
            title: '提交成功，等待审核',
            icon: 'none',
            duration: 2000,
            success: function(){
              setTimeout(()=>{
                wx.switchTab({
                  url: '/eaterplanet_ecommerce/pages/user/me',
                })
              }, 2000)
            }
          })
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.msg,
            showCancel: false
          })
        }
      }
    })

  }
})
