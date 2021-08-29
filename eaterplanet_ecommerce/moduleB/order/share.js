var app = getApp();
var status = require('../../utils/index.js');
var util = require('../../utils/util.js');

Page({
  mixins: [require('../../mixin/globalMixin.js'), require('../../mixin/compoentCartMixin.js')],
  data: {
    members: '',
    order_goods_list: [],
    orders: '',
    cartNum: 0,
    groupInfo: {
      group_name: '社区',
      owner_name: '团长'
    },
  },
  isFirst: 1,

  onLoad: function (options) {
    let order_id = options.order_id || '';
    if (!order_id) {
      wx.showModal({
        title: '提示',
        content: '参数错误',
        showCancel: false,
        confirmColor: '#F75451',
        success(res) {
          if (res.confirm) {
            wx.redirectTo({
              url: '/eaterplanet_ecommerce/pages/index/index',
            })
          }
        }
      })
      return false;
    }
    status.setGroupInfo().then((groupInfo) => { this.setData({ groupInfo }) });
    this.getData(order_id);
  },

  getData: function (order_id) {
    wx.showLoading();
    let token = wx.getStorageSync('token');
    app.util.ProReq('order.share_order', {
      token,
      order_id
    }).then(res => {
      wx.hideLoading();
      let {
        members,
        order_goods_list,
        orders
      } = res.data;
      this.setData({
        members,
        order_goods_list,
        orders
      })
      if(this.isFirst==1) this.compareCommunity(orders.head_info);
      this.isFirst++;
    }).catch(err => {
      console.log(err)
      app.util.message(err.msg || '请求出错', 'switchTo:/eaterplanet_ecommerce/pages/user/me', 'error');
    })
  },

  changeNotListCartNum: function (t) {
    let that = this;
    let e = t.detail;
    (0, status.cartNum)(that.setData({
      cartNum: e
    }));
  },

  /**
   * 比较社区
   * shareCommunity: 这个接龙的所属社区
   */
  compareCommunity: function (shareCommunity='') {
    console.log('shareCommunity', shareCommunity)
    let that = this;
    // 原来社区
    let currentCommunity = wx.getStorageSync('community');
    let currentCommunityId = currentCommunity.communityId || '';
    const token = wx.getStorageSync('token');
    let {
      groupInfo
    } = that.data;

    let shareCommunityId = shareCommunity.id || '';
    shareCommunityId && util.getCommunityById(shareCommunityId).then(res => {
      let {
        hide_community_change_btn,
        default_head_info
      } = res;
      if (res.open_danhead_model == 1) {
        // 开启单社区
        app.globalData.community = default_head_info;
        app.globalData.changedCommunity = true;
        wx.setStorage({
          key: "community",
          data: default_head_info
        })
        token && util.addhistory(default_head_info);
        if (shareCommunityId != default_head_info.communityId) {
          let {
            groupInfo
          } = that.data;
          console.log('开启单社区');
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
            console.log('禁止切换');
            app.util.message(`您只能访问自己${groupInfo.group_name}`, 'switchTo:/eaterplanet_ecommerce/pages/index/index', 'error', '知道了');
            return;
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
                return;
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
            wx.setStorage({
              key: "community",
              data: res.data
            })
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

    this.setData({
      showChangeCommunity: false
    })
    console.log('用户点击确定')
  },

  /**
   * 取消切换
   */
  cancelChangeCommunity: function () {
    let {
      groupInfo
    } = this.data;
    wx.showModal({
      title: '提示',
      content: `此订单在您所属${groupInfo.group_name}不可参与`,
      showCancel: false,
      confirmColor: '#ff5041',
      success(res) {
        if (res.confirm) {
          wx.switchTab({
            url: `/eaterplanet_ecommerce/pages/index/index`
          })
        }
      }
    });
  },
})
