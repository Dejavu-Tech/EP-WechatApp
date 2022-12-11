var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tixian_money: '',
    final_money: 0,
    sxfee: 0,
    type: 1,
    items: [
      { name: '1', value: '系统余额', show: true, checked: false },
      { name: '2', value: '微信零钱', show: true, checked: false },
      { name: '3', value: '支付宝', show: true, checked: false },
      { name: '4', value: '银行卡', show: true, checked: false }
    ]
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
    var token = wx.getStorageSync('token');
    var that = this;
    app.util.request({
      url: 'entry/wxapp/user',
      data: {
        controller: 'community.get_community_info',
        token: token
      },
      dataType: 'json',
      success: function(res) {
        if (res.data.code == 0) {
          let rdata = res.data;

          let items = that.data.items;
          let community_info = rdata.community_info;
          if (community_info.head_commiss_tixianway_yuer == 0) items[0].show = false;
          if (community_info.head_commiss_tixianway_weixin == 0) items[1].show = false;
          if (community_info.head_commiss_tixianway_alipay == 0) items[2].show = false;
          if (community_info.head_commiss_tixianway_bank == 0) items[3].show = false;

          let type = that.data.type;
          for (let i = 0; i < items.length; i++){
            if(items[i].show){
              items[i].checked = true;
              type = items[i].name;
              break
            }
          }

          let head_commiss_tixian_publish = rdata.head_commiss_tixian_publish;
          let hasTixianPublish = head_commiss_tixian_publish!='';
          let { is_need_subscript, need_subscript_template } = res.data;

          that.setData({
            head_commiss_tixian_publish,
            member_info: rdata.member_info,
            community_info: rdata.community_info,
            commission_info: rdata.commission_info,
            community_tixian_fee: rdata.community_tixian_fee,
            community_min_money: rdata.community_min_money,
            items,
            type,
            hasTixianPublish,
            is_need_subscript,
            need_subscript_template
          });

        } else {
          //is_login
          wx.reLaunch({
            url: '/eaterplanet_ecommerce/pages/user/me',
          })

        }
      }
    })
  },

  bindTixianMoneyInput: function(t) {
    let max_val = this.data.commission_info.money;
    var value = t.detail.value;
    if (value > max_val) {
      wx.showToast({
        title: '本次最大可提现' + max_val + '元',
        icon: "none",
      })
    }
    let fee = this.data.community_tixian_fee;
    let final_money = (value * (100 - fee) / 100).toFixed(2);
    let sxfee = (value - final_money).toFixed(2);

    this.setData({
      tixian_money: value,
      final_money: final_money,
      sxfee
    })
  },

  getAll: function() {
    var max_tixian_money = this.data.commission_info.money;
    let fee = this.data.community_tixian_fee;
    let final_money = (max_tixian_money * (100 - fee) / 100).toFixed(2);
    let sxfee = (max_tixian_money - final_money).toFixed(2);
    this.setData({
      tixian_money: max_tixian_money,
      final_money: final_money,
      sxfee
    })
  },

  /**
   * 提交
   */
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
    console.log(isNull)
    if (isNull == 1) return;
    params.type = type;
    console.log(params);

    let tdata = this.data;
    let tixian_money = parseFloat(tdata.tixian_money);
    let max_tixian_money = tdata.commission_info.money;
    let community_min_money = parseFloat(tdata.community_min_money);

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
      let fee = tdata.community_tixian_fee;
      let final_money = (max_tixian_money * (100 - fee) / 100).toFixed(2);
      let sxfee = (max_tixian_money - final_money).toFixed(2);
      this.setData({
        tixian_money: max_tixian_money,
        final_money: final_money,
        sxfee
      })
      return false;
    }

    if (!this.canTixian) return;
    this.canTixian = false;
    var token = wx.getStorageSync('token');
    var that = this;

    wx.showLoading();
    app.util.request({
      url: 'entry/wxapp/user',
      data: {
        controller: 'community.tixian_community_info',
        token: token,
        ...params
      },
      dataType: 'json',
      success: function (res) {
        if (res.data.code == 0) {
          wx.showToast({
            title: "提现成功，等待审核",
            icon: "none",
            duration: 2000,
            mask: true,
            success: function () {
              wx.redirectTo({
                url: '/eaterplanet_ecommerce/moduleA/groupCenter/cashList',
              })
            }
          });
        } else {
          wx.showToast({
            title: "提现失败",
            icon: "none",
            duration: 2000,
            mask: true
          });
        }
        setTimeout(()=>{
          that.canTixian = true;
        }, 500);
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
            tmplIds.forEach(item=>{
              if (res[item] == 'accept') {
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
   * 切换类型
   */
  radioChange(e) {
    this.setData({ type: e.detail.value })
  }

})
