// 团长接龙详情
var app = getApp();
var util = require('../../utils/util.js');
var status = require('../../utils/index.js');

Page({
  mixins: [require('../../mixin/compoentCartMixin.js'), require('../../mixin/globalMixin.js')],
  data: {
    showGoodsModal: false,
    showCommentModal: false,
    showCartModal: false,
    pid: 0,
    hideGoods: true,
    buy_type: 'soitaire',
    groupInfo: {
      group_name: '社区',
      owner_name: '团长'
    },
    showShareModal: false,
    list: [],
    loadText: "加载中...",
    noData: 0,
    loadMore: true,
    isIpx: app.globalData.isIpx,
    orderList: [],
    noOrderMore: false,
    noOrderData: 0,
    myOrderList: [],
    noMyOrderMore: false,
    noMyOrderData: false
  },
  imagePath: '',
  options: '',
  page: 1,
  soli_id: 0,
  orderPage: 1,
  isFirst: 1,
  myOrderPage: 1,
  canCancel: true,
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
    status.setNavBgColor();
    status.setGroupInfo().then((groupInfo) => { that.setData({ groupInfo }) });
    var scene = decodeURIComponent(options.scene);
    if (scene !== 'undefined') {
      var opt_arr = scene.split("_");
      options.id = opt_arr[0]; //接龙id
      options.share_id = opt_arr[1]; //分享人id
    }
    let { id, share_id } = options;
    this.options = options;
    if (share_id != 'undefined' && share_id > 0) wx.setStorageSync('share_id', share_id);
    if (!id) {
      app.util.message('参数错误', 'redirect:/eaterplanet_ecommerce/moduleA/solitaire/index', 'error');
    }
    this.soli_id = id;
  },

  initFn(){
    let that = this;
    let id = this.options && this.options.id || 0;
    this.page = 1;
    this.setData({
      list: [],
      loadText: "加载中...",
      noData: 0,
      loadMore: true
    }, ()=>{
      id && that.getData(id);
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    let id = this.options && this.options.id || 0;
    id && this.getData(id),this.getOrderList(), this.getMyOrderList();
    util.check_login_new().then((res) => {
      if (!res) {
        that.setData({
          needAuth: true
        })
      } else {
        that.showCartGoods().catch(()=>{
          console.log('购物车为空')
        });
      }
    })
  },

  onHide: function () {
    this.setData({ clearTime: true })
  },

  authSuccess: function(){
    this.setData({ needAuth: false })
    let head_data = this.data.community;
    console.log('authSuccess');
    this.compareCommunity(head_data);
    this.visiteRecord();
  },

  /**
   * 获取详情
   */
  getData: function (id) {
    const token = wx.getStorageSync('token');
    let that = this;
    app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'solitaire.get_solitaire_detail',
        id,
        token
      },
      dataType: 'json',
      success: function (res) {
        if (res.data.code == 0) {
          let { head_data, soli_info, solitaire_target, solitaire_target_takemember, solitaire_target_takemoney, solitaire_target_type,solitaire_is_message } = res.data;

          // 完成接龙差值
          let {
            soli_total_money, //一共下单金额
            order_count //一共下多少单
          } = soli_info;
          let diffMoney = solitaire_target_takemoney * 1 - soli_total_money*1;
          let diffMember = solitaire_target_takemember * 1 - order_count * 1;
          that.setData({
            community: head_data || '',
            soli_info,
            solitaire_target,
            solitaire_target_takemember,
            solitaire_target_takemoney,
            solitaire_target_type,
            diffMoney,
            diffMember,
            clearTime: false,
            solitaire_is_message
          })

          if(that.isFirst==1) {
            that.compareCommunity(head_data);
            if(solitaire_is_message==1){
              that.getCommentList()
            }
            setTimeout(() => {
              that.drawImg(head_data, soli_info);
            }, 1000);
            token && that.visiteRecord();
          }
          that.isFirst++;
        } else {
          app.util.message(res.data.msg, 'redirect:/eaterplanet_ecommerce/moduleA/solitaire/index', 'error');
          return;
        }
      }
    })
  },

  showImgPrev: function (event) {
    var idx = event ? event.currentTarget.dataset.idx : '';
    let urls = this.data.soli_info.images_list || '';
    wx.previewImage({
      current: urls[idx],
      urls
    });
  },

  /**
   * 比较社区
   * shareCommunity: 这个接龙的所属社区
   */
  compareCommunity: function(shareCommunity) {
    let that = this;
    // 原来社区
    let currentCommunity = wx.getStorageSync('community');
    let currentCommunityId = currentCommunity.communityId || '';
    const token = wx.getStorageSync('token');
    let { groupInfo } = that.data;

    let shareCommunityId = shareCommunity.head_id || '';
    shareCommunityId && util.getCommunityById(shareCommunityId).then(res=>{
      let { hide_community_change_btn, default_head_info } = res;
      if (res.open_danhead_model == 1) {
        // 开启单社区
        app.globalData.community = default_head_info;
        app.globalData.changedCommunity = true;
        wx.setStorage({ key: "community", data: default_head_info })
        token && util.addhistory(default_head_info);
        if(shareCommunityId!=default_head_info.communityId) {
          let { groupInfo } = that.data;
          console.log('开启单社区');
          app.util.message(`您只能访问自己${groupInfo.group_name}`, 'redirect:/eaterplanet_ecommerce/moduleA/solitaire/index', 'error', '知道了');
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
              app.util.message(`您只能访问自己${groupInfo.group_name}`, 'redirect:/eaterplanet_ecommerce/moduleA/solitaire/index', 'error', '知道了');
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
                app.util.message(`您只能访问自己${groupInfo.group_name}`, 'redirect:/eaterplanet_ecommerce/moduleA/solitaire/index', 'error', '知道了');
                return;
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

    this.setData({ showChangeCommunity: false })
    console.log('用户点击确定')
  },

  /**
   * 取消切换
   */
  cancelChangeCommunity: function () {
    let { groupInfo } = this.data;
    wx.showModal({
      title: '提示',
      content: `此接龙在您所属${groupInfo.group_name}不可参与`,
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

  /**
   * 商品弹窗
   */
  handleGoodsModal: function () {
    this.setData({
      showGoodsModal: !this.data.showGoodsModal
    })
  },

  /**
   * 评论弹窗
   */
  handleCommentModal: function () {
    this.setData({
      showCommentModal: !this.data.showCommentModal
    })
  },

  changeCartNum: function(e){
    let { goods_total_count, goods_id } = e.detail;
    let soli_info = this.data.soli_info || '';
    let goods_list = soli_info.goods_list || [];
    let gidx = goods_list.findIndex(item => item.actId == goods_id);
    if (gidx !== -1) {
      this.showCartGoods().catch(()=>{
        console.log('购物车为空')
      });
      goods_list[gidx].goods_total_count = goods_total_count || 0;
      soli_info.goods_list = goods_list;
      // let cartNum = 0;
      // goods_list.forEach(item=>{
      //   cartNum += item.goods_total_count*1;
      // })
      this.setData({ soli_info })
    }
  },

  /**
   * 购物车弹窗
   */
  handleCartModal: function() {
    console.log('购物车弹窗');
    let that = this;
    let showCartModal = this.data.showCartModal;
    if (showCartModal){
      this.setData({ showCartModal: false })
    } else {
      this.showCartGoods().then(()=>{
        that.setData({ showCartModal: true })
      }).catch(()=>{
        console.log('购物车为空')
      });
    }
  },

  /**
   * showModal
   */
  showCartGoods: function (showModal=true){
    let that = this;
    return new Promise(function (resolve, reject) {
      const token = wx.getStorageSync('token');
      let soli_id = that.soli_id || '';
      let currentCommunity = wx.getStorageSync('community');
      let community_id = currentCommunity.communityId || '';

      soli_id && wx.showLoading(), app.util.request({
        url: 'entry/wxapp/index',
        data: {
          controller: 'car.show_cart_goods',
          token,
          soli_id,
          community_id,
          buy_type: 'soitaire',
        },
        dataType: 'json',
        success: function (res) {
          wx.hideLoading();
          if (res.data.code == 0) {
            let carts = res.data.carts;
            if (Object.keys(carts).length == 0){
              that.setData({ cartNum: 0 })
              reject(res);
            } else {
              let { cartNum, totMoney } = that.countCartNum(carts);
              showModal && that.setData({ carts, cartNum, totMoney })
              resolve();
            }
          } else if(res.data.code == 5) {
            that.setData({ needAuth: true, showAuthModal: true })
          } else {
            console.log(res)
          }
        }
      })
    })
  },

  /**
   * 计算数量和金额
   * @param {*} carts
   */
  countCartNum: function(carts){
    let cartNum = 0;
    let totMoney = 0;
    Object.keys(carts).forEach(k=>{
      Object.keys(carts[k].shopcarts).forEach(j=>{
        let gnum = carts[k].shopcarts[j].goodsnum*1;
        cartNum += gnum;
        totMoney += carts[k].shopcarts[j].currntprice*gnum;
      });
    })
    totMoney = totMoney.toFixed(2);
    return { cartNum, totMoney };
  },

  /**
   * 购物车改变
   * 重新请求列表
   */
  changeCart: function(e){
    let id = this.options && this.options.id || 0;
    let carts = e.detail;
    let { cartNum, totMoney } = this.countCartNum(carts);
    id && this.setData({ clearTime: true, carts, cartNum, totMoney }), this.getData(id);
  },

  /**
   * 留言
   */
  subComment: function (e) {
    let { soli_info, pid } = this.data;
    let soli_id = soli_info.id || '';
    let content = e.detail.value.content || '';
    if (content == '') {
      wx.showToast({
        title: '请输入内容',
        icon: 'none'
      })
      return;
    }
    let that = this;
    const token = wx.getStorageSync('token');
    app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'solitaire.sub_solipost',
        soli_id,
        content,
        pid,
        token
      },
      dataType: 'json',
      success: function (res) {
        if (res.data.code == 0) {
          let { post_id, cur_time } = res.data;
          let userInfo = wx.getStorageSync('userInfo');
          let comment = {
            id: post_id,
            soli_id,
            pid,
            username: userInfo.nickName,
            avatar: userInfo.avatarUrl,
            content,
            fav_count: 0,
            addtime: cur_time,
            reply: [],
            is_agree: false
          }
          let list = that.data.list;
          list.unshift(comment);

          soli_info.comment_total = soli_info.comment_total*1 + 1;
          that.setData({ soli_info, list, content: '', showCommentModal: false, noData: 0 })
          app.util.message(res.data.msg || '留言成功', '', 'success');
        } else {
          app.util.message(res.data.msg || '留言失败', '', 'error');
        }
      }
    })
  },

  /**
   * 记录浏览次数
   */
  visiteRecord: function () {
    let soli_id = this.soli_id || '';
    const token = wx.getStorageSync('token');
    app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'solitaire.send_visite_record',
        soli_id,
        token
      },
      dataType: 'json',
      success: function (res) { }
    })
  },

  /**
   * 点赞
   */
  favComment: function (e) {
    let that = this;
    let soli_info = this.data.soli_info;
    let soli_id = soli_info.id || '';
    let post_id = e ? e.currentTarget.dataset.post_id : '';
    let idx = e ? e.currentTarget.dataset.idx : 0;
    const token = wx.getStorageSync('token');
    post_id && app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'solitaire.fav_soli_post',
        soli_id,
        post_id,
        token
      },
      dataType: 'json',
      success: function (res) {
        if (res.data.code == 0) {
          if (res.data.do == 1) {
            // 点赞成功
            let list = that.data.list;
            list[idx].is_agree = true;
            list[idx].fav_count = list[idx].fav_count * 1 + 1;
            that.setData({ list })
          } else {
            // 取消成功
            let list = that.data.list;
            list[idx].is_agree = false;
            list[idx].fav_count = list[idx].fav_count*1 - 1;
            that.setData({ list })
          }
        } else if (res.data.code == 1) {
          that.setData({ needAuth: true, showAuthModal: true })
        } else {
          wx.showToast({
            title: res.data.msg || '点赞失败',
            icon: 'none'
          })
        }
      }
    })
  },

  /**
   * 更多商品显示隐藏
   */
  handleMoreGoods: function(){
    this.setData({ hideGoods: !this.data.hideGoods })
  },

  goPlaceOrder: function(){
    let soli_info = this.data.soli_info;
    // if (soli_info.is_involved) return;
    this.showCartGoods(false).then(()=>{
      let soli_id = soli_info.id || '';
      let url = `/eaterplanet_ecommerce/pages/order/placeOrder?type=soitaire&soli_id=${soli_id}`;
      wx.navigateTo({ url })
    }).catch(()=>{
      wx.showToast({
        title: '请先选择商品！',
        icon: 'none'
      })
    });
  },

  /**
   * 获取评论列表
   */
  getCommentList: function () {
    let that = this;
    let id = this.options && this.options.id || 0;
    const token = wx.getStorageSync('token');
    wx.showLoading();
    app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'solitaire.get_comment_list',
        page: this.page,
        token,
        id
      },
      dataType: 'json',
      success: function (res) {
        wx.hideLoading();
        if (res.data.code == 0) {
          let h = {};
          let list = res.data.data;
          if (list.length < 20) h.noMore = true;
          let oldList = that.data.list;
          list = oldList.concat(list);
          that.page++;
          that.setData({
            list,
            ...h
          })
        } else if (res.data.code == 1) {
          // 无数据
          if (that.page == 1) that.setData({
            noData: 1
          })
          that.setData({
            loadMore: false,
            noMore: false,
            loadText: "没有更多记录了~"
          })
        }
      }
    })
  },

  /**
   * 用户订单列表
   */
  getMyOrderList: function () {
    console.log('getMyOrderList');
    let that = this;
    let soli_id = this.options && this.options.id || 0;
    const token = wx.getStorageSync('token');
    token && wx.showLoading(), app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'order.orderlist',
        page: this.myOrderPage,
        token,
        soli_id
      },
      dataType: 'json',
      success: function (res) {
        wx.hideLoading();
        if (res.data.code == 0) {
          let h = {};
          let list = res.data.data;
          if (list.length < 6) h.noMyOrderMore = true;
          let oldList = that.data.myOrderList;
          list = oldList.concat(list);
          that.myOrderPage++;
          that.setData({
            myOrderList: list,
            ...h
          })
        } else if (res.data.code == 1) {
          // 无数据
          let h = { noMyOrderMore: true };
          if (that.myOrderPage == 1) h.noMyOrderData = 1;
          that.setData(h)
        }
      }
    })
  },

  getMoreMyOrder: function(){
    this.data.noMyOrderMore || this.getMyOrderList();
  },

  //取消订单
  cancelOrder: function(e){
    let that = this;
    this.canCancel && wx.showModal({
      title: '取消订单并退款',
      content: '取消订单后，款项将原路退回到您的支付账户；详情请查看退款进度。',
      confirmText: '取消订单',
      confirmColor: '#ff5344',
      cancelText: '再等等',
      cancelColor: '#666666',
      success(res) {
        if (res.confirm) {
          that.canCancel = false;
          let order_id = e.currentTarget.dataset.type;
          let idx = e.currentTarget.dataset.index;
          let token = wx.getStorageSync('token');
          app.util.request({
            url: 'entry/wxapp/index',
            data: {
              controller: 'order.del_cancle_order',
              token,
              order_id
            },
            dataType: 'json',
            method: 'POST',
            success: function (res) {
              if(res.data.code==0){
                //提交成功
                wx.showModal({
                  title: '提示',
                  content: '取消订单成功',
                  showCancel: false,
                  confirmColor: '#ff5344',
                  success(ret) {
                    if(ret.confirm) {
                      let myOrderList = that.data.myOrderList;
                      myOrderList[idx].order_status_id = 5;
                      that.setData({ myOrderList })
                    }
                  }
                })
              } else {
                that.canCancel = true;
                wx.showToast({
                  title: res.data.msg || '取消订单失败',
                  icon: 'none'
                })
              }
            }
          })
          console.log('用户点击确定')
        } else if (res.cancel) {
          that.canCancel = true;
          console.log('用户点击取消')
        }
      }
    })
  },

  callTelphone: function(event) {
    let phoneNumber = event.currentTarget.dataset.phone;
    wx.makePhoneCall({ phoneNumber })
  },

  /**
   * 获取评论列表
   */
  getOrderList: function () {
    let that = this;
    let id = this.options && this.options.id || 0;
    wx.showLoading();
    app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'solitaire.get_soli_order_list',
        page: this.orderPage,
        id,
        size: 6
      },
      dataType: 'json',
      success: function (res) {
        wx.hideLoading();
        if (res.data.code == 0) {
          let h = {};
          let list = res.data.data;
          if (list.length < 6) h.noOrderMore = true;
          let oldList = that.data.orderList;
          let orderList = oldList.concat(list);
          that.orderPage++;
          that.setData({
            orderList,
            ...h
          })
        } else if (res.data.code == 1) {
          // 无数据
          let h = {};
          if (that.orderPage == 1) h.noOrderData = 1;
          that.setData({
            noOrderMore: true,
            ...h
          })
        }
      }
    })
  },

  getMoreOrder: function(){
    this.data.noOrderMore || this.getOrderList();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (!this.data.loadMore||this.data.solitaire_is_message==0) return false;
    this.getCommentList();
  },

  drawImg: function (head, soli_info) {
    let images_list = soli_info.images_list;
    let qrcode_image = soli_info.qrcode_image;
    let content = soli_info.content.replace(/&lt;[^&gt]+&gt;|&[^&gt]+;/g, "").trim();
    content = content.replace(/<\/?.+?>/g, "");
    content = content.replace(/&nbsp;/g, "");
    let option = [];
    let h = 300
    if (images_list.length) {
      option.push({
        "type": "image",
        "url": images_list[0],
        "css":
        {
          "width": "442px",
          "height": "300px",
          "top": "230px",
          "left": "36px",
          "rotate": "0",
          "borderRadius": "",
          "borderWidth": "",
          "borderColor": "",
          "shadow": "",
          "mode": "aspectFill"
        }
      })
      h = 0;
    }

    this.setData({
      template: {
        "width": "514px",
        "height": (710-h) + "px",
        "background": "#fff",
        "views": [
          {
            "type": "image",
            "url": head.avatar,
            "css":
            {
              "width": "46px",
              "height": "46px",
              "top": "25px",
              "left": "36px",
              "rotate": "0",
              "borderRadius": "3px",
              "borderWidth": "",
              "borderColor": "#000000",
              "shadow": "",
              "mode": "scaleToFill"
            }
          },
          {
            "type": "text",
            "text": head.head_name,
            "css":
            {
              "color": "#000000",
              "background": "",
              "width": "385px",
              "height": "20px",
              "top": "30px",
              "left": "96px",
              "rotate": "0",
              "borderRadius": "",
              "borderWidth": "",
              "borderColor": "#000000",
              "shadow": "",
              "padding": "0px",
              "fontSize": "14px",
              "fontWeight": "bold",
              "maxLines": "1",
              "lineHeight": "20px",
              "textStyle": "fill",
              "textDecoration": "none",
              "fontFamily": "",
              "textAlign": "left"
            }
          },
          {
            "type": "text",
            "text": head.community_name,
            "css":
            {
              "color": "#999999",
              "background": "",
              "width": "385px",
              "height": "17px",
              "top": "52px",
              "left": "96px",
              "rotate": "0",
              "borderRadius": "",
              "borderWidth": "",
              "borderColor": "#000000",
              "shadow": "",
              "padding": "0px",
              "fontSize": "12px",
              "fontWeight": "normal",
              "maxLines": "1",
              "lineHeight": "17px",
              "textStyle": "fill",
              "textDecoration": "none",
              "fontFamily": "",
              "textAlign": "left"
            }
          },
          {
            "type": "text",
            "text": content,
            "css":
            {
              "color": "#666666",
              "background": "",
              "width": "442px",
              "height": "52px",
              "top": "158px",
              "left": "36px",
              "rotate": "0",
              "borderRadius": "",
              "borderWidth": "",
              "borderColor": "#000000",
              "shadow": "",
              "padding": "0px",
              "fontSize": "18px",
              "fontWeight": "normal",
              "maxLines": "2",
              "lineHeight": "26px",
              "textStyle": "fill",
              "textDecoration": "none",
              "fontFamily": "",
              "textAlign": "left"
            }
          },
          {
            "type": "text",
            "text": soli_info.solitaire_name,
            "css":
            {
              "color": "#000000",
              "background": "",
              "width": "442px",
              "height": "43px",
              "top": "95px",
              "left": "36px",
              "rotate": "0",
              "borderRadius": "",
              "borderWidth": "",
              "borderColor": "#000000",
              "shadow": "",
              "padding": "0px",
              "fontSize": "30px",
              "fontWeight": "normal",
              "maxLines": "1",
              "lineHeight": "43px",
              "textStyle": "fill",
              "textDecoration": "none",
              "fontFamily": "",
              "textAlign": "left"
            }
          },
          {
            "type": "text",
            "text": "一群人正在赶来接龙",
            "css":
            {
              "color": "#999999",
              "background": "",
              "width": "442px",
              "height": "23px",
              "top": (595-h) + "px",
              "left": "204px",
              "rotate": "0",
              "borderRadius": "",
              "borderWidth": "",
              "borderColor": "#000000",
              "shadow": "",
              "padding": "0px",
              "fontSize": "16px",
              "fontWeight": "normal",
              "maxLines": "2",
              "lineHeight": "23px",
              "textStyle": "fill",
              "textDecoration": "none",
              "fontFamily": "",
              "textAlign": "left"
            }
          },
          {
            "type": "text",
            "text": "长按识别或扫码参与",
            "css":
            {
              "color": "#999999",
              "background": "",
              "width": "442px",
              "height": "22.88px",
              "top": (630-h) + "px",
              "left": "204px",
              "rotate": "0",
              "borderRadius": "",
              "borderWidth": "",
              "borderColor": "#000000",
              "shadow": "",
              "padding": "0px",
              "fontSize": "16px",
              "fontWeight": "normal",
              "maxLines": "2",
              "lineHeight": "23px",
              "textStyle": "fill",
              "textDecoration": "none",
              "fontFamily": "",
              "textAlign": "left"
            }
          },
          {
            "type": "image",
            "url": qrcode_image,
            "css":
            {
              "width": "120px",
              "height": "120px",
              "top": (560-h) + "px",
              "left": "356px",
              "rotate": "0",
              "borderRadius": "",
              "borderWidth": "",
              "borderColor": "#000000",
              "shadow": "",
              "mode": "scaleToFill"
            }
          },
          ...option
        ]
      }
    });
  },

  onImgOK(e) {
    this.imagePath = e.detail.path;
    this.setData({
      image: this.imagePath
    })
  },

  saveImage() {
    let that = this;
    wx.saveImageToPhotosAlbum({
      filePath: this.imagePath,
      success(res) {
        that.setData({ showShareModal: false })
        wx.showToast({
          title: '保存成功！'
        })
      },
      fail(res) {
        wx.showToast({
          title: '保存失败，请重试！',
          icon: 'none'
        })
      }
    });
  },

  handleShareModal: function (e) {
    let type = e ? e.currentTarget.dataset.type : '';
    let h = {};
    if(type=='order') {
      h.showOrderModal = !this.data.showOrderModal
    } else {
      h.showShareModal = !this.data.showShareModal
      this.data.showShareModal || wx.showLoading({ title: '生成中' })
    }
    if(!this.data.showShareModal){
      setTimeout(() => {
        wx.hideLoading()
        this.setData(h)
      }, 1000)
    } else {
      this.setData(h)
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let share_id = wx.getStorageSync('member_id') || '';
    let soli_info = this.data.soli_info || '';
    let title = (soli_info&&soli_info.solitaire_name) || '';
    let id = soli_info&&soli_info.id || '';
    let share_path = `eaterplanet_ecommerce/moduleA/solitaire/details?id=${id}&share_id=${share_id}`;
    console.log(share_path)
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
    let share_id = wx.getStorageSync('member_id') || '';
    let soli_info = this.data.soli_info || '';
    let title = (soli_info&&soli_info.solitaire_name) || '';
    let id = soli_info&&soli_info.id || '';

    var query= `id=${id}&share_id=${share_id}`;
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
