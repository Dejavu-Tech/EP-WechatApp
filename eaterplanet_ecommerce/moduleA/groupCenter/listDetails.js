var app =getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isIpx: app.globalData.isIpx,
    list: [],
    state: 0,
    loadText: "加载中...",
    noData: 0,
    loadMore: true
  },
  list_id: '',
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
    let list_id = options.id || '';
    let state = options.state || 0;
    if (list_id) {
      this.setData({ state });
      wx.showLoading();
      this.list_id = list_id;
      this.getData();
    } else {
      wx.redirectTo({
        url: '/eaterplanet_ecommerce/moduleA/groupCenter/list',
      })
    }
  },

  getData: function () {
    let that = this;
    let list_id = this.list_id;
    var token = wx.getStorageSync('token');
    app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'community.get_head_deliverygoods',
        token,
        list_id,
        page: this.page
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
          that.setData({
            list,
            ...h
          })
        } else {
          // 无数据
          if (that.page == 1) that.setData({
            noData: 1
          })
          that.setData({
            loadMore: false,
            noMore: false,
            loadText: "没有更多记录了~"
          })
        }
      },
      fail: (err)=> {
        console.log(err);
        wx.hideLoading();
      }
    })
  },

  signAll: function () {
    let that = this;
    let token = wx.getStorageSync('token');
    let list_id = this.list_id;
    app.util.request({
      'url': 'entry/wxapp/index',
      'data': {
        controller: 'community.sub_head_delivery',
        token: token,
        list_id: list_id
      },
      dataType: 'json',
      success: function (res) {
        wx.hideLoading();
        console.log(res);
        if (res.data.code == 0) {
          wx.showToast({
            title: '收货成功',
            icon: false
          })
          setTimeout(()=>{
            wx.redirectTo({
              url: '/eaterplanet_ecommerce/moduleA/groupCenter/list',
            })
          }, 2000);
        } else {
          wx.showToast({
            title: '签收失败，请重试！',
            icon: false
          })
        }
      },
      fail: (err) => {
        console.log(err);
        wx.hideLoading();
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
    if (!this.data.loadMore) return false;
    this.getData();
  }
})
