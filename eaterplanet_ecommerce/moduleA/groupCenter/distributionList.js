var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentTab: 0,
    pageSize: 10,
    navList: [{
        name: "全部",
        status: "0"
      }, {
        name: "待确认",
        status: "1"
      }, {
        name: "已确认",
        status: "2"
      },
      {
        name: "无效",
        status: "3"
      }
    ],
    distributionList: [],
    loadText: "没有更多记录了~",
    containerHeight: 0,
    chooseDate: "",
    chooseDateTime: "",
    data: "",
    estimate: "",
    permoney: 0,
    communnityId: "",
    loadText: "",
    disUserId: "",
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
      containerHeight: sysInfo.windowHeight - Math.round(sysInfo.windowHeight / 375 * 55)
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var dayTime = new Date(),
      year = dayTime.getFullYear(),
      mon = dayTime.getMonth() + 1,
      dateTime = Date.parse(dayTime);
    this.setData({
      page: 1,
      order: [],
      chooseDate: year + "年" + mon + "月",
      chooseDateTime: dateTime
    }), this.getData();

    this.get_month_money();
  },

  get_month_money: function() {
    var chooseDate = this.data.chooseDate;
    var that = this;
    var token = wx.getStorageSync('token');
    app.util.request({
      'url': 'entry/wxapp/index',
      'data': {
        controller: 'order.order_commission',
        token: token,
        chooseDate: chooseDate
      },
      method: 'post',
      dataType: 'json',
      success: function(res) {
        if (res.data.code == 0) {
          that.setData({
            permoney: res.data.money
          })
        } else {
          that.setData({
            permoney: 0
          })
        }
      }
    })

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
    var chooseDate = this.data.chooseDate;
    var token = wx.getStorageSync('token');
    var currentTab = this.data.currentTab;

    var order_status = -1;
    if (currentTab == 0) {
      order_status = -1;
    } else if (currentTab == 1) {
      order_status = 22;
    } else if (currentTab == 2) {
      order_status = 6;
    } else if (currentTab == 3) {
      order_status = 357;
    }

    //currentTab
    app.util.request({
      'url': 'entry/wxapp/index',
      'data': {
        controller: 'order.orderlist',
        is_tuanz: 1,
        token: token,
        chooseDate: chooseDate,
        page: that.data.page,
        order_status: order_status
      },
      method: 'post',
      dataType: 'json',
      success: function(res) {
        if (res.data.code == 0) {
          console.log(that.data.page);
          let data = res.data.data;
          let rushList = that.data.order.concat(data);
          that.setData({
            order: rushList,
            hide_tip: true,
            'no_order': 0
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
   * 刷新
   */
  refresh: function() {
    this.setData({
      page: 1,
      order: [],
    }, ()=>{
      this.getData();
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  bindChange: function(t) {
    this.setData({
      currentTab: 1 * t.detail.current
    });
    this.setData({
      order: [],
      page: 1,
      no_order: 0
    }, () => {
      console.log('我变啦');
      this.getData();
    })
  },

  /**
   * 切换导航
   */
  switchNav: function(e) {
    if (this.data.currentTab === 1 * e.target.dataset.current) return false;
    this.setData({
      currentTab: 1 * e.target.dataset.current
    });
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
    this.getData();
  },

  /**
   * 监控日期改变
   */
  bindDateChange: function(t) {
    console.log("picker发送选择改变，携带值为", t.detail.value), this.setData({
      date: t.detail.value
    });
    var a = this.data.date.split("-"),
      e = Date.parse(this.data.date);
    this.setData({
      chooseDate: a[0] + "年" + a[1] + "月",
      chooseDateTime: e,
      order: [],
      page: 1,
      no_order: 0
    }), this.getData();
    this.get_month_money();
  },
  getCurrentList: function() {
    console.log(this.data.no_order);
    if (this.data.no_order == 1) return false;
    this.data.page += 1;
    this.getData();

    this.setData({
      isHideLoadMore: false
    })
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    console.log(this.data.no_order);
    if (this.data.no_order == 1) return false;
    this.data.page += 1;
    this.getData();

    this.setData({
      isHideLoadMore: false
    })
  },

  handleTipDialog: function(){
    this.setData({
      showTipDialog: !this.data.showTipDialog
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})