var util = require('../../utils/util.js');
var status = require('../../utils/index.js');
var app = getApp();

Page({
  mixins: [require('../../mixin/globalMixin.js')],
  data: {
    classification: {
      tabs: [],
      activeIndex: 0
    },
    slider_list: [],
    pintuan_show_type: 0,
    loadMore: true,
    loadText: "加载中...",
    loadOver: false,
    showEmpty: false,
    rushList: [],
    isIpx: app.globalData.isIpx
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.setShareConfig();
    status.setNavBgColor();
    this.initFn();
  },

  initFn: function(){
    wx.showLoading();
    this.getTabs();
    this.getData();
  },

  authSuccess: function () {
    let that = this;
    this.pageNum = 1;
    this.setData({
      classification: {
        tabs: [],
        activeIndex: 0
      },
      slider_list: [],
      pintuan_show_type: 0,
      loadMore: true,
      loadText: "加载中...",
      loadOver: false,
      showEmpty: false,
      rushList: []
    }, () => {
      that.initFn();
    })
  },

  authModal: function () {
    if (this.data.needAuth) {
      this.setData({ showAuthModal: !this.data.showAuthModal });
      return false;
    }
    return true;
  },

  /**
   * 获取分类
   */
  getTabs: function () {
    let that = this;
    app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'group.pintuan_slides'
      },
      dataType: 'json',
      success: function (res) {
        if(res.data.code==0) {
          let {
            category_list,
            pintuan_show_type,
            slider_list,
            pintuan_index_share_title,
            pintuan_index_share_img
          } = res.data;

          let params = {
            classification: {}
          };
          params.slider_list = slider_list || [];
          params.pintuan_show_type = pintuan_show_type;
          params.pintuan_index_share_title = pintuan_index_share_title || '';
          params.pintuan_index_share_img = pintuan_index_share_img || '';
          category_list = category_list || [];
          let index_type_first_name = '推荐';

          if (category_list.length > 0) {
            category_list.unshift({
              name: index_type_first_name,
              id: 0
            })
            params.isShowClassification = true;
            params.classification.tabs = category_list;
          } else {
            params.isShowClassification = false;
          }
          that.setData(params)
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    (0, status.cartNum)('', true).then((res) => {
      res.code == 0 && that.setData({
        cartNum: res.data
      })
    });
  },

  /**
   * 监控分类导航
   */
  classificationChange: function (t) {
    console.log(t.detail.e)
    wx.showLoading();
    var that = this;
    this.pageNum = 1;
    this.setData({
      rushList: [],
      showEmpty: false,
      "classification.activeIndex": t.detail.e,
      classificationId: t.detail.a
    }, function () {
      that.getData();
    });
  },

  /**
   * 获取商品列表
   */
  getData: function () {
    let that = this;
    let token = wx.getStorageSync('token');
    let gid = that.data.classificationId;
    let community = wx.getStorageSync('community');
    let head_id = community.communityId || 0;

    app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'group.get_pintuan_list',
        pageNum: this.pageNum,
        gid,
        token,
        head_id,
        is_index: 1
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
          let pintuan_model_buy = rdata.pintuan_model_buy || 0;
          h.rushList = rushList;
          h.reduction = reduction;
          h.loadOver = true;
          let loadMore = that.data.loadMore;
          if(res.data.list.length<20) { loadMore = false }
          h.loadMore = loadMore;
          h.loadText = loadMore ? "加载中..." : "没有更多商品了~";
          h.pintuan_model_buy = pintuan_model_buy;
          h.pintuan_show_type = rdata.pintuan_show_type;
          if (pintuan_model_buy == 1) h.needPosition=true,(!head_id&&that.needCommunity());
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
   * 需要社区
   * 判断是否已绑定
   */
  needCommunity: function(){
    let token = wx.getStorageSync('token');
    let that = this;
    console.log('需要社区')
    if (token) {
      util.getCommunityInfo().then(res=>{
        if(res) {
          that.pageNum = 1;
          that.setData({
            loadMore: true,
            loadText: "加载中...",
            loadOver: false,
            showEmpty: false,
            rushList: []
          }, () => {
            that.getData();
          })
        }
      })
    }
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
      }
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    let that = this;
    this.pageNum = 1;
    this.setData({
      loadMore: true,
      loadText: "加载中...",
      loadOver: false,
      showEmpty: false,
      rushList: []
    }, () => {
      that.getData();
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log('这是我的底线');
    this.data.loadMore && (this.setData({ loadOver: false }), this.getData());
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var member_id = wx.getStorageSync('member_id');
    let { pintuan_index_share_title, pintuan_index_share_img } = this.data;
    return {
      title: pintuan_index_share_title,
      path: "eaterplanet_ecommerce/moduleA/pin/index?share_id=" + member_id,
      imageUrl: pintuan_index_share_img,
      success: function () { },
      fail: function () { }
    };
  },

  onShareTimeline: function() {
    var member_id = wx.getStorageSync('member_id');
    let { pintuan_index_share_title, pintuan_index_share_img } = this.data;
    var query= `share_id=${member_id}`;
    return {
      title: pintuan_index_share_title,
      imageUrl: pintuan_index_share_img,
      query,
      success: function() {},
      fail: function() {}
    };
  }
})
