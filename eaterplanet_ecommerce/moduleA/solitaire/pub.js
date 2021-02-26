var app = getApp();
var util = require('../../utils/util.js');
var chooseFlag = true;
var myDate = new Date();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    begin_time: '',
    end_time: '',
    noteMaxLen: 500,
    imgGroup: [],
    goods: [], // 选择商品
    type: 0, // 0社区商品 1仅快递
    title: '',
    content: ''
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
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  titleInput: function(e){
    var title = e.detail.value;
    this.setData({ title })
  },

  /**
   * 开始时间
   */
  beginTimePicker: function(e){
    this.setData({ begin_time: e.detail })
  },

  /**
   * 开始时间
   */
  endTimePicker: function (e) {
    this.setData({ end_time: e.detail })
  },

  contentInput: function(e){
    var value = e.detail.value, len = parseInt(value.length);
    if (len > this.data.noteMaxLen) return;
    this.setData({
      currentNoteLen: len, //当前字数
      limitNoteLen: this.data.noteMaxLen - len, //剩余字数
      content: value
    });
  },

  chooseImage: function () {
    chooseFlag = false;
  },

  changeImg: function (e) {
    chooseFlag = e.detail.len === e.detail.value.length;
    this.setData({
      imgGroup: e.detail.value
    });
  },

  deleteGoods: function(e){
    let idx = e.detail;
    console.log(idx);
    let goods = this.data.goods;
    if(idx!=-1) {
      goods.splice(idx, 1);
      this.setData({ goods })
    }
  },

  /**
   * 获取团长信息
   */
  getData: function () {
    const token = wx.getStorageSync('token');
    let that = this;
    app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'solitaire.get_solitaire_headinfo',
        token: token
      },
      dataType: 'json',
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({ community: res.data.data || '' })
        } else if (res.data.code == 1) {
          app.util.message('您还未登录', 'switchTo:/eaterplanet_ecommerce/pages/index/index', 'error');
          return;
        } else {
          app.util.message(res.data.msg, 'switchTo:/eaterplanet_ecommerce/pages/index/index', 'error');
          return;
        }
      }
    })
  },

  /**
   * 提交
   */
  subForm: function(){
    let { title, content, begin_time, end_time, imgGroup, goods } = this.data;
    let that = this;
    if(title=='') {
      wx.showToast({
        title: '请输入标题',
        icon: 'none'
      })
      return;
    }
    if (content == '') {
      wx.showToast({
        title: '请输入内容',
        icon: 'none'
      })
      return;
    }
    if (imgGroup.length <= 0) {
      wx.showToast({
        title: '请上传接龙图片',
        icon: 'none'
      })
      return;
    }
    if (goods.length <= 0) {
      wx.showToast({
        title: '请选择商品',
        icon: 'none'
      })
      return;
    }

    let ids = [];
    goods.forEach(item=>{
      ids.push(item.gid);
    })
    let goods_list = ids.join(',');
    const token = wx.getStorageSync('token');
    let data = { title, content, begin_time, end_time, images_list: imgGroup.join(','), goods_list, token };
    app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'solitaire.sub_head_solitaire',
        ...data
      },
      dataType: 'json',
      success: function (res) {
        if (res.data.code == 0) {
          app.util.message('提交成功', 'redirect:/eaterplanet_ecommerce/moduleA/solitaire/groupIndex', 'success');
        } else {
          app.util.message(res.data.msg || '提交失败', '', 'error');
          return;
        }
      }
    })
  }
})
