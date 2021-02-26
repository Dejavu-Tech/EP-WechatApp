var app = getApp();
var util = require('../../utils/util.js');

Page({
  mixins: [require('../../mixin/cartMixin.js')],
  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    specialList: [],
    navBackUrl: '/eaterplanet_ecommerce/moduleA/special/list'
  },
  page: 1,
  noMore: false,
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
    if (options.share_id != 'undefined' && options.share_id > 0) wx.setStorageSync('share_id', options.share_id);
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
      specialList: []
    }, () => {
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
        this.setData({ needAuth: true });
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
        controller: 'marketing.get_special_page_list',
        token: token,
        head_id: cur_community.communityId,
        page: this.page
      },
      dataType: 'json',
      success: function (res) {
        wx.stopPullDownRefresh();
        wx.hideLoading();
        if (res.data.code == 0) {
          let specialList = res.data.data;
          let oldList = that.data.specialList;
          specialList = oldList.concat(specialList);
          that.page++;
          that.setData({ specialList })
        } else if(res.data.code == 1) {
          that.noMore = true;
        } else if (res.data.code == 2) {
          that.setData({ needAuth: true })
        }
      }
    })
  },

  goSpecial: function (e) {
    let id = e.currentTarget.dataset.id;
    id && wx.navigateTo({
      url: `/eaterplanet_ecommerce/moduleA/special/index?id=${id}`,
    })
  },

  openSku: function (e) {
    if (!this.authModal()) return;
    let shopidx = e.currentTarget.dataset.idx;
    let specialList = this.data.specialList;
    let rushList = specialList[shopidx].list || [];
    this.setData({ list: rushList })

    var that = this;
    let idx = e.currentTarget.dataset.gidx;
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
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.noMore = false;
    this.page = 1;
    let that = this;
    that.setData({ list: [], specialList: [] },()=>{
      that.getData();
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.noMore || this.getData();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var share_title = '活动专题列表';
    var share_id = wx.getStorageSync('member_id');
    var share_path = `eaterplanet_ecommerce/moduleA/special/list?share_id=${share_id}`;

    return {
      title: share_title,
      path: share_path,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },

  onShareTimeline: function () {
    var share_title = '活动专题列表';
    var share_id = wx.getStorageSync('member_id');

    var query= `share_id=${share_id}`;
    return {
      title: share_title,
      query,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
})
