var app = getApp();
var util = require('../../utils/util.js');

Page({
  mixins: [require('../../mixin/commonMixin.js')],
  /**
   * 页面的初始数据
   */
  data: {
    type: 1,
    items: [{
        name: '1',
        value: '系统余额',
        show: true,
        checked: false
      },
      {
        name: '2',
        value: '微信零钱',
        show: true,
        checked: false
      },
      {
        name: '3',
        value: '支付宝',
        show: true,
        checked: false
      },
      {
        name: '4',
        value: '银行卡',
        show: true,
        checked: false
      }
    ],
    info: [],
    tixian_money: '',
    final_money: 0
  },
  canTixian: true,
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
    wx.showLoading();
    this.getData();
  },

  onShow: function() {
    let that = this;
    util.check_login_new().then((res) => {
      if (res) {
        that.setData({
          needAuth: false
        })
      } else {
        that.setData({
          needAuth: true
        })
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
    }, () => {
      wx.showLoading();
      that.getData();
    })
  },

  getData: function() {
    var token = wx.getStorageSync('token');
    let that = this;
    //Todo
    app.util.request({
      url: 'entry/wxapp/user',
      data: {
        controller: 'distribution.get_commission_info',
        token: token
      },
      dataType: 'json',
      success: function(res) {
        wx.hideLoading();
        if (res.data.code == 0) {
          let commiss_tixian_publish = res.data.data.commiss_tixian_publish;
          let items = that.data.items;
          let rdata = res.data.data;
          if (rdata.commiss_tixianway_yuer == 0) items[0].show = false;
          if (rdata.commiss_tixianway_weixin == 0) items[1].show = false;
          if (rdata.commiss_tixianway_alipay == 0) items[2].show = false;
          if (rdata.commiss_tixianway_bank == 0) items[3].show = false;

          let type = that.data.type;
          for (let i = 0; i < items.length; i++) {
            if (items[i].show) {
              items[i].checked = true;
              type = items[i].name;
              break
            }
          }

          let { is_need_subscript, need_subscript_template } = res.data;

          that.setData({
            info: res.data.data,
            items,
            type,
            is_need_subscript,
            need_subscript_template,
            commiss_tixian_publish
          })
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.msg,
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
      }
    })
  },

  formSubmit: function(event) {
    let that = this;
    let is_need_subscript = this.data.is_need_subscript;
    if(is_need_subscript==1) {
      //弹出订阅消息
      this.subscriptionNotice().then(()=>{
        that.resSubmit(event);
      }).catch(()=>{
        that.resSubmit(event);
      });
    } else {
      that.resSubmit(event);
    }
  },

  resSubmit: function(e) {
    const params = e.detail.value;
    let isNull = 0;
    let type = this.data.type;
    let errortip = [{}, {}, {
      bankusername: '微信真实姓名'
    }, {
      bankusername: '支付宝真实姓名',
      bankaccount: '支付宝账户'
    }, {
      bankname: '银行卡名称',
      bankusername: '持卡人姓名',
      bankaccount: '银行卡账户'
    }];
    for (let item in params) {
      params[item] = params[item].replace(/(^\s*)|(\s*$)/g, "");
      if (!params[item]) {
        const itemTip = errortip[type][item];
        wx.showToast({
          title: '请输入' + (itemTip || '正确的表单内容'),
          icon: 'none'
        })
        isNull = 1;
        break;
      }
      if (item == 'money' && params[item] * 1 <= 0) {
        wx.showToast({
          title: '请输入正确的金额',
          icon: 'none'
        })
        return;
      }
    }

    if (isNull == 1) return;
    params.type = type;

    let tdata = this.data;
    let tixian_money = parseFloat(tdata.tixian_money);
    let max_tixian_money = tdata.info.money;
    let community_min_money = parseFloat(tdata.info.commiss_min_tixian_money);

    if (tixian_money == '' || community_min_money > tixian_money) {
      wx.showToast({
        title: '最小提现' + community_min_money + '元',
        icon: "none",
      })
      return false;
    }

    if (tixian_money > max_tixian_money) {
      wx.showToast({
        title: '本次最大可提现' + max_tixian_money + '元',
        icon: "none",
      })
      let fee = tdata.info.commiss_tixian_bili;
      let final_money = (max_tixian_money * (100 - fee) / 100).toFixed(2);
      this.setData({
        tixian_money: max_tixian_money,
        final_money: final_money
      })
      return false;
    }

    if (!this.canTixian) return;
    this.canTixian = false;

    wx.showLoading();
    var token = wx.getStorageSync('token');
    let that = this;
    app.util.request({
      url: 'entry/wxapp/user',
      data: {
        controller: 'distribution.tixian_sub',
        token: token,
        ...params
      },
      dataType: 'json',
      success: function(res) {
        wx.hideLoading();
        if (res.data.code == 0) {
          wx.showToast({
            title: '已提交申请',
            icon: 'none',
            duration: 2000,
            success: function(){
              that.setData({
                canPay: false,
                tixian_money: '',
                final_money: 0
              })
              that.getData();
            }
          })
        } else {
          wx.showToast({
            title: res.data.msg ? res.data.msg : '提交失败，请重试',
            icon: 'none'
          })
        }
        that.canTixian = true;
      }
    })
  },

  /**
   * 订阅消息
   */
  subscriptionNotice: function() {
    let that = this;
    return new Promise((resolve, reject)=>{
      let obj = that.data.need_subscript_template;
      let tmplIds =  Object.keys(obj).map(key => obj[key]); // 订阅消息模版id
      if (wx.requestSubscribeMessage) {
        tmplIds.length && wx.requestSubscribeMessage({
          tmplIds: tmplIds,
          success(res) {
            let is_need_subscript = 1;
            let acceptId = [];
            Object.keys(obj).forEach(item=>{
              if (res[obj[item]] == 'accept') {
                //用户同意了订阅，添加进数据库
                acceptId.push(item);
              } else {
                //用户拒绝了订阅或当前游戏被禁用订阅消息
                is_need_subscript = 0;
              }
            })

            if(acceptId.length) {
              that.addAccept(acceptId);
            }
            that.setData({ is_need_subscript })
            resolve();
          },
          fail(err) {
            console.log(err)
            reject();
          }
        })
      } else {
        // 兼容处理
        reject();
      }
    })
  },

  // 用户点击订阅添加到数据库
  addAccept: function (acceptId) {
    let token = wx.getStorageSync('token');
    let type = acceptId.join(',');
    app.util.request({
      url: 'entry/wxapp/user',
      data: {
        controller: 'user.collect_subscriptmsg',
        token,
        type
      },
      dataType: 'json',
      method: 'POST',
      success: function () {}
    })
  },

  /**
   * 获得焦点
   */
  bindIptFocus: function() {
    this.setData({
      onFocus: true
    })
  },

  /**
   * 失去焦点
   */
  bindIptBlur: function() {
    this.setData({
      onFocus: false
    })
  },

  radioChange(e) {
    this.setData({
      type: e.detail.value
    })
  },

  bindTixianMoneyInput: function(t) {
    let max_val = this.data.info.money;
    var value = t.detail.value;
    if (!(/^(\d?)+(\.\d{0,2})?$/.test(value))) {
      value = value.substring(0, value.length - 1);
      value = parseFloat(value);
    }

    if (value > max_val) {
      wx.showToast({
        title: '本次最大可提现' + max_val + '元',
        icon: "none",
      })
    }
    let fee = this.data.info.commiss_tixian_bili;
    let val = parseFloat(value) > 0 ? parseFloat(value) : 0;
    let final_money = (val * (100 - fee) / 100).toFixed(2);

    let canPay = false;
    value ? canPay = true : canPay = false;

    this.setData({
      tixian_money: value,
      final_money: final_money,
      canPay
    })
    return value;
  },

  getAll: function() {
    const tdata = this.data;
    var max_tixian_money = tdata.info.money * 1;
    let fee = tdata.info.commiss_tixian_bili;
    let final_money = (max_tixian_money * (100 - fee) / 100).toFixed(2);

    let canPay = false;
    max_tixian_money ? canPay = true : canPay = false;
    this.setData({
      tixian_money: max_tixian_money,
      final_money: final_money,
      canPay
    })
  }
})
