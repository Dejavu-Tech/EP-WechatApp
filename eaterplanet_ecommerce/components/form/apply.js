var app = getApp();
import WxValidate from '../../utils/WxValidate.js';
var u = true;

Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  attached: function() {
    this.initValidate();
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //资料验证函数
    initValidate() {
      const rules = {
        form_username: {
          required: true,
          minlength: 1
        },
        form_mobile: {
          required: true,
          tel: true
        }
      }
      const messages = {
        form_username: {
          required: '请填写真实姓名',
          minlength: '请输入正确的姓名'
        },
        form_mobile: {
          required: '请填写手机号',
          tel: '请填写正确的手机号'
        }
      }
      this.WxValidate = new WxValidate(rules, messages)
    },

    /**
     * 输入框获得焦点
     */
    iptFocus: function (t) {
      let name = t.currentTarget.dataset.name;
      this.setData({
        currentFocus: name
      })
    },

    /**
     * 输入框失去焦点
     */
    iptBlur: function () {
      this.setData({
        currentFocus: ''
      })
    },

    //报错 
    showModal(error) {
      wx.showModal({
        content: error.msg,
        showCancel: false,
      })
    },

    /**
     * 资料修改表单提交
     */
    formSubmit(e) {
      this.setData({
        btnLoading: true
      })
      const params = e.detail.value;
      //校验表单
      if (!this.WxValidate.checkForm(params)) {
        const error = this.WxValidate.errorList[0];
        this.showModal(error);
        this.setData({
          btnLoading: false
        })
        return false;
      }
      let token = wx.getStorageSync('token');
      params.token = token;
      app.util.ProReq('user.save_formData', params).then(res=>{
        wx.showModal({
          content: res.msg || '提交成功,等待审核后才可查看价格和购买',
          showCancel: false,
          success: ()=>{
            wx.setStorageSync('isparse_formdata', 0);
            wx.reLaunch({
              url: '/eaterplanet_ecommerce/pages/index/index',
            })
          }
        })
      }).catch(err=>{
        this.setData({
          btnLoading: false
        })
        app.util.message(err.msg || '提交失败，请重试', '', 'error');
      })
    }
  }
})
