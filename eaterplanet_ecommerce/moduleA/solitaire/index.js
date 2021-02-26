var app = getApp();
var util = require('../../utils/util.js');
var status = require('../../utils/index.js');

Page({
  mixins: [require('../../mixin/globalMixin.js')],
  data: {
    list: [],
    loadText: "加载中...",
    noData: 0,
    loadMore: true,
    groupInfo: {
      group_name: '社区',
      owner_name: '团长'
    },
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
  onLoad: function(options) {
    app.setShareConfig();
    let that = this;
    status.setNavBgColor();
    status.setGroupInfo().then((groupInfo) => { that.setData({ groupInfo }) });
    let { share_id, community_id } = options;
    this.options = options;
    if (share_id != 'undefined' && share_id > 0) wx.setStorageSync('share_id', share_id);
    this.compareCommunity(community_id)
    this.getData(community_id);
  },

  initFn(community_id) {
    let that = this;
    this.page = 1;
    this.setData({
      list: [],
      loadText: "加载中...",
      noData: 0,
      loadMore: true,
    }, ()=>{
      that.getData(community_id);
    })
  },

  /**
   * 比较社区
   */
  compareCommunity: function (shareCommunityId) {
    let that = this;
    // 原来社区
    let currentCommunity = wx.getStorageSync('community');
    let currentCommunityId = currentCommunity.communityId || '';
    const token = wx.getStorageSync('token');

    shareCommunityId && util.getCommunityById(shareCommunityId).then(res => {
      let { hide_community_change_btn, default_head_info } = res;
      let { groupInfo } = that.data;
      if (res.open_danhead_model == 1) {
        // 开启单社区
        app.globalData.community = default_head_info;
        app.globalData.changedCommunity = true;
        wx.setStorage({ key: "community", data: default_head_info })
        token && util.addhistory(default_head_info);
        if(shareCommunityId!=default_head_info.communityId) {
          let { groupInfo } = that.data;
          app.util.message(`您只能访问自己${groupInfo.group_name}`, 'switchTo:/eaterplanet_ecommerce/pages/index/index', 'error', '知道了');
          return;
        }
      } else {
        // 社区是否存在
        if (currentCommunityId != '' && shareCommunityId) {
          // 存在并且不相同
          console.log('currentCommunityId存在 比较社区')
          if (currentCommunityId != shareCommunityId) {
            console.log('currentCommunityId存在 社区不同')
            //如果禁止切换
            // if (hide_community_change_btn == 1) {
              console.log('禁止切换');
              app.util.message(`您只能访问自己${groupInfo.group_name}`, 'switchTo:/eaterplanet_ecommerce/pages/index/index', 'error', '知道了');
              return;
            // }
            // that.setData({
            //   hide_community_change_btn,
            //   showChangeCommunity: res.data ? true : false,
            //   changeCommunity: res.data,
            //   currentCommunity: currentCommunity
            // })
          }
        } else {
          // 不存在社区id
          //token 是否存在
          if (token) {
            util.getCommunityInfo().then(function (ret) {
              //比较社区
              console.log('token存在 比较社区')
              if (ret.community_id && ret.community_id != shareCommunityId) {
                app.util.message(`您只能访问自己${groupInfo.group_name}`, 'switchTo:/eaterplanet_ecommerce/pages/index/index', 'error', '知道了');
                // that.setData({
                //   showChangeCommunity: true,
                //   currentCommunity: ret
                // })
              }
            }).catch((param) => {
              console.log('step4 新人')
              if (Object.keys(param) != '') util.addhistory(param, true);
            });
          } else {
            console.log('token不存在 存社区')
            // 直接存本地
            app.globalData.community = res.data;
            app.globalData.changedCommunity = true;
            wx.setStorage({ key: "community", data: res.data })
          }
        }
      }
    });
  },

  /**
   * 切换提示
   */
  confrimChangeCommunity: function () {
    let community = this.data.changeCommunity;
    let token = wx.getStorageSync('token');
    app.globalData.community = community;
    app.globalData.changedCommunity = true;
    wx.setStorage({
      key: "community",
      data: community
    })
    token && util.addhistory(community);
    this.initFn(community.communityId);
    this.setData({ showChangeCommunity: false })
    console.log('用户点击确定')
  },

  /**
   * 取消切换
   */
  cancelChangeCommunity: function () {
    let currentCommunity = this.data.currentCommunity;
    let communityId = currentCommunity.communityId || '';
    communityId && this.initFn(communityId);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
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
  },

  /**
   * 获取列表
   */
  getData: function (head_id) {
    let that = this;
    wx.showLoading();
    if (!head_id) {
      let community = wx.getStorageSync('community');
      head_id = community.communityId || '';
    }
    app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'solitaire.get_head_index_solitairelist',
        head_id,
        page: this.page
      },
      dataType: 'json',
      success: function(res) {
        wx.stopPullDownRefresh();
        wx.hideLoading();
        let showTabbar = res.data.showTabbar;
        if (res.data.code == 0) {
          let h = {};
          let list = res.data.data;
          let head_data = res.data.head_data;
          if (list.length < 20) h.noMore = true;
          let oldList = that.data.list;
          list = oldList.concat(list);
          that.page++;
          that.setData({
            list,
            ...h,
            head_data,
            showTabbar
          })
        } else if (res.data.code == 1) {
          // 无数据
          let head_data = res.data.head_data || '';
          if (that.page == 1) that.setData({
            noData: 1
          })
          that.setData({
            loadMore: false,
            noMore: false,
            head_data,
            loadText: "没有更多记录了~",
            showTabbar
          })
        } else if (res.data.code == 2) {
          // 您还未登录
        } else if (res.data.code == 3) {
          // 团长不存在
          app.util.message(res.data.msg, '/eaterplanet_ecommerce/pages/position/community', 'error');
          return;
        } else {
          app.util.message(res.data.msg, '', 'error');
          return;
        }
      }
    })
  },

  goDetails: function (event){
    var id = event ? event.currentTarget.dataset.id : '';
    if(!id) return;
    var pages_all = getCurrentPages();
    let link = `/eaterplanet_ecommerce/moduleA/solitaire/details?id=${id}`;
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

  showImgPrev: function (event) {
    var idx = event ? event.currentTarget.dataset.idx : '';
    var sidx = event ? event.currentTarget.dataset.sidx : '';
    let list = this.data.list;
    let urls = list[sidx].images_list;
    wx.previewImage({
      current: urls[idx],
      urls
    });
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    let that = this;
    this.page = 1;
    this.setData({
      list: [],
      loadText: "加载中...",
      noData: 0,
      loadMore: true,
    }, ()=>{
      that.getData();
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if (!this.data.loadMore) return false;
    this.getData();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let community = wx.getStorageSync('community');
    let head_id = community.communityId || '';
    let share_id = wx.getStorageSync('member_id') || '';
    let share_path = `eaterplanet_ecommerce/moduleA/solitaire/index?share_id=${share_id}&community_id=${head_id}`;
    let title = '';
    return {
      title,
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
    let community = wx.getStorageSync('community');
    let head_id = community.communityId || '';
    let share_id = wx.getStorageSync('member_id') || '';
    let title = '';

    var query= `share_id=${share_id}&community_id=${head_id}`;
    return {
      title,
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
