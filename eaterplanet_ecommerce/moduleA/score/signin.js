// eaterplanet_ecommerce/moduleA/score/signin.js
var util = require('../../utils/util.js');
var app = getApp();
var status = require('../../utils/index.js');

Page({
  mixins: [require('../../mixin/scoreCartMixin.js')],
  data: {
    info: {},
    dayScore: [],
    showSignModal: false,
    list: [],
    loadText: "加载中...",
    noData: 0,
    loadMore: true
  },
  page: 1,
  isLock: false,
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
  onLoad: function () {
    app.setShareConfig();
    status.setNavBgColor();
    wx.showLoading();
    this.getData();
    this.getList();
  },

  onShow: function () {
    let that = this;
    util.check_login_new().then((res) => {
      if (!res) {
        that.setData({
          needAuth: true
        })
      }
    })
  },

  vipModal: function(t) {
    this.setData(t.detail)
  },

  /**
   * 授权成功回调
   */
  authSuccess: function () {
    let that = this;
    that.page = 1;
    this.setData({
      needAuth: false,
      showAuthModal: false,
      list: [],
      loadText: "加载中...",
      noData: 0,
      loadMore: true
    }, () => {
      that.getData();
      that.getList();
    })
  },

  authModal: function () {
    if (this.data.needAuth) {
      this.setData({ showAuthModal: !this.data.showAuthModal });
      return false;
    }
    return true;
  },

  getData: function(){
    var token = wx.getStorageSync('token');
    let that = this;
    app.util.request({
      url: 'entry/wxapp/user',
      data: {
        controller: 'signinreward.get_signinreward_baseinfo',
        token: token
      },
      dataType: 'json',
      success: function (res) {
        wx.hideLoading();
        if (res.data.code == 0) {
          let info = res.data.data || {};
          let dayScore = [];
          dayScore.push(info.signinreward_day1_score || 0);
          dayScore.push(info.signinreward_day2_score || 0);
          dayScore.push(info.signinreward_day3_score || 0);
          dayScore.push(info.signinreward_day4_score || 0);
          dayScore.push(info.signinreward_day5_score || 0);
          dayScore.push(info.signinreward_day6_score || 0);
          dayScore.push(info.signinreward_day7_score || 0);

          // let isopen_signinreward = info.isopen_signinreward;
          // if (isopen_signinreward!=1) {
          //   app.util.message('未开启签到送积分功能', 'switchTo:/eaterplanet_ecommerce/pages/index/index', 'error');
          // }

          that.setData({
            info: res.data.data || {},
            dayScore
          })
        } else {
          that.setData({ needAuth: true })
        }
      }
    })
  },

  signIn: function () {
    if (!this.authModal() || this.isLock) return;
    this.isLock = true;
    var token = wx.getStorageSync('token');
    let that = this;
    app.util.request({
      url: 'entry/wxapp/user',
      data: {
        controller: 'signinreward.sub_signin',
        token: token
      },
      dataType: 'json',
      success: function (res) {
        wx.hideLoading();
        if (res.data.code == 0) {
          let { score, continuity_day, reward_socre } = res.data;
          let info = that.data.info;
          info.score = score;
          info.today_is_signin = 1;
          info.has_continuity_day = continuity_day;
          info.show_day_arr[continuity_day-1].is_signin = 1;
          that.setData({ info, showSignModal: true, reward_socre })
          // app.util.message('签到成功', '', 'success');
        } else{
          app.util.message(res.data.msg || '签到失败', '', 'success');
        }
        this.isLock = false;
      }
    })
  },

  goLink: function (event) {
    if (!this.authModal()) return;
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

  handleTipModal: function(){
    this.setData({
      showSignModal: !this.data.showSignModal
    })
  },

  getList: function () {
    var token = wx.getStorageSync('token');
    var that = this;
    var cur_community = wx.getStorageSync('community');
    app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'signinreward.load_sign_goodslist',
        token,
        pageNum: this.page,
        is_random: 1,
        head_id: cur_community.communityId
      },
      dataType: 'json',
      success: function (res) {
        if (res.data.code == 0) {
          let h = {};
          let list = res.data.list;
          if (list.length < 10) h.noMore = true;
          let oldList = that.data.list;
          list = oldList.concat(list);
          that.page++;
          that.setData({
            list,
            ...h
          })
        } else {
          let h = {};
          if (that.page == 1) h.noData = 1;
          that.setData({
            loadMore: false,
            noMore: false,
            loadText: "没有更多记录了~",
            ...h
          })
        }
      }
    })
  },

  onReachBottom: function() {
    if (!this.data.loadMore) return false;
    this.getList();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let info = this.data.info;
    let { signinreward_share_title, signinreward_share_image } = info;
    var share_id = wx.getStorageSync('member_id');
    var share_path = 'eaterplanet_ecommerce/moduleA/score/signin?share_id=' + share_id;
    console.log('签到分享地址：', share_path);

    return {
      title: signinreward_share_title,
      path: share_path,
      imageUrl: signinreward_share_image,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },

  onShareTimeline: function () {
    let info = this.data.info;
    let { signinreward_share_title, signinreward_share_image } = info;
    var share_id = wx.getStorageSync('member_id');
    var query= `share_id=${share_id}`;

    return {
      title: signinreward_share_title,
      query,
      imageUrl: signinreward_share_image,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
})
