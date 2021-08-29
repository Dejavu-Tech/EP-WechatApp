var app = getApp();
var util = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    needAuth: false,
    has_slider: 0,
    slider_list: [],
    share_img: '',
    share_title: '',
    loadMore: true,
    loadText: "加载中...",
    loadOver: false,
    showEmpty: false,
    rushList: [],
  },
  pageNum: 1,
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
    this.getData();
    this.getList();
  },

  onShow: function () {
    let that = this;
    util.check_login_new().then((res) => {
      if(res) {
        that.setData({ needAuth: false })
      } else {
        this.setData({ needAuth: true });
      }
    })
  },

  authSuccess: function () {
    let that = this;
    this.pageNum = 1;
    this.setData({
      slider_list: [],
      loadMore: true,
      loadText: "加载中...",
      loadOver: false,
      showEmpty: false,
      rushList: []
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

  getData: function () {
    app.util.ProReq('presalegoods.index', {}).then(res => {
      let { has_slider, slider_list, presale_share_img, presale_share_title, presale_layout } = res.data;
      this.setData({
        presale_layout,
        has_slider,
        slider_list,
        share_img: presale_share_img,
        share_title: presale_share_title
      })
    })
  },

  /**
   * 获取商品列表
   */
  getList: function () {
    let that = this;
    let token = wx.getStorageSync('token');
    let community = wx.getStorageSync('community');
    let head_id = community.communityId || 0;
    
    app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'presalegoods.load_goods_list',
        pageNum: this.pageNum,
        token,
        head_id,
        pre_page: 10
      },
      dataType: 'json',
      success: function (res) {
        wx.hideLoading();
        wx.stopPullDownRefresh();
        if (res.data.code == 0) {
          let oldRushList = that.data.rushList;
          if (that.pageNum == 1) oldRushList = [];
          
          let h = {}, list = res.data.list;
          if (that.pageNum == 1 && list.length == 0) h.showEmpty = true;
          let rushList = oldRushList.concat(list);
          let rdata = res.data;
          let reduction = { full_money: rdata.full_money, full_reducemoney: rdata.full_reducemoney, is_open_fullreduction: rdata.is_open_fullreduction }
          h.rushList = rushList;
          h.reduction = reduction;
          h.loadOver = true;
          let loadMore = that.data.loadMore;
          if(res.data.list.length<10) { loadMore = false }
          h.loadMore = loadMore;
          h.loadText = loadMore ? "加载中..." : "没有更多商品了~";
          // h.pintuan_show_type = rdata.pintuan_show_type;
          that.setData(h, function () {
            that.pageNum += 1;
          })
        } else if (res.data.code == 1) {
          let s = { loadMore: false }
          if (that.pageNum == 1)  s.showEmpty = true;
          that.setData(s);
        } else if (res.data.code == 2) {
          //no login
          that.setData({ needAuth: true })
        }
      }
    })
  },

    /**
   * 幻灯片跳转
   */
  goBannerUrl: function (t) {
    let idx = t.currentTarget.dataset.idx;
    let { slider_list, needAuth } = this.data;
    if (slider_list.length > 0) {
      let url = slider_list[idx].link;
      let type = slider_list[idx].linktype;
      if (util.checkRedirectTo(url, needAuth)) {
        this.authModal();
        return;
      }
      if (type == 0) {
        // 跳转webview
        url && wx.navigateTo({ url: '/eaterplanet_ecommerce/pages/web-view?url=' + encodeURIComponent(url) })
      } else if (type == 1) {
        if (url.indexOf('eaterplanet_ecommerce/pages/index/index') != -1 || url.indexOf('eaterplanet_ecommerce/pages/order/shopCart') != -1 || url.indexOf('eaterplanet_ecommerce/pages/user/me') != -1 || url.indexOf('eaterplanet_ecommerce/pages/type/index') != -1) {
          url && wx.switchTab({ url: url })
        } else {
          url && wx.navigateTo({ url: url })
        }
      } else if (type == 2) {
        // 跳转小程序
        let appid = slider_list[idx].appid;
        appid && wx.navigateToMiniProgram({
          appId: slider_list[idx].appid,
          path: url,
          extraData: {},
          envVersion: 'release',
          success(res) {
            // 打开成功
          },
          fail(error) {
            console.log(error)
          }
        })
      } else if (type == 6) {
        //领券
        wx.navigateTo({
          url: '/eaterplanet_ecommerce/moduleA/coupon/getCoupon?id='+url
        })
      }
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getData();
    let that = this;
    this.pageNum = 1;
    this.setData({
      loadMore: true,
      loadText: "加载中...",
      loadOver: false,
      showEmpty: false,
      rushList: []
    }, () => {
      that.getList();
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log('这是我的底线');
    this.data.loadMore && (this.setData({ loadOver: false }), this.getList());
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var member_id = wx.getStorageSync('member_id');
    let { share_title, share_img } = this.data;
    return {
      title: share_title,
      path: "eaterplanet_ecommerce/moduleB/presale/index?share_id=" + member_id,
      imageUrl: share_img,
      success: function () { },
      fail: function () { }
    };
  }
})
