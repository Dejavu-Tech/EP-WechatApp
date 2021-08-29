var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tab_index: 0,
    list: [],
    info: ''
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
  onLoad: function (options) {
    let type = options.type || 0;
    this.getData();
    this.setData({
      tab_index: type
    },()=>{
      this.getList();
    })
  },
  listPage: 1,

  tabchange: function (e) {
    var index = e.currentTarget.dataset.index;
    this.listPage = 1;
    this.setData({
      list: [],
      tab_index: index,
      noMore: false,
      noData: false
    },()=>{
      this.getList();
    })
  },

  getList() {
    let _this = this;
    let token = wx.getStorageSync('token');
    let type = ['invite', 'success'];
    let data = {
      token,
      type: type[this.data.tab_index],
      page: _this.listPage
    };
    wx.showLoading();
    app.util.ProReq('invitegift.getInvitegiftRecord', data)
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

  getData() {
    wx.showLoading();
    let token = wx.getStorageSync('token');
    app.util.ProReq('invitegift.index', {token})
      .then(res=>{
        this.setData({
          info: res.data
        });
      })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

  handleTipModal(e) {
    var type = e.currentTarget.dataset.type;
    let tip = {
      wait: '被邀请人的订单在售后期内，需要等待售后期结束才能获得活动奖励',
      invalid: '被邀请人的订单在售后期内发生退款，需要被邀请人重新下单才可获得奖励',
    };
    wx.showModal({
      title: '提示',
      content: tip[type],
      showCancel: false
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    (this.data.noMore&&this.listPage!=1) || this.getList();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let { invite_order_share_title, invite_order_share_img } = this.data.info;
    let suid = wx.getStorageSync('member_id') || '';
    var community = wx.getStorageSync('community') || '';
    var community_id = community&&community.communityId;
    return {
      title: invite_order_share_title,
      path: "eaterplanet_ecommerce/pages/index/index?community_id=" + community_id + '&share_id=' + suid,
      imageUrl: invite_order_share_img,
      success: function() {},
      fail: function() {}
    };
  }
})
