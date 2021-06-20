var app = getApp();
var util = require('../../utils/util.js');
var status = require('../../utils/index.js');

Page({
  mixins: [require('../../mixin/compoentCartMixin.js')],
  data: {
    classification: {
      tabs: [],
      activeIndex: 0
    },
    rushList: [],
    loadMore: true,
    loadText: "加载中...",
    loadOver: false,
    showEmpty: false,
    is_show_vipgoods: 1
  },
  pageNum:1,
  canLoad: 1,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    status.setNavBgColor();
    this.getData();
    this.getList();
  },

  /**
  * 授权成功回调
  */
  authSuccess: function () {
    let that = this;
    wx.showLoading();
    this.pageNum = 1;
    that.setData({
      needAuth: false,
      showAuthModal: false,
      classification: {
        tabs: [],
        activeIndex: 0
      },
      rushList: [],
      loadMore: true,
      loadText: "加载中...",
      loadOver: false,
      showEmpty: false
    });
  },

  /**
 * 授权成功回调
 */
  authSuccess: function () {
    let url = '/eaterplanet_ecommerce/moduleA/vip/upgrade';
    app.globalData.navBackUrl = url;
    wx.redirectTo({ url })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    util.check_login_new().then((res) => {
      if (!res) {
        that.setData({
          needAuth: true
        })
      } else {
        this.setData({ needAuth: false });
        (0, status.cartNum)('', true).then((res) => {
          res.code == 0 && that.setData({ cartNum: res.data })
        });
      }
    })
  },

  getData: function(){
    wx.showLoading();
    var token = wx.getStorageSync('token');
    let that = this;
    app.util.request({
      'url': 'entry/wxapp/user',
      'data': {
        controller: 'vipcard.get_vipcard_baseinfo',
        token: token
      },
      dataType: 'json',
      success: function (res) {
        wx.hideLoading();
        if (res.data.code == 0) {
          let {
            member_info,
            card_equity_list,
            card_list,
            is_open_vipcard_buy,
            modify_vipcard_name,
            is_vip_card_member,
            vipcard_unopen_headbg,
            vipcard_effect_headbg,
            vipcard_afterefect_headbg,
            vipcard_buy_pagenotice,
            vipcard_equity_notice,
            is_show_vipgoods,
            category_list
            // del_vip_day
          } = res.data.data;
          wx.setNavigationBarTitle({ title: modify_vipcard_name || '会员中心' })

          let params = {
            classification: {}
          };
          category_list = category_list || [];
          if (category_list.length > 0) {
            category_list.unshift({
              name: '全部',
              id: 0
            })
            params.isShowClassification = true;
            params.classification.tabs = category_list;
          } else {
            params.isShowClassification = false;
          }

          card_list.map(item=>{
            let expire_day = item.expire_day.split('.');
            return item.expire_day = expire_day[0];
          })

          that.setData({
            member_info,
            card_equity_list,
            card_list,
            is_open_vipcard_buy,
            modify_vipcard_name,
            is_vip_card_member,
            vipcard_unopen_headbg,
            vipcard_effect_headbg,
            vipcard_afterefect_headbg,
            vipcard_equity_notice,
            del_vip_day: res.data.del_vip_day || '',
            is_show_vipgoods,
            ...params
          })
        } else {
          app.util.message('未登录', 'switchTo:/eaterplanet_ecommerce/pages/user/me', 'error');
        }
      }
    })
  },

  choosecard: function (t) {
    this.setData({
      selectid: t.currentTarget.dataset.id
    });
  },

  submitpay: function (t) {
    if (wx.getStorageSync("token")) {
      var rech_id = this.data.selectid, token = wx.getStorageSync("token");
      if (void 0 == rech_id) return wx.showToast({
        icon: "none",
        title: "请选择要开通的会员类型"
      });
      app.util.request({
        url: "entry/wxapp/user",
        data: {
          controller: "vipcard.wxcharge",
          token,
          rech_id
        },
        dataType: "json",
        success: function (res) {
          if(res.data.is_zero_pay==1) {
            wx.showToast({
              title: "支付成功",
              icon: "none",
              duration: 2000,
              success: function () {
                setTimeout(function () {
                  wx.redirectTo({
                    url: "/eaterplanet_ecommerce/moduleA/vip/upgrade"
                  });
                }, 2000);
              }
            });
          } else {
            wx.requestPayment({
              appId: res.data.appId,
              timeStamp: res.data.timeStamp,
              nonceStr: res.data.nonceStr,
              package: res.data.package,
              signType: res.data.signType,
              paySign: res.data.paySign,
              success: function (wxres) {
                wx.showToast({
                  title: "支付成功",
                  icon: "none",
                  duration: 2000,
                  success: function () {
                    setTimeout(function () {
                      wx.redirectTo({
                        url: "/eaterplanet_ecommerce/moduleA/vip/upgrade"
                      });
                    }, 2000);
                  }
                });
              },
              fail: function (error) {
                wx.showToast({
                  icon: "none",
                  title: "支付失败，请重试！"
                });
              }
            })
          }
        }
      });
    } else{
      this.setData({
        needAuth: true
      });
    }
  },

  /**
 * 监控分类导航
 */
  classificationChange: function (t) {
    wx.showLoading();
    var that = this;
    this.pageNum = 1;
    this.canLoad = 1;
    this.setData({
      rushList: [],
      loadMore: true,
      loadText: "加载中...",
      loadOver: false,
      showEmpty: false,
      "classification.activeIndex": t.detail.e,
      classificationId: t.detail.a
    }, function () {
      that.getList();
    });
  },

  /**
   * 获取商品列表
   */
  getList: function () {
    let that = this;
    let token = wx.getStorageSync('token');
    let gid = that.data.classificationId;
    let community = wx.getStorageSync('community');
    let head_id = community.communityId || 0;

    this.canLoad==1 && (that.canLoad=0), app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'vipcard.get_vipgoods_list',
        pageNum: this.pageNum,
        gid,
        token,
        head_id
      },
      dataType: 'json',
      success: function (res) {
        wx.hideLoading();
        wx.stopPullDownRefresh();
        if (res.data.code == 0) {
          let oldRushList = that.data.rushList;
          let h = {}, list = res.data.list;
          if (that.pageNum == 1 && list.length == 0) h.showEmpty = true;
          if(list.length < 10) h.loadMore = false;
          let rushList = oldRushList.concat(list);
          let rdata = res.data;
          let reduction = { full_money: rdata.full_money, full_reducemoney: rdata.full_reducemoney, is_open_fullreduction: rdata.is_open_fullreduction }
          h.rushList = rushList;
          h.reduction = reduction;
          h.loadOver = true;
          h.loadText = that.data.loadMore ? "加载中..." : "没有更多商品了~";
          console.log(h)
          that.setData(h, function () {
            that.pageNum += 1;
          })
        } else if (res.data.code == 1) {
          let s = { loadMore: false }
          if (that.pageNum == 1) s.showEmpty = true;
          that.setData(s);
        } else if (res.data.code == 2) {
          //no login
          that.setData({ needAuth: true })
        }
        console.log('that.canLoad', that.canLoad);
        that.canLoad=1;
      }
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log('这是我的底线', this.canLoad);
    this.data.loadMore && (this.canLoad==1) && (this.setData({ loadOver: false }), this.getList());
  }
})
