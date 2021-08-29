var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    total_points: 0,
    tab_index: 1
  },
  listPage: 1,
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
    this.goodsList();
    this.getScore();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  tabchange: function (e) {
    var index = e.currentTarget.dataset.index;
    this.listPage = 1;
    this.setData({
      list: [],
      tab_index: index
    })
    console.log(index)
    if(index==1) {
      this.goodsList();
    } else {
      this.getScore();
    }
  },

  goodsList() {
    let _this = this;
    let token = wx.getStorageSync('token');
    let data = {
      token,
      page: _this.listPage
    };
    wx.showLoading();
    app.util.ProReq('invitegift.getInvitegiftCouponList', data)
      .then(res => {
        _this.listLoading = false;
        wx.stopPullDownRefresh();
        let h = {};
        if (_this.listPage == 1) {
          h.list = res.data;
          res.data.length==0?(h.noData=true):'';
        } else {
          h.list = [..._this.data.list, ...res.data];
        }
        if (res.data.length > 0) {
          _this.listPage += 1;
        } else {
          _this.listPage = 0;
        }
        if(res.data.length < 10) {
          h.noMore = true;
        }
        this.setData(h);
        wx.hideLoading();
      })
      .catch(err => {
        wx.hideLoading();
        let h = {};
        _this.listPage==1?(h.noData=true):'';
        this.setData({
          listLoading: false,
          noMore: true,
          ...h,
        })
        wx.stopPullDownRefresh();
      });
  },

  getScore() {
    let token = wx.getStorageSync('token');
    app.util.ProReq('invitegift.getInvitegiftPoints', {token})
      .then(res=>{
        this.setData({
          total_points: res.data.total_points
        })
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

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  }
})