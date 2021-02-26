var app = getApp();
var util = require('../../utils/util.js');
var status = require('../../utils/index.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    distributeInfo: {},
    list: [],
    stateName: ["未结算", "已结算", "已取消"],
    typeName: { commiss: "订单分佣", tuijian: "推荐下级奖励" },
    noData: 0,
    tip: '加载中',
    isHideLoadMore: true
  },
  page: 1,
  hasMore: true,
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
    let that = this;
    let commiss_diy_name = wx.getStorageSync('commiss_diy_name') || '分销';
    status.setGroupInfo().then((groupInfo) => {
      let owner_name = groupInfo && groupInfo.owner_name || '团长';
      wx.setNavigationBarTitle({
        title: owner_name + commiss_diy_name,
      })
      that.setData({ groupInfo })
    });
    this.setData({ commiss_diy_name })

    if (!util.check_login()) {
      wx.reLaunch({
        url: '/eaterplanet_ecommerce/pages/user/me',
      })
    }
    wx.showLoading();
    this.getList();
  },

  getData(){
    var token = wx.getStorageSync('token');
    var that = this;
    app.util.request({
      'url': 'entry/wxapp/user',
      'data': {
        controller: 'community.get_head_distribute_info',
        token: token
      },
      dataType: 'json',
      success: function (res) {
        wx.hideLoading();
        if (res.data.code == 0) {
          that.setData({
            distributeInfo: res.data.data
          })
        } else {
          wx.reLaunch({
            url: '/eaterplanet_ecommerce/pages/user/me',
          })
        }
      }
    })
  },

  getList() {
    var token = wx.getStorageSync('token');
    var that = this;
    if(!that.hasMore) { return; }
    this.setData({ isHideLoadMore: false })
    app.util.request({
      'url': 'entry/wxapp/user',
      'data': {
        controller: 'community.get_head_distribute_order',
        token: token,
        page: that.page,
        type: '',
        level: ''
      },
      dataType: 'json',
      success: function (res) {
        if (res.data.code == 0) {
          let oldList = that.data.list;
          let list = oldList.concat(res.data.data);
          that.setData({ list, isHideLoadMore: true })
        } else {
          if (that.data.list.length==0 && that.page==1) that.setData({ noData: 1 })
          that.hasMore = false;
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getData();
    console.log(this.page)
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
    this.page++;
    this.getList();
  }
})
