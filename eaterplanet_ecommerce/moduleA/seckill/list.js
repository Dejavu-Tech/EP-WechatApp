var app = getApp();
var util = require('../../utils/util.js');
var status = require('../../utils/index.js');

Page({
  mixins: [require('../../mixin/globalMixin.js')],
  data: {
      statusBarHeight: app.globalData.statusBarHeight + 44 + 'px',
      searchBarHeight: app.globalData.statusBarHeight + 'px',
    currentTab: 0,
    scekillTimeList: [],
    endTime: 10000,
    list: [],
    clearTimer: false
  },
  secTime: '',
  seckill_share_title: '',
  seckill_share_image: '',
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
    status.setNavBgColor();
    app.setShareConfig();
    this.secTime = options.time || '';
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    util.check_login_new().then((res) => {
      that.setData({needAuth: !res})
      res && (0, status.cartNum)('', true).then((resp) => {
        resp.code == 0 && that.setData({
          cartNum: resp.data
        })
      });
    })
    this.loadPage();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.setData({ clearTimer: false })
  },

  loadPage: function(){
    this.getInfo();
  },

  /**
   * 授权成功回调
   */
  authSuccess: function () {
    const that = this;
    this.setData({
      showEmpty: false,
      needAuth: false,
      showAuthModal: false
    }, () => {
      that.loadPage()
    })
  },

  authModal: function () {
    if (this.data.needAuth) {
      this.setData({
        showAuthModal: !this.data.showAuthModal
      });
      return false;
    }
    return true;
  },

  getInfo: function(){
    let that = this;
    app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'scekill.get_scekill_info'
      },
      dataType: 'json',
      success: function (res) {
        if(res.data.code==0){
          let {
            seckill_is_open,
            scekill_time_arr,
            seckill_page_title,
            seckill_bg_color,
            seckill_share_title,
            seckill_share_image,
            showTabbar
          } = res.data.data;
          wx.setNavigationBarTitle({
            title: seckill_page_title || '整点秒杀'
          })

          let myDate = new Date();
          let curHour = myDate.getHours(); // 当前时间
          console.log('当前时间:', curHour);
          let curSeckillIdx = 0; //当前时间索引
          let scekillTimeArr = scekill_time_arr || []; //显示的时间段
          // if (scekill_time_arr.length > 5) {}
          //判断各个时段状态
          let scekillTimeList = [];
          let currentTab = 0;
          if (scekillTimeArr.length) {
            scekillTimeArr.forEach((item, idx) => {
              let secObj = {};
              //state: 0已开抢 1疯抢中 2即将开抢
              if (item == curHour) {
                secObj.state = 1;
                secObj.desc = '疯抢中';
                currentTab = idx;
              } else if (item < curHour) {
                secObj.state = 0;
                secObj.desc = '已开抢';
              } else {
                secObj.state = 2;
                secObj.desc = '即将开抢';
              }
              secObj.timeStr = (item < 10 ? '0' + item : item) + ':00';
              secObj.seckillTime = item;
              scekillTimeList.push(secObj);
            })
            if (that.secTime!='') {
              let k = scekillTimeArr.findIndex((n) => n == that.secTime);
              if (k > 0) currentTab = k;
            }
            that.getSecKillGoods(scekillTimeArr[currentTab]);
          }

          let curTimeStr = (scekillTimeArr[currentTab]*1 + 1);
          if (that.secTime!='' && curHour!=scekillTimeArr[currentTab]) {
            curTimeStr = (scekillTimeArr[currentTab]*1);
          }

          let endTime = new Date(new Date().toLocaleDateString()).getTime() + curTimeStr*60*60*1000;
          that.seckill_share_title = seckill_share_title;
          that.seckill_share_image = seckill_share_image;
          that.setData({ scekillTimeList, seckill_bg_color, currentTab, endTime, showTabbar })
        }
      }
    })
  },

  handleClick(e) {
    let that = this;
    let currentTab = e.currentTarget.dataset.index;
    let scekillTimeList = this.data.scekillTimeList;
    let day = new Date(new Date().toLocaleDateString()).getTime();
    let curTimeItem = scekillTimeList[currentTab];
    let endTime = 0;
    if (curTimeItem.state == 1) {
      endTime = day + (curTimeItem.seckillTime * 1 + 1) * 60 * 60 * 1000;
    } else {
      if (curTimeItem.state == 2) {
        endTime = day + (curTimeItem.seckillTime * 1) * 60 * 60 * 1000 + 1;
      }
    }

    this.setData({
      list: [],
      currentTab,
      endTime,
      clearTimer: true
    }, ()=>{
      that.getSecKillGoods(curTimeItem.seckillTime);
    })
  },

  getSecKillGoods: function (seckill_time) {
    wx.showLoading();
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
        wx.stopPullDownRefresh();
        wx.hideLoading();
        if (res.data.code == 0) {
          let list = res.data.list || [];
          list = that.transTime(list);
          let showEmpty = false;
          if (list.length == 0) showEmpty = true;
          that.setData({ list, clearTimer: false, showEmpty })
        } else {
          that.setData({ clearTimer: false, showEmpty: true })
        }
      }
    })
  },

  /**
   * 结束时间判断
   */
  transTime: function (list) {
    let that = this;
    let e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0;
    e === 0 && list.map(function (t) {
      t.end_time *= 1000;
      t.actEnd = t.end_time <= new Date().getTime();
    })
    return list;
  },

  endCurSeckill: function(){
    this.loadPage();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.loadPage();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var member_id = wx.getStorageSync('member_id');
    let {
      seckill_share_title,
      seckill_share_image
    } = this;
    return {
      title: seckill_share_title,
      path: "eaterplanet_ecommerce/moduleA/seckill/list?share_id=" + member_id,
      imageUrl: seckill_share_image,
      success: function () { },
      fail: function () { }
    };
  },

  onShareTimeline: function() {
    var member_id = wx.getStorageSync('member_id');
    let {
      seckill_share_title,
      seckill_share_image
    } = this;
    var query= `share_id=${member_id}`;
    return {
      title: seckill_share_title,
      imageUrl: seckill_share_image,
      query,
      success: function() {},
      fail: function() {}
    };
  }
})
