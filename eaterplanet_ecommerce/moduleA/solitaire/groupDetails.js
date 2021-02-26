// 团长接龙详情
var app = getApp();
var status = require('../../utils/index.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    showGoodsModal: false,
    showCommentModal: false,
    pid: 0,
    showShareModal: false,
    list: [],
    loadText: "加载中...",
    noData: 0,
    loadMore: true,
    orderList: [],
    noOrderMore: false,
    noOrderData: 0,
    solitaire_is_message: 0
  },
  imagePath: '',
  options: '',
  page: 1,
  orderPage: 1,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    status.setNavBgColor();
    this.options = options;
    let id = options.id || 0;
    if(!id) {
      app.util.message('参数错误', 'redirect:/eaterplanet_ecommerce/moduleA/solitaire/groupIndex', 'error');
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
  initFn() {
    let that = this;
    let id = this.options && this.options.id || 0;
    this.page = 1;
    this.setData({
      list: [],
      loadText: "加载中...",
      noData: 0,
      loadMore: true
    }, () => {
      id && that.getData(id);
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let id = this.options && this.options.id || 0;
    id && this.getData(id), this.getOrderList();
  },

  onHide: function () {
    this.setData({ clearTime: true })
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
        token,
        is_head: 1
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
          let diffMoney = solitaire_target_takemoney * 1 - soli_total_money * 1;
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
          }, ()=>{
            that.drawImg(head_data, soli_info);
          })
          if(solitaire_is_message==1){
            that.getCommentList()
          }
        } else if (res.data.code == 2) {
          app.util.message('您还未登录', 'switchTo:/eaterplanet_ecommerce/pages/index/index', 'error');
          return;
        } else {
          app.util.message(res.data.msg, 'redirect:/eaterplanet_ecommerce/moduleA/solitaire/groupIndex', 'error');
          return;
        }
      }
    })
  },

  showImgPrev: function (event){
    var idx = event ? event.currentTarget.dataset.idx : '';
    let urls = this.data.soli_info.images_list || [];
    wx.previewImage({
      current: urls[idx],
      urls
    });
  },

  /**
   * 商品弹窗
   */
  handleGoodsModal: function(){
    this.setData({
      showGoodsModal: !this.data.showGoodsModal
    })
  },

  /**
   * 评论弹窗
   */
  handleCommentModal: function () {
    this.setData({
      showCommentModal: !this.data.showCommentModal,
      pid: 0
    })
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
          let list = that.data.list;

          if (pid!=0) {
            let comment = {
              id: post_id,
              pid,
              username: userInfo.nickName,
              content
            }
            let idx = list.findIndex(item => item.id == pid);
            if (idx !== -1) {
              list[idx].reply.push(comment);
            }
          } else {
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
            list.unshift(comment);
          }

          soli_info.comment_total = soli_info.comment_total * 1 + 1;
          that.setData({ soli_info, list, content: '', showCommentModal: false, noData: 0 })
          app.util.message(res.data.msg || '留言成功', '', 'success');
        } else {
          app.util.message(res.data.msg || '留言失败', '', 'error');
        }
      }
    })
  },

  /**
   * 回复留言
   */
  replyComment: function(e){
    let pid = e.currentTarget.dataset.id || '';
    this.setData({
      showCommentModal: !this.data.showCommentModal,
      pid
    })
  },

  /**
   * 删除留言
   */
  deleteComment: function(e){
    let that = this;
    let id = e.currentTarget.dataset.id || '';
    let idx = e.currentTarget.dataset.idx || '';
    id && wx.showModal({
      title: '操作提示',
      content: '确认删除此留言？',
      confirmColor: '#ff5041',
      success(res) {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' })
          const token = wx.getStorageSync('token');
          app.util.request({
            url: 'entry/wxapp/index',
            data: {
              controller: 'solitaire.delete_comment',
              id,
              token
            },
            dataType: 'json',
            success: function (res) {
              wx.hideLoading();
              if (res.data.code == 0) {
                let { list, soli_info } = that.data;
                list.splice(idx, 1);
                let noData = false;
                if (list.length==0) noData = true;

                soli_info.comment_total = soli_info.comment_total * 1 - 1;
                that.setData({ list, soli_info, noData });
                wx.showToast({
                  title: res.data.msg || '删除成功',
                  icon: 'none'
                })
              } else if (res.data.code == 2) {
                app.util.message('您还未登录', 'switchTo:/eaterplanet_ecommerce/pages/index/index', 'error');
                return;
              } else {
                app.util.message(res.data.msg || '删除失败', '', 'error');
              }
            }
          })
        }
      }
    });
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
            list[idx].fav_count = list[idx].fav_count * 1 - 1;
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
   * 结束接龙
   */
  endSolitaire: function (e) {
    let that = this;
    let soli_info = that.data.soli_info;
    let id = soli_info.id;
    id && wx.showModal({
      title: '操作提示',
      content: '确认终止此接龙吗？',
      confirmColor: '#ff5041',
      success(res) {
        if (res.confirm) {
          wx.showLoading({ title: '提交中...' })
          const token = wx.getStorageSync('token');
          app.util.request({
            url: 'entry/wxapp/index',
            data: {
              controller: 'solitaire.end_solitaire',
              id,
              token
            },
            dataType: 'json',
            success: function (res) {
              wx.hideLoading();
              if (res.data.code == 0) {
                soli_info.end = 1;
                that.setData({ soli_info });
                wx.showToast({
                  title: res.data.msg || '接龙已终止',
                  icon: 'none'
                })
              } else if (res.data.code == 2) {
                app.util.message('您还未登录', 'switchTo:/eaterplanet_ecommerce/pages/index/index', 'error');
                return;
              } else {
                app.util.message(res.data.msg || '操作失败', '', 'error');
              }
            }
          })
        }
      }
    });
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
          "mode": "scaleToFill"
        }
      })
      h = 0;
    }

    this.setData({
      template: {
        "width": "514px",
        "height": (710 - h) + "px",
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
              "height": "20.02px",
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
              "lineHeight": "20.202000000000005px",
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
              "height": "17.16px",
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
              "lineHeight": "17.316000000000003px",
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
              "height": "52.181999999999995px",
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
              "lineHeight": "25.974000000000004px",
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
              "height": "42.89999999999999px",
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
              "lineHeight": "43.290000000000006px",
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
              "height": "22.88px",
              "top": (595 - h) + "px",
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
              "lineHeight": "23.088000000000005px",
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
              "top": (630 - h) + "px",
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
              "lineHeight": "23.088000000000005px",
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
              "top": (560 - h) + "px",
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

  handleShareModal: function () {
    this.setData({
      showShareModal: !this.data.showShareModal
    })
  },

  handleGoodsModal: function(e){
    if (this.data.showGoodsModal){
      this.setData({
        showGoodsModal: false,
        goodsModalList: []
      })
    } else {
      let idx = e ? e.currentTarget.dataset.idx : '';
      let orderList = this.data.orderList;
      let goodsModalList = orderList[idx].goodslist || [];
      this.setData({
        showGoodsModal: true,
        goodsModalList
      })
    }
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
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (!this.data.loadMore||this.data.solitaire_is_message==0) return false;
    this.getCommentList();
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
        size: 5
      },
      dataType: 'json',
      success: function (res) {
        wx.hideLoading();
        if (res.data.code == 0) {
          let h = {};
          let list = res.data.data;
          if (list.length < 5) h.noOrderMore = true;
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let share_id = wx.getStorageSync('member_id') || '';
    let soli_info = this.data.soli_info || '';
    let title = soli_info.solitaire_name || '';
    let share_path = `eaterplanet_ecommerce/moduleA/solitaire/details?id=${soli_info.id}&share_id=${share_id}`;
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
  }
})
