var page = 1;
var app = getApp();
var timeFormat = require("../../utils/timeFormat");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isCalling: false,
    queryData: {
      createTime: null,
      communityId: null,
      order: [],
      page: page,
      pageSize: 20
    },
    maxDate: (0, timeFormat.formatYMD)(new Date()),
    searchKey: "",
    date: "",
    containerHeight: 0, 
    showLoadMore: false,
    no_order: 0,
    page: 1,
    hide_tip: true,
    order: [],
    tip: '正在加载',
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
    var sysInfo = wx.getSystemInfoSync();
    this.setData({
      containerHeight: sysInfo.windowHeight - Math.round(sysInfo.windowWidth / 375 * 125)
    });
    page = 1;
    this.data.queryData.communityId = app.globalData.disUserInfo.communityId;
    this.data.queryData.createTime = null;

    this.getData();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var is_show_on = this.data.is_show_on;
    if (is_show_on > 0) {
      this.setData({
        page: 1,
        order: []
      })
      this.getData();
    } else {
      this.setData({
        is_show_on: is_show_on + 1
      })
    }

  },

  /**
   * 获取数据
   */
  getData: function() {
    wx.showLoading({
      title: "加载中...",
      mask: true
    });

    this.setData({
      isHideLoadMore: true
    })

    this.data.no_order = 1
    let that = this;
    var token = wx.getStorageSync('token');
    //currentTab
    app.util.request({
      'url': 'entry/wxapp/index',
      'data': {
        controller: 'community.get_community_member_orderlist',
        date: that.data.date,
        searchKey: that.data.searchKey,
        token: token,
        page: that.data.page
      },
      dataType: 'json',
      success: function(res) {
        if (res.data.code == 0) {
          let close_community_delivery_orders = res.data.close_community_delivery_orders || 0;
          let rushList = that.data.order.concat(res.data.data);

          that.setData({
            order: rushList,
            hide_tip: true,
            no_order: 0,
            close_community_delivery_orders
          });
          wx.hideLoading();
        } else {
          that.setData({
            isHideLoadMore: true
          })
          wx.hideLoading();
          return false;
        }

      }
    })

  },

  /**
   * 获取时间
   */
  getTodayMs: function() {
    var t = new Date();
    return t.setHours(0), t.setMinutes(0), t.setSeconds(0), t.setMilliseconds(0), Date.parse(t);
  },

  /**
   * 监控输入框
   */
  bindSearchChange: function(e) {
    this.setData({
      searchKey: e.detail.value
    });
  },

  /**
   * 搜索
   */
  searchByKey: function() {
    page = 1;
    this.setData({
      order: [],
      no_order: 0,
      page: 1
    });
    this.data.queryData.memberNickName = this.data.searchKey;
    this.getData();
  },

  /**
   * 取消
   */
  cancel: function() {
    page = 1;
    this.setData({
      searchKey: "",
      order: []
    });
    this.data.queryData.memberNickName = null;
    this.getData();
  },

  /**
   * 监控日期
   */
  bindDateChange: function(e) {
    page = 1;
    this.setData({
      date: e.detail.value,
      order: [],
      no_order: 0,
      page: 1
    });
    this.data.queryData.createTime = new Date(e.detail.value).getTime() - 28800000;
    this.getData();
  },

  /**
   * 清除日期
   */
  clearDate: function() {
    page = 1;
    this.setData({
      date: "",
      order: [],
      no_order: 0,
      page: 1
    });
    this.data.queryData.createTime = null;
    this.getData();
  },

  /**
   * 拨打电话
   */
  callTelphone: function(e) {
    var that = this;
    var phoneNumber = e.currentTarget.dataset.phone;
    if (phoneNumber!="未下单"){
      this.data.isCalling || (this.data.isCalling = true, wx.makePhoneCall({
        phoneNumber: phoneNumber,
        complete: function() {
          that.data.isCalling = false;
        }
      }));
    }
  },

  /**
   * 获取更多
   */
  getMore: function() {
    if (this.data.no_order == 1) return false;
    this.data.page += 1;
    this.getData();

    this.setData({
      isHideLoadMore: false
    })
  },

  goLink: function (e) {
    let close_community_delivery_orders = this.data.close_community_delivery_orders;
    if (close_community_delivery_orders!=1) {
      var pages_all = getCurrentPages();
      var url = e.currentTarget.dataset.link;
      if (pages_all.length > 3) {
        wx.redirectTo({ url })
      } else {
        wx.navigateTo({ url })
      }
    }
  },
})