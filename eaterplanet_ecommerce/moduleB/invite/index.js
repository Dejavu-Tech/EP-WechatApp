var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    info: '',
    list: [],
    showSharePopup: true,
    needAuth: false,
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
    this.getData();
    this.getInvitelist();
  },

  onPullDownRefresh() {
    this.getData();
    this.getInvitelist();
  },

  getData() {
    wx.showLoading();
    let token = wx.getStorageSync('token');
    app.util.ProReq('invitegift.index', {token})
      .then(res=>{
        wx.stopPullDownRefresh();
        this.setData({
          info: res.data
        }, ()=>{
          this.drawImg(res.data);
        });
        // this.onRender(res.data);
      })
      .catch(err=>{
        wx.stopPullDownRefresh();
        app.util.message(err.msg, 'switchTo:/eaterplanet_ecommerce/pages/user/me', 'error');
        // if(err.code==1&&err.msg=='未登录') {
        //   this.setData({
        //     needAuth: true,
        //     showAuthModal: true
        //   })
        // }
      })
  },

  getInvitelist() {
    let token = wx.getStorageSync('token');
    app.util.ProReq('invitegift.getInvitegiftRecord', { token, page:1, type: 'invite'})
      .then(res=>{
        this.setData({
          list: res.data
        });
      })
  },

  goLink: function(event) {
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

  checkInvitegift() {
    let token = wx.getStorageSync('token');
    wx.showLoading();
    app.util.ProReq('invitegift.checkInvitegift', {token})
      .then(res=>{
        wx.hideLoading();
        this.setData({ showSharePopup: false })
      }).catch(err=>{
        wx.hideLoading();
        wx.showModal({
          content: err.msg,
          showCancel: false
        })
      })
  },

  hide_share_handler: function () {
    this.setData({ 
      showSharePopup: !this.data.showSharePopup
    })
  },

  drawImg: function (info) {
    let { 
      invite_poster_back_type, 
      invite_poster_back_color, 
      invite_poster_back_img, 
      invite_poster_qrcode_img, 
      invite_poster_qrcode_size, 
      invite_poster_qrcode_top, 
      invite_poster_qrcode_left,
      invite_poster_qrcode_border_status,
      invite_poster_qrcode_corner_type,
      invite_poster_qrcode_bordercolor
    } = info;
    let background = '#FFFFFF';
    let data = [];
    if(invite_poster_back_type==0) {
      background = invite_poster_back_color;
    } else {
      let bgImg = {
        type: 'image',
        url: invite_poster_back_img,
        css: {
          left: '0px',
          top: '0px',
          mode: 'widthFix',
          width: '750px',
          height: '1334px'
        }
      }
      data.push(bgImg);
    }
    let poster = {
      width: '750px',
      height: '1334px',
      background,
      views: [
        ...data,
        {
          type: 'image',
          url: invite_poster_qrcode_img,
          mode: 'widthFix',
          css: {
            left: invite_poster_qrcode_left + 'px',
            top: invite_poster_qrcode_top + 'px',
            width: invite_poster_qrcode_size + 'px',
            height: invite_poster_qrcode_size + 'px',
            radius: invite_poster_qrcode_corner_type==0?'10px':'0px',
            border: invite_poster_qrcode_border_status==1?`1px solid ${invite_poster_qrcode_bordercolor}`:'none'
          }
        }
      ]
    };
    console.log(poster);
    this.setData({
      template: poster
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
      showSharePopup: true,
      showShareModal: !this.data.showShareModal
    })
  },

  handleTipModal(e) {
    var type = e.currentTarget.dataset.type;
    let tip = {
      wait: '被邀请人的订单在售后期内，需要等待售后期结束才能获得活动奖励',
      invalid: '被邀请人的订单在售后期内发生退款，需要被邀请人重新下单才可获得奖励',
    };
    wx.showModal({
      title: '提示',
      content: tip[type],
      showCancel: false
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (options) {
    let { invite_share_title, invite_share_img, suid, invite_order_share_title, invite_order_share_img } = this.data.info;
    var community = wx.getStorageSync('community');
    var community_id = community.communityId;
    let title = invite_share_title;
    let imageUrl = invite_share_img;
    let path = "eaterplanet_ecommerce/moduleB/invite/share?community_id=" + community_id + '&share_id=' + suid;
    if( options && options.target && options.target.dataset.name == 'invite' ){
      path = "eaterplanet_ecommerce/pages/index/index?community_id=" + community_id + '&share_id=' + suid;
      title = invite_order_share_title;
      imageUrl = invite_order_share_img;
    }
    return {
      title,
      path,
      imageUrl,
      success: function() {},
      fail: function() {}
    };
  }
})
