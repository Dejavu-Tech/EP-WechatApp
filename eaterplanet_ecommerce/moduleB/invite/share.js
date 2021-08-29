var app = getApp();
var util = require('../../utils/util.js');

Page({
  mixins: [require('../../mixin/compoentCartMixin.js'), require('../../mixin/globalMixin.js')],
  data: {
    list: [],
    topImg: '',
    rules: '',
    getRules: '',
    showRulesPopup: false,
    token: '',
    can_collect_gift: 0,
    coupon_info: '',
    point: '',
    isCollect: 0,
    needAuth: false
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
  onLoad: function (options) {
    let share_id = '';
    if (options.scene) {
      var value = decodeURIComponent(options.scene);
      if (typeof value === 'object') {
        //记录推广人uid
        if (value.share_id)  share_id = value.share_id;
      } else {
        share_id = value;
      }
    }
    if (options.share_id)  share_id = options.share_id;
    wx.setStorageSync('share_id', share_id);

    //登錄後返回
    let can_collect_gift = options.can_collect_gift;
    let token = wx.getStorageSync('token') || '';
    this.setData({
      token,
      can_collect_gift
    })
    if(can_collect_gift==1) this.collectInvitegift();
    setTimeout(() => { this.getData() }, 100);
  },

  getData() {
    let suid = wx.getStorageSync('share_id');
    let token = wx.getStorageSync('token') || '';
    app.util.ProReq('invitegift.invitegiftIndex', { suid, token })
      .then(res=>{
        let { invite_activity_open_topback_img, invite_activity_rules, invite_activity_use_rules, suid } = res.data;

        this.setData({
          topImg: invite_activity_open_topback_img,
          rules: invite_activity_rules,
          getRules: invite_activity_use_rules,
        })
      })
      .catch(err=>{
        app.util.message(err.msg, 'switchTo:/eaterplanet_ecommerce/pages/index/index', 'error');
      })
  },

  /**
   * 授权成功回调
   */
  authSuccess: function (res) {
    console.log(res)
    let can_collect_gift = res.detail.data.is_can_collect_gift;
    // if(can_collect_gift==1) this.collectInvitegift();
    this.setData({
      needAuth: false,
      can_collect_gift
    }, ()=>{
      this.collectInvitegift();
    })
  },

  authModal: function(){
    if(this.data.needAuth) {
      this.setData({ showAuthModal: !this.data.showAuthModal });
      return false;
    }
    return true;
  },

  /**
   * 领取礼包
   */
  collectInvitegift() {
    let token = wx.getStorageSync('token') || '';
    app.util.ProReq('invitegift.collectInvitegift', {token})
      .then(res=>{
        this.setData({
          coupon_info: res.data.coupon_info,
          point: res.data.point,
          isCollect: 1
        })
      })
      .catch(err=>{
        this.setData({ can_collect_gift: 0 })
        app.util.message(err.msg, 'switchTo:/eaterplanet_ecommerce/pages/index/index', 'error');
      })
  },

  goLink: function(event) {
    let link = event.currentTarget.dataset.link;
    var pages_all = getCurrentPages();
    if (pages_all.length > 3) {
      wx.redirectTo({
        url: link
      })
    } else {
      wx.navigateTo({
        url: link
      })
    }
  },

  goIndex: function(event) {
    wx.switchTab({
      url: '/eaterplanet_ecommerce/pages/index/index',
    })
  },

  handleRuleModal() {
    this.setData({
      showRulesPopup: !this.data.showRulesPopup
    })
  },

  /**
   * 立即领取按钮
   */
  getGift() {
    // 1.判断登录
    wx.showLoading();
    let that = this;
    util.check_login_new().then((res)=>{
      if (res) {
        let token = wx.getStorageSync('token') || '';
        this.setData({ token })
        wx.hideLoading();
      } else {
        that.setData({ needAuth: true, showAuthModal: true });
        wx.hideLoading();
      }
    })
  }
})
