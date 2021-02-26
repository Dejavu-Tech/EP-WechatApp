var app = getApp();
var util = require('../../utils/util.js');
var a = require("../../utils/public");
var status = require('../../utils/index.js');

Page({
  mixins: [require('../../mixin/globalMixin.js'), require('../../mixin/compoentCartMixin.js')],
  data: {
    cartNum: 0,
    showEmpty: false,
    showLoadMore: true,
    rushList: [],
    needAuth: false
  },
  pageNum: 1,
  keyword: '',
  type: 0,
  good_ids: '',
  gid: 0,
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
    wx.showLoading();
    this.keyword = options.keyword || '';
    this.type = options.type || 0;
    this.good_ids = options.good_ids || '';
    this.gid = options.gid || 0;
    this.getData();
  },

  onShow: function() {
    const that = this;
    util.check_login_new().then((res) => {
      let needAuth = !res;
      that.setData({ needAuth })
      if(res) {
        (0, status.cartNum)('', true).then((res) => {
          res.code == 0 && that.setData({
            cartNum: res.data
          })
        });
      }
    })
  },

  // 获取数据
  getData: function() {
    if (!this.hasRefeshin) {
      this.hasRefeshin = true;
      let that = this;
      that.setData({
        showLoadMore: true,
        loadMore: true,
        loadText: '加载中'
      });
      let token = wx.getStorageSync('token');
      let cur_community = wx.getStorageSync('community');
      let keyword = this.keyword;
      let type = this.type;
      let good_ids = this.good_ids;
      let gid = this.gid;
      app.util.request({
        'url': 'entry/wxapp/index',
        'data': {
          controller: 'index.load_condition_goodslist',
          token: token,
          pageNum: that.pageNum,
          head_id: cur_community.communityId,
          keyword,
          type,
          good_ids,
          gid
        },
        dataType: 'json',
        success: function(res) {
          if (res.data.code == 0) {
            let rushList = that.data.rushList.concat(res.data.list);

            let nowtime = Date.parse(new Date())/1000;
            for (var i in rushList) {
              if (rushList[i]['end_time'] < nowtime) {
                rushList[i].actEnd = true
              }
            }

            let reduction = {
              full_money: res.data.full_money,
              full_reducemoney: res.data.full_reducemoney,
              is_open_fullreduction: res.data.is_open_fullreduction
            }
            that.pageNum += 1;
            that.hasRefeshin = false;
            that.setData({
              showLoadMore: false,
              rushList,
              loadMore: false,
              cur_time: res.data.cur_time,
              reduction
            });
            if (that.data.rushList.length == 0) that.setData({
              showEmpty: true
            })
          } else if (res.data.code == 1) {
            if (that.pageNum == 1 && that.data.rushList.length == 0) that.setData({
              showEmpty: true
            })
            that.setData({
              showLoadMore: true,
              loadMore: false,
              loadText: '没有更多了'
            })
            that.hasRefeshin = true;
          } else if (res.data.code == 2) {
            //no login
            that.setData({
              needAuth: true
            })
          }
        },
        complete: function() {
          wx.hideLoading();
        }
      })
    }
  },

  /**
   * 授权成功回调
   */
  authSuccess: function() {
    const that = this;
    this.pageNum = 1;
    this.setData({
      showEmpty: false,
      showLoadMore: true,
      rushList: [],
      needAuth: false
    }, ()=>{
      that.getData();
    })
  },

  /**
   * 关闭购物车选项卡
   */
  closeSku: function() {
    this.setData({
      visible: 0,
      stopClick: false
    });
  },

  changeCartNum: function (t) {
    let that = this;
    let e = t.detail;
    (0, status.cartNum)(that.setData({
      cartNum: e
    }));
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    console.log('这是我的底线');
    this.getData();
  }
})