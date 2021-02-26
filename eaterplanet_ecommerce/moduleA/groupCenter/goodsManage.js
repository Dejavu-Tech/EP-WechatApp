var app = getApp();
var util = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isIpx: false,
    goods: [{
      name: '大苹果',
      image: 'https://shiziyu.liofis.com/attachment/images/3/2019/03/S3sWb8he8w9ujHJ70bI8JUh2wuJjbS.jpg?imageView2/2/w/240/h/240/ignore-error/1',
      status_name: '上架',
      checked: false
    },
    {
      name: '大苹果',
      image: 'https://shiziyu.liofis.com/attachment/images/3/2019/03/S3sWb8he8w9ujHJ70bI8JUh2wuJjbS.jpg?imageView2/2/w/240/h/240/ignore-error/1',
      status_name: '上架',
      checked: true
    }],
    checkedAll: false,
    checkedCount: 0
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
    if (!util.check_login()) {
      wx.redirectTo({
        url: '/eaterplanet_ecommerce/pages/user/me',
      })
    }
    app.globalData.isIpx && this.setData({
      isIpx: true
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 勾选
   */
  checkboxChange: function(e) {
    var type = e.currentTarget.dataset.type,
      idx = e.currentTarget.dataset.index,
      goods = this.data.goods,
      checkedAll = this.data.checkedAll;


    if ("all" === type) {
      let ck = 0;
      if (checkedAll) {
        goods.forEach(function(item) {
          item.checked = 0;
        })
      } else {
        goods.forEach(function (item) {
          item.checked = 1;
        })
        ck = goods.length;
      }
      this.setData({
        checkedCount: ck,
        goods: goods,
        checkedAll: !checkedAll
      })
    } else if ("item" === type) {
      goods.forEach(function (item, t) {
        if (idx == t) {
          if (item.checked) {
            item.checked = 0
          } else {
            item.checked = 1
          }
        }
      })

      var ck = 0;
      goods.forEach(function (item) {
        if (item.checked) {
          ck++;
        }
      })

      this.setData({
        checkedCount: ck,
        goods: goods,
        checkedAll: ck == goods.length ? true : false
      })
    }

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  }
})
