var app = getApp();
var util = require('../../utils/util.js');
var status = require('../../utils/index.js');

Page({
  mixins: [require('../../mixin/globalMixin.js')],
  data: {
    seconds: 0,
    surplus: 0,
    likeList: [],
    groupInfo: {
      group_name: '社区',
      owner_name: '团长'
    }
  },
  orderId: '',
  canPreSub: true,
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
    app.setShareConfig();
    let that = this;
    let { id, share_id } = options;
    if (share_id != 'undefined' && options.share_id > 0) wx.setStorageSync('share_id', share_id);
    status.setGroupInfo().then((groupInfo) => { that.setData({ groupInfo }) });
    console.log(id)
    var scene = decodeURIComponent(options.scene);
    if (scene != 'undefined' && scene != '') id = scene;
    if (id === void 0) {
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
    this.orderId = id;
    this.getData();
    this.getLikeList();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    util.check_login_new().then((res) => {
      if (res) {
        this.setData({ needAuth: false });
      } else {
        this.setData({ needAuth: true });
      }
    })
  },

  /**
   * 授权成功回调
   */
  authSuccess: function () {
    let that = this;
    this.setData({
      needAuth: false,
    }, () => {
      that.getData();
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

  getData: function () {
    wx.showLoading();
    let that = this;
    var token = wx.getStorageSync('token');
    let order_id = this.orderId;
    app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'groupdo.group_info',
        token,
        order_id
      },
      dataType: 'json',
      success: function (res) {
        wx.hideLoading();
        if (res.data.code == 0) {
          let {
            order_goods,
            goods_info,
            options,
            pin_info,
            share_title,
            pin_order_arr,
            me_take_in,
            is_me,
            interface_get_time,
            order_id,
            order_type,
            pintuan_model_buy,
            community_id,
            hide_community_change_btn,
            pintuan_show_community_info,
            is_need_subscript,
            need_subscript_template
          } = res.data.data;
          goods_info.goods_id = order_goods.goods_id;
          let order = {
            goods_id: order_goods.goods_id,
            pin_id: pin_info.pin_id,
          }
          var timestamp = Date.parse(new Date());
          let seconds = (pin_info.end_time - interface_get_time) * 1000 + timestamp;
          let surplus = goods_info.pin_count - pin_order_arr.length;

          util.getCommunityById(community_id).then(ret => {
            that.setData({ changeCommunity: ret.data })
          })

          //开启社区关联
          if (pintuan_model_buy==1) {
            pin_info.state == 0 && that.needCommunity(community_id, hide_community_change_btn, goods_info);
          }

          that.setData({
            seconds: seconds > 0 ? seconds: 0,
            order,
            order_goods,
            goods_info,
            options,
            pin_info,
            share_title,
            pin_order_arr,
            me_take_in,
            is_me,
            interface_get_time,
            order_id,
            surplus,
            order_type,
            hide_community_change_btn: hide_community_change_btn || 0,
            goodsComunityId: community_id,
            pintuan_model_buy,
            pintuan_show_community_info,
            is_need_subscript,
            need_subscript_template
          })
        } else {
          app.util.message('无数据', '/eaterplanet_ecommerce/moduleA/pin/index', 'error');
        }
      }
    })
  },

  /**
   * 需要社区
   * 判断是否已绑定
   */
  needCommunity: function (shareCommunityId, hideCommunityChangeBtn, goods_info={}) {
    let that = this;
    console.log('需要社区')
    let token = wx.getStorageSync('token');
    let is_all_sale = goods_info.is_all_sale || 0;
    //当前社区
    let currentCommunity = wx.getStorageSync('community');
    let currentCommunityId = (currentCommunity && currentCommunity.communityId) || '';
    console.log('shareCommunityId', shareCommunityId);

    // 单社区
    util.getCommunityById(shareCommunityId).then(res => {
      if (res.open_danhead_model == 1) {
        console.log(res)
        let default_head_info = res.default_head_info;
        app.globalData.community = default_head_info;
        app.globalData.changedCommunity = true;
        wx.setStorage({ key: "community", data: default_head_info })
        that.setData({ community: default_head_info })
        token && that.addhistory(default_head_info);
      } else {
        // 社区是否存在
        if (currentCommunityId != '' && shareCommunityId) {
          // 存在并且不相同
          console.log('currentCommunityId存在 比较社区')
          if (currentCommunityId != shareCommunityId) {
            console.log('currentCommunityId存在 社区不同')
            //如果禁止切换
            let { groupInfo } = that.data;
            console.log(hideCommunityChangeBtn)
            if (hideCommunityChangeBtn == 1 && is_all_sale!=1) {
              app.util.message(`您只能访问自己${groupInfo.group_name}`, '/eaterplanet_ecommerce/moduleA/pin/index', 'error', '知道了');
              return;
            }
            that.setData({
              showChangeCommunity: true,
              changeCommunity: res.data,
              community: currentCommunity
            })
          }
        } else {
          // 不存在社区id
          //token 是否存在
          if (token) {
            util.getCommunityInfo().then(function (ret) {
              //比较社区
              console.log('token存在 比较社区')
              if (ret.community_id && ret.community_id != shareCommunityId) {
                that.setData({
                  showChangeCommunity: true,
                  community: currentCommunity
                })
              }
            }).catch((param) => {
              console.log('step4 新人')
              if (Object.keys(param) != '') that.addhistory(param, true);
            });
          } else {
            console.log('token不存在 存社区')
            // 直接存本地
            app.globalData.community = res;
            app.globalData.changedCommunity = true;
            wx.setStorage({ key: "community", data: res })
            that.setData({ community: res })
          }
        }
      }
    })
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
    token && this.addhistory(community);

    this.setData({ community, showChangeCommunity: false })
    console.log('用户点击确定')
  },

  /**
   * 取消切换
   */
  cancelChangeCommunity: function(){
    let { community, goods_info, groupInfo } = this.data;
    (goods_info.is_all_sale == 1) || wx.showModal({
      title: '提示',
      content: `此拼团在您所属${groupInfo.group_name}不可参与`,
      showCancel: false,
      confirmColor: '#ff5041',
      success(res) {
        if (res.confirm) {
          let community_id = (community && community.communityId) || '';
          let goods_id = goods_info.goods_id;
          app.util.request({
            url: 'entry/wxapp/index',
            data: {
              controller: 'goods.check_goods_community_canbuy',
              community_id,
              goods_id
            },
            dataType: 'json',
            success: function (res) {
              if (res.data.code == 0) {
                wx.redirectTo({
                  url: `/eaterplanet_ecommerce/moduleA/pin/goodsDetail?id=${goods_id}`
                })
              } else {
                wx.redirectTo({
                  url: '/eaterplanet_ecommerce/moduleA/pin/index'
                })
              }
            }
          })
        }
      }
    });
  },

  /**
   * 历史社区
   */
  addhistory: function (community, isNew = false) {
    var community_id = community.communityId;
    console.log('addhistory');
    var token = wx.getStorageSync('token');
    app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'index.addhistory_community',
        community_id,
        token: token
      },
      dataType: 'json',
      success: function (res) {
        if (isNew) {
          console.log('新人 社区')
          app.util.request({
            'url': 'entry/wxapp/index',
            'data': {
              controller: 'index.get_community_info',
              community_id: community_id
            },
            dataType: 'json',
            success: function (result) {
              if (result.data.code == 0) {
                let community = result.data.data;
                app.globalData.community = community;
                app.globalData.changedCommunity = true;
                wx.setStorage({ key: "community", data: community })
              }
            }
          })
        }
      }
    })
  },

  getLikeList: function(){
    let that = this;
    var token = wx.getStorageSync('token');
    let order_id = this.orderId;
    let community = wx.getStorageSync('community');
    let community_id = (community && community.communityId) || '';

    app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'group.pintuan_like_list',
        order_id,
        community_id
      },
      dataType: 'json',
      success: function (res) {
        if (res.data.code == 0) {
          let { is_show_order_guess_like, list } = res.data;
          that.setData({ is_show_order_guess_like, likeList: list || [] })
        } else {
          console.log('猜你喜欢无数据')
        }
      }
    })
  },

  goLink: function (e) {
    var pages_all = getCurrentPages();
    var url = e.currentTarget.dataset.link;
    if (pages_all.length > 6) {
      url && wx.redirectTo({ url })
    } else {
      url && wx.navigateTo({ url })
    }
  },

  /**
   * 开团订阅
   */
  preSub: function(e){
    let that = this;
    if(!this.canPreSub) return;
    this.canPreSub = false;
    let is_need_subscript = this.data.is_need_subscript;
    if(is_need_subscript==1) {
      //弹出订阅消息
      this.subscriptionNotice().then(()=>{
        that.preOpenSku();
      }).catch(()=>{
        that.preOpenSku();
      });
    } else {
      that.preOpenSku();
    }
  },

  /**
   * 订阅消息
   */
  subscriptionNotice: function() {
    console.log('subscriptionNotice')
    let that = this;
    return new Promise((resolve, reject)=>{
      let obj = that.data.need_subscript_template;
      let tmplIds =  Object.keys(obj).map(key => obj[key]); // 订阅消息模版id
      if (wx.requestSubscribeMessage) {
        tmplIds.length && wx.requestSubscribeMessage({
          tmplIds: tmplIds,
          success(res) {
            let is_need_subscript = 1;
            let acceptId = [];
            Object.keys(obj).forEach(item=>{
              if (res[obj[item]] == 'accept') {
                //用户同意了订阅，添加进数据库
                acceptId.push(item);
              } else {
                //用户拒绝了订阅或当前游戏被禁用订阅消息
                is_need_subscript = 0;
              }
            })

            if(acceptId.length) {
              that.addAccept(acceptId);
            }
            that.setData({ is_need_subscript })
            resolve();
          },
          fail() {
            reject();
          }
        })
      } else {
        // 兼容处理
        reject();
      }
    })
  },

  // 用户点击订阅添加到数据库
  addAccept: function (acceptId) {
    let token = wx.getStorageSync('token');
    let type = acceptId.join(',');
    app.util.request({
      url: 'entry/wxapp/user',
      data: {
        controller: 'user.collect_subscriptmsg',
        token,
        type
      },
      dataType: 'json',
      method: 'POST',
      success: function () {}
    })
  },

  preOpenSku: function(){
    this.canPreSub = true;
    var that = this;
    var { order, options, goods_info } = that.data;

    order.buy_type = 'pintuan';
    order.quantity = 1;
    that.setData({ order: order })

    var is_just_addcar = 0;
    let list = options.list || [];
    let arr = [];
    if (list.length > 0) {
      for (let i = 0; i < list.length; i++) {
        let sku = list[i]['option_value'][0];
        let temp = {
          name: sku['name'],
          id: sku['option_value_id'],
          index: i,
          idx: 0
        };
        arr.push(temp);
      }
      //把单价剔除出来begin
      var id = '';
      for (let i = 0; i < arr.length; i++) {
        if (i == arr.length - 1) {
          id = id + arr[i]['id'];
        } else {
          id = id + arr[i]['id'] + "_";
        }
      }
      let cur_sku_arr = options.sku_mu_list[id];
      that.setData({
        sku: arr,
        sku_val: 1,
        cur_sku_arr: cur_sku_arr,
        skuList: options,
        visible: true,
        showSku: true,
        is_just_addcar
      });
    } else {
      let actPrice = goods_info.danprice || '0.00';
      let pinprice = goods_info.pinprice || '0.00';
      let cur_sku_arr = {
        skuImage: goods_info.goods_images,
        spuName: goods_info.name,
        actPrice: actPrice.split('.'),
        pinprice: pinprice.split('.')
      };
      that.setData({
        visible: true,
        showSku: true,
        is_just_addcar,
        sku: [],
        sku_val: 1,
        cur_sku_arr,
        skuList: []
      }, () => {
        // that.goOrder();
      })
    }
  },

  openSku: function () {
    if (!this.authModal()) return;
    var that = this;
    var { goodsComunityId, groupInfo, goods_info } = that.data;

    if (this.data.pintuan_model_buy==1) {
      //判断社区是否相同
      let currentCommunity = wx.getStorageSync('community');
      let currentCommunity_id = (currentCommunity && currentCommunity.communityId) || '';
      if ((goodsComunityId != '' && currentCommunity_id != '' && goodsComunityId == currentCommunity_id) || goods_info.is_all_sale==1) {
        this.preSub();
      } else {
        app.util.message(`此拼团在您所属${groupInfo.group_name}不可参与`, '','error');
      }
    } else {
      this.preSub();
    }
  },

  goOrder: function () {
    var that = this;
    if (that.data.can_car) { that.data.can_car = false; }
    let { order, cur_sku_arr, sku_val } = this.data;
    var goods_id = order.goods_id;
    var quantity = sku_val;
    var sku_str = '';
    var is_just_addcar = 0;
    let buy_type = order.buy_type;
    let pin_id = order.pin_id;

    let community = wx.getStorageSync('community');
    let community_id = community.communityId || 0;

    if (cur_sku_arr && cur_sku_arr.option_item_ids) {
      sku_str = cur_sku_arr.option_item_ids;
    }

    let data = {
      goods_id,
      community_id,
      quantity,
      sku_str,
      buy_type,
      pin_id,
      is_just_addcar
    }

    util.addCart(data).then(res=>{
      if(res.showVipModal==1) {
        let { pop_vipmember_buyimage } = res.data;
        wx.hideLoading();
        that.setData({ pop_vipmember_buyimage, showVipModal: true, visible: false })
      } else if (res.data.code == 3 || res.data.code == 7) {
        wx.showToast({
          title: res.data.msg,
          icon: 'none',
          duration: 2000
        })
      } else if (res.data.code == 4) {
        wx.hideLoading();
        that.setData({ needAuth: true, showAuthModal: true, visible: false })
      } else if (res.data.code == 6) {
        var msg = res.data.msg;
        let max_quantity = res.data.max_quantity || '';
        (max_quantity > 0) && that.setData({ sku_val: max_quantity })
        wx.showToast({
          title: msg,
          icon: 'none',
          duration: 2000
        })
      } else {
        var pages_all = getCurrentPages();
        let url = `/eaterplanet_ecommerce/pages/order/placeOrder?type=${buy_type}`;
        (pages_all.length > 3) ? wx.redirectTo({ url }) : wx.navigateTo({ url });
      }
    }).catch(res=>{
      app.util.message(res||'请求失败', '', 'error');
    })
  },

  selectSku: function (event) {
    var that = this;
    let str = event.currentTarget.dataset.type;
    let obj = str.split("_");
    let arr = that.data.sku;
    let temp = {
      name: obj[3],
      id: obj[2],
      index: obj[0],
      idx: obj[1]
    };
    arr.splice(obj[0], 1, temp);
    that.setData({
      sku: arr
    })
    var id = '';
    for (let i = 0; i < arr.length; i++) {
      if (i == arr.length - 1) {
        id = id + arr[i]['id'];
      } else {
        id = id + arr[i]['id'] + "_";
      }
    }
    var options = this.data.skuList;
    var cur_sku_arr = options.sku_mu_list[id];

    that.setData({
      cur_sku_arr: cur_sku_arr
    });
    console.log(id);
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
      var cur_sku_arr = options.sku_mu_list[id];
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

  /**
   * 确认购物车
   */
  gocarfrom: function (e) {
    var that = this;
    wx.showLoading();
    var token = wx.getStorageSync('token');
    app.util.request({
      'url': 'entry/wxapp/user',
      'data': {
        controller: 'user.get_member_form_id',
        'token': token,
        "from_id": e.detail.formId
      },
      dataType: 'json',
      success: function (res) { }
    })
    that.goOrder();
  },

  /**
   * 关闭购物车
   */
  closeSku: function () {
    this.setData({
      visible: 0,
      stopClick: false,
    });
  },

  showAllBtn: function() {
    this.setData({
      showAllUser: !this.data.showAllUser
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var that = this;
    var share_id = wx.getStorageSync('member_id') || '';
    var share_path = 'eaterplanet_ecommerce/moduleA/pin/share?id=' + that.data.order_id + '&share_id=' + share_id;
    let { surplus, order_goods } = this.data;
    let title = '';
    if (surplus > 0) {
      title = `还差${surplus}人！我${order_goods.price}元团了${order_goods.name}`;
    } else {
      title = `我${order_goods.price}元团了${order_goods.name}`;
    }
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

  onShareTimeline: function() {
    var share_id = wx.getStorageSync('member_id') || '';
    let { surplus, order_goods, order_id } = this.data;
    let title = '';
    if (surplus > 0) {
      title = `还差${surplus}人！我${order_goods.price}元团了${order_goods.name}`;
    } else {
      title = `我${order_goods.price}元团了${order_goods.name}`;
    }

    var query= `id=${order_id}&share_id=${share_id}`;
    return {
      title: title,
      query,
      success: function() {},
      fail: function() {}
    };
  }
})
