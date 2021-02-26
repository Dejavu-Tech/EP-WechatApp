var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodShareImg: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let type = options.type || '';
    if (type == 'commiss'){
      this.getCommissShareImage();
    }else {
      this.getShareImage();
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
  /**
   * 商品列表分享图
   */
  getShareImage: function () {
    wx.showLoading({ title: '获取中' })
    var that = this;
    var token = wx.getStorageSync('token');
    var community_id = wx.getStorageSync('community').communityId;
    app.util.request({
      url: 'entry/wxapp/user',
      data: {
        controller: 'user.user_index_shareqrcode',
        community_id,
        token: token
      },
      dataType: 'json',
      method: 'POST',
      success: function (res) {
        if (res.data.code == 0) {
          let goodShareImg = res.data.image_path;
          that.setData({ goodShareImg });
          wx.hideLoading();
          // var image_path = res.data.image_path;
          // wx.getImageInfo({
          //   src: image_path,
          //   success: function (res) {
          //     var real_path = res.path;
          //     wx.saveImageToPhotosAlbum({
          //       filePath: real_path,
          //       success(res) {
          //         wx.showToast({
          //           title: '图片保存成功，可以分享了',
          //           icon: 'none',
          //           duration: 2000
          //         })
          //         that.setData({
          //           is_share_html: true
          //         });
          //       }
          //     })
          //   }
          // })
        }
      }
    })
  },

  /**
   * 会员分销分享图
   */
  getCommissShareImage: function () {
    wx.showLoading({ title: '获取中' })
    var that = this;
    var token = wx.getStorageSync('token');
    app.util.request({
      url: 'entry/wxapp/user',
      data: {
        controller: 'distribution.get_haibao',
        token: token
      },
      dataType: 'json',
      method: 'POST',
      success: function (res) {
        if (res.data.code == 0) {
          let goodShareImg = res.data.commiss_qrcode;
          that.setData({ goodShareImg });
          wx.hideLoading();
        }
      }
    })
  },

  //图片点击事件
  preImg: function (event) {
    var src = event.currentTarget.dataset.src;//获取data-src
    var goodShareImg = this.data.goodShareImg;//获取data-list
    //图片预览
    wx.previewImage({
      current: src, // 当前显示图片的http链接
      urls: [goodShareImg] // 需要预览的图片http链接列表
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  }
})