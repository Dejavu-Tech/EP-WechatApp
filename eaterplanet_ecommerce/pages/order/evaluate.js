// eaterplanet_ecommerce/pages/order/evaluate.js
var util = require('../../utils/util.js');
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    order_id: 0,
    goods_id: 0,
    miaoshu_no: 0,
    price_no: 0,
    zhiliang_no: 0,
    is_jifen: 0,
    pinjia_text: '',
    thumb_img: [],
    image: [],
    placeholder: "亲，您对这个商品满意吗？您的评价会帮助我们选择更好的商品哦～",
    evaluate: "",
    imgGroup: [],
    imgMax: 4,
    isIpx: false,
    focus: false,
    progressList: []
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
  onLoad: function(options) {
    //id=' + id + '&goods_id' + goods_id
    var that = this;
    var token = wx.getStorageSync('token');

    var order_id = options.id;
    var goods_id = options.goods_id;

    this.setData({
      order_id: order_id,
      goods_id: goods_id
    })

    app.util.request({
      'url': 'entry/wxapp/user',
      'data': {
        controller: 'user.order_comment',
        'token': token,
        order_id: order_id,
        goods_id: goods_id
      },
      dataType: 'json',
      success: function(res) {
        if (res.data.code == 3) {
          //un login
        } else if (res.data.code == 0) {
          //code goods_image
          that.setData({
            goods_id: res.data.goods_id,
            order_goods: res.data.order_goods,
            goods_image: res.data.goods_image,
            open_comment_gift: res.data.open_comment_gift,
            comment_gift_publish: res.data.comment_gift_publish
          })
        }
      }
    })

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  addImg: function() {
    var that = this,
      imgGroup = this.data.imgGroup;
    wx.chooseMedia({
      count: this.data.imgMax - imgGroup.length,
      success: function(res) {
        const tempFiles = res.tempFiles;
        var new_thumb_img = that.data.thumb_img;
        for (var i = 0; i < tempFiles.length; i++) {
          wx.showLoading({
            title: '上传中'
          })
          if (new_thumb_img.length >= 4) {
            that.setData({
              thumb_img: new_thumb_img
            });
            return false;
          } else {
            wx.uploadFile({
              url: app.util.url('entry/wxapp/index', {
                'm': 'eaterplanet_ecommerce',
                'controller': 'goods.doPageUpload'
              }),
              filePath: tempFiles[i].tempFilePath,
              name: 'upfile',
              formData: {
                'name': tempFiles[i].tempFilePath
              },
              header: {
                'content-type': 'multipart/form-data'
              },
              success: function(res) {

                wx.hideLoading();
                var data = JSON.parse(res.data);

                var image_thumb = data.image_thumb;
                var image_o_full = data.image_o_full;
                var orign_image = data.image_o;
                var new_img = that.data.image;

                var new_thumb_img = that.data.thumb_img;
                new_img.push(orign_image);
                new_thumb_img.push(image_thumb);
                imgGroup.push(image_thumb);

                that.setData({
                  thumb_img: new_thumb_img,
                  image: new_img,
                  imgGroup: imgGroup
                })
              }
            })
          }
        }
      }
    });
  },
  textinput: function(event) {
    var content = event.detail.value;
    //pinjia_text
    this.setData({
      pinjia_text: content
    })

  },
  /**
   * 删除图片
   */
  choseImg: function(e) {
    var idx = e.currentTarget.dataset.idx;
    var imgGroup = this.data.imgGroup;
    var new_img = this.data.image;
    new_img.splice(idx, 1);
    imgGroup.splice(idx, 1);
    this.setData({
      imgGroup: imgGroup,
      image: new_img
    })
  },

  sub_comment: function() {
    var order_id = this.data.order_id;
    var goods_id = this.data.goods_id;

    var pinjia_text = this.data.pinjia_text;
    var image = this.data.image;
    var that = this;

    if (pinjia_text == '') {
      wx.showToast({
        title: '请填写评价内容',
        icon: 'success',
        duration: 1000
      })
      return false;
    }
    wx.showLoading({
      title: '评论中',
    })
    var token = wx.getStorageSync('token');
    console.log(image);
    app.util.request({
      'url': 'entry/wxapp/user',
      'data': {
        controller: 'user.sub_comment',
        'token': token,
        order_id: order_id,
        goods_id: goods_id,
        comment_content: pinjia_text,
        imgs: image
      },
      method: 'POST',
      dataType: 'json',
      success: function(msg) {
        wx.hideLoading();
        if (msg.data.code == 3) {
          wx.showToast({
            title: '未登录',
            icon: 'loading',
            duration: 1000
          })
        } else {
          wx.showToast({
            title: '评价成功',
            icon: 'success',
            duration: 1000,
            success: function(res) {
              //是否跳到积分
              wx.redirectTo({
                url: "/eaterplanet_ecommerce/pages/order/order?id=" + order_id
              })
            }
          })
        }
      }
    })
  },

  /**
   * 预览大图
   */
  bigImg: function(e) {
    var t = e.currentTarget.dataset.src,
      list = e.currentTarget.dataset.list;
    wx.previewImage({
      current: t,
      urls: list
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  }
})
