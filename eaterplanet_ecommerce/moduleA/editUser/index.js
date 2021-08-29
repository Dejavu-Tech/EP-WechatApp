import WxValidate from '../../utils/WxValidate.js';
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    realname: "",
    telephone: ""
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
    this.getData();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.initValidate();
  },

  getData: function() {
    let token = wx.getStorageSync('token');
    app.util.ProReq('user.get_realname_tel', { token }).then(res => {
      this.setData({
        realname: res.data.realname,
        telephone: res.data.telephone
      })
    }).catch(err => {
      app.util.message(err.message || '请先登录', 'switchTo:/eaterplanet_ecommerce/pages/user/me', 'error');
    })
  },

  //报错
  showModal(error) {
    wx.showModal({
      content: error.msg,
      showCancel: false,
    })
  },

  //资料验证函数
  initValidate() {
    const rules = {
      realname: {
        required: true,
        minlength: 1
      },
      telephone: {
        required: true,
        tel: true
      }
    }
    const messages = {
      realname: {
        required: '请填写真实姓名',
        minlength: '请输入正确的姓名'
      },
      telephone: {
        required: '请填写手机号',
        tel: '请填写正确的手机号'
      }
    }
    this.WxValidate = new WxValidate(rules, messages)
  },

  /**
   * 资料修改表单提交
   */
  formSubmit(e) {
    const params = e.detail.value;
    //校验表单
    if (!this.WxValidate.checkForm(params)) {
      const error = this.WxValidate.errorList[0];
      this.showModal(error);
      return false;
    }
    this.setData({
      btnLoading: true
    })
    let token = wx.getStorageSync('token');
    params.token = token;
    app.util.ProReq('user.update_realname_tel', params).then(res => {
      this.setData({ btnLoading: false });
      wx.showModal({
        title: "提示",
        content: res.message || '更改成功',
        showCancel: false
      })
    }).catch(err => {
      this.setData({
        btnLoading: false
      })
      app.util.message(err.msg || '提交失败，请重试', '', 'error');
    })
  }
})
