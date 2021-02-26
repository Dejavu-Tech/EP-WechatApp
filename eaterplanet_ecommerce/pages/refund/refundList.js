var app = getApp()
Page({
  mixins: [require('../../mixin/globalMixin.js')],
  data: {
    containerHeight: 0,
    scrollTop: 0,
    currentTab: "0",
    navList: [{
      name: "全部",
      status: "0"
    }, {
      name: "处理中",
      status: "1"
    }, {
      name: "已退款",
      status: "2"
    }, {
      name: "已拒绝",
      status: "3"
    }],
    refundList: [],
    loading: true,
    page: 1,
    loadover: false,
    order_status: 12,
    no_order: 0,
    hide_tip: true,
    order: [],
    tip: '正在加载',
    pageNum: [1, 1, 1, 1],
    pageSize: 20,
    loadText: "没有更多订单了~",
    LoadingComplete: ["", "", "", ""]
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
    let sysInfo = wx.getSystemInfoSync();
    this.setData({
      currentTab: options.orderStatus || "0",
      containerHeight: sysInfo.windowHeight - Math.round(sysInfo.windowWidth / 375 * 55)
    });
    this.getData();
  },

  getData: function() {
    this.setData({
      isHideLoadMore: true
    })

    this.data.no_order = 1
    let that = this;
    var token = wx.getStorageSync('token');

    app.util.request({
      'url': 'entry/wxapp/index',
      'data': {
        controller: 'order.refundorderlist',
        token: token,
        currentTab: that.data.currentTab,
        page: that.data.page,
        order_status: that.data.order_status
      },
      dataType: 'json',
      success: function(res) {
        if (res.data.code == 0) {
          let rushList = that.data.order.concat(res.data.data);
          that.setData({
            order: rushList,
            hide_tip: true,
            'no_order': 0
          });
        } else {
          that.setData({
            isHideLoadMore: true
          })
          return false;
        }
      }
    })

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.setData({
      pageNum: [1, 1, 1, 1, 1],
      loading: true
    }), this.getAllList();
  },

  /**
   * 获取列表
   */
  getAllList: function() {
    var that = this;
    Promise.all([this.getDataList({
        pageNum: 1,
        status: ""
      }), this.getDataList({
        pageNum: 1,
        status: 1
      }), this.getDataList({
        pageNum: 1,
        status: 3
      }), this.getDataList({
        pageNum: 1,
        status: 4
      })])
      .then(function(res) {
        that.setData({
          loading: false
        });
        wx.stopPullDownRefresh();
      })
      .catch(function() {});
  },

  /**
   * 切换导航
   */
  switchNav: function(t) {
    this.data.currentTab !== t.currentTarget.dataset.current && this.setData({
      currentTab: t.currentTarget.dataset.current
    });
  },

  /**
   * 监控改变
   */
  bindChange: function(t) {
    console.log(t.detail.current);
    this.setData({
      no_order: 0,
      page: 1,
      order: [],
      currentTab: t.detail.current + ""
    });

    this.getData();
  },

  /**
   * 获取数据列表
   */
  getDataList: function(t) {
    let data = {
      pageNum: t.pageNum,
      pageSize: this.data.pageSize,
      status: t.status
    };
    // 请求数据
    return data;
  },

  /**
   * 售后详情
   */
  goRefund: function (t) {
    var order_id = t.currentTarget.dataset.type;
    wx.navigateTo({
      url: "/eaterplanet_ecommerce/pages/order/refunddetail?id=" + order_id
    });
  },

  /**
   * 前往订单详情
   */
  goOrder: function(t) {
    var order_id = t.currentTarget.dataset.type;
    wx.navigateTo({
      url: "/eaterplanet_ecommerce/pages/order/order?id=" + order_id
    });
  },

  /**
   * 撤销申请
   */
  cancelApplication: function(t) {
    var a = this,
      n = t.detail;
    wx.showModal({
      title: "撤销申请",
      content: "您确定要撤销本次退款申请吗？",
      success: function(t) {
        t.confirm && (0, e.default)("/shop-return-order/refund/undo", {
          returnOrderNo: n
        }).then(function(t) {
          0 === t.head.error ? (wx.showToast({
            title: "撤销成功",
            icon: "none"
          }), a.getAllList()) : (wx.showToast({
            title: "该退款申请已处理",
            icon: "none"
          }), a.getAllList());
        }).catch(function() {});
      }
    });
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  getCurrentList: function() {
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


  }
})
