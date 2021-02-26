var util = require('../../utils/util.js');
var app = getApp();

Page({
  mixins: [require('../../mixin/globalMixin.js')],
  data: {
    is_login: true,
    tab_index: 1,
    isHideLoadMore: true,
    no_order: 0,
    quan: [],
    loadText: '加载中'
  },
  page: 1,
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
    util.check_login() ? this.setData({is_login: true}) : this.setData({is_login: false});
    this.getData();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 授权成功回调
   */
  authSuccess: function () {
    wx.reLaunch({
      url: '/eaterplanet_ecommerce/pages/user/me',
    })
  },

  tabchange: function (e) {
    var index = e.currentTarget.dataset.index;
    this.page = 1;
    this.setData({
      quan: [],
      tab_index: index
    })
    this.getData();
  },

  getData: function () {
    this.setData({
      isHideLoadMore: true
    })
    wx.showLoading();
    this.data.no_order = 1
    var page = this.page;
    var tab_index = this.data.tab_index;
    var token = wx.getStorageSync('token');
    var self = this;
    app.util.request({
      'url': 'entry/wxapp/user',
      'data': {
        controller: 'user.myvoucherlist',
        token: token,
        type: tab_index,
        page: page,
        pre_page: 5,

      },
      dataType: 'json',
      method: 'POST',
      success: function (data) {
        wx.hideLoading();
        if (data.data.code == 0) {
          var agoData = self.data.quan;
          var goods = data.data.list;
          goods.map(function (good) {
            agoData.push(good);
          });
          self.setData({
            quan: agoData,
            no_order: 0
          });
        } else {
          self.setData({
            isHideLoadMore: true
          })
          return false;
        }
      }
    })
  },

  goUse: function (e) {
    let idx = e.currentTarget.dataset.idx;
    let quan = this.data.quan || [];
    if (quan.length>=idx) {
      if(quan[idx].is_limit_goods_buy==0) {
        wx.switchTab({
          url: '/eaterplanet_ecommerce/pages/index/index',
        })
      } else if (quan[idx].is_limit_goods_buy == 1) {
        let id = quan[idx].limit_goods_list;
        let ids = id.split(',');
        let url = '';
        if(ids.length>1) {
          url = '/eaterplanet_ecommerce/pages/type/result?type=2&good_ids=' + id;
        } else {
          url = '/eaterplanet_ecommerce/pages/goods/goodsDetail?id=' + id;
        }
        wx.navigateTo({ url: url })
      } else if (quan[idx].is_limit_goods_buy == 2) {
        let gid = quan[idx].goodscates || 0;
        wx.navigateTo({
          url: '/eaterplanet_ecommerce/pages/type/result?type=1&gid=' + gid,
        })
      }
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.no_order == 1) return false;
    this.page += 1;
    this.getData();
    this.setData({
      isHideLoadMore: false
    })
  }
})
