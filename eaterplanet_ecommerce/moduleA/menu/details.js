const app = getApp()
var util = require('../../utils/util.js');
var status = require('../../utils/index.js');

Page({
  mixins: [require('../../mixin/compoentCartMixin.js')],
  data: {
    info: {},
    fmShow: true,
    canvasWidth: 375,
    canvasHeight: 300
  },
  gid: 0,
  goodsImg: '',
  imageUrl: '',
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
    let gid = options.id || '';
    this.gid = gid;
    this.getData(gid);
    let showBackBtn = false;
    let pages_all = getCurrentPages();
    if (pages_all.length > 1) {
      showBackBtn = true;
    }
    this.setData({ showBackBtn })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    const that = this;
    util.check_login_new().then((res) => {
      let needAuth = !res;
      that.setData({ needAuth })
      if (res) {
        (0, status.cartNum)('', true).then((res) => {
          res.code == 0 && that.setData({
            cartNum: res.data
          })
        });
      }
    })
  },

  onReady: function (res) {
    this.videoContext = wx.createVideoContext('myVideo');
  },

  /**
   * 授权成功回调
   */
  authSuccess: function () {
    const that = this;
    let gid = this.gid;
    this.setData({
      needAuth: false,
      showAuthModal: false
    }, () => {
      that.getData(gid);
    })
  },

  vipModal: function(t) {
    this.setData(t.detail)
  },

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

  endPlay: function () {
    this.videoContext.pause();
    this.setData({
      fmShow: true
    })
  },

  /**
   * 获取信息
   */
  getData: function (id) {
    let that = this;
    let token = wx.getStorageSync('token');
    let community = wx.getStorageSync('community');
    let head_id = community.communityId || '';

    wx.showLoading();
    app.util.request({
      'url': 'entry/wxapp/index',
      'data': {
        controller: 'recipe.get_recipe_detail',
        token,
        id,
        head_id
      },
      dataType: 'json',
      success: function (res) {
        if (res.data.code==0) {
          let info = res.data.data || {};
          let is_open_recipe_full_video = res.data.is_open_recipe_full_video;
          let showCoverVideo = (is_open_recipe_full_video==1) && info.video;
          that.setData({ info, showCoverVideo }, ()=>{
            let shareImg = info.images;
            info.video && shareImg && status.download(shareImg + "?imageView2/1/w/500/h/400").then(function (a) {
              that.goodsImg = a.tempFilePath, that.drawImg();
            });
          })
        }
        wx.hideLoading();
      }
    })
  },

  /**
   * 点赞
   */
  agree: function () {
    if (!this.authModal()) return;
    let that = this;
    let item = this.data.info;
    let token = wx.getStorageSync('token');

    app.util.request({
      'url': 'entry/wxapp/index',
      'data': {
        controller: 'recipe.fav_recipe_do',
        token: token,
        id: item.id
      },
      dataType: 'json',
      success: function (res) {
        if (res.data.code == 0) {
          //成功
          wx.showToast({
            title: '已喜欢~',
            icon: 'none'
          })
          item.fav_count = res.data.fav_count;
          item.has_fav = 1;
          that.setData({ info: item })
        } else if (res.data.code == 1) {
          //未登录
          that.setData({ needAuth: true });
        } else if (res.data.code == 2) {
          //取消收藏
          item.fav_count = res.data.fav_count;
          item.has_fav = 0;
          that.setData({ info: item })
          wx.showToast({
            title: '取消喜欢~',
            icon: 'none'
          })
        }
      }
    })
  },

  goLink: function(e){
    let link = e.currentTarget.dataset.link;
    app.util.navTo(link);
  },

  drawImg: function () {
    var t = this;
    wx.createSelectorQuery().select(".canvas-img").boundingClientRect(function () {
      const context = wx.createCanvasContext("myCanvas");
      context.drawImage(t.goodsImg, 0, 0, status.getPx(375), status.getPx(300));
      context.drawImage("../../images/play.png", status.getPx(127.5), status.getPx(70), status.getPx(120), status.getPx(120));
      context.save();
      context.draw(false, t.checkCanvas());
    }).exec();
  },

  checkCanvas: function () {
    var that = this;
    setTimeout(() => {
      wx.canvasToTempFilePath({
        canvasId: "myCanvas",
        success: function (res) {
          res.tempFilePath ? that.imageUrl = res.tempFilePath : that.drawImg();
          console.log('我画完了')
        },
        fail: function (a) {
          that.drawImg();
        }
      })
    }, 500)
  },

  clickStore: function() {
    this.setData({ showStore: !this.data.showStore })
  },

  coverVideoEnd: function(){
    this.setData({
      showCoverVideo: false
    })
  },

  _backhome: function() {
    wx.switchTab({
      url: '/eaterplanet_ecommerce/pages/index/index',
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let info = this.data.info;
    var community = wx.getStorageSync('community');
    var gid = info.id;
    var community_id = community.communityId;
    var share_title = info.recipe_name;
    var share_id = wx.getStorageSync('member_id');
    var share_path = `eaterplanet_ecommerce/moduleA/menu/details?id=${gid}&share_id=${share_id}&community_id=${community_id}`;
    console.log('分享地址：', share_path);
    return {
      title: share_title,
      path: share_path,
      imageUrl: this.imageUrl,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },

  onShareTimeline: function () {
    let info = this.data.info;
    var community = wx.getStorageSync('community');
    var gid = info.id;
    var community_id = community.communityId;
    var share_title = info.recipe_name;
    var share_id = wx.getStorageSync('member_id');
    var query= `id=${gid}&share_id=${share_id}&community_id=${community_id}`;

    return {
      title: share_title,
      query,
      imageUrl: this.imageUrl,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
})
