var app = getApp();

Page({
  mixins: [require('static/orderMixin.js')],
  data: {
    placeholdeImg: app.globalData.placeholdeImg,
    navList: [{
        name: "全部",
        status: "-1"
      }, {
        name: "待发货",
        status: "1"
      }, {
        name: "配送中",
        status: "14"
      }, {
        name: "待收货",
        status: "4"
      }, {
        name: "待付款",
        status: "3"
      }
    ],
    currentTab: -1,
    list: [],
    loadText: "加载中...",
    noData: 0,
    loadMore: true
  },
  page: 1,
  keyword: '',
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
  onLoad: function (options) {
    let currentTab = options.status || -1;
    this.setData({
      currentTab
    })
  },

  onShow: function () {
    this.initFn();
  },

  initFn: function(keyword=''){
    if(typeof keyword !=='string') keyword='';
    this.page = 1;
    this.keyword = keyword;
    this.setData({
      list: [],
      loadText: "加载中...",
      noData: 0,
      loadMore: true,
      showRaderList: false
    },()=>{
      this.getData();
    })
  },

  /**
   * 切换导航
   */
  switchNav: function (e) {
    let that = this;
    if (this.data.currentTab === 1 * e.target.dataset.current) return false;
    this.setData({
      currentTab: 1 * e.target.dataset.current
    }, ()=>{
      that.initFn();
    });
  },

  goResult: function(e) {
    let keyword = e.detail.value.replace(/\s+/g, '');
    // if (!keyword) {
    //   wx.showToast({
    //     title: '请输入关键词',
    //     icon: 'none'
    //   })
    //   return;
    // }
    this.initFn(keyword);
  },

  getData: function () {
    let that = this;
    let token = wx.getStorageSync('token');
    let order_status = this.data.currentTab;
    let keyword = this.keyword;

    wx.showLoading();
    app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'order.orderlist',
        token,
        is_supply: 1,
        order_status,
        page: this.page,
        keyword
      },
      dataType: 'json',
      success: function (res) {
        if (res.data.code == 0) {
          let h = {};
          let list = res.data.data;
          if (list.length < 10) h.noMore = true;
          let oldList = that.data.list;
          list = oldList.concat(list);
          that.page++;
          that.setData({ list, ...h })
        } else if(res.data.code==2) {
          app.util.message(res.data.msg, 'switchTo:/eaterplanet_ecommerce/pages/user/me', 'error');
        } else {
          let h = {};
          if(that.page==1) h.noData = 1;
          h.loadMore = false;
          h.noMore = false;
          h.loadText = "没有更多记录了~";
          that.setData( h )
        }
        wx.hideLoading();
      }
    })
  },

  callPhone: function(e){
    var phoneNumber = e.currentTarget.dataset.phone;
    phoneNumber && wx.makePhoneCall({
      phoneNumber: phoneNumber
    });
  },

  hideExpModal: function(){
    this.setData({
      showExpModal: false
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
