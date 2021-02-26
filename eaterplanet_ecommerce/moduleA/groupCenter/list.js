var page = 1;
var app= getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    needAuth: false,
    isHideLoadMore: true,
    loadText: '正在加载',
    list: [],
    queryData: {
      createTime: null,
      communityId: null,
      page: page,
      pageSize: 20
    },
    status: ['待配送', '配送中', '已送达团长'],
    page: 1,
    searchKey: ""
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
    this.data.queryData.createTime = null;
    this.getData();
  },

  /**
   * 获取数据
   */
  getData: function () {
    wx.showLoading({
      title: "加载中...",
      mask: true
    });

    this.setData({
      isHideLoadMore: true
    })

    this.data.no_list = 1
    let that = this;
    var token = wx.getStorageSync('token');
    app.util.request({
      'url': 'entry/wxapp/index',
      'data': {
        controller: 'community.get_head_deliverylist',
        date: that.data.date,
        searchKey: that.data.searchKey,
        token: token,
        page: that.data.page
      },
      dataType: 'json',
      success: function (res) {
        if (res.data.code == 0) {
          console.log(that.data.page);
          let rushList = that.data.list.concat(res.data.data);
          that.setData({
            list: rushList,
            hide_tip: true,
            no_list: 0
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
   * 监控输入框
   */
  bindSearchChange: function (e) {
    this.setData({
      searchKey: e.detail.value
    });
  },

  /**
   * 搜索
   */
  searchByKey: function () {
    page = 1;
    this.setData({
      list: [],
      no_list: 0,
      page: 1
    });
    this.data.queryData.memberNickName = this.data.searchKey;
    this.getData();
  },

  /**
   * 取消
   */
  cancel: function () {
    page = 1;
    this.setData({
      searchKey: "",
      list: []
    });
    this.data.queryData.memberNickName = null;
    this.getData();
  },

  /**
   * 监控日期
   */
  bindDateChange: function (e) {
    page = 1;
    this.setData({
      date: e.detail.value,
      list: [],
      no_list: 0,
      page: 1
    });
    this.data.queryData.createTime = new Date(e.detail.value).getTime() - 28800000;
    this.getData();
  },

  /**
   * 清除日期
   */
  clearDate: function () {
    page = 1;
    this.setData({
      date: "",
      list: [],
      no_list: 0,
      page: 1
    });
    this.data.queryData.createTime = null;
    this.getData();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 拨打电话
   */
  callTelphone: function (e) {
    var that = this;
    var phoneNumber = e.currentTarget.dataset.phone;
    if (phoneNumber != "未下单") {
      this.data.isCalling || (this.data.isCalling = true, wx.makePhoneCall({
        phoneNumber: phoneNumber,
        complete: function () {
          that.data.isCalling = false;
        }
      }));
    }
  },

  /**
   * 授权成功回调
   */
  authSuccess: function () {
    // todo
  },

  /**
   * 跳转详情
   */
  goDetails: function (e) {
    let state = e.currentTarget.dataset.state;
    let list_id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/eaterplanet_ecommerce/moduleA/groupCenter/listDetails?id=' + list_id + '&state=' + state,
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

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
    if (this.data.no_list == 1) return false;
    this.data.page += 1;
    this.getData();

    this.setData({
      isHideLoadMore: false
    })
  }
})
