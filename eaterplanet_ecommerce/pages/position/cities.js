// eaterplanet_ecommerce/pages/position/cities.js
var app = getApp(),
  cities = [];
var QQMapWX = require("../../utils/qqmap-wx-jssdk.min.js")

Page({
  mixins: [require('../../mixin/globalMixin.js')],
  data: {
    cities: [],
    localCity: {}
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
    var shopname = wx.getStorageSync('shopname');
    if (shopname) wx.setNavigationBarTitle({
      title: shopname || ''
    });
    this.getMapKey();
    this.getData();
  },

  getMapKey: function() {
    var tx_map_key = wx.getStorageSync('tx_map_key');
    console.log('tx_map_key', tx_map_key)
    let that = this;
    if (tx_map_key) {
      this.getCity();
    } else {
      console.log('step4')
      this.getCommunityConfig();
      console.log('step2')
    }
  },

  getCommunityConfig: function() {
    let that = this;
    return new Promise(function (resolve, reject) {
      app.util.request({
        'url': 'entry/wxapp/index',
        'data': {
          controller: 'index.get_community_config'
        },
        dataType: 'json',
        success: function (res) {
          console.log('step1')
          if (res.data.code == 0) {
            wx.setStorage({
              key: "shopname",
              data: res.data.shoname
            })
            if (res.data.shoname) {
              wx.setNavigationBarTitle({
                title: res.data.shoname
              });
            }
            wx.setStorage({
              key: "tx_map_key",
              data: res.data.tx_map_key
            })
            wx.setStorage({
              key: "shop_index_share_title",
              data: res.data.shop_index_share_title
            })
            resolve(res);
            that.getCity();
          }
        }
      })
    })
  },

  /**
   * 获取定位城市
   */
  getCity: function() {
    console.log('step3')
    var token = wx.getStorageSync('token');
    var tx_map_key = wx.getStorageSync('tx_map_key');
    console.log(tx_map_key);
    var that = this;

    var demo = new QQMapWX({
      key: tx_map_key
    });

    wx.getLocation({
      type: 'gcj02', //编码方式，
      success: function(res) {
        var latitude = res.latitude;
        var longitude = res.longitude;

        that.setData({
          latitude: res.latitude,
          longitude: res.longitude
        })
        wx.setStorage({
          key: "latitude",
          data: res.latitude
        })
        wx.setStorage({
          key: "longitude",
          data: res.longitude
        })

        demo.reverseGeocoder({
          //腾讯地图api 逆解析方法 首先设计经纬度
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          }, //逆解析成功回调函数
          success: function(res) {
            that.setData({
              localCity: {
                districtName: res.result.address_component.city
              }
            })
            wx.setStorage({
              key: 'city',
              data: that.data.localCity,
            })
          }
        })
      }
    })
  },

  /**
   * 获取数据
   */
  getData: function() {
    var that = this;
    wx.showLoading({
      title: "加载中...",
      mask: true
    });
    var city = app.globalData.city;
    if (cities.length) {
      this.setData({
        cities: cities,
        localCity: city
      }), wx.hideLoading()
    } else {
      // 请求数据
      var token = wx.getStorageSync('token');
      var community = wx.getStorageSync('community');
      app.util.request({
        'url': 'entry/wxapp/index',
        'data': {
          controller: 'community.get_city_list',
          token: token
        },
        dataType: 'json',
        success: function(res) {
          if (res.data.code == 0) {
            var cityArr = [],
              keyArr = [];
            res.data.data && res.data.data.forEach(function(item) {
              var firstLetter = item.firstLetter,
                pos = keyArr.indexOf(firstLetter);
              if (pos < 0) {
                keyArr.push(firstLetter);
                cityArr.push({
                  key: firstLetter,
                  list: []
                });
                pos = keyArr.length - 1
              }
              cityArr[pos].list.push({
                name: item.districtName,
                key: firstLetter,
                city: item
              });
            });

            cityArr.sort(function(x, y) {
              if (x.key > y.key) return 1
              else if (x.key < y.key) return -1
              else return 0
            })
            cities = cityArr;
            that.setData({
              cities: cities
            });
          }
          wx.hideLoading();
        }
      })
    }
  },

  /**
   * 选择城市
   */
  chooseCity: function(e) {
    var currentPages = getCurrentPages(),
      a = 1;
    currentPages[currentPages.length - 2].route.indexOf("/position/search") > -1 && (a = 2);
    var city = e.currentTarget.dataset.city;
    app.globalData.changeCity = city.city_id || 0;
    wx.setStorage({
      key: "city",
      data: {
        districtName: city.districtName
      }
    })
    wx.setStorage({
      key: "city_id",
      data: city.city_id
    })
    wx.navigateBack({
      delta: a
    });
  }
})
