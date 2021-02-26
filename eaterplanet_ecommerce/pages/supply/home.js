var app = getApp();
var util = require('../../utils/util.js');
var wcache = require('../../utils/wcache.js');
var status = require('../../utils/index.js');

Page({
  mixins: [require('../../mixin/cartMixin.js'), require('../../mixin/globalMixin.js')],
  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    info: [],
    cartNum: 0
  },
  supplyId: 0,
  page: 1,
  is_only_distribution: 0,
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
    this.supplyId = options.id || 0;
    this.is_only_distribution = options.is_only_distribution || 0;
    if (options.share_id != 'undefined' && options.share_id > 0) wcache.put('share_id', options.share_id);
    this.getData();
  },

  /**
   * 授权成功回调
   */
  authSuccess: function () {
    this.getData();
    this.setData({
      needAuth: false
    })
  },

  getData: function () {
    wx.showLoading();
    var token = wx.getStorageSync('token');
    var that = this;
    var cur_community = wx.getStorageSync('community');
    app.util.request({
      'url': 'entry/wxapp/index',
      'data': {
        controller: 'supply.get_details',
        token: token,
        page: that.page,
        is_random: 1,
        head_id: cur_community.communityId,
        id: that.supplyId,
        is_only_distribution: this.is_only_distribution
      },
      dataType: 'json',
      success: function (res) {
        wx.hideLoading();
        if (res.data.code == 0) {
          let oldList = that.data.list;
          let info = res.data.data || [];
          let list = oldList.concat(res.data.list);
          let noData = false;
          if(that.page == 1) {
            wx.setNavigationBarTitle({
              title: info.storename || info.shopname || '商户'
            })
            if (list.length==0) noData = true;
          }
          let noMore = false;
          if (res.data.list.length == 0) noMore = true;
          that.setData({ list, info, noMore, noData })
        } else {
          that.setData({ noMore: true })
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    util.check_login_new().then((res) => {
      if (res) {
        this.setData({ needAuth: false });
        (0, status.cartNum)('', true).then((res) => {
          res.code == 0 && that.setData({ cartNum: res.data })
        });
      } else {
        let id = this.specialId;
        this.setData({ needAuth: true, navBackUrl: `/eaterplanet_ecommerce/pages/supply/home?id=${id}` });
      }
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.data.noMore || (this.page++, this.getData());
  },

  onShareAppMessage: function (res) {
    var share_title = this.data.info.storename || '商户主页';
    var share_id = wx.getStorageSync('member_id');
    var id = this.supplyId;
    var share_path = `eaterplanet_ecommerce/pages/supply/home?id=${id}&share_id=${share_id}`;

    return {
      title: share_title,
      path: share_path,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },

  onShareTimeline: function (res) {
    var share_title = this.data.info.storename || '商户主页';
    var share_id = wx.getStorageSync('member_id');
    var id = this.supplyId;
    var query = `id=${id}&share_id=${share_id}`;
    return {
      title: share_title,
      query,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
})
