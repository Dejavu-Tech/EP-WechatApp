const height = wx.getSystemInfoSync().windowHeight
var utils = require('../../utils/weather.js')
var util = require('../../utils/util.js');
var status = require('../../utils/index.js');
var a = require("../../utils/public");
var countDownInit = require("../../utils/countDown");
var wcache = require('../../utils/wcache.js');
var app = getApp();
var timerOut = '';
var globalData = getApp().globalData
const key = globalData.key
var SYSTEMINFO = globalData.systeminfo
Page({
  mixins: [countDownInit.default, require('../../mixin/globalMixin.js'), require('../../mixin/compoentCartMixin.js')],
  data: {
isIPhoneX: globalData.isIPhoneX,
    bh:"",
    cityDatas: {},
    hourlyDatas: [],
    weatherIconUrl: globalData.weatherIconUrl,
    weatherIconUrl1: globalData.weatherIconUrl1,
    weatherBackgroundUrl:globalData.weatherBackgroundUrl,
    detailsDic: {
      key: ['tmp', 'fl', 'hum', 'pcpn', 'wind_dir', 'wind_deg', 'wind_sc', 'wind_spd', 'vis', 'pres', 'cloud', ''],
      val: {
        tmp: '温度(℃)',
        fl: '体感温度(℃)',
        hum: '相对湿度(%)',
        pcpn: '降水量(mm)',
        wind_dir: '风向',
        wind_deg: '风向角度(deg)',
        wind_sc: '风力(级)',
        wind_spd: '风速(mk/h)',
        vis: '能见度(km)',
        pres: '气压(mb)',
        cloud: '云量',
      },
    },
    lifestyles: {
      'comf': '舒适度指数',
      'cw': '洗车指数',
      'drsg': '穿衣指数',
      'flu': '感冒指数',
      'sport': '运动指数',
      'trav': '旅游指数',
      'uv': '紫外线指数',
      'air': '空气污染扩散条件指数',
      'ac': '空调开启指数',
      'ag': '过敏指数',
      'gl': '太阳镜指数',
      'mu': '化妆指数',
      'airc': '晾晒指数',
      'ptfc': '交通指数',
      'fsh': '钓鱼指数',
      'spi': '防晒指数',
    },
    // 用来清空 input
    searchText: '',
    // 是否已经弹出
    hasPopped: false,
    animationMain: {},
    animationOne: {},
    animationTwo: {},
    animationThree: {},
    // 是否切换了城市
    located: true,
    // 需要查询的城市
    searchCity: '',
    setting: {},
    openSettingButtonShow: false,
    shareInfo: {},
        isfixed: !1,
        statusBarHeight: app.globalData.statusBarHeight + 44 + 'px',
        searchBarHeight: app.globalData.statusBarHeight + 'px',
      rushboxHeight: app.globalData.statusBarHeight + 200 + 'px',
    needAuth: false,
    stopClick: false,
    community: {},
    rushList: [],
    commingList: [],
    countDownMap: [],
    actEndMap: [],
    skuList: [],
    pageNum: 1,
    notice_list: [],
    slider_list: [],
    shop_info: {},
    showEmpty: false,
    indexBottomImage: '',
    classification: {
      tabs: [],
      activeIndex: -1
    },
    commingClassification: {
      tabs: [],
      activeIndex: -1
    },
        common_header_backgroundimage: "",
    isShowCommingClassification: true,
    isShowClassification: true,
    showChangeCommunity: false,
    isTipShow: false,
    isShowGuide: false,
    isShowMenu: false,
    index_lead_image: '',
    theme: 0,
    cartNum: 0,
    navigat: [],
    navigatSwiper: {page: 1, current:0, totnav: 0},
    tabIdx: 0,
    scrollDirect: "",
    isSticky: false,
    showCommingEmpty: false,
    stopNotify: true,
    reduction: {},
    is_share_html: true,
    commingNum: 0,
    couponRefresh: false,
    index_change_cate_btn: 0,
    newComerRefresh: false,
    showCouponModal: false,
    copy_text_arr: [],
    showCopyText: false,
    totalAlertMoney: 0,
    groupInfo: {
      group_name: '社区',
      owner_name: '团长'
    },
    needPosition: true,
    typeTopicList: [],
    pinList: {},
    cube: [],
    secRushList: [],
    secKillGoodsIndex: 1,
    isblack: 0,
    imageSize: {
      imageWidth: "100%",
      imageHeight: 600
    },
    fmShow: true,
    presale_index_info: '',
    isDiy: 0,
    diyManyGoodsList: []
  },
  isFirst: 0,
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
    hasCommingGoods: true
  },
  tpage: 1,
  hasRefeshin: false,
  postion: {},
  options: '',
  focusFlag: false,

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
  /**reloadPage () {
    this.getCityDatas()
    this.reloadInitSetting()
    this.reloadWeather()
  },*/
  onLoad: function(options) {
    app.setShareConfig();
    wx.hideTabBar();
    var that = this;
    var token = wx.getStorageSync('token');
    var i = this, s = wx.getStorageSync("token");
    var timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000;
    console.log("当前时间戳为：" + timestamp);

    //获取当前时间
    var nn = timestamp * 1000;

    var date = new Date(nn);
    //获取时
    var hh = date.getHours();
    
    console.log("现在的时间是"+hh+"点")

  
    if (6 < hh && hh <= 20) {
     
      console.log("勤奋的你")
      i.setData({
        bh: 'd'
      })
    } else {
        i.setData({
            bh: 'n'
      })
    }

    status.setNavBgColor();
    status.setGroupInfo().then((groupInfo) => { that.setData({ groupInfo }) });
    console.log('step1');
    let community = wx.getStorageSync('community');
    let community_id = community.communityId || '';
    
    let isparse_formdata = wx.getStorageSync('isparse_formdata') || 0;
    if (isparse_formdata != 1) {
      // this.get_index_info();
      if (options && Object.keys(options).length != 0) {
        console.log('step2');
        var scene = decodeURIComponent(options.scene);
        if (scene != 'undefined') {
          var opt_arr = scene.split("_");
          options.community_id = opt_arr[0];
          wcache.put('share_id', opt_arr[1]);
        }
        that.options = options;

        if (options.share_id != 'undefined' && options.share_id > 0) wcache.put('share_id', options.share_id);
        if (options.community_id != 'undefined' && options.community_id > 0) {
          console.log('step3');
          util.getCommunityById(options.community_id).then((res)=>{
            if (res.code == 0) {
              console.log('step4');
              var shareCommunity = res.data;
              console.log('分享community_id', options.community_id);
              console.log('历史community_id', community_id);
              let sdata = {};
              if (res.open_danhead_model == 1) {
                console.log('开启单社区', res.default_head_info);
                sdata.community = res.default_head_info;
                sdata.open_danhead_model = res.open_danhead_model;
                token && that.addhistory(res.default_head_info.communityId || '');
                wx.setStorageSync('community', res.default_head_info);
              } else if (shareCommunity){
                if (options.community_id != community_id) {
                  if (community_id) {
                    sdata.showChangeCommunity = true;
                    sdata.changeCommunity = shareCommunity;
                    sdata.community = community;
                  } else {
                    sdata.community = shareCommunity;
                    sdata.shareCommunity = shareCommunity;
                    wcache.put('community', shareCommunity);
                  }
                } else {
                  sdata.community = community;
                }
              }
              sdata.hidetip = false;
              sdata.token = token;
              sdata.showEmpty = false;
              sdata.needPosition = false;
              that.setData(sdata, ()=>{
                that.loadPage();
              });
            } else {
              console.log('step5');
              that.loadPage();
              that.setData({
                hidetip: false,
                token: token,
                showEmpty: false,
                needPosition: false
              })
            }
            token && that.addhistory();
          })
        } else {
          util.getCommunityById(options.community_id).then((res) => {
            if (res.code == 0) {
              if (res.open_danhead_model == 1) {
                console.log('开启单社区step6');
                that.setData({ community: res.default_head_info, open_danhead_model: res.open_danhead_model })
                token && that.addhistory(res.default_head_info.communityId || '');
                wx.setStorageSync('community', res.default_head_info);
              }
              console.log('step6');
              that.loadPage();
            }
          }).catch(() => {
            that.loadPage();
          })
        }
      } else {
        util.getCommunityById(options.community_id).then((res) => {
          if (res.code == 0) {
            if (res.open_danhead_model == 1) {
              console.log('开启单社区step7');
              that.setData({ community: res.default_head_info, open_danhead_model: res.open_danhead_model })
              token && that.addhistory(res.default_head_info.communityId || '');
              wx.setStorageSync('community', res.default_head_info);
            }
            that.loadPage();
          }
        }).catch(()=>{
          that.loadPage();
        })
        console.log('step7');
        that.setData({
          hidetip: false,
          token: token,
          showEmpty: false,
          community
        })
      }
    }
  },

  addhistory: function (id=0) {
    console.log('step13');
    let community_id = 0;
    if (id==0) {
      var community = wx.getStorageSync('community');
      community_id = community.communityId;
    } else {
      community_id = id;
    }
    console.log('history community_id=' + community_id);
    var token = wx.getStorageSync('token');
    let that = this;
    community_id !==void 0 && app.util.request({
      'url': 'entry/wxapp/index',
      'data': {
        controller: 'index.addhistory_community',
        community_id: community_id,
        'token': token
      },
      dataType: 'json',
      success: function(res) {
        if(id!=0) that.getHistoryCommunity(), console.log('addhistory+id', id);
      }
    })
  },

  loadPage: function() {
    wx.showLoading();
    console.log('step8');
    let that = this;
    that.get_index_info();
    if(this.data.isDiy==0) {
      that.get_type_topic();
      that.getNavigat();
      that.getPinList();
    } else {
      this.getDiyInfo();
    }
    that.getCoupon();

    status.loadStatus().then(function() {
      let appLoadStatus = app.globalData.appLoadStatus;
      console.log('appLoadStatus',appLoadStatus)
      if (appLoadStatus == 0) {
        // wx.hideLoading();
        setTimeout(function(){ wx.hideLoading(); },1000);
        that.setData({ needAuth: true, couponRefresh: false });
        that.data.isDiy==0&&that.load_goods_data();
      } else if (appLoadStatus == 2) {
        console.log('step9');
        that.getHistoryCommunity();
      } else {
        console.log('step12');
        let community = wx.getStorageSync('community');
        community || (community=app.globalData.community);
        if (!community){
          util.getCommunityInfo().then((res) => {
            that.setData({
              community: that.fliterCommunity(res)
            })
          })
        } else {
          that.setData({
            community: that.fliterCommunity(community)
          })
        }
        console.log('step18');
        that.data.isDiy==0&&that.load_goods_data();
      }
    });
  },

  // 不显示社区省份
  fliterCommunity: function (community){
    let resArr = community && community.fullAddress && community.fullAddress.split('省');
    if (resArr) {
      return Object.assign({}, community, { address: resArr[1] || resArr[0] });
    } else {
      return community;
    }
  },

  onReady: function (res) {
    this.videoContext = wx.createVideoContext('myVideo');
  },

  onShow: function() {
    // 页面显示
    let that = this;
    console.log('isblack', app.globalData.isblack)
    this.setData({ stopNotify: false, tabbarRefresh: true, isblack: app.globalData.isblack || 0 })

    util.check_login_new().then((res) => {
      if(res) {
        that.setData({ needAuth: false })
      } else {
        this.setData({ needAuth: true, couponRefresh: false });
        return;
      }
    })

    app.globalData.timer.start();
    var token = wx.getStorageSync('token');
    token&&(0, status.cartNum)('', true).then((res)=>{
      res.code == 0 && that.setData({ cartNum: res.data })
    });

    if (app.globalData.changedCommunity) {
      console.log('change')
      app.globalData.goodsListCarCount = [];
      let community = app.globalData.community;
      this.setData({
        community: that.fliterCommunity(community),
        newComerRefresh: false
      });
      this.getCommunityPos(community.communityId);
      this.hasRefeshin = false;
      this.setData({
        newComerRefresh: true,
        rushList: [],
        pageNum: 1,
        classificationId: null,
        "classification.activeIndex": -1
      }, () => {
        this.setData({
          "classification.activeIndex": 0
        })
      })
      this.$data = {
        ...this.$data, ...{
          overPageNum: 1,
          loadOver: false,
          hasOverGoods: false,
          countDownMap: {},
          actEndMap: {},
          timer: {},
          stickyFlag: false,
          hasCommingGoods: true
        }
      }
      app.globalData.changedCommunity = false, this.get_index_info(), this.addhistory();
      this.load_goods_data(), this.get_type_topic(),this.getPinList();
    } else {
      console.log('nochange')
      if (that.isFirst>=1){
        this.setData({ loadOver: true })
        this.changeRushListNum();
      }
    }

    if (that.isFirst==0) {
      this.setData({ couponRefresh: true });
    } else {
      this.getCoupon();
      let cid = app.globalData.indexCateId || '';
      cid && this.goIndexType(cid);
      app.globalData.indexCateId = '';
    }
    
    that.isFirst++;
  },

  /**
   * 动态变化列表购物车数量
   */
  changeRushListNum: function(){
    let that = this;
    let goodsListCarCount = app.globalData.goodsListCarCount;
    let rushList = this.data.rushList;
    let changeCarCount = false;
    this.setData({ changeCarCount })
    if (goodsListCarCount.length > 0 && rushList.length > 0) {
      goodsListCarCount.forEach(function (item) {
        let k = that.arrayHasElement(rushList, item.actId);
        if (k[0] != -1 && rushList[k[0]][k[1]].skuList.length === 0) {
          let newNum = item.num * 1;
          rushList[k[0]][k[1]].car_count = newNum >= 0 ? newNum : 0;
          changeCarCount = true;
        }
      })
      // goodsListCarCount.forEach(function (item) {
      //   let k = rushList.findIndex((n) => n.actId == item.actId);
      //   if (k != -1 && rushList[k].skuList.length === 0) {
      //     let newNum = item.num * 1;
      //     rushList[k].car_count = newNum >= 0 ? newNum : 0;
      //     changeCarCount = true;
      //   }
      // })
      this.setData({ rushList, changeCarCount })
    }
  },

  arrayHasElement: function(array, element) {
    let el=array;
    for(let number in el){
      if (el[number].length > 0) {
        for (var index in el[number]) {
          if (el[number][index].actId == element) {
            return [number, index]
          }
        }
      }
    }
    return [-1, -1];
  },

  changeNotListCartNum: function (t) {
    let that = this;
    let e = t.detail;
    (0, status.cartNum)(that.setData({ cartNum: e }));
    this.changeRushListNum();
  },

  onHide: function() {
    this.setData({ stopNotify: true, tabbarRefresh: false, changeCarCount: false })
    console.log('详情页', this.data.stopNotify)
    app.globalData.timer.stop();
    console.log('onHide')
  },

  /**
   * 授权成功回调
   */
  authSuccess: function() {
    console.log('authSuccess');
    let that = this;
    this.tpage = 1;
    this.hasRefeshin = false;
    this.setData({
      rushList: [],
      pageNum: 1,
      needAuth: false,
      newComerRefresh: false,
      couponRefresh: true,
      isblack: app.globalData.isblack || 0,
      diyLoaded: false
    })
    this.$data = {
      ...this.$data, ...{
        overPageNum: 1,
        loadOver: false,
        hasOverGoods: false,
        countDownMap: {},
        actEndMap: {},
        timer: {},
        hasCommingGoods: true
      }
    }
    status.getInNum().then((isCan) => {
      if (isCan) {
        that.setData({ isTipShow: true })
        timerOut = setTimeout(() => { that.setData({ isTipShow: false }) }, 7000);
      }
    })
    this.loadPage();
    this.data.isTipShow && (timerOut = setTimeout(() => { that.setData({ isTipShow: false }) }, 7000));
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

  //获取历史社区
  getHistoryCommunity: function () {
    let that = this;
    var token = wx.getStorageSync('token');
    app.util.request({
      'url': 'entry/wxapp/index',
      'data': {
        controller: 'index.load_history_community',
        token: token
      },
      dataType: 'json',
      success: function (res) {
        console.log('step14');
        if (res.data.code == 0) {
          console.log('getHistoryCommunity');
          let history_communities = res.data.list;
          let isNotHistory = false;
          if (Object.keys(history_communities).length == 0 || history_communities.communityId == 0) isNotHistory = true;
          
          let resArr = history_communities && history_communities.fullAddress && history_communities.fullAddress.split('省');
          history_communities = Object.assign({}, history_communities, { address: resArr[1] })

          that.setData({
            community: history_communities
          })
          wcache.put('community', history_communities);
          app.globalData.community = history_communities;

          if (token && !isNotHistory) {
            let lastCommunity = wx.getStorageSync('lastCommunity');
            let lastCommunityId = lastCommunity.communityId || '';
            if (lastCommunityId != '' && lastCommunityId != history_communities.communityId) {
              that.setData({
                showChangeCommunity: true,
                changeCommunity: lastCommunity
              }, ()=> {
                wx.removeStorageSync('lastCommunity');
              })
            }
          }

          that.setData({
            community: app.globalData.community
          })
          that.load_goods_data();
        } else {
          let options = that.options;
          if (options !== void 0 && options.community_id) {
            console.log('新人加入分享进来的社区id:', that.options);
            that.addhistory(options.community_id);
          } else if (res.data.code == 1) {
            console.log('获取历史社区');
            wx.redirectTo({
              url: "/eaterplanet_ecommerce/pages/position/community"
            })
          } else {
            that.setData({ needAuth: true })
          }
        }
      }
    })
  },
  
  getScrollHeight: function () {
    wx.createSelectorQuery().select('.rush-list-box').boundingClientRect((rect) => {
      rect && rect.height && (this.$data.scrollHeight = rect.height || 1300);
      console.log(this.$data.scrollHeight)
    }).exec()
  },

  /**
   * 引导页切换
   */
  handleProxy: function(){
    clearTimeout(timerOut);
    this.setData({
      isTipShow: false,
      isShowGuide: true
    })
    wcache.put('inNum', 4);
  },

  handleHideProxy: function(){
    this.setData({
      isTipShow: false,
      isShowGuide: false
    })
  },

  /**
   * 获取首页信息
   */
  get_index_info: function() {
    let that = this;
    let community = wx.getStorageSync('community');
    let communityId = community && community.communityId || '';
    let token = wx.getStorageSync('token');
    app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'index.index_info',
        communityId,
        token
      },
      dataType: 'json',
      success: function(res) {
        let rdata = res.data;
        let groupInfo = that.data.groupInfo;
        if (rdata.code == 0) {
          if (!res.data.is_community && communityId && !that.data.needAuth) {
            let changeCommunity = that.data.changeCommunity || {};
            let changeCommunityId = changeCommunity.communityId || '';
            if (changeCommunityId) {
              wcache.put('community', changeCommunity);
              that.addhistory(changeCommunity.community_id);
              that.setData({
                community: changeCommunity,
                showChangeCommunity: false
              })
              that.loadPage();
            } else {
              wx.showModal({
                title: '提示',
                content: `该${groupInfo.group_name}不在，请重新选择${groupInfo.group_name}`,
                showCancel: false,
                confirmColor: '#4facfe',
                success(res) {
                  if (res.confirm) {
                    wx.redirectTo({
                      url: '/eaterplanet_ecommerce/pages/position/community',
                    })
                  }
                }
              })
            }
          }
          let notice_list = rdata.notice_list;
          let slider_list = rdata.slider_list;
          let index_lead_image = rdata.index_lead_image;
          if(index_lead_image){
            status.getInNum().then((isCan)=>{
              if (isCan) {
                that.setData({ isTipShow: true },()=>{
                  timerOut = setTimeout(() => { that.setData({ isTipShow: false }) }, 9000);
                })
              }
            })
          } else {
            that.setData({ isTipShow: false })
          }

          let common_header_backgroundimage = rdata.common_header_backgroundimage;
          app.globalData.common_header_backgroundimage = common_header_backgroundimage;
          let order_notify_switch = rdata.order_notify_switch;
          let index_list_top_image_on = rdata.index_list_top_image_on;
          let index_change_cate_btn = rdata.index_change_cate_btn || 0;
          let default_img = '../../images/rush-title.png';
          // if (index_list_top_image_on == 1) default_img='';
          let index_list_top_image = rdata.index_list_top_image ? rdata.index_list_top_image : default_img;
          let shop_info = {
            shoname: rdata.shoname,
            shop_index_share_image: rdata.shop_index_share_image,
            index_list_top_image: index_list_top_image,
            title: rdata.title,
            common_header_backgroundimage,
            order_notify_switch,
            index_top_img_bg_open: rdata.index_top_img_bg_open || 0,
            index_top_font_color: rdata.index_top_font_color || '#fff',
            index_communityinfo_showtype: rdata.index_communityinfo_showtype || 0,
            index_list_top_image_on
          }
          app.globalData.placeholdeImg = rdata.index_loading_image || '';
          let placeholdeImg = rdata.index_loading_image || '';

          wcache.put('shopname', rdata.shoname);
          wx.setNavigationBarTitle({ title: rdata.shoname });

          let category_list = rdata.category_list || [];
          let index_type_first_name = rdata.index_type_first_name || '全部';
          if (category_list.length > 0) {
            category_list.unshift({
              name: index_type_first_name,
              id: 0
            })
            that.setData({
              isShowClassification: true,
              "classification.tabs": category_list
            })
          } else {
            that.setData({
              isShowClassification: false
            })
          }
          let theme = rdata.theme || 0;
          let rushEndTime = rdata.rushtime*1000 || 0;
          let isShowShareBtn = rdata.index_share_switch || 0;
          let isShowListCount = rdata.is_show_list_count || 0;
          let isShowListTimer = rdata.is_show_list_timer || 0;
          let isShowContactBtn = rdata.index_service_switch || 0; 
          let index_switch_search = rdata.index_switch_search || 0;
          let ishow_index_gotop = rdata.ishow_index_gotop || 0;

          if (rdata.is_comunity_rest == 1 && !that.data.needAuth) {
            wx.showModal({
              title: '温馨提示',
              content: `${groupInfo.owner_name}休息中，欢迎下次光临!`,
              showCancel: false,
              confirmColor: '#4facfe',
              confirmText: '好的',
              success(res) { }
            })
          }

          that.postion = rdata.postion;

          //秒杀
          let { scekill_time_arr, seckill_bg_color, seckill_is_open, seckill_is_show_index, hide_community_change_word,index_qgtab_counttime, hide_index_type } = rdata;
          let myDate = new Date();
          let curHour = myDate.getHours(); // 当前时间
          console.log('当前时间:', curHour);
          let curSeckillIdx = 0; //当前时间索引
          let scekillTimeArr = []; //显示的时间段
          if (scekill_time_arr.length > 3) {
            let timeLen = scekill_time_arr.length;
            curSeckillIdx = scekill_time_arr.findIndex(item => {
              return item >= curHour;
            });
            console.log('当前时间索引:', curSeckillIdx)
            //取三个时间段
            if (curSeckillIdx === -1) {
              //没有进行或者未开始 取最后三个
              scekillTimeArr = scekill_time_arr.slice(-3);
            } else if (curSeckillIdx === 0) {
              //全部未开始 取最前三个
              scekillTimeArr = scekill_time_arr.slice(0, 3);
            } else if ((curSeckillIdx + 1) == timeLen) {
              //剩最后一个 取最后三个
              scekillTimeArr = scekill_time_arr.slice(-3);
            } else {
              scekillTimeArr = scekill_time_arr.slice(curSeckillIdx - 1, curSeckillIdx + 2);
            }
          } else {
            scekillTimeArr = scekill_time_arr;
          }
          //判断各个时段状态
          let scekillTimeList = [];
          let secKillActiveIdx = 0;
          if(scekillTimeArr.length){
            scekillTimeArr.forEach((item, idx) => {
              let secObj = {};
              //state: 0已开抢 1疯抢中 2即将开抢
              if (item == curHour) {
                secObj.state = 1;
                secObj.desc = '疯抢中';
                secKillActiveIdx = idx;
              } else if (item < curHour) {
                secObj.state = 0;
                secObj.desc = '已开抢';
              } else {
                secObj.state = 2;
                secObj.desc = '即将开抢';
              }
              secObj.timeStr = (item < 10 ? '0' + item : item) + ':00';
              secObj.timeArr = [item < 10 ? '0' + item : item, '00'];
              secObj.seckillTime = item;
              scekillTimeList.push(secObj);
            })
            //获取当前秒杀商品
            that.getSecKillGoods(scekillTimeArr[secKillActiveIdx]);
          }

          let index_video_arr = rdata.index_video_arr;

          // 预售信息
          let presale_index_info = rdata.presale_index_info || '';
          if(presale_index_info&&presale_index_info.goods_list) {
            let goods_list = presale_index_info.goods_list;
            let nowtime = Date.parse(new Date())/1000;
            goods_list.forEach((item, idx)=>{
              let { presale_ding_money, actPrice, presale_deduction_money, presale_type, presale_ding_time_start_int, presale_ding_time_end_int } = item;
              if(presale_type==0) {
                presale_deduction_money = presale_deduction_money>0?presale_deduction_money:presale_ding_money;
                let goodsPrice = (actPrice[0]+'.'+actPrice[1])*1;
                presale_index_info.goods_list[idx].weikuan = (goodsPrice - presale_deduction_money*1).toFixed(2);
                presale_ding_money = presale_ding_money.toFixed(2);
                presale_index_info.goods_list[idx].dingArr = (presale_ding_money+'').split('.');
                presale_index_info.goods_list[idx].presale_deduction_money = presale_deduction_money;
              }
              let saleStatus = 1; //客付定金  0未开始  2已结束
              if(nowtime<presale_ding_time_start_int) {
                saleStatus = 0;
              } else if(nowtime>presale_ding_time_end_int) {
                saleStatus = 2;
              }
              presale_index_info.goods_list[idx].saleStatus = saleStatus;
            })
          }
          let isDiy = rdata.open_diy_index_page || 0;
          wx.setStorageSync('is_diy', isDiy);
          (isDiy==1)&&that.getDiyInfo();

          // 礼品卡
          let virtualcard_info = rdata.virtualcard_info || '';
          if(virtualcard_info&&virtualcard_info.goods_list) {
              var timestamp = Date.parse(new Date())/1000;
              let newList = [];
              if(Object.keys(virtualcard_info.goods_list).length) {
                virtualcard_info.goods_list.forEach(item=>{
                  (item.end_time<timestamp)&&(item.actEnd = 1);
                  newList.push(item);
                })
              }
              virtualcard_info.goods_list = newList;
          }

          that.setData({
            notice_list,
            slider_list,
            index_lead_image,
            theme,
            indexBottomImage: rdata.index_bottom_image || '',
            shop_info: shop_info,
            loadOver: true,
            rushEndTime,
            commingNum: rdata.comming_goods_total,
            isShowShareBtn,
            isShowListCount,
            isShowListTimer,
            is_comunity_rest: rdata.is_comunity_rest,
            index_change_cate_btn,
            isShowContactBtn,
            index_switch_search,
            is_show_new_buy: rdata.is_show_new_buy || 0,
            qgtab: res.data.qgtab || {},
            notice_setting: rdata.notice_setting || {},
            index_hide_headdetail_address: rdata.index_hide_headdetail_address || 0,
            is_show_spike_buy: rdata.is_show_spike_buy || 0,
            hide_community_change_btn: rdata.hide_community_change_btn || 0,
            hide_top_community: rdata.hide_top_community || 0,
            index_qgtab_text: rdata.index_qgtab_text,
            ishow_index_copy_text: rdata.ishow_index_copy_text || 0,
            newComerRefresh: true,
            cube: rdata.cube,
            placeholdeImg,
            seckill_bg_color,
            seckill_is_open,
            seckill_is_show_index,
            scekillTimeList,
            secKillActiveIdx,
            hide_community_change_word,
            ishow_index_gotop,
            ishow_index_pickup_time: rdata.ishow_index_pickup_time || 0,
            index_video_arr,
            index_qgtab_counttime,
            hide_index_type,
            show_index_wechat_oa: rdata.show_index_wechat_oa,
            ishide_index_goodslist: rdata.ishide_index_goodslist,
            can_index_notice_alert: rdata.can_index_notice_alert,
            presale_index_info,
            isDiy,
            virtualcard_info
          })
        }
      }
    })
  },

  /**
   * 确认切换社区
   */
  confrimChangeCommunity: function() {
    let community = this.data.changeCommunity;
    app.globalData.community = community;
    wcache.put('community', community);
    this.$data = {
      ...this.$data, ...{
        overPageNum: 1,
        loadOver: false,
        hasOverGoods: false,
        countDownMap: {},
        actEndMap: {},
        timer: {},
        stickyFlag: false
      }
    }
    this.hasRefeshin = false;
    this.setData({
      showChangeCommunity: false,
      community: community,
      rushList: [],
      pageNum: 1
    }, () => {
      this.loadPage();
      this.addhistory();
    })
  },

  /**
   * 关闭切换社区
   */
  closeChangeCommunity: function(){
    this.setData({
      showChangeCommunity: false
    })
  },

  /**
   * 获取商品列表
   */
  load_goods_data: function() {
    var token = wx.getStorageSync('token');
    var that = this;
    var cur_community = wx.getStorageSync('community');
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
          head_id: cur_community.communityId,
          gid,
          per_page: 12
        },
        dataType: 'json',
        success: function(res) {
          if (that.data.pageNum == 1) {
            that.setData({ cate_info: res.data.cate_info || {} })
          }
          if (res.data.code == 0) {
            let rushList = [];
            if (res.data.is_show_list_timer==1) {
              rushList = that.transTime(res.data.list);
              for (let s in that.$data.countDownMap) that.initCountDown(that.$data.countDownMap[s]);
            } else {
              rushList = that.data.rushList;
              rushList[that.data.pageNum-1] = res.data.list;
            }
            let rdata = res.data;
            let { full_money, full_reducemoney, is_open_fullreduction, is_open_vipcard_buy, is_vip_card_member, is_member_level_buy } = rdata;
            let reduction = { full_money, full_reducemoney, is_open_fullreduction }

            // 是否可以会员折扣购买
            let canLevelBuy = false;
            if (is_open_vipcard_buy == 1) {
              if (is_vip_card_member != 1 && is_member_level_buy == 1) canLevelBuy = true;
            } else {
              (is_member_level_buy == 1) && (canLevelBuy = true);
            }

            if (that.data.pageNum==1) that.setData({ copy_text_arr: rdata.copy_text_arr || [] })
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
            }, ()=>{
              if (that.isFirst == 1) {
                that.isFirst++;
              }
                if (rushList.length && !that.$data.stickyTop) {
                  wx.createSelectorQuery().select(".tab-nav-query").boundingClientRect(function (t) {
                    if (t && t.top){
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
            that.setData({ needAuth: true, couponRefresh: false })
          }
        },
        complete: function() {
          that.$data.isLoadData = false;
          // wx.hideLoading();
          setTimeout(function(){ wx.hideLoading(); },1000);
        }
      })
    } else {
      that.load_over_gps_goodslist();
    }
  },

  /**
   * 组合倒计时时间
   */
  transTime: function(list) {
    let that = this;
    let e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0;
    e === 0 && list.map(function(t) {
      t.end_time *= 1000;
      that.$data.countDownMap[t.end_time] = t.end_time, that.$data.actEndMap[t.end_time] = t.end_time <= new Date().getTime() || t.spuCanBuyNum == 0;
    })
    let rushList = that.data.rushList;
    let idx = that.data.pageNum+that.$data.overPageNum-2;
    rushList[idx] = list;
    return rushList;
    // return that.data.rushList.concat(list);
  },

  /**
   * 获取售罄商品
   */
  load_over_gps_goodslist: function() {
    var token = wx.getStorageSync('token');
    var that = this;
    var cur_community = wx.getStorageSync('community');
    var gid = that.data.classificationId;

    if (!that.$data.hasOverGoods && that.$data.loadOver) {
      that.$data.hasOverGoods = true;
      that.setData({
        loadMore: true
      });
      app.util.request({
        'url': 'entry/wxapp/index',
        'data': {
          controller: 'index.load_over_gps_goodslist',
          token: token,
          pageNum: that.$data.overPageNum,
          head_id: cur_community.communityId,
          gid,
          is_index_show: 1
        },
        dataType: 'json',
        success: function(res) {
          if (res.data.code == 0) {
            let rushList = that.transTime(res.data.list);
            for (let s in that.$data.countDownMap) that.initCountDown(that.$data.countDownMap[s]);

            that.$data.hasOverGoods = false;
            that.$data.overPageNum += 1;
            that.setData({
              rushList: rushList,
              loadMore: false,
              tip: ''
            }, ()=>{
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
                that.getScrollHeight();
              }
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
            that.setData({ needAuth: true, couponRefresh: false })
          }
          that.$data.isLoadData = false;
        }
      })
    } else {
      that.$data.isLoadData = false;
    }
  },

  /**
   * 监控分类导航
   */
  classificationChange: function(t, autoScroll=0) {
    console.log(t.detail.e)
    wx.showLoading();
    var that = this;
    this.$data = {...this.$data, ...{
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
    }, function() {
      if ((this.$data.stickyFlag && (that.$data.scrollTop != that.$data.stickyTop+5)) || autoScroll){
        console.log('滚动了')
        let windowWidth = app.globalData.systemInfo && app.globalData.systemInfo.windowWidth || 375;
        let taBH = windowWidth/750*72;
        wx.pageScrollTo({ scrollTop: that.$data.stickyTop - taBH, duration: 0 })
      }
      that.load_goods_data();
    });
  },

  /**
  * 监控即将抢购分类导航
  */
  commingClassificationChange: function (t) {
    wx.showLoading();
    var that = this;
    that.tpage = 1;
    this.$data = {...this.$data, ...{hasCommingGoods: true} },
    this.setData({
      showCommingEmpty: false,
      commingList: [],
      "commingClassification.activeIndex": t.detail.e,
      commingClassificationId: t.detail.a
    }, function () {
      if (this.$data.stickyFlag && (that.$data.scrollTop != that.$data.stickyTop + 5)) {
        wx.pageScrollTo({ scrollTop: that.$data.stickyTop + 5, duration: 0 })
      }
      that.getCommingList();
    });
  },

  // 抢购切换
  tabSwitch: function (t) {
    var that = this;
    var tabIdx = 1 * t.currentTarget.dataset.idx;
    this.setData({ tabIdx: tabIdx }, ()=>{
      if (tabIdx == 1) {
        if (that.$data.stickyFlag && (that.$data.scrollTop != that.$data.stickyTop + 5)) {
          wx.pageScrollTo({ scrollTop: that.$data.stickyTop + 5, duration: 0 })
        }
        if (that.tpage == 1) {
          that.getCommingList();
        }
      }
    })
  },

  /**
   * 即将开抢列表
   */
  getCommingList: function(){
    this.data.commigLoadMore && wx.showLoading();
    var token = wx.getStorageSync('token');
    var that = this;
    var cur_community = wx.getStorageSync('community');
    var gid = this.data.commingClassificationId || 0;
    that.$data.isLoadData = true;

    if (that.$data.hasCommingGoods) {
      that.$data.hasCommingGoods = false;
      that.setData({ commigLoadMore: true });
      app.util.request({
        url: 'entry/wxapp/index',
        data: {
          controller: 'index.load_comming_goodslist',
          token: token,
          pageNum: that.tpage,
          head_id: cur_community.communityId,
          gid
        },
        dataType: 'json',
        success: function (res) {
          wx.hideLoading();
          if (res.data.code == 0) {
            let commingList = res.data.list;
            commingList = that.data.commingList.concat(commingList);
            that.$data.hasCommingGoods = true;
            that.tpage += 1;
            that.setData({
              commingList: commingList,
              commigLoadMore: false,
              commigTip: ''
            },()=>{
              that.getScrollHeight();
            });
          } else if (res.data.code == 1) {
            if (that.tpage == 1 && that.data.commingList.length == 0) that.setData({
              showCommingEmpty: true
            })
            that.setData({
              commigLoadMore: false,
              commigTip: '^_^已经到底了'
            })
          } else if (res.data.code == 2) {
            that.setData({ needAuth: true, couponRefresh: false })
          }
          that.$data.isLoadData = false;
        }
      })
    } else{
      that.$data.isLoadData = false;
      !that.data.commigLoadMore && wx.hideLoading();
    }
  },

  /**
   * 返回顶部
   */
  backTop: function() {
    this.stickyFlag = false, wx.pageScrollTo({
      scrollTop: 0,
      duration: 500
    });
  },

  goLink: function(event) {
    let url = event.currentTarget.dataset.link;
    let needauth = event.currentTarget.dataset.needauth || '';
    console.log(needauth)
    if(needauth){ if (!this.authModal()) return; }
    url && wx.navigateTo({ url })
  },

  /**
   * 导航小图标
   */
  getNavigat: function(){
    let that = this;
    app.util.request({
      'url': 'entry/wxapp/index',
      'data': {
        controller: 'index.get_navigat'
      },
      dataType: 'json',
      success: function (res) {
        if (res.data.code == 0) {
          let navigat = res.data.data || [];
          let navigatEmpty = [];
          let navigatSwiper = {page: 1, current:0, totnav: 0};
          let chunks = [];
          if (navigat.length>0) {
            let len = (5-navigat.length%5) || 0;
            if(len<5&&len>0) navigatEmpty = new Array(len);
            for(let i=0;i<navigat.length;i=i+10){
              chunks.push(navigat.slice(i,i+10));
            }
            navigatSwiper.page = chunks.length;
            navigatSwiper.totnav = navigat.length;
          }
          that.setData({ navigat: chunks, navigatEmpty, navigatSwiper })
        }
      }
    })
  },

  navigatSwiperChange: function(t) {
    this.setData({
      "navigatSwiper.current": t.detail.current
    });
  },
  
  /**
   * 导航图标跳转
   */
  goNavUrl: function(t) {
    let idx = t.currentTarget.dataset.idx;
    console.log(idx)
    let { navigat, needAuth, navigatSwiper } = this.data;
    let sidx = navigatSwiper.current;
    navigat = navigat[sidx];
    if (navigat.length > 0) {
      let url = navigat[idx].link;
      let type = navigat[idx].type;
      if(util.checkRedirectTo(url, needAuth)){
        this.authModal();
        return;
      }
      if (type== 0){
        // 跳转webview
        wx.navigateTo({
          url: '/eaterplanet_ecommerce/pages/web-view?url=' + encodeURIComponent(url),
        })
      } else if (type==1) {
        if (url.indexOf('eaterplanet_ecommerce/pages/index/index') != -1 || url.indexOf('eaterplanet_ecommerce/pages/order/shopCart') != -1 || url.indexOf('eaterplanet_ecommerce/pages/user/me') != -1 || url.indexOf('eaterplanet_ecommerce/pages/type/index') != -1) {
          wx.switchTab({ url: url })
        } else {
          wx.navigateTo({ url: url })
        }
      } else if (type==2){
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
      } else if (type == 3){
        //首页分类
        // t.detail.e 选中索引
        // t.detail.a 选中id
        let classification = this.data.classification;
        let tabs = classification && classification.tabs;
        let cid = url;
        let activeIdx = tabs.findIndex((p) => { return p.id == cid });
        if (activeIdx!=-1) {
          let cateInfo = {
            detail: { e: activeIdx, a: cid }
          };
          this.classificationChange(cateInfo, 1);
        } else {
          wx.showToast({
            title: '分类不存在或已关闭',
            icon: 'none'
          })
        }
      } else if (type == 4) {
        //独立分类
        app.globalData.typeCateId = url;
        wx.switchTab({
          url: '/eaterplanet_ecommerce/pages/type/index'
        })
      } else if (type == 6) {
        //领券
        let url = navigat[idx].link;
        wx.navigateTo({
          url: '/eaterplanet_ecommerce/moduleA/coupon/getCoupon?id='+url
        })
      }
    }
  },

  /**
   * 幻灯片跳转
   */
  goBannerUrl: function (t) {
    let idx = t.currentTarget.dataset.idx;
    let { slider_list, needAuth } = this.data;
    if (slider_list.length > 0) {
      let url = slider_list[idx].link;
      let type = slider_list[idx].linktype;
      if (util.checkRedirectTo(url, needAuth)) {
        this.authModal();
        return;
      }
      if (type == 0) {
        // 跳转webview
        url && wx.navigateTo({ url: '/eaterplanet_ecommerce/pages/web-view?url=' + encodeURIComponent(url) })
      } else if (type == 1) {
        if (url.indexOf('eaterplanet_ecommerce/pages/index/index') != -1 || url.indexOf('eaterplanet_ecommerce/pages/order/shopCart') != -1 || url.indexOf('eaterplanet_ecommerce/pages/user/me') != -1 || url.indexOf('eaterplanet_ecommerce/pages/type/index') != -1) {
          url && wx.switchTab({ url: url })
        } else {
          url && wx.navigateTo({ url: url })
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
      } else if (type == 6) {
        //领券
        wx.navigateTo({
          url: '/eaterplanet_ecommerce/moduleA/coupon/getCoupon?id='+url
        })
      }
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.setData({ couponRefresh: false, newComerRefresh: false, stopNotify: true });
    this.tpage = 1;
    this.$data = {
      ...this.$data, ...{
        overPageNum: 1,
        loadOver: false,
        hasOverGoods: false,
        countDownMap: {},
        actEndMap: {},
        timer: {},
        stickyFlag: false,
        hasCommingGoods: true
      }
    }
    this.hasRefeshin = false;
    this.setData({
      rushList: [],
      commingList: [],
      tabIdx: 0,
      pageNum: 1,
      couponRefresh: true,
      newComerRefresh: true,
      stopNotify: false,
      rushEndTime: 0,
      diyLoaded: false
    }, ()=>{
      this.loadPage();
    })
    wx.stopPullDownRefresh();
  },

  onReachBottom: function(e) {
    if(this.data.ishide_index_goodslist==1||this.data.isDiy==1) return;
    if (this.data.tabIdx==0){
      this.load_goods_data();
    } else {
      this.getCommingList();
    }
  },

  /**
   * 获取团长位置
   */
  getCommunityPos: function (community_id){
    let that = this;
    app.util.request({
      'url': 'entry/wxapp/user',
      'data': {
        controller: 'index.get_community_position',
        communityId: community_id
      },
      dataType: 'json',
      method: 'POST',
      success: function (res) {
        if (res.data.code == 0) {
          that.postion = res.data.postion;
        }
      }
    })
  },

  /**
  * 查看地图
  */
  gotoMap: function () {
    let community = this.data.community;
    let postion = this.postion || {lat: 0, lon: 0};
    let longitude = parseFloat(postion.lon),
      latitude = parseFloat(postion.lat),
      name = community.disUserName,
      address = `${community.fullAddress}(${community.communityName})`;
    wx.openLocation({
      latitude: latitude,
      longitude: longitude,
      name: name,
      address: address,
      scale: 28
    })
  },

  share_handler: function () {
    this.setData({
      is_share_html: false
    })
  },

  hide_share_handler: function () {
    this.setData({
      is_share_html: true
    })
  },

  // 搜索
  goResult: function (e) {
    let value = e.detail.value.keyword ? e.detail.value.keyword : e.detail.value;
    let keyword = value.replace(/\s+/g, '');
    if (!keyword) {
      wx.showToast({
        title: '请输入关键词',
        icon: 'none'
      })
      return;
    }
    wx.navigateTo({
      url: '/eaterplanet_ecommerce/pages/type/result?keyword=' + keyword,
    })
  },

  /**
   * 新人优惠券显示开关
   */
  toggleCoupon: function(e){
    let auth = e.currentTarget.dataset.auth || '';
    let needAuth = this.data.needAuth || '';
    if(needAuth && auth) {
      this.setData({
        showAuthModal: true,
        showCouponModal: false
      })
    } else {
      this.setData({
        showCouponModal: !this.data.showCouponModal,
        hasAlertCoupon: false
      })
    }
  },

  changeCartNum: function(t) {
    let that = this;
    let e = t.detail;
    (0, status.cartNum)(that.setData({ cartNum: e }));
  },

  /**
   * 一键复制文本
   */
  copyText: function (e) {
    let copy_text_arr = this.data.copy_text_arr;
    let community = this.data.community;
    let communityName = community.communityName;
    let disUserName = community.disUserName;
    let communityAddress = community.address || community.communityAddress || community.fullAddress;
    let data = '-团长信息-\r\n小区：' + communityName + '\r\n团长：' + disUserName + '\r\n自提点：' + communityAddress + '\r\n\r\n今日推荐\r\n';
    if (copy_text_arr.length) {
      copy_text_arr.forEach(function(item, index){
        data += (index + 1) + '.【' + item.goods_name + '】  团购价' + item.price + '\r\n';
        data += '~~~~~~~~~~~~~~~~~~~~\r\n';
      })
    }
    let that = this;
    wx.setClipboardData({
      data: data,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            that.setData({ showCopyText: false })
            wx.showToast({
              title: '复制成功'
            })
          }
        })
      }
    })
  },

  /**
   * 显示关闭复制文本
   */
  showCopyTextHandle: function(e){
    if (!this.authModal()) return;
    let showCopyText = e.currentTarget.dataset.status;
    this.setData({ showCopyText })
  },

  /**
   * 优惠券获取
   */
  getCoupon: function () {
    let that = this;
    let token = wx.getStorageSync('token');
    app.util.request({
      url: 'entry/wxapp/index',
      data: { controller: 'goods.get_seller_quan', token },
      dataType: 'json',
      success: function (res) {
        let list = res.data.quan_list;
        let hasCoupon = false;
        let hasAlertCoupon = false;
        if (Object.prototype.toString.call(list) == '[object Object]' && Object.keys(list).length > 0) hasCoupon = true;
        if (Object.prototype.toString.call(list) == '[object Array]' && list.length > 0) hasCoupon = true;

        let alert_quan_list = res.data.alert_quan_list || [];
        if (Object.prototype.toString.call(alert_quan_list) == '[object Object]' && Object.keys(alert_quan_list).length > 0) hasAlertCoupon = true;
        if (Object.prototype.toString.call(alert_quan_list) == '[object Array]' && alert_quan_list.length > 0) hasAlertCoupon = true;

        let totalAlertMoney = 0;
        if (Object.prototype.toString.call(alert_quan_list) == '[object Object]' && Object.keys(alert_quan_list).length > 0) {
          Object.keys(alert_quan_list).forEach(function(item){
            totalAlertMoney += alert_quan_list[item].credit*1;
          })
        } else if (Object.prototype.toString.call(alert_quan_list) == '[object Array]' && alert_quan_list.length > 0) {
          alert_quan_list.forEach(function (item) {
            totalAlertMoney += item.credit * 1;
          })
        }

        that.setData({
          quan: res.data.quan_list || [],
          alert_quan_list,
          hasCoupon,
          hasAlertCoupon,
          showCouponModal: hasAlertCoupon,
          totalAlertMoney: totalAlertMoney.toFixed(2)
        })
      }
    });
  },

  receiveCoupon: function (event) {
    if (!this.authModal()) return;
    let quan_id = event.currentTarget.dataset.quan_id;
    let type = event.currentTarget.dataset.type || 0;
    var token = wx.getStorageSync('token');
    var quan_list = [];
    if(type==1) {
      quan_list = this.data.alert_quan_list;
    } else {
      quan_list = this.data.quan;
    }
    var that = this;

    app.util.request({
      url: 'entry/wxapp/index',
      data: { controller: 'goods.getQuan', token, quan_id },
      dataType: 'json',
      success: function (msg) {
        //1 被抢光了 2 已领过  3  领取成功
        if (msg.data.code == 0) {
          wx.showToast({
            title: msg.data.msg || '被抢光了',
            icon: 'none'
          })
        } else if (msg.data.code == 1) {
          wx.showToast({
            title: '被抢光了',
            icon: 'none'
          })
        } else if (msg.data.code == 2) {
          wx.showToast({
            title: '已领取',
            icon: 'none'
          })
          var new_quan = [];
          for (var i in quan_list) {
            if (quan_list[i].id == quan_id) quan_list[i].is_get = 1;
            new_quan.push(quan_list[i]);
          }
          that.setData({ quan: new_quan })
        }
        else if (msg.data.code == 4) {
          wx.showToast({
            title: '新人专享',
            icon: 'none'
          })
        } 
        else if (msg.data.code == 3) {
          var new_quan = [];
          for (var i in quan_list) {
            if (quan_list[i].id == quan_id){
              quan_list[i].is_get = 1;
              quan_list[i].is_hide = msg.data.is_hide;
            }
            new_quan.push(quan_list[i]);
          }
          if(type==1) {
            that.setData({ alert_quan_list: new_quan })
          } else {
            that.setData({ quan: new_quan })
          }
          wx.showToast({
            title: '领取成功',
          })
        } else if (msg.data.code == 4) {
          // 未登录
        }
      }
    })
  },

  goUse: function (e) {
    this.setData({ showCouponModal: false, hasAlertCoupon: false })
    let idx = e.currentTarget.dataset.idx;
    let quan = this.data.alert_quan_list || [];
    console.log(Object.keys(quan).length)
    if (Object.keys(quan).length >= idx) {
      if (quan[idx].is_limit_goods_buy == 0) {
        wx.switchTab({
          url: '/eaterplanet_ecommerce/pages/index/index',
        })
      } else if (quan[idx].is_limit_goods_buy == 1) {
        let id = quan[idx].limit_goods_list;
        let ids = id.split(',');
        let url = '';
        if (ids.length > 1) {
          url = '/eaterplanet_ecommerce/pages/type/result?type=2&good_ids=' + id;
        } else {
          url = '/eaterplanet_ecommerce/pages/goods/goodsDetail?id=' + id;
        }
        wx.navigateTo({ url: url })
      } else if (quan[idx].is_limit_goods_buy == 2) {
        let gid = quan[idx].goodscates || 0;
        wx.navigateTo({
          url: '/eaterplanet_ecommerce/pages/type/result?type=1&gid=' + gid,
        })
      }
    }
  },

  /**
   * 分类专题
   */
  get_type_topic: function () {
    let that = this;
    var cur_community = wx.getStorageSync('community');
    var token = wx.getStorageSync('token');
    app.util.request({
      url: 'entry/wxapp/index',
      data: { 
        controller: 'goods.get_category_col_list',
        head_id: cur_community.communityId,
        token
      },
      dataType: 'json',
      success: function (res) {
        if(res.data.code == 0) {
          let typeTopicList = res.data.data || [];
          that.setData({ typeTopicList })
        }
      }
    })
  },

  /**
   * 拼团列表
   */
  getPinList: function () {
    let that = this;
    var community = wx.getStorageSync('community');
    let head_id = community.communityId || '';
    var token = wx.getStorageSync('token');
    app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'group.get_pintuan_list',
        is_index: 1,
        head_id,
        token
      },
      dataType: 'json',
      success: function (res) {
        if (res.data.code == 0) {
          let pinList = {};
          let { list, pintuan_index_coming_img, pintuan_index_show } = res.data;
          pinList.list = list || [];
          pinList.img = pintuan_index_coming_img || '';
          pinList.show = pintuan_index_show || 0;
          that.setData({ pinList })
        }
      }
    })
  },

  /**
   * 魔方图标跳转
   */
  goCube: function (t) {
    let idx = t.currentTarget.dataset.idx; // 当前链接索引
    let index = t.currentTarget.dataset.index; // 当前魔方索引
    let { cube, needAuth } = this.data;
    console.log(cube)
    if (cube.length > 0) {
      let url = cube[index].thumb.link[idx];
      let url2 = cube[index].thumb.outlink[idx];
      let type = (cube[index].thumb.linktype && cube[index].thumb.linktype[idx]);
      (type === (void 0)) && (type = 1);
      if (util.checkRedirectTo(url, needAuth)) {
        this.authModal();
        return;
      }
      if (type == 0) {
        // 跳转webview
        url = cube[index].thumb.webview[idx];
        wx.navigateTo({
          url: '/eaterplanet_ecommerce/pages/web-view?url=' + encodeURIComponent(url)
        })
      } else if (type == 1) {
        if (url.indexOf('eaterplanet_ecommerce/pages/index/index') != -1 || url.indexOf('eaterplanet_ecommerce/pages/order/shopCart') != -1 || url.indexOf('eaterplanet_ecommerce/pages/user/me') != -1 || url.indexOf('eaterplanet_ecommerce/pages/type/index') != -1) {
          url && wx.switchTab({ 
            url,
            fail: (err)=>{
              wx.showToast({
                title: err.errMsg,
                icon: 'none'
              })
            } 
          })
        } else {
          url && wx.navigateTo({
            url,
            fail: (err)=>{
              wx.showToast({
                title: err.errMsg,
                icon: 'none'
              })
            } 
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
        let cid = cube[index].thumb.cateid[idx];
        this.goIndexType(cid);
      } else if (type == 4) {
        //独立分类
        let url = cube[index].thumb.cateid[idx];
        app.globalData.typeCateId = url;
        wx.switchTab({
          url: '/eaterplanet_ecommerce/pages/type/index'
        })
      }else if (type==5){
        // 跳转小程序
        let appid = cube[index].thumb.appid[idx];
        appid && wx.navigateToMiniProgram({
          appId: appid,
          path: url2,
          extraData: {},
          envVersion: 'release',
          success(res) {
            // 打开成功
          },
          fail(error) {
            console.log(error)
          }
        })
      } else if (type == 6) {
        //领券
        wx.navigateTo({
          url: '/eaterplanet_ecommerce/moduleA/coupon/getCoupon?id='+url
        })
      }
    }
  },

  goIndexType: function(cid){
    if(cid.detail) {
      cid = cid.detail;
    }
    let classification = this.data.classification;
    let tabs = classification && classification.tabs;
    let activeIdx = tabs.findIndex((p) => { return p.id == cid });
    if (activeIdx != -1) {
      let cateInfo = {
        detail: { e: activeIdx, a: cid }
      };
      this.classificationChange(cateInfo, 1);
    }
  },

  getSecKillGoods: function (seckill_time){
    var that = this;
    var cur_community = wx.getStorageSync('community');
    var token = wx.getStorageSync('token');
    app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'index.load_gps_goodslist',
        token: token,
        pageNum: 1,
        head_id: cur_community.communityId,
        seckill_time,
        is_seckill: 1,
        per_page: 10000
      },
      dataType: 'json',
      success: function (res) {
        if(res.data.code==0) {
          let secRushList = res.data.list || [];
          that.setData({ secRushList })
        }
      }
    })
  },

  scrollSecKillGoodsChange: function (t) {
    this.setData({
      secKillGoodsIndex: t.detail.current + 1
    });
  },

  /**
   * 显示秒杀时间切换
   */
  changeSecKillTime(t){
    let that = this;
    let seckill_time = t.currentTarget.dataset.time;
    let secKillActiveIdx = t.currentTarget.dataset.idx;
    this.setData({
      secRushList: [],
      secKillActiveIdx
    }, ()=>{
      that.getSecKillGoods(seckill_time);
    })
  },

  /** 
   * 图片信息
   */
  imageLoad: function (e) {
    var imageSize = util.imageUtil(e)
    this.setData({
      imageSize
    })
  },

  /**
   * 播放视频隐藏封面图
   */
  btnPlay: function () {
    this.setData({
      fmShow: false
    })
    this.videoContext.play();
  },

  videEnd: function () {
    this.setData({
      fmShow: true
    })
  },

  bindload: function(t){
    console.log(t.detail)
  },

  binderror: function(t){
    this.setData({ hideMpAccount: true })
    console.log(t.detail)
  },

  closeMpaccount: function(){
    this.setData({ show_index_wechat_oa: 0 })
  },

  showNoticeTextHandle: function(e){
    if(this.data.can_index_notice_alert==1) {
      let showNoticeText = e.currentTarget.dataset.status;
      let noticeIdx = e.currentTarget.dataset.idx;
      this.setData({ showNoticeText, noticeIdx })
    }
  },

  /**
   * DIY公用链接跳转
   */
  goDiysliderUrl: function(t) {
    let link = t.currentTarget.dataset.link;
    let needAuth = this.data.needAuth;

    if (Object.keys(link).length > 0) {
      let type = link.parents;
      if (util.checkRedirectTo(link.wap_url, needAuth)) {
        this.authModal();
        return;
      }
      switch(type) {
        case "WEBVIEW":
          let url = link.wap_url;
          url && wx.navigateTo({ url: '/eaterplanet_ecommerce/pages/web-view?url=' + encodeURIComponent(url) });
          break;
        case "MALL_LINK":
          url = link.wap_url;
          if (url.indexOf('eaterplanet_ecommerce/pages/index/index') != -1 || url.indexOf('eaterplanet_ecommerce/pages/order/shopCart') != -1 || url.indexOf('eaterplanet_ecommerce/pages/user/me') != -1 || url.indexOf('eaterplanet_ecommerce/pages/type/index') != -1) {
            url && wx.switchTab({ url })
          } else {
            url && wx.navigateTo({ url })
          }
          break;
        case "OTHER_APPLET":
          // 跳转小程序
          let appId = link.appid;
          let path = link.wap_url;
          appId && wx.navigateToMiniProgram({
            appId,
            path,
            extraData: {},
            envVersion: 'release',
            success(res) {},
            fail(error) {  wx.showModal({ title: "提示", content: error.errMsg, showCancel: false }) }
          })
          break;
        case "CUSTOM_LINK":
          url = link.wap_url;
          if (url.indexOf('eaterplanet_ecommerce/pages/index/index') != -1 || url.indexOf('eaterplanet_ecommerce/pages/order/shopCart') != -1 || url.indexOf('eaterplanet_ecommerce/pages/user/me') != -1 || url.indexOf('eaterplanet_ecommerce/pages/type/index') != -1) {
            url && wx.switchTab({ url })
          } else {
            url && wx.navigateTo({ url })
          }
          break;
        case "GOODS_CATEGORY":
          //独立分类
          let cateId = link.id;
          app.globalData.typeCateId = cateId;
          wx.switchTab({
            url: '/eaterplanet_ecommerce/pages/type/index'
          })
          break;
        default:
          url = link.wap_url;
          url && wx.navigateTo({ url })
          break;
      }
    }
  },

  /**
   * DIY商品列表组获取
   */
  getDiyGoodsList(res) {
    console.log('getDiyGoodsList', res)
    let data = res.detail.data;
    let idx = res.detail.id;
    let diyGoodsList = [];
    let is_open_vipcard_buy = 0;
    if(data.code==0) {
      let resGoodsList = data.list;
      if (data.is_show_list_timer==1&&resGoodsList.length>0) {
        diyGoodsList = this.transTime(resGoodsList);
        for (let s in this.$data.countDownMap) this.initCountDown(this.$data.countDownMap[s]);
      } else {
        diyGoodsList[0] = resGoodsList;
      }
      is_open_vipcard_buy = data.is_open_vipcard_buy;
    }
    let list = this.data.diyGoodsList;
    list[idx] = diyGoodsList;
    this.setData({ diyGoodsList: list, is_open_vipcard_buy })
  },

  getDiyManyGoodsList(res) {
    let data = res.detail.data;
    let list = [];
    if(data.code==0) {
      let resGoodsList = data.list;
      if (data.is_show_list_timer==1&&resGoodsList.length>0) {
        list = this.transTime(resGoodsList);
        for (let s in this.$data.countDownMap) this.initCountDown(this.$data.countDownMap[s]);
      } else {
        list[0] = resGoodsList;
      }
    }

    this.setData({ diyManyGoodsList: list })
  },

  /**
   * DIY数据
   */
  getDiyInfo: function() {
    app.util.ProReq('index.get_diy_info').then(res => {
      console.log(res.global)
      let { diyJson, global } = res;
      global.title && wx.setNavigationBarTitle({ title: global.title });
      wx.setNavigationBarColor({
        backgroundColor: global.topNavColor,
        frontColor: global.textNavColor,
      })
      let diyGoodsList = Array.from(Array(diyJson.length), () => '');
      this.setData({
        diyJson, globalDiyData: global, diyGoodsList, diyLoaded: true
      })
    })
  },

  onShareAppMessage: function(res) {
    this.setData({ is_share_html: true });
    var community = wx.getStorageSync('community');
    var community_id = community.communityId;
    var member_id = wx.getStorageSync('member_id');
    console.log('首页分享地址：');
    console.log(community_id, member_id);
    return {
      title: this.data.shop_info.title,
      path: "eaterplanet_ecommerce/pages/index/index?community_id=" + community_id + '&share_id=' + member_id,
      imageUrl: this.data.shop_info.shop_index_share_image,
      success: function() {},
      fail: function() {}
    };
  },

  onShareTimeline: function(res) {
    var community = wx.getStorageSync('community');
    var community_id = community.communityId;
    var share_id = wx.getStorageSync('member_id');
    var query= `share_id=${share_id}&community_id=${community_id}`;
    return {
      title: this.data.shop_info.title,
      query,
      imageUrl: this.data.shop_info.shop_index_share_image,
      success: function() {},
      fail: function() {}
    };
  }
})
