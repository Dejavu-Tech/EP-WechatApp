var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    loadText: "加载中...",
    noData: 0,
    loadMore: true,
    keyword: ""
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
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 获取列表
   */
  getData: function () {
    let that= this;
    wx.showLoading();
    const token = wx.getStorageSync('token');
    app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'solitaire.get_head_solitairelist',
        token: token,
        page: this.page,
        keyword: this.data.keyword
      },
      dataType: 'json',
      success: function (res) {
        wx.hideLoading();
        if (res.data.code == 0) {
          let h = {};
          let list = res.data.data;
          if (list.length < 20) h.noMore = true;
          let oldList = that.data.list;
          list = oldList.concat(list);
          that.page++;
          that.setData({ list, ...h })
        } else if (res.data.code == 1) {
          // 无数据
          if (that.page == 1) that.setData({ noData: 1 })
          that.setData({ loadMore: false, noMore: false, loadText: "没有更多记录了~" })
        } else if (res.data.code == 2) {
          app.util.message('您还未登录', 'switchTo:/eaterplanet_ecommerce/pages/index/index', 'error');
          return;
        } else {
          app.util.message(res.data.msg, 'switchTo:/eaterplanet_ecommerce/pages/index/index', 'error');
          return;
        }
      }
    })
  },

  goResult: function (e){
    let keyword = e.detail.value || '', that = this;
    this.page = 1;
    this.setData({
      list: [],
      loadText: "加载中...",
      noData: 0,
      loadMore: true,
      keyword
    }, ()=>{
      that.getData();
    })
  },

  goDetails: function (e){
    var id = e ? e.currentTarget.dataset.id : '';
    if (!id) return;
    let link = `/eaterplanet_ecommerce/moduleA/solitaire/groupDetails?id=${id}`;
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

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (!this.data.loadMore) return false;
    this.getData();
  }
})
