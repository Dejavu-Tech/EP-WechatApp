var app = getApp();
var util = require('../../utils/util.js');

Page({
  mixins: [require('../../mixin/cartMixin.js')],
  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    supplyList: [],
    noMore: false,
    supply_diy_name: "商户"
  },
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
    app.setShareConfig();
    this.getData();
  },

  /**
   * 授权成功回调
   */
  authSuccess: function () {
    let that = this;
    this.page = 1;
    this.setData({
      needAuth: false,
      noMore: false,
      list: [],
      supplyList: []
    }, ()=>{
      that.getData();
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    util.check_login_new().then((res) => {
      if (res) {
        this.setData({ needAuth: false });
      } else {
        this.setData({ needAuth: true, navBackUrl: `/eaterplanet_ecommerce/pages/supply/index` });
      }
    })
  },

  getData: function () {
    wx.showLoading();
    var token = wx.getStorageSync('token');
    var that = this;
    var cur_community = wx.getStorageSync('community');
    app.util.request({
      'url': 'entry/wxapp/index',
      'data': {
        controller: 'supply.get_list',
        token: token,
        page: that.page,
        head_id: cur_community.communityId
      },
      dataType: 'json',
      success: function (res) {
        wx.stopPullDownRefresh();
        wx.hideLoading();
        if (that.page==1) {
          let supply_diy_name = res.data.supply_diy_name || '商户';
          wx.setNavigationBarTitle({
            title: `${supply_diy_name}列表`,
          })
          that.setData({ supply_diy_name })
        }
        if (res.data.code == 0) {
          let oldList = that.data.supplyList;
          let supplyList = oldList.concat(res.data.data);
          that.setData({ supplyList })
        } else {
          that.setData({ noMore: true })
        }
      }
    })
  },

  goDetails: function(e){
    let id = e.currentTarget.dataset.id || 0;
    id && wx.navigateTo({
      url: `/eaterplanet_ecommerce/pages/supply/home?id=${id}`,
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    let that = this;
    this.page = 1;
    this.setData({
      noMore: false,
      list: [],
      supplyList: []
    }, () => {
      that.getData();
    })
  },

  openSku: function(e) {
    if (!this.authModal()) return;
    let shopidx = e.currentTarget.dataset.shopidx;
    let supplyList = this.data.supplyList;
    let rushList = supplyList[shopidx].goods_list || [];
    this.setData({ list: rushList })

    var that = this;
    let idx = e.currentTarget.dataset.idx;
    let spuItem = rushList[idx];

    var goods_id = spuItem.actId;
    var options = spuItem.skuList;
    that.setData({
      addCar_goodsid: goods_id
    })

    let list = options.list || [];
    let arr = [];
    if (list.length > 0) {
      for (let i = 0; i < list.length; i++) {
        let sku = list[i]['option_value'][0];
        let temp = {
          name: sku['name'],
          id: sku['option_value_id'],
          index: i,
          idx: 0
        };
        arr.push(temp);
      }
      //把单价剔除出来begin

      var id = '';
      for (let i = 0; i < arr.length; i++) {
        if (i == arr.length - 1) {
          id = id + arr[i]['id'];
        } else {
          id = id + arr[i]['id'] + "_";
        }
      }
      var cur_sku_arr = options.sku_mu_list[id];
      that.setData({
        sku: arr,
        sku_val: 1,
        cur_sku_arr: cur_sku_arr,
        skuList: spuItem.skuList,
        visible: true,
        showSku: true
      });
    } else {
      let goodsInfo = spuItem;
      that.setData({
        sku: [],
        sku_val: 1,
        skuList: [],
        cur_sku_arr: goodsInfo
      })
      let formIds = {
        detail: {
          formId: ""
        }
      };
      formIds.detail.formId = "the formId is a mock one";
      that.gocarfrom(formIds);
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.data.noMore || (this.page++, this.getData());
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  onShareTimeline: function () {

  }
})
