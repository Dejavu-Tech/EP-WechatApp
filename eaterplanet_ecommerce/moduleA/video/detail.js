var app = getApp();

Page({

  data: {
    is_heng: 1,
    rushList: [],
    current: 0
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
  onLoad: function (options) {
    app.setShareConfig();
    let id = options.id || '';
    if (!id) {
      wx.showModal({
        title: '提示',
        content: '参数错误',
        showCancel: false,
        success(res) {
          if (res.confirm) {
            wx.redirectTo({
              url: '/eaterplanet_ecommerce/pages/index/index',
            })
          }
        }
      })
      return;
    }
    this.getData(id);
    this.get_goods_details(id);

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

  },

  goDetails: function(){
    let goods = this.data.goods;
    let id = goods.id || '';
    id && wx.redirectTo({
      url: `/eaterplanet_ecommerce/pages/goods/goodsDetail?id=${id}`,
    })
  },

  get_goods_details: function (id) {
    let that = this;
    if (!id) {
      wx.hideLoading();
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
    let token = wx.getStorageSync('token');
    let community = wx.getStorageSync('community');
    let community_id = community.communityId || '';
    app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'goods.get_goods_detail',
        token: token,
        id,
        community_id
      },
      dataType: 'json',
      success: function (res) {
        wx.hideLoading();
        let goods = (res.data.data && res.data.data.goods) || '';
        // 商品不存在
        if (!goods || goods.length == 0 || Object.keys(goods) == '') {
          wx.showModal({
            title: '提示',
            content: '该商品不存在，回首页',
            showCancel: false,
            confirmColor: '#F75451',
            success(res) {
              if (res.confirm) {
                wx.switchTab({
                  url: '/eaterplanet_ecommerce/pages/index/index',
                })
              }
            }
          })
        }
        that.currentOptions = res.data.data.options;
        that.setData({
          goods: goods,
          options: res.data.data.options,
          order: {
            goods_id: res.data.data.goods.goods_id,
            pin_id: res.data.data.pin_id,
          },
          share_title: goods.share_title,
          goods_image: res.data.data.goods_image
        })
      }
    })
  },

  getData: function (goodsId) {
    var token = wx.getStorageSync('token');
    var that = this;
    var cur_community = wx.getStorageSync('community');
    app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'index.load_gps_goodslist',
        token: token,
        pageNum: 1,
        head_id: cur_community.communityId,
        per_page: 10000,
        is_video: 1
      },
      dataType: 'json',
      success: function (res) {
        if (res.data.code == 0) {
          let rdata = res.data;
          let rushList = rdata.list || [];
          let current = rushList.findIndex(item => item.actId == goodsId);
          that.setData({ rushList, current });
        }
      }
    })
  },

  changeSubject: function(t){
    let rushList = this.data.rushList;
    if (t < 0 || rushList.length<=1) {
      wx.showToast({
        title: "没有上一个视频了~",
        icon: "none",
        duration: 2000
      });
    } else {
      console.log(t);
      if (t>rushList.length-1) {
        wx.showToast({
          title: "没有下一个视频了~",
          icon: "none",
          duration: 2000
        });
        return;
      }
      var that = this;
      t = t || 0, that.setData({
        current: t
      }), this.get_goods_details(rushList[t].actId);
    }
  },

  pre: function(){
    this.changeSubject(this.data.current*1 - 1)
  },

  next: function () {
    this.changeSubject(this.data.current*1 + 1)
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
    var goods = this.data.goods;
    var share_title = this.data.share_title;
    var share_id = wx.getStorageSync('member_id');
    var share_path = `eaterplanet_ecommerce/moduleA/video/detail?id=${goods.id}&share_id=${share_id}`;
    let shareImg = goods.goods_share_image;
    console.log('商品分享地址：', share_path);

    return {
      title: share_title,
      path: share_path,
      imageUrl: shareImg,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },

  onShareTimeline: function() {
    var goods = this.data.goods;
    var share_title = this.data.share_title;
    var share_id = wx.getStorageSync('member_id');
    let shareImg = goods.goods_share_image;

    var query= `id=${goods.id}&share_id=${share_id}`;
    return {
      title: share_title,
      imageUrl: shareImg,
      query,
      success: function() {},
      fail: function() {}
    };
  }
})
