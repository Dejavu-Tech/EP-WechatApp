var app = getApp();

Page({
  mixins: [require('../../mixin/commonMixin.js')],
  data: {
    type: 1,
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
  onLoad: function (options) {
    
  },

  onShow: function () {
    wx.showLoading();
    this.getData();
  },

  getData: function () {
    let token = wx.getStorageSync('token');
    app.util.ProReq('supplymobile.supply_managemoney_panel', { token }).then(res => {
      let {
        supply_min_apply_money,
        supply_commiss,
        tixian_waylist,
        supply_tixian_free,
        supply_tixian_notice
      } = res.data;

      // 查询是否有自定义选中  没有则第一个显示的
      let type = 0;
      let tixian_waylist_keys = Object.keys(tixian_waylist);
      tixian_waylist_keys.forEach(item=>{
        if (tixian_waylist[item].is_default_check) {
          type = item;
          return
        }
      })

      if(type==0) {
        try {
          tixian_waylist_keys.forEach(item=>{
            if (tixian_waylist[item].is_show==1) {
              type = item;
              tixian_waylist[item].is_default_check = 1;
              throw Error();
            }
          })
        } catch (e) {
        }
      }

      this.setData({
        type,
        supply_min_apply_money,
        supply_commiss,
        tixian_waylist,
        supply_tixian_free,
        supply_tixian_notice
      })
    }).catch(err => {
      console.log(err)
      app.util.message(err.msg || '请求出错', '', 'error');
    })
  },

  formSubmit: function (e) {
    const params = e.detail.value;
    let isNull = 0;
    let { type, tixian_money, supply_commiss, supply_min_apply_money, supply_tixian_free } = this.data;
    let errortip = [{}, {
      account: '微信真实姓名'
    }, {
      bankusername: '支付宝真实姓名',
      account: '支付宝账户'
    }, {
      card_name: '银行卡名称',
      card_username: '持卡人姓名',
      account: '银行卡账户'
    }, {
      account: '微信真实姓名'
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

    tixian_money = parseFloat(tixian_money);
    let max_tixian_money = supply_commiss.money;
    supply_min_apply_money = parseFloat(supply_min_apply_money);

    if (tixian_money == '' || supply_min_apply_money > tixian_money) {
      wx.showToast({
        title: '最小提现' + supply_min_apply_money + '元',
        icon: "none",
      })
      return false;
    }

    if (tixian_money > max_tixian_money) {
      wx.showToast({
        title: '本次最大可提现' + max_tixian_money + '元',
        icon: "none",
      })
      let final_money = (max_tixian_money * (100 - supply_tixian_free) / 100).toFixed(2);
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
    let data = {
      supply_apply_type: params.type,
      account: params.account || '',
      card_name: params.card_name || '',
      card_username: params.card_username || '',
      ti_money: params.money,
      token
    }
    app.util.ProReq('supplymobile.supply_applymoney', data).then(res => {
      wx.showToast({
        title: '已提交申请',
        icon: 'none',
        success: function () {
          that.canTixian = true;
          that.setData({
            canPay: false,
            tixian_money: '',
            final_money: 0
          })
          that.getData();
        }
      })
    }).catch(err=>{
      that.canTixian = true;
      wx.showToast({
        title: err.msg || '提交失败，请重试',
        icon: 'none'
      })
    })
  },

  /**
   * 获得焦点
   */
  bindIptFocus: function () {
    this.setData({
      onFocus: true
    })
  },

  /**
   * 失去焦点
   */
  bindIptBlur: function () {
    this.setData({
      onFocus: false
    })
  },

  radioChange(e) {
    this.setData({
      type: e.detail.value
    })
  },

  bindTixianMoneyInput: function (t) {
    let max_val = this.data.supply_commiss.money;
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
    let fee = this.data.supply_tixian_free;
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

  getAll: function () {
    const tdata = this.data;
    var max_tixian_money = tdata.supply_commiss.money * 1;
    let fee = tdata.supply_tixian_free;
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