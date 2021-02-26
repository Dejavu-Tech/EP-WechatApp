var app = getApp();
var util = require('../../utils/util.js');
var status = require('../../utils/index.js');

Page({
  mixins: [require('../../mixin/globalMixin.js'), require('../../mixin/compoentCartMixin.js')],
  data: {
    loadMore: true,
    loadText: "加载中...",
    rushList: [],
    cartNum: 0,
    showEmpty: false,
    theme: 0
  },
  $data: {
    id: 0,
    pageNum: 1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    status.setNavBgColor();
    let id = options.id || '';
    this.$data.id = id;
    if (id) {
     this.getData();
    } else {
      wx.showToast({
        title: '参数错误',
        icon: 'none'
      }, ()=>{
        wx.switchTab({
          url: '/eaterplanet_ecommerce/pages/index/index',
        })
      })
    }
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
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    const that = this;
    util.check_login_new().then((res) => {
      let needAuth = !res;
      that.setData({ needAuth })
      if (res) {
        (0, status.cartNum)('', true).then((res) => {
          res.code == 0 && that.setData({
            cartNum: res.data
          })
        });
      }
    })
  },

  /**
 * 授权成功回调
 */
  authSuccess: function () {
    const that = this;
    this.$data.pageNum = 1;
    this.setData({
      loadMore: true,
      loadText: "加载中...",
      rushList: [],
      showEmpty: false,
      needAuth: false
    }, () => {
      that.getData();
    })
  },

  getData: function () {
    let that = this;
    return new Promise(function (resolve, reject) {
      let token = wx.getStorageSync('token');
      let cur_community = wx.getStorageSync('community');
      let gid = that.$data.id;
      wx.showLoading();
      app.util.request({
        url: 'entry/wxapp/index',
        data: {
          controller: 'index.load_cate_goodslist',
          token: token,
          head_id: cur_community.communityId,
          gid
        },
        dataType: 'json',
        success: function (res) {
          wx.hideLoading();
          if (res.data.code == 0) {
            let { full_money, full_reducemoney, is_open_fullreduction, list, is_show_cate_tabbar, user_service_switch, theme } = res.data;
            let reduction = { full_money, full_reducemoney, is_open_fullreduction };
            let rushList = that.data.rushList.concat(list);

            var h = {
              rushList: rushList,
              pageEmpty: false,
              reduction,
              loadOver: true,
              is_show_cate_tabbar,
              user_service_switch,
              theme
            };
            if (list.length==0) {
              h.showEmpty = true;
            }
            
            wx.setNavigationBarTitle({ title: list.length && list[0].cate_info['name'] || '' });
            h.loadText = that.data.loadMore ? "加载中..." : "没有更多商品了~";
            that.setData(h, function () {
              that.$data.pageNum += 1;
            })
          } else if (res.data.code == 1) {
            wx.showModal({
              title: '提示',
              content: res.data.msg || '无数据',
              showCancel: false,
              success(){
                wx.navigateBack();
              }
            })
          }
          resolve(res);
        }
      })
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
  onReachBottom: function () {
    console.log('这是我的底线');
    // this.data.loadMore && (this.setData({ loadOver: false }),this.getData());
  },

  loadImgFail: function(event) {
    console.log(event)
    this.setData({
      hideErrorImg: true
    })
  },

  onShareAppMessage: function (res) {
    let rushList = this.data.rushList;
    let cate_info = rushList && rushList[0].cate_info;
    var share_title = (cate_info && cate_info.name) || '分类列表';
    var share_id = wx.getStorageSync('member_id');
    var id = this.$data.id;
    var share_path = `eaterplanet_ecommerce/pages/type/details?id=${id}&share_id=${share_id}`;

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
  }
})
