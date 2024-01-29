// eaterplanet_ecommerce/pages/position/community.js
var location = require("../../utils/Location")
var QQMapWX = require("../../utils/qqmap-wx-jssdk.min.js")
var status = require('../../utils/index.js');
var app = getApp();

Page({
  mixins: [require('../../mixin/globalMixin.js')],
  data: {
    loadMore: true,
    canGetGPS: true,
    tip: "加载中...",
    community: {},
    communities: [],
    historyCommunity: [],
    city: {
      districtName: ""
    },
    latitude: '',
    longitude: '',
    hasRefeshin: false,
    pageNum: 1,
    isNotHistory: true,
    city_id: 0,
    needAuth: false,
    common_header_backgroundimage: '',
    groupInfo: {
      group_name: '社区',
      owner_name: '团长'
    },
    isEmpty: false
  },

  linkSearch: function() {
    wx.navigateTo({
      url: "/eaterplanet_ecommerce/pages/position/search?city=" + JSON.stringify(this.data.city)
    });
  },
  isFirst: true,
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
    var that = this;
    status.setNavBgColor();
    status.setGroupInfo().then((groupInfo) => {
      that.setData({
        groupInfo
      })
    });
    this.loadpage();
  },

  onReady: function(){
    this.setData({
      common_header_backgroundimage: app.globalData.common_header_backgroundimage
    });
  },

  loadpage: function() {
    let that = this;
    var current_community = wx.getStorageSync('community');
    if (current_community) that.setData({
      community: current_community
    })
    console.log(current_community)
    var tx_map_key = wx.getStorageSync('tx_map_key');
    if (tx_map_key) {
      var shopname = wx.getStorageSync('shopname');
      wx.setNavigationBarTitle({
        title: shopname
      });
      that.load_gps_community();
    } else {
      that.getCommunityConfig();
    }
  },

  /**
   * 授权成功回调
   */
  authSuccess: function() {
    this.setData({
      needAuth: false
    })
    this.loadpage()
  },

  getCommunityConfig: function(){
    let that = this;
    app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'index.get_community_config'
      },
      dataType: 'json',
      success: function (res) {
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
          that.setData({
            tx_map_key: res.data.tx_map_key
          })
          wx.setStorage({
            key: "shop_index_share_title",
            data: res.data.shop_index_share_title
          })
          that.load_gps_community();
        }
      }
    })
  },

  /**
   * 获取定位城市
   */
  load_gps_community: function() {
    var token = wx.getStorageSync('token');
    var tx_map_key = wx.getStorageSync('tx_map_key');
    if (tx_map_key == undefined || tx_map_key == '') {
      if (this.data.tx_map_key) {
        tx_map_key = this.data.tx_map_key
      } else {
        this.getCommunityConfig();
        return;
      }
    }
    var that = this;
    token && app.util.request({
      'url': 'entry/wxapp/index',
      'data': {
        controller: 'index.load_history_community',
        token: token
      },
      dataType: 'json',
      success: function(res) {
        if (res.data.code == 0) {
          let history_communities = res.data.list;
          let isNotHistory = false;
          if (Object.keys(history_communities).length == 0 || history_communities.communityId == 0) isNotHistory = true;

          if (that.data.community) {
            app.globalData.community = history_communities;
          }
          that.setData({
            historyCommunity: history_communities,
            isNotHistory
          })
        }
      }
    })

    var demo = new QQMapWX({
      key: tx_map_key || ''
    });

    console.log('腾讯地图api key', tx_map_key);

    wx.getLocation({
      type: 'gcj02', //编码方式，
      success: function(res) {
        console.log('getLocation success')
        var latitude = res.latitude;
        var longitude = res.longitude;
        that.setData({
          latitude: res.latitude,
          longitude: res.longitude
        })
        wx.setStorage({
          key: "latitude",
          data: latitude
        })
        wx.setStorage({
          key: "longitude",
          data: longitude
        })

        demo.reverseGeocoder({
          //腾讯地图api 逆解析方法 首先设计经纬度
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          }, //逆解析成功回调函数
          success: function(res) {
            let cityName = res.result.address_component.city;
            that.setData({
              city: {
                districtName: cityName
              }
            })
            wx.showLoading({
              title: "加载中...",
              mask: true,
              icon: "none"
            })
            that.load_gps_community_list();
          },
          fail: function(error){
            console.log('腾讯地图api error', error);
            let msg = error.message || '';
            app.util.message(msg, '', 'error');
            wx.setStorageSync('tx_map_key', '');
          }
        })
      },
      fail: function(error) {
        that.isFirst = true;
        location.checkGPS(app, () => {
          console.log('canGetGPS', app.globalData.canGetGPS)
          if (app.globalData.canGetGPS) {
            console.log('checkGPS sucess')
            let gpos = app.globalData.location;
            if (gpos && gpos.lat) {
              that.setData({
                latitude: gpos.latitude,
                longitude: gpos.longitude
              })
              wx.setStorage({
                key: "latitude",
                data: gpos.latitude
              })
              wx.setStorage({
                key: "longitude",
                data: gpos.longitude
              })

              demo.reverseGeocoder({
                //腾讯地图api 逆解析方法 首先设计经纬度
                location: {
                  latitude: gpos.latitude,
                  longitude: gpos.longitude
                }, //逆解析成功回调函数
                success: function(res) {
                  let cityName = res.result.address_component.city;
                  that.setData({
                    city: {
                      districtName: cityName
                    }
                  })
                  that.load_gps_community_list();
                }
              })
            }
          } else {
            location.openSetting(app).then(function(pos) {
              that.setData({
                latitude: pos.latitude,
                longitude: pos.longitude
              })
              wx.setStorage({
                key: "latitude",
                data: pos.latitude
              })
              wx.setStorage({
                key: "longitude",
                data: pos.longitude
              })

              demo.reverseGeocoder({
                //腾讯地图api 逆解析方法 首先设计经纬度
                location: {
                  latitude: pos.latitude,
                  longitude: pos.longitude
                }, //逆解析成功回调函数
                success: function(res) {
                  let cityName = res.result.address_component.city;
                  that.setData({
                    city: {
                      districtName: cityName
                    }
                  })
                  that.load_gps_community_list();
                }
              })
            }).catch(function() {
              that.setData({
                isEmpty: true,
                loadMore: false,
                hasRefeshin: true,
                tip: '',
                canGetGPS: false
              })
            });
          }
        });
      }
    })
  },

  /**
   * 获取社区列表
   */
  load_gps_community_list: function(city_id) {
    console.log('load_gps_community_list')
    var token = wx.getStorageSync('token');
    var that = this;
    //tip: "加载中...",
    console.log('come gpslist');
    if (!that.data.hasRefeshin) {
      that.setData({
        hasRefeshin: true,
        loadMore: true
      });

      app.util.request({
        'url': 'entry/wxapp/index',
        'data': {
          controller: 'index.load_gps_community',
          token: token,
          pageNum: that.data.pageNum,
          longitude: that.data.longitude,
          latitude: that.data.latitude,
          city_id: that.data.city_id || 0
        },
        dataType: 'json',
        success: function(res) {
          wx.hideLoading();
          if (res.data.code == 0) {
            let communities = that.data.communities.concat(res.data.list);
            if (that.data.pageNum == 1 && communities.length == 0) {
              that.setData({
                isEmpty: true,
                loadMore: false,
                tip: '',
                hasRefeshin: true
              });
              return false;
            }
            that.setData({
              communities: communities,
              pageNum: that.data.pageNum + 1,
              loadMore: false,
              hasRefeshin: false,
              tip: '',
              index_hide_headdetail_address: res.data.index_hide_headdetail_address || 0
            });
          } else if (res.data.code == 1) {
            //go data
            that.setData({
              loadMore: false,
              tip: '^_^已经到底了'
            })
          } else if (res.data.code == 2) {
            //no login
            wx.hideLoading();
            console.log(that.data.needAuth)
            that.setData({
              needAuth: true,
              hasRefeshin: false
            })
          }
        }
      })
    }
  },

  /**
   * 打开设置
   */
  openSetting: function() {
    let that = this;
    that.setData({
      isEmpty: false,
      loadMore: true,
      hasRefeshin: false,
      tip: '加载中'
    }, () => {
      that.load_gps_community();
    })
    // location.openSetting(app);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let that = this;
    console.log("show")
    if (!this.isFirst) {
      console.log('nofirst');
      // util.check_login() ? this.setData({
      //   needAuth: false
      // }) : this.setData({
      //   needAuth: true
      // });
      var city = wx.getStorageSync('city'),
        city_id = wx.getStorageSync('city_id');
      console.log(city_id)
      city && that.setData({
        city,
        city_id,
        pageNum: 1,
        hasRefeshin: false,
        communities: []
      }), wx.showLoading({
        title: "加载中...",
        mask: true,
        icon: "none"
      }), this.load_gps_community_list();
    } else {
      this.isFirst = false
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
    this.load_gps_community_list();
  },

  gotoMap: function () {
    let community = this.data.community;
    let postion = { lat: community.lat, lon: community.lon };
    let longitude = parseFloat(postion.lon),
      latitude = parseFloat(postion.lat),
      name = community.disUserName,
      address = `${community.fullAddress}(${community.communityName})`;
    wx.openLocation({
      latitude: latitude,
      longitude: longitude,
      name: name,
      address: address,
      scale: 28
    })
  },

  callTelphone: function (e) {
    let that = this;
    let community = this.data.community;
    let phoneNumber = community.head_mobile||community.disUserMobile;
    if (phoneNumber) {
      this.isCalling || (this.isCalling = true, wx.makePhoneCall({
        phoneNumber: phoneNumber,
        complete: function () {
          that.isCalling = false;
        }
      }));
    } else {
      app.util.message('请先登录', 'switchTo:/eaterplanet_ecommerce/pages/user/me', 'error');
    }
  },
})
