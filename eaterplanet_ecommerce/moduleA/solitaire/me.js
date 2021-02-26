var app = getApp();

Page({
  mixins: [require('../../mixin/globalMixin.js')],
  data: {
    list: [],
    loadText: "加载中...",
    noData: 0,
    loadMore: true,
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
    this.getData();
  },

  /**
   * 授权成功回调
   */
  authSuccess: function () {
    let that = this;
    this.page = 1;
    this.setData({
      list: [],
      loadText: "加载中...",
      noData: 0,
      loadMore: true,
      needAuth: false
    }, ()=>{
      that.getData(this.specialId);
    })
  },

  /**
   * 获取列表
   */
  getData: function () {
    let that = this;
    const token = wx.getStorageSync('token');
    let community = wx.getStorageSync('community');
    let head_id = community && community.communityId || '';
    wx.showLoading();
    app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'solitaire.get_member_solitairelist',
        token,
        page: this.page,
        head_id
      },
      dataType: 'json',
      success: function (res) {
        wx.stopPullDownRefresh();
        wx.hideLoading();
        if (res.data.code == 0) {
          let h = {};
          let list = res.data.data;
          if (list.length < 20) h.noMore = true;
          let oldList = that.data.list;
          list = oldList.concat(list);
          that.page++;
          that.setData({
            list,
            ...h
          })
        } else if (res.data.code == 1) {
          // 无数据
          if (that.page == 1) that.setData({
            noData: 1
          })
          that.setData({
            loadMore: false,
            noMore: false,
            loadText: "没有更多记录了~"
          })
        } else if (res.data.code == 2) {
          // 您还未登录
          that.setData({ needAuth: true, showAuthModal: true })
        } else {
          app.util.message(res.data.msg, '', 'error');
          return;
        }
      }
    })
  },

  goDetails: function (event) {
    var id = event ? event.currentTarget.dataset.id : '';
    if (!id) return;
    var pages_all = getCurrentPages();
    let link = `/eaterplanet_ecommerce/moduleA/solitaire/details?id=${id}`;
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

  showImgPrev: function (event) {
    var idx = event ? event.currentTarget.dataset.idx : '';
    var sidx = event ? event.currentTarget.dataset.sidx : '';
    let list = this.data.list;
    let urls = list[sidx].images_list;
    wx.previewImage({
      current: urls[idx],
      urls
    });
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    let that = this;
    this.page = 1;
    this.setData({
      list: [],
      loadText: "加载中...",
      noData: 0,
      loadMore: true,
    }, () => {
      that.getData();
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (!this.data.loadMore) return false;
    this.getData();
  }
})
