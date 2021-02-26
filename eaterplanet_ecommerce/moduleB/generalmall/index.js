const height = wx.getSystemInfoSync().windowHeight
var util = require('../../utils/util.js');
var status = require('../../utils/index.js');
var countDownInit = require("../../utils/countDown");
var a = require("../../utils/public");
var app = getApp();
let globalData = getApp().globalData
const key = globalData.key
let SYSTEMINFO = globalData.systeminfo
Page({
  mixins: [countDownInit.default, require('../../mixin/globalMixin.js')],
  data: {
    classification: {
      tabs: [],
      activeIndex: -1
    },
    rushList: [],
            statusBarHeight: app.globalData.statusBarHeight + 44 + 'px',
        searchBarHeight: app.globalData.statusBarHeight + 'px',
      rushboxHeight: app.globalData.statusBarHeight + 200 + 'px',
    pageNum: 1
    
  },
  $data: {
          statusBarHeight: app.globalData.statusBarHeight + 44,
        top: 0,
    stickyFlag: false,
    scrollTop: 0,
    overPageNum: 1,
    loadOver: false,
    hasOverGoods: false,
    countDownMap: {},
    actEndMap: {},
    timer: {},
    scrollHeight: 1300,
    stickyTop: 0,
  },

  /**
   * is_only_express
   */
  onLoad: function (options) {
    app.setShareConfig();
    let that = this;
    status.setNavBgColor();
    status.setGroupInfo().then((groupInfo) => {
      that.setData({
        groupInfo
      })
    });
  },

  loadPage: function () {
    wx.showLoading();
    this.hasRefeshin = false;
    this.$data = {
      ...this.$data,
      ...{
        overPageNum: 1,
        loadOver: false,
        hasOverGoods: false,
        countDownMap: {},
        actEndMap: {},
        timer: {},
        hasCommingGoods: true
      }
    }
    this.setData({
      rushList: [],
      pageNum: 1
    }, ()=>{
      this.getIndexInfo();
      this.load_goods_data();
    })
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
        (0, status.cartNum)('', true).then((res) => {
          that.setData({
            cartNum: res.data
          })
        });
      }
    })
    this.loadPage();
  },

  /**
   * 监控滚动事件
   */
  onPageScroll: function (t) {
    if (!this.$data.isLoadData) {
      if (t.scrollTop < this.$data.scrollHeight) {
        if (t.scrollTop > this.$data.scrollTop) {
          "down" !== this.data.scrollDirect && this.setData({
            scrollDirect: "down"
          })
        } else {
          "up" != this.data.scrollDirect && this.setData({
            scrollDirect: "up"
          })
        }
      } else {
        "down" !== this.data.scrollDirect && this.setData({
          scrollDirect: "down"
        })
      }
      if (t.scrollTop > this.$data.stickyTop) {
        this.data.isSticky || (this.setData({
          isSticky: true
        }), this.$data.stickyFlag = true)
      } else {
        t.scrollTop < this.$data.stickyBackTop && this.data.isSticky && (this.setData({
          isSticky: false
        }), this.$data.stickyFlag = false)
      }
      this.$data.scrollTop = t.scrollTop
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.loadPage();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.load_goods_data();
  },

  authModal: function (e = {}) {
    let needAuth = (e && e.detail) || this.data.needAuth;
    if (this.data.needAuth || e.detail) {
      this.setData({
        showAuthModal: !this.data.showAuthModal,
        needAuth
      });
      return false;
    }
    return true;
  },

  /**
   * 授权成功回调
   */
  authSuccess: function () {
    this.setData({
      needAuth: false
    })
    this.loadPage();
  },

  /**
   * 导航小图标
   */
  getIndexInfo: function () {
    let that = this;
    app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'generalmall.get_index_info'
      },
      dataType: 'json',
      success: function (res) {
        if (res.data.code == 0) {
          let {
            navigat_list,
            slider_list,
            category_list,
            shoname,
            index_type_first_name,
            theme,
            index_list_top_image,
            showTabbar,
            is_show_list_timer,
            is_show_list_count
          } = res.data.data;
          wx.setNavigationBarTitle({
            title: shoname
          });

          let navigatEmpty = [];
          if (navigat_list.length > 0) {
            let len = (5 - navigat_list.length % 5) || 0;
            if (len < 5 && len > 0) navigatEmpty = new Array(len);
          }

          let h = {
            classification: {
              tabs: ''
            }
          };
          h.index_type_first_name = index_type_first_name || '全部';
          if (category_list.length > 0) {
            category_list.unshift({
              name: index_type_first_name || '全部',
              id: 0
            })
            h.isShowClassification = true;
            h.classification.tabs = category_list;
          } else {
            h.isShowClassification = false;
          }

          that.setData({
            navigat: navigat_list,
            navigatEmpty,
            slider_list,
            theme,
            index_list_top_image,
            showTabbar,
            isShowListTimer: is_show_list_timer,
            isShowListCount: is_show_list_count,
            ...h
          })
        }
      }
    })
  },

  /**
   * 幻灯片跳转
   */
  goBannerUrl: function (t) {
    let idx = t.currentTarget.dataset.idx;
    let {
      slider_list,
      needAuth
    } = this.data;
    if (slider_list.length > 0) {
      let url = slider_list[idx].link;
      let type = slider_list[idx].linktype;
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

  /**
   * 导航图标跳转
   */
  goNavUrl: function (t) {
    let idx = t.currentTarget.dataset.idx;
    let {
      navigat,
      needAuth
    } = this.data;
    if (navigat.length > 0) {
      let url = navigat[idx].link;
      let type = navigat[idx].type;
      if (util.checkRedirectTo(url, needAuth)) {
        this.authModal();
        return;
      }
      if (type == 0) {
        // 跳转webview
        wx.navigateTo({
          url: '/eaterplanet_ecommerce/pages/web-view?url=' + encodeURIComponent(url),
        })
      } else if (type == 1) {
        if (url.indexOf('eaterplanet_ecommerce/pages/index/index') != -1 || url.indexOf('eaterplanet_ecommerce/pages/order/shopCart') != -1 || url.indexOf('eaterplanet_ecommerce/pages/user/me') != -1 || url.indexOf('eaterplanet_ecommerce/pages/type/index') != -1) {
          wx.switchTab({
            url: url
          })
        } else {
          wx.navigateTo({
            url: url
          })
        }

      } else if (type == 2) {
        // 跳转小程序
        let appid = navigat[idx].appid;
        appid && wx.navigateToMiniProgram({
          appId: navigat[idx].appid,
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
      } else if (type == 3) {
        //首页分类
        let classification = this.data.classification;
        let tabs = classification && classification.tabs;
        let cid = url;
        let activeIdx = tabs.findIndex((p) => {
          return p.id == cid
        });
        if (activeIdx != -1) {
          let cateInfo = {
            detail: {
              e: activeIdx,
              a: cid
            }
          };
          this.classificationChange(cateInfo);
        }
      } else if (type == 4) {
        //独立分类
        app.globalData.typeCateId = url;
        wx.switchTab({
          url: '/eaterplanet_ecommerce/pages/type/index'
        })
      }
    }
  },

  /**
   * 监控分类导航
   */
  classificationChange: function (t) {
    wx.showLoading();
    var that = this;
    this.$data = {
      ...this.$data,
      ...{
        overPageNum: 1,
        loadOver: false,
        hasOverGoods: false,
        countDownMap: {},
        actEndMap: {},
        timer: {}
      }
    }, this.hasRefeshin = false, this.setData({
      rushList: [],
      showEmpty: false,
      pageNum: 1,
      "classification.activeIndex": t.detail.e,
      classificationId: t.detail.a
    }, function () {
      if (!this.$data.stickyFlag && (that.$data.scrollTop != that.$data.stickyTop + 5)) {
        wx.pageScrollTo({
          scrollTop: that.$data.stickyTop - 30,
          duration: 0
        })
      }
      that.load_goods_data();
    });
  },

  /**
   * 获取商品列表
   */
  load_goods_data: function () {
    var token = wx.getStorageSync('token');
    var that = this;
    // var cur_community = wx.getStorageSync('community');
    var gid = that.data.classificationId;
    this.$data.isLoadData = true;
    console.log('load_goods_begin ');

    if (!that.hasRefeshin && !that.$data.loadOver) {
      console.log('load_goods_in ');
      this.hasRefeshin = true;
      that.setData({
        loadMore: true
      });
      app.util.request({
        'url': 'entry/wxapp/index',
        'data': {
          controller: 'index.load_gps_goodslist',
          token: token,
          pageNum: that.data.pageNum,
          head_id: '',
          gid,
          per_page: 12,
          is_only_express: 1
        },
        dataType: 'json',
        success: function (res) {
          if (that.data.pageNum == 1) {
            that.setData({
              cate_info: res.data.cate_info || {}
            })
          }
          if (res.data.code == 0) {
            let rushList = '';
            if (res.data.is_show_list_timer == 1) {
              rushList = that.transTime(res.data.list);
              for (let s in that.$data.countDownMap) that.initCountDown(that.$data.countDownMap[s]);
            } else {
              let oldRushList = that.data.rushList;
              rushList = oldRushList.concat(res.data.list);
            }
            let rdata = res.data;
            let {
              full_money,
              full_reducemoney,
              is_open_fullreduction,
              is_open_vipcard_buy,
              is_vip_card_member,
              is_member_level_buy
            } = rdata;
            let reduction = {
              full_money,
              full_reducemoney,
              is_open_fullreduction
            }

            // 是否可以会员折扣购买
            let canLevelBuy = false;
            if (is_open_vipcard_buy == 1) {
              if (is_vip_card_member != 1 && is_member_level_buy == 1) canLevelBuy = true;
            } else {
              (is_member_level_buy == 1) && (canLevelBuy = true);
            }

            if (that.data.pageNum == 1) that.setData({
              copy_text_arr: rdata.copy_text_arr || []
            })
            that.hasRefeshin = false;
            that.setData({
              rushList: rushList,
              pageNum: that.data.pageNum + 1,
              loadMore: false,
              reduction,
              tip: '',
              is_open_vipcard_buy: is_open_vipcard_buy || 0,
              is_vip_card_member,
              is_member_level_buy,
              canLevelBuy
            }, () => {
              if (that.isFirst == 1) {
                that.isFirst++;
                if (rushList.length && !that.$data.stickyTop) {
                  wx.createSelectorQuery().select(".tab-nav-query").boundingClientRect(function (t) {
                    if (t && t.top) {
                      wcache.put('tabPos', t);
                      that.$data.stickyTop = t.top + t.height, that.$data.stickyBackTop = t.top;
                    } else {
                      let tabpos = wcache.get('tabPos', false);
                      if (tabpos) that.$data.stickyTop = tabpos.top + tabpos.height, that.$data.stickyBackTop = tabpos.top;
                    }
                  }).exec();
                  that.$data.scrollTop > that.$data.stickyTop && wx.pageScrollTo({
                    duration: 0,
                    scrollTop: that.$data.stickyTop + 4
                  });
                }
              }
              that.getScrollHeight();
              if (that.data.pageNum == 2 && res.data.list.length < 10) {
                console.log('load_over_goods_list_begin')
                that.$data.loadOver = true;
                that.hasRefeshin = true;
                that.setData({
                  loadMore: true
                }, () => {
                  that.load_over_gps_goodslist();
                });
              }
            });
          } else if (res.data.code == 1) {
            that.$data.loadOver = true;
            that.load_over_gps_goodslist();
          } else if (res.data.code == 2) {
            //no login
            that.setData({
              needAuth: true,
              couponRefresh: false
            })
          }
        },
        complete: function () {
          that.$data.isLoadData = false;
          // wx.hideLoading();
          setTimeout(function () {
            wx.hideLoading();
          }, 1000);
        }
      })
    } else {
      that.load_over_gps_goodslist();
    }
  },

  /**
   * 组合倒计时时间
   */
  transTime: function (list) {
    let that = this;
    let e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0;
    e === 0 && list.map(function (t) {
      t.end_time *= 1000;
      that.$data.countDownMap[t.end_time] = t.end_time, that.$data.actEndMap[t.end_time] = t.end_time <= new Date().getTime() || t.spuCanBuyNum == 0;
    })
    return that.data.rushList.concat(list);
  },

  /**
   * 获取售罄商品
   */
  load_over_gps_goodslist: function () {
    var token = wx.getStorageSync('token');
    var that = this;
    // var cur_community = wx.getStorageSync('community');
    var gid = that.data.classificationId;

    if (!that.$data.hasOverGoods && that.$data.loadOver) {
      that.$data.hasOverGoods = true;
      that.setData({
        loadMore: true
      });
      app.util.request({
        url: 'entry/wxapp/index',
        data: {
          controller: 'index.load_over_gps_goodslist',
          token: token,
          pageNum: that.$data.overPageNum,
          head_id: '',
          gid,
          is_index_show: 1,
          is_only_express: 1
        },
        dataType: 'json',
        success: function (res) {
          if (res.data.code == 0) {
            let rushList = that.transTime(res.data.list);
            for (let s in that.$data.countDownMap) that.initCountDown(that.$data.countDownMap[s]);

            that.$data.hasOverGoods = false;
            that.$data.overPageNum += 1;
            that.setData({
              rushList: rushList,
              loadMore: false,
              tip: ''
            }, () => {
              if (that.isFirst == 1) {
                that.isFirst++;
                if (rushList.length && !that.$data.stickyTop) {
                  wx.createSelectorQuery().select(".tab-nav-query").boundingClientRect(function (t) {
                    if (t && t.top) {
                      wcache.put('tabPos', t);
                      that.$data.stickyTop = t.top + t.height, that.$data.stickyBackTop = t.top;
                    } else {
                      let tabpos = wcache.get('tabPos', false);
                      if (tabpos) that.$data.stickyTop = tabpos.top + tabpos.height, that.$data.stickyBackTop = tabpos.top;
                    }
                  }).exec();
                  that.$data.scrollTop > that.$data.stickyTop && wx.pageScrollTo({
                    duration: 0,
                    scrollTop: that.$data.stickyTop + 4
                  });
                }
              }
              that.getScrollHeight();
            });
          } else if (res.data.code == 1) {
            if (that.$data.overPageNum == 1 && that.data.rushList.length == 0) that.setData({
              showEmpty: true
            })
            that.setData({
              loadMore: false,
              tip: '^_^已经到底了'
            })
          } else if (res.data.code == 2) {
            that.setData({
              needAuth: true,
              couponRefresh: false
            })
          }
          that.$data.isLoadData = false;
        }
      })
    } else {
      that.$data.isLoadData = false;
    }
  },

  getScrollHeight: function () {
    wx.createSelectorQuery().select('.rush-list-box').boundingClientRect((rect) => {
      rect && rect.height && (this.$data.scrollHeight = rect.height || 1300);
      console.log(this.$data.scrollHeight)
    }).exec()
  },

  openSku: function (t) {
    if (!this.authModal()) return;
    var that = this,
      e = t.detail;
    var goods_id = e.actId;
    var options = e.skuList;
    that.setData({
      addCar_goodsid: goods_id
    })

    let list = options.list || [];
    let arr = [];
    if (list && list.length > 0) {
      for (let i = 0; i < list.length; i++) {
        let sku = list[i]['option_value'][0];
        console.log(sku)
        let temp = {
          name: sku['name'],
          id: sku['option_value_id'],
          index: i,
          idx: 0
        };
        arr.push(temp);
      }
      var id = '';
      for (let i = 0; i < arr.length; i++) {
        if (i == arr.length - 1) {
          id = id + arr[i]['id'];
        } else {
          id = id + arr[i]['id'] + "_";
        }
      }
      var cur_sku_arr = options.sku_mu_list[id] || {};
      that.setData({
        sku: arr,
        sku_val: 1,
        cur_sku_arr: cur_sku_arr,
        skuList: e.skuList,
        visible: true,
        showSku: true,
        is_take_vipcard: e.is_take_vipcard || '',
        is_mb_level_buy: e.is_mb_level_buy || ''
      });
    } else {
      let goodsInfo = e.allData;
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
   * 确认加入购物车
   */
  gocarfrom: function (e) {
    var that = this;
    wx.showLoading();
    this.setData({
      is_take_vipcard: '',
      is_mb_level_buy: ''
    })
    a.collectFormIds(e.detail.formId);
    that.goOrder();
  },

  /**
   * 关闭购物车选项卡
   */
  closeSku: function () {
    this.setData({
      visible: 0,
      stopClick: false,
    });
  },

  selectSku: function (event) {
    var that = this;
    let str = event.currentTarget.dataset.type;
    let obj = str.split("_");
    let {
      sku,
      skuList,
      sku_val
    } = this.data;
    let temp = {
      name: obj[3],
      id: obj[2],
      index: obj[0],
      idx: obj[1]
    };
    sku.splice(obj[0], 1, temp);
    var id = '';
    for (let i = 0; i < sku.length; i++) {
      if (i == sku.length - 1) {
        id = id + sku[i]['id'];
      } else {
        id = id + sku[i]['id'] + "_";
      }
    }
    var cur_sku_arr = skuList.sku_mu_list[id];

    let h = {};
    sku_val = sku_val || 1;
    if (sku_val > cur_sku_arr.canBuyNum) {
      h.sku_val = cur_sku_arr.canBuyNum;
      wx.showToast({
        title: `最多只能购买${cur_sku_arr.canBuyNum}件`,
        icon: 'none'
      })
    }

    that.setData({
      cur_sku_arr,
      sku,
      ...h
    });
  },

  /**
   * 数量加减
   */
  setNum: function (event) {
    let types = event.currentTarget.dataset.type;
    var that = this;
    var num = 1;
    let sku_val = this.data.sku_val * 1;
    if (types == 'add') {
      num = sku_val + 1;
    } else if (types == 'decrease') {
      if (sku_val > 1) {
        num = sku_val - 1;
      }
    }

    let arr = that.data.sku;
    var options = this.data.skuList;

    if (arr.length > 0) {
      var id = '';
      for (let i = 0; i < arr.length; i++) {
        if (i == arr.length - 1) {
          id = id + arr[i]['id'];
        } else {
          id = id + arr[i]['id'] + "_";
        }
      }
    }

    if (options.length > 0) {
      let cur_sku_arr = options.sku_mu_list[id];
      if (num > cur_sku_arr['canBuyNum']) {
        num = num - 1;
      }
    } else {
      let cur_sku_arr = this.data.cur_sku_arr;
      if (num > cur_sku_arr['canBuyNum']) {
        num = num - 1;
      }
    }

    this.setData({
      sku_val: num
    })
  },

  skuConfirm: function () {
    this.closeSku(), (0, status.cartNum)().then((res) => {
      res.code == 0 && that.setData({
        cartNum: res.data
      })
    });
  },

  goOrder: function() {
    var that = this;
    if (that.data.can_car) {
      that.data.can_car = false;
    }
    var token = wx.getStorageSync('token');
    var community = wx.getStorageSync('community');

    var goods_id = that.data.addCar_goodsid;
    var community_id = community.communityId;
    var quantity = that.data.sku_val;

    var cur_sku_arr = that.data.cur_sku_arr;

    var sku_str = '';
    var is_just_addcar = 1;

    if (cur_sku_arr && cur_sku_arr.option_item_ids) {
      sku_str = cur_sku_arr.option_item_ids;
    }

    let data = {
      goods_id,
      community_id,
      quantity,
      sku_str,
      buy_type: 'dan',
      pin_id: 0,
      is_just_addcar
    }
    util.addCart(data).then(res=>{
      if(res.showVipModal==1) {
        let { pop_vipmember_buyimage } = res.data;
        wx.hideLoading();
        that.setData({ pop_vipmember_buyimage, showVipModal: true, visible: false })
      } else {
        if (res.data.code == 3 || res.data.code == 7) {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 2000
          })
        } else if (res.data.code == 4) {
          wx.hideLoading();
          that.setData({ needAuth: true, showAuthModal: true, visible: false })
        } else if (res.data.code == 6) {
          let max_quantity = res.data.max_quantity || '';
          (max_quantity > 0) && that.setData({ sku_val: max_quantity })
          var msg = res.data.msg;
          wx.showToast({
            title: msg,
            icon: 'none',
            duration: 2000
          })
        } else {
          if (is_just_addcar == 1) {
            that.closeSku();
            (0, status.cartNum)(res.data.total);
            that.setData({ cartNum: res.data.total })
            wx.showToast({
              title: "已加入购物车",
              image: "../../images/addShopCart.png"
            })
          } else {
            var pages_all = getCurrentPages();
            if (pages_all.length > 3) {
              wx.redirectTo({
                url: '/eaterplanet_ecommerce/pages/buy/index?type=' + that.data.order.buy_type
              })
            } else {
              wx.navigateTo({
                url: '/eaterplanet_ecommerce/pages/buy/index?type=' + that.data.order.buy_type
              })
            }
          }

        }
      }
    }).catch(res=>{
      app.util.message(res||'请求失败', '', 'error');
    })
  },

  vipModal: function (t) {
    this.setData(t.detail)
  },

  // 输入框获得焦点
  handleFocus: function () {
    this.focusFlag = true;
  },

  handleBlur: function (t) {
    let a = t.detail;
    let val = parseInt(a.value);
    if (val == '' || isNaN(val)) {
      this.setData({
        sku_val: 1
      })
    }
  },

  // 监控输入框变化
  changeNumber: function (t) {
    let {
      cur_sku_arr,
      sku_val
    } = this.data;
    let max = cur_sku_arr.stock * 1;
    let a = t.detail;
    this.focusFlag = false;
    if (a) {
      let val = parseInt(a.value);
      val = val < 1 ? 1 : val;
      if (val > max) {
        wx.showToast({
          title: `最多只能购买${max}件`,
          icon: 'none'
        })
        sku_val = max;
      } else {
        sku_val = val;
      }
    }
    this.setData({
      sku_val
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  onShareTimeline: function(res) {

  }

})
