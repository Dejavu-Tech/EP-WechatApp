// eaterplanet_ecommerce/pages/position/search.js
var wcache = require('../../utils/wcache.js');
var status = require('../../utils/index.js');
var app = getApp();
Page({
  mixins: [require('../../mixin/globalMixin.js')],
  data: {
    communities: [],
    city: {
      districtName: ""
    },
    cityName: "",
    inputValue: "",
    loadMore: false,
    noResult: true,
    latitude: '',
    longitude: '',
    hasRefeshin: false,
    pageNum: 1,
    groupInfo: {
      group_name: '社区',
      owner_name: '团长'
    },
    tip: "" // 没有更多社区了 / 没有搜索到社区"
  },
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
  onLoad: function(options) {
    var that = this;
    status.setNavBgColor();
    var city = wx.getStorageSync('city');
    var shopname = wcache.get('shopname');
    if (shopname) wx.setNavigationBarTitle({
      title: shopname
    });
    status.setGroupInfo().then((groupInfo) => { that.setData({ groupInfo }) });
    that.setData({
      city: city,
      cityName: city.districtName
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },
  onInput: function(event) {
    //inputValue
    console.log(event.detail.value);
    this.setData({
      inputValue: event.detail.value
    })
  },
  subInput: function() {
    this.setData({
      pageNum: 1,
      hasRefeshin: false
    })
    this.load_gps_community_list();
  },
  load_gps_community_list: function() {
    var token = wx.getStorageSync('token');
    var latitude = wx.getStorageSync('latitude');
    var longitude = wx.getStorageSync('longitude');

    var that = this;
    var inputValue = this.data.inputValue;

    if (!that.data.hasRefeshin) {
      that.setData({
        hasRefeshin: true,
        loadMore: true
      });
      app.util.request({
        'url': 'entry/wxapp/index',
        'data': {
          controller: 'index.load_gps_community',
          token: token,
          inputValue: inputValue,
          pageNum: that.data.pageNum,
          longitude: longitude,
          latitude: latitude
        },
        dataType: 'json',
        success: function(res) {
          if (res.data.code == 0) {
            let communities = that.data.communities.concat(res.data.list);

            that.setData({
              communities: communities,
              pageNum: that.data.pageNum + 1,
              loadMore: false,
              hasRefeshin: false,
              tip: ''
            });

          } else if (res.data.code == 1) {
            //go data
            that.setData({
              loadMore: false,
              tip: '^_^已经到底了'
            })

          } else if (res.data.code == 2) {
            //no login
          }
        }
      })
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    this.load_gps_community_list();
  }
})
