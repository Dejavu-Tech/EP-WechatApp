const app = getApp()
var util = require('../../utils/util.js');
var status = require('../../utils/index.js');

Page({
  mixins: [require('../../mixin/globalMixin.js')],
  data: {
    loadMore: true,
    classification: {
      menutabs: [],
      activeIndex: 0
    },
    tabTop: 0,
    showSubCate: true
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
  pageNum: 1,

  onLoad: function() {
    app.setShareConfig();
    this.getInfo();
    this._doRefreshMasonry();
  },

  onReady: function(){
    let that = this;
    const query = wx.createSelectorQuery();
    let searH = Math.round(app.globalData.systemInfo.windowWidth / 750 * 100) || 0;
    setTimeout(() => {
      query.select('#tab').boundingClientRect(function (res) {
        that.setData({ tabTop: res.top - searH });
      }).exec();
    }, 1000)
  },

  onShow: function() {
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

  onPageScroll: function (event) {
    if (event.scrollTop > this.data.tabTop) {
      if (this.data.tabFix) {
        return
      } else {
        this.setData({
          oneFixed: "Fixed"
        })
      }
    } else {
      this.setData({
        oneFixed: ''
      })
    }
  },

  noLogin: function() {
    this.setData({
      needAuth: true,
      showAuthModal: true
    })
  },

  /**
   * 授权成功回调
   */
  authSuccess: function() {
    const that = this;
    this.pageNum = 1;
    this.setData({
      loadMore: true,
      showEmpty: 0,
      needAuth: false,
      showAuthModal: false
    }, () => {
      that._doRefreshMasonry()
    })
  },

  authModal: function () {
    if (this.data.needAuth) {
      this.setData({ showAuthModal: !this.data.showAuthModal });
      return false;
    }
    return true;
  },

  /**
   * 监控分类导航
   */
  classificationChange: function (t) {
    var that = this;
    this.pageNum = 1;
    this.setData({
      loadMore: true,
      showEmpty: 0,
      "classification.activeIndex": t.detail.e,
      classificationId: t.detail.a
    }, function () {
      that._doRefreshMasonry()
    });
  },

  onPullDownRefresh: function() {
    const that = this;
    this.pageNum = 1;
    this.setData({
      loadMore: true,
      showEmpty: 0
    }, () => {
      that.getInfo();
      that._doRefreshMasonry()
    })
  },

  onReachBottom: function() {
    this.data.loadMore && this._doAppendMasonry()
  },

  _doRefreshMasonry(keyword = '') {
    let that = this;
    this.masonryListComponent = this.selectComponent('#masonry');
    this.getData(keyword).then(res => {
      that.masonryListComponent.start(res).then(() => {})
    }).catch(()=>{
      that.masonryListComponent.start([]).then(() => {})
    })
  },

  _doAppendMasonry() {
    let that = this;
    this.masonryListComponent = this.selectComponent('#masonry')
    // 获取接口数据后使用瀑布流组件append方法，当append完成后调用then，是否可触底价在的标志位可以在这里处理
    this.getData().then(res => {
      that.masonryListComponent.append(res).then(() => {
        console.log('refresh completed')
      })
    }).catch(() => {
      console.log('没有更多了')
    })
  },

  /**
   * 获取列表
   */
  getData: function(keyword = '') {
    return new Promise((resolve, reject) => {
      let that = this;
      let token = wx.getStorageSync('token');
      let gid = that.data.classificationId;

      wx.showLoading();
      app.util.request({
        'url': 'entry/wxapp/index',
        'data': {
          controller: 'recipe.get_recipe_list',
          token: token,
          gid,
          pageNum: this.pageNum,
          keyword
        },
        dataType: 'json',
        success: function(res) {
          wx.stopPullDownRefresh();
          if (res.data.code == 0) {
            let list = res.data.data;
            that.pageNum++;
            resolve(list);
          } else {
            // 无数据
            let h = {
              loadMore: false
            }
            if (that.pageNum == 1) h.showEmpty = 1;
            that.setData(h);
            reject('');
          }
          wx.hideLoading();
        }
      })
    })
  },

  /**
   * 获取信息
   */
  getInfo: function() {
    let that = this;
    let token = wx.getStorageSync('token');

    wx.showLoading();
    app.util.request({
      'url': 'entry/wxapp/index',
      'data': {
        controller: 'recipe.get_index_info'
      },
      dataType: 'json',
      success: function(res) {
        if (res.data.code) {
          let {
            adv_arr,
            cate_list,
            is_open_recipe,
            modify_recipe_name,
            modify_recipe_share_title,
            modify_vipcard_share_image
          } = res.data.code;
          if (is_open_recipe != 1) {
            app.util.message('未开启功能', 'switchTo:/eaterplanet_ecommerce/pages/index/index', 'error');
            return;
          }

          wx.setNavigationBarTitle({
            title: modify_recipe_name || '菜谱'
          })

          // 菜单
          let params = {
            classification: {
              activeIndex: 0
            }
          };
          let index_type_first_name = '全部';
          if (cate_list.length > 0) {
            cate_list.unshift({
              name: index_type_first_name,
              id: 0
            })
            params.isShowClassification = true;
            params.classification.tabs = cate_list;
          } else {
            params.isShowClassification = false;
          }

          that.setData({
            adv_arr: adv_arr || [],
            modify_recipe_share_title,
            modify_vipcard_share_image,
            modify_recipe_name,
            ...params
          })
        }
        wx.hideLoading();
      }
    })
  },

  /**
   * 搜索
   */
  goResult: function(e) {
    let that = this;
    let keyword = e.detail.value.replace(/\s+/g, '');
    if (!keyword) {
      wx.showToast({
        title: '请输入关键词',
        icon: 'none'
      })
      return;
    }
    this.pageNum = 1;
    this.setData({
      loadMore: true,
      showEmpty: 0
    }, () => {
      that._doRefreshMasonry(keyword);
    })
  },

  /**
   * 幻灯片跳转
   */
  goBannerUrl: function(t) {
    let idx = t.currentTarget.dataset.idx;
    let {
      adv_arr,
      needAuth
    } = this.data;
    if (adv_arr.length > 0) {
      let url = adv_arr[idx].link;
      let type = adv_arr[idx].linktype;
      if (util.checkRedirectTo(url, needAuth)) {
        this.authModal();
        return;
      }
      if (type == 0) {
        // 跳转webview
        url && wx.navigateTo({
          url: '/eaterplanet_ecommerce/pages/web-view?url=' + encodeURIComponent(url)
        })
      } else if (type == 1) {
        if (url.indexOf('eaterplanet_ecommerce/pages/index/index') != -1 || url.indexOf('eaterplanet_ecommerce/pages/order/shopCart') != -1 || url.indexOf('eaterplanet_ecommerce/pages/user/me') != -1 || url.indexOf('eaterplanet_ecommerce/pages/type/index') != -1) {
          url && wx.switchTab({
            url: url
          })
        } else {
          url && wx.navigateTo({
            url: url
          })
        }

      } else if (type == 2) {
        // 跳转小程序
        let appid = slider_list[idx].appid;
        appid && wx.navigateToMiniProgram({
          appId: slider_list[idx].appid,
          path: url,
          extraData: {},
          envVersion: 'release',
          success(res) {
            // 打开成功
          },
          fail(error) {
            console.log(error)
          }
        })
      }
    }
  },

  goLink: function (event) {
    if (!this.authModal()) return;
    let link = event.currentTarget.dataset.link;
    var pages_all = getCurrentPages();
    if (pages_all.length > 3) {
      wx.redirectTo({
        url: link
      })
    } else {
      wx.navigateTo({
        url: link
      })
    }
  },

  onShareAppMessage: function() {
    var member_id = wx.getStorageSync('member_id');
    let {
      modify_recipe_share_title,
      modify_vipcard_share_image,
      modify_recipe_name
    } = this.data;
    return {
      title: modify_recipe_share_title || modify_recipe_name,
      path: "eaterplanet_ecommerce/moduleA/menu/index?share_id=" + member_id,
      imageUrl: modify_vipcard_share_image,
      success: function() {},
      fail: function() {}
    };
  },

  onShareTimeline: function() {
    var member_id = wx.getStorageSync('member_id');
    let {
      modify_recipe_share_title,
      modify_vipcard_share_image,
      modify_recipe_name
    } = this.data;
    var query= `share_id=${member_id}`;

    return {
      title: modify_recipe_share_title || modify_recipe_name,
      query,
      imageUrl: modify_vipcard_share_image,
      success: function() {},
      fail: function() {}
    };
  }

})
