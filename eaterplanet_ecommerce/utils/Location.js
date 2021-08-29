let app = getApp();
var QQMapWX = require("./qqmap-wx-jssdk.min.js");

function checkGPS(t, fn=null) {
  wx.authorize({
    scope: "scope.userLocation",
    success: function () {
      console.log("get GPS success"), wx.getLocation({
        success: function (n) {
          console.log("get GPS location success"), app.globalData.location = {
            lat: n.latitude,
            lng: n.longitude
          }, app.globalData.canGetGPS = true, fn;
          wx.setStorage({
            key: "latitude",
            data: n.latitude
          })
          wx.setStorage({
            key: "longitude",
            data: n.longitude
          })
        },
        fail: function () {
          console.log("get GPS location fail"), app.globalData.canGetGPS = false, fn&&fn();
        }
      });
    },
    fail: function () {
      console.log("get GPS fail checkGPS"), app.globalData.canGetGPS = false, fn&&fn();
    }
  });
}

function openSetting(t) {
  return new Promise(function (resolve, reject) {
    wx.showModal({
      content: "为了更好的服务您,需要您的地理位置",
      confirmText: "去开启",
      confirmColor: "#FF673F",
      success: function(res1) {
        if(res1.confirm) {
          wx.openSetting({
            success: function(result) {
              console.log(result);
              if(result.authSetting["scope.userLocation"]){
                wx.getLocation({
                  success: function(res) {
                    console.log("get GPS location success");
                    getApp().globalData.location = {
                      lat: res.latitude,
                      lng: res.longitude
                    }, 
                    getApp().globalData.canGetGPS = true;
                    resolve(res);
                  },
                  fail: function (error) {
                    console.log("get GPS fail openSetting");
                    getApp().globalData.canGetGPS = false;
                    reject('取消', error);
                  }
                });
              } else {
                reject('未开启');
              }
            },
            fail: function(error) {
              reject(error);
            }
          });
        } else if(res1.cancel) {
          reject('用户点击取消');
          console.log('用户点击取消')
        }
      }
    });
  });
}

/**
 * 获取定位城市
 */
function getGps() {
  let that = this;
  return new Promise(function (resolve, reject) {
    wx.getLocation({
      type: 'gcj02', //编码方式，
      success: function (res) {
        console.log("getGps-res", res);
        resolve(res);
        wx.setStorage({
          key: "latitude",
          data: res.latitude
        })
        wx.setStorage({
          key: "longitude",
          data: res.longitude
        })
      },
      fail: (error) => {
        console.log("getGps-error", error);
        if (error.errMsg == "getLocation:fail auth deny"){
          that.openSetting().then(function(res){
            console.log(res);
            // reject(res)
          }).catch(function(){
            console.log(error);
            reject(error);
          });
        } else {
          // reject(error);
          console.log(error);
          // reject(error);
        }
      }
    })
  })
}

/**
 * 通过GPS获取详细位置
 */
function getGpsLocation(lat, lon) {
  var tx_map_key = wx.getStorageSync('tx_map_key');
  if (tx_map_key) {
    return new Promise(function (resolve, reject) {
      analyzeGps(tx_map_key, lat, lon).then((res)=>{
        resolve(res);
      });
    })
  } else {
    return new Promise(function (resolve, reject) {
      app.util.request({
        url: 'entry/wxapp/index',
        data: {
          controller: 'index.get_community_config'
        },
        dataType: 'json',
        success: function (res) {
          if (res.data.code == 0) {
            tx_map_key = res.data.tx_map_key;
            wx.setStorage({
              key: "tx_map_key",
              data: tx_map_key
            })
            analyzeGps(tx_map_key, lat, lon).then((res) => {
              resolve(res);
            });
          }
        }
      })
    })
  }
}

/**
 * 解析GPS
 */
function analyzeGps(tx_map_key, lat, lon) {
  var demo = new QQMapWX({
    key: tx_map_key
  });
  return new Promise(function (resolve, reject) {
    demo.reverseGeocoder({
      //腾讯地图api 逆解析方法 首先设置经纬度
      location: {
        latitude: lat,
        longitude: lon
      }, //逆解析成功回调函数
      success: function (res) {
        console.log(res)
        let address_component = res.result.address_component || {};
        let address_reference = res.result.address_reference;
        address_component.town = address_reference.town&&address_reference.town.title || '';
        resolve(address_component);
      }
    })
  })
}

module.exports = {
  checkGPS,
  openSetting,
  getGps,
  getGpsLocation
}