var app = getApp();
var status = require('../../utils/index.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    waitSendNum: 0,
    waitSignNum: 0,
    waitPickNum: 0,
    completeNum: 0,
    disUserId: "",
    communityName: "",
    communityId: "",
    distribution: "",
    estimate: "",
    lastMonth: "",
    isShow: true,
    currentTab: 0,
    show_on_one:0,
    dialogShow: 0,
    effectValidOrderNum: 0,
    groupInfo: {
      group_name: '社区',
      owner_name: '团长'
    },
    showActionsheet: false,
    shareActionsheet: [
      { text: '发送给朋友', value: 1, share: true },
      { text: '生成二维码', value: 2, type: 'warn' }
    ]
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
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    status.setGroupInfo().then((groupInfo) => {
      let owner_name = groupInfo && groupInfo.owner_name || '团长';
      wx.setNavigationBarTitle({
        title: `${owner_name}中心`,
      })
      that.setData({ groupInfo })
    });
    this.loadPage();
  },

  loadPage: function () {
    let that = this;
    status.loadStatus().then(function () {
      let appLoadStatus = app.globalData.appLoadStatus;
      if (appLoadStatus == 0) {
       //未登录
      wx.redirectTo({
        url: "/eaterplanet_ecommerce/pages/user/me"
      })
      } else if (appLoadStatus == 2) {
       // wx.redirectTo({
        //  url: "/eaterplanet_ecommerce/pages/position/community"
       // })
      }
      that.setData({
        appLoadStatus: appLoadStatus,
        community: app.globalData.community
      })
    });
    this.load_community_data();
  },
  load_community_data:function(){
    var token = wx.getStorageSync('token');
    var that = this;
    app.util.request({
      'url': 'entry/wxapp/user',
      'data': {
        controller: 'community.get_community_info',
        'token': token
      },
      dataType: 'json',
      success: function (res) {
        if (res.data.code == 0) {
          let communityData = res.data;
          let commission_info = communityData.commission_info;
          commission_info.mix_total_money = commission_info.mix_total_money.toFixed(2);
          let { head_today_pay_money, today_add_head_member, today_after_sale_order_count, today_invite_head_member,is_open_solitaire,is_show_community_ranking } = res.data;
          that.setData({
            member_info: communityData.member_info,
            community_info: communityData.community_info,
            commission_info: commission_info,
            total_order_count: communityData.total_order_count || 0,
            total_member_count: communityData.total_member_count || 0,
            today_order_count: communityData.today_order_count || 0,
            today_effect_order_count: communityData.today_effect_order_count || 0,
            today_pay_order_count: communityData.today_pay_order_count || 0,
            today_pre_total_money: communityData.today_pre_total_money || 0,
            waitSendNum: communityData.wait_send_count || 0,
            waitSignNum: communityData.wait_qianshou_count || 0,
            waitPickNum: communityData.wait_tihuo_count || 0,
            completeNum: communityData.has_success_count || 0,
            open_community_addhexiaomember: communityData.open_community_addhexiaomember,
            open_community_head_leve: communityData.open_community_head_leve,
            head_today_pay_money,
            today_add_head_member, 
            today_after_sale_order_count, 
            today_invite_head_member,
            is_open_solitaire,
            shop_index_share_title: communityData.shop_index_share_title,
            shop_index_share_image: communityData.shop_index_share_image,
            is_show_community_ranking: is_show_community_ranking || 0
          });
        } else {
          //is_login
          wx.reLaunch({
            url: '/eaterplanet_ecommerce/pages/user/me',
          })
        }
      }
    })
  },

  /**
   * 扫描
   */
  goScan: function(){
    wx.scanCode({
      success(res) {
        console.log(res)
        if (res.scanType == 'WX_CODE' && res.path != '')
        {
          wx.navigateTo({
            url: "/" + res.path
          });
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
    var show_on_one = this.data.show_on_one;
    let commiss_diy_name = wx.getStorageSync('commiss_diy_name') || '分销';
    if (show_on_one > 0) {
      this.load_community_data();
    }
    this.setData({
      show_on_one: 1,
      commiss_diy_name
    })
  },

  /**
   * 跳转订单
   */
  goOrder: function (e) {
    let status = e.currentTarget.dataset.status;
    wx.navigateTo({
      url: "/eaterplanet_ecommerce/moduleA/groupCenter/groupList?tab=" + status
    });
  },

  /**
   * 跳转编辑
   */
  goEdit: function () {
    wx.navigateTo({
      url: "/eaterplanet_ecommerce/moduleA/groupCenter/setting?id=" + this.data.community_info.id
    });
  },

  /**
   * 导航切换
   */
  switchNav: function (e) {
    if (this.data.currentTab === 1 * e.target.dataset.current) return false;
    this.setData({
      currentTab: 1 * e.target.dataset.current
    });
  },

  /**
   * 导航切换监控
   */
  bindChange: function (e) {
    this.setData({
      currentTab: 1 * e.detail.current
    });
    for (var i = 0; i < 4; i++) {
      if (this.data.currentTab === i) {
        this.setData({
          effectEstimate: this.data.effectList[i].estimate,
          effectSettle: this.data.effectList[i].settle,
          effectValidOrderNum: this.data.effectList[i].validOrderNum
        });
      }
    }
  },

  changeMycommunion: function () {
    let community_info = this.data.community_info;
    let community_id = community_info.id;
    console.log(community_id)
    var token = wx.getStorageSync('token');
    let that = this;
    community_id !== void 0 && app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'index.addhistory_community',
        community_id: community_id,
        token: token
      },
      dataType: 'json',
      success: function (res) {
        console.log('s1')
        that.getCommunityInfo().then(() => {
          console.log('s2')
          app.globalData.changedCommunity = true;
          wx.switchTab({
            url: '/eaterplanet_ecommerce/pages/index/index',
          })
        });
      }
    })
  },

  getCommunityInfo: function(){
    return new Promise(function (resolve, reject) {
      var token = wx.getStorageSync('token');
      app.util.request({
        url: 'entry/wxapp/index',
        data: {
          controller: 'index.load_history_community',
          token: token
        },
        dataType: 'json',
        success: function (res) {
          if (res.data.code == 0) {
            let history_communities = res.data.list;
            if (Object.keys(history_communities).length > 0 || history_communities.communityId != 0) {
              wx.setStorageSync('community', history_communities);
              app.globalData.community = history_communities;
              resolve(history_communities);
            } else {
              resolve('');
            }
          }
        }
      })
    })
  },

  handleShareActionsheet: function(){
    // this.setData({ showActionsheet: true })
    this.getShareCode();
  },

  closeQrcodeModal: function(){
    this.setData({ showQrcodeModal: !this.data.showQrcodeModal })
  },

  getShareCode(){
    wx.showLoading();
    var token = wx.getStorageSync('token');
    var that = this;
    app.util.request({
      url: 'entry/wxapp/user',
      data: {
        controller: 'community.community_index_shareqrcode',
        token
      },
      dataType: 'json',
      success: function (res) {
        wx.hideLoading();
        if (res.data.code == 0) {
          let qrcode = res.data.qrcode;
          if(!qrcode) {
            return wx.showToast({
              title: '暂未生成二维码',
              icon: 'none'
            })
          }
          that.setData({ qrcode, showQrcodeModal: true })
        }
      }
    })
  },

  btnClick(e){
    let type = e.detail.value;
    if(type==2) {
      this.setData({showActionsheet: false})
      this.getShareCode();
    }
  },

  saveImgToThumb: function(){
    let image_path = this.data.qrcode;
    let that = this;
    wx.getImageInfo({
      src: image_path,
      success: function(res) {
        var real_path = res.path;
        wx.saveImageToPhotosAlbum({
          filePath: real_path,
          success(res) {
            wx.showToast({
              title: '图片保存成功，可以分享了',
              icon: 'none',
              duration: 2000
            })
            that.setData({
              showQrcodeModal: false
            });
          }
        })
      }
    })
  },

  confirmMessage: function(){
    this.setData({
      dialogShow: !this.data.dialogShow
    })
  },

  goLink: function(event){
    let url = event.currentTarget.dataset.link;
    url && wx.navigateTo({ url })
  },

  onShareAppMessage: function(res) {
    this.setData({ is_share_html: true });
    let community_info = this.data.community_info || '';
    let { id, community_name } = community_info;
    let shopname = wx.getStorageSync('shopname') || '';
    this.setData({ showActionsheet: false });
    let shop_index_share_title = this.data.shop_index_share_title || '';
    let shop_index_share_image = this.data.shop_index_share_image || '';
    let title = shop_index_share_title ? shop_index_share_title : (shopname + ' ' +community_name || '');
    if(!id) return;
    return {
      title,
      path: "eaterplanet_ecommerce/pages/index/index?community_id=" + id,
      imageUrl: shop_index_share_image,
      success: function() {},
      fail: function() {}
    };
  }
})
