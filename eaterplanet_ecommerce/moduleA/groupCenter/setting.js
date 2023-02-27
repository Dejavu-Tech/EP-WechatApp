var app = getApp();
var util = require('../../utils/util.js');
import WxValidate from '../../utils/WxValidate.js';
var status = require('../../utils/index.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    showEditAvatar: false,
    showEditUserInfo: false,
    showEditFinance: false,
    currentFocus: '',
    rest: 0, // 1休息 0营业
    headInfo: '',
    btnLoading: false,
    tuanItems: [
      { name: 0, value: '跟随系统' },
      { name: 1, value: '开启' },
      { name: 2, value: '关闭' }
    ],
    tuanType: ['跟随系统','开启','关闭'],
    fareItems: [
      { name: 0, value: '跟随系统' },
      { name: 1, value: '自定义' }
    ],
    groupInfo: {
      group_name: '社区',
      owner_name: '团长'
    },
    image_o: ''
  },
  is_modify_shipping_method: 0,
  is_modify_shipping_fare: 0,
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
    status.setGroupInfo().then((groupInfo) => {
      let owner_name = groupInfo && groupInfo.owner_name || '团长';
      wx.setNavigationBarTitle({
        title: `${owner_name}中心`,
      })
      that.setData({ groupInfo })
    });

    let id = options && (options.id || 0);
    if (!util.check_login()) {
      wx.switchTab({
        url: '/eaterplanet_ecommerce/pages/user/me',
      })
    }
    if (!id) wx.switchTab({ url: '/eaterplanet_ecommerce/pages/user/me' });
    this.initValidate(); //验证规则函数
    this.getData(id);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  radioChange(e) {
    console.log(e)
    let name = e.currentTarget.dataset.name;
    if (name =='method'){
      this.is_modify_shipping_method = e.detail.value;
    } else if (name == 'fare'){
      this.is_modify_shipping_fare = e.detail.value;
      let showFare = false;
      if(e.detail.value == 1) showFare = true;
      this.setData({ showFare })
    }
  },

  //资料验证函数
  initValidate() {
    const rules = {
      head_name: {
        required: true,
        minlength: 1
      },
      head_mobile: {
        required: true,
        tel: true
      }
    }
    const messages = {
      head_name: {
        required: '请填写团长名称',
        minlength: '请输入正确的团长名称'
      },
      head_mobile: {
        required: '请填写手机号',
        tel: '请填写正确的手机号'
      }
    }
    this.WxValidate = new WxValidate(rules, messages)
  },

  /**
   * 获取数据
   */
  getData: function(id){
    let token = wx.getStorageSync('token');
    let that = this;
    app.util.request({
      'url': 'entry/wxapp/index',
      'data': {
        controller: 'community.get_head_info',
        id,
        token
      },
      dataType: 'json',
      success: function (res) {
        if (res.data.code == 0) {
          let headInfo = res.data.data;
          let showFare = headInfo.is_modify_shipping_fare == 1 ? true : false;
          that.setData({
            headInfo: headInfo,
            rest: res.data.data.rest,
            showFare
          })
          that.is_modify_shipping_method = headInfo.is_modify_shipping_method || 0;
          that.is_modify_shipping_fare = headInfo.is_modify_shipping_fare || 0;
        } else {
          wx.switchTab({
            url: '/eaterplanet_ecommerce/pages/user/me',
          })
        }
      }
    })
  },

  /**
   * 显示头像修改窗口
   */
  showEdit: function (t) {
    let type = t.currentTarget.dataset.type;
    if (type == 'avatar') {
      this.setData({
        showEditAvatar: true
      })
    } else if (type == 'info') {
      this.setData({
        showEditUserInfo: true
      })
    } else if (type == 'finance') {
      this.setData({
        showEditFinance: true
      })
    }
  },

  /**
   * 隐藏头像修改窗口
   */
  hideEdit: function () {
    this.setData({
      showEditAvatar: false,
      showEditUserInfo: false,
      showEditFinance: false
    })
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

  /**
   * 状态切换
   */
  switchChange(e) {
    let rest = e.detail.value ? 0 : 1 ;
    let headInfo = this.data.headInfo;
    let id = headInfo && (headInfo.id || 0);
    let token = wx.getStorageSync('token');
    let that = this;
    app.util.request({
      'url': 'entry/wxapp/index',
      'data': {
        controller: 'community.set_head_rest',
        id,
        token,
        rest
      },
      dataType: 'json',
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            rest: rest
          })
        } else if (res.data.code == 1) {
          wx.switchTab({
            url: '/eaterplanet_ecommerce/pages/user/me',
          })
        } else {
          that.setData({
            rest: !rest
          })
          wx.showToast({
            title: '修改失败',
          })
        }
      }
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
  infoFormSubmit(e) {
    this.setData({ btnLoading: true })
    const params = e.detail.value
    //校验表单
    if (!this.WxValidate.checkForm(params)) {
      const error = this.WxValidate.errorList[0];
      this.showModal(error);
      this.setData({ btnLoading: false })
      return false;
    }
    let is_modify_shipping_method = this.is_modify_shipping_method;
    let is_modify_shipping_fare = this.is_modify_shipping_fare;
    let data = Object.assign({}, params, { is_modify_shipping_method, is_modify_shipping_fare });
    if (is_modify_shipping_fare==1) {
      if (params.shipping_fare*1<=0) {
        wx.showToast({
          title: '请输入配送费',
          icon: 'none'
        })
        this.setData({ btnLoading: false })
        return;
      }
    }
    this.modifyHeadInfo(data);
  },

  /**
   * 资料修改
   */
  modifyHeadInfo(params) {
    let token = wx.getStorageSync('token');
    let headInfo = this.data.headInfo;
    let id = headInfo.id;
    let that = this;
    let share_wxcode = this.data.image_o;
    if (share_wxcode) params.share_wxcode = share_wxcode;
    app.util.request({
      'url': 'entry/wxapp/index',
      'data': {
        controller: 'community.modify_head_info',
        id,
        token,
        ...params
      },
      dataType: 'json',
      success: function (res) {
        if (res.data.code == 0) {
          let share_wxcode_old = headInfo.share_wxcode;
          headInfo = Object.assign({}, headInfo, params);
          headInfo.share_wxcode = share_wxcode_old;
          that.setData({
            headInfo
          })
          that.showModal({
            msg: '修改成功'
          })
        } else if (res.data.code == 1) {
          wx.switchTab({
            url: '/eaterplanet_ecommerce/pages/user/me',
          })
        } else {
          that.showModal({
            msg: '修改失败'
          })
        }
        that.hideEdit();
        that.setData({ btnLoading: false })
      }
    })
  },

  choseImg: function () {
    var self = this;
    wx.chooseMedia({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        const tempFiles = res.tempFiles;
        wx.showLoading({
          title: '上传中',
        })
        wx.uploadFile({
          url: app.util.url('entry/wxapp/index', { 'm': 'eaterplanet_ecommerce', 'controller': 'goods.doPageUpload' }),
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
            var image_o = data.image_o;
            self.setData({
              'headInfo.share_wxcode': image_o,
              image_o: image_o
            })
          }
        })
      }
    })
  }
})
