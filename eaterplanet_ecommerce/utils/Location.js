const app = getApp();
const QQMapWX = require('./qqmap-wx-jssdk.min.js');

/**
 * 检查GPS权限
 * @param {Function} fn 回调函数
 */
const checkGPS = (fn = null) => {
  wx.authorize({
    scope: 'scope.userLocation',
    success: () => {
      console.log('get GPS success');
      wx.getLocation({
        success: (res) => {
          console.log('get GPS location success');
          app.globalData.location = {
            latitude: res.latitude,
            longitude: res.longitude
          };
          app.globalData.canGetGPS = true;
          fn && fn(res);
        },
        fail: (error) => {
          console.log('get GPS location fail', error);
          app.globalData.canGetGPS = false;
          fn && fn();
        }
      });
    },
    fail: () => {
      console.log('get GPS fail checkGPS');
      app.globalData.canGetGPS = false;
      fn && fn();
    }
  });
};

/**
 * 打开设置以获取地理位置权限
 * @param {Object} t 参数对象
 * @returns {Promise}
*/
const openSetting = (t) => {
  return new Promise((resolve, reject) => {
    wx.showModal({
      content: '为了更好的服务您,需要您的地理位置',
      confirmText: '去开启',
      confirmColor: '#FF673F',
      success: (res1) => {
        if (res1.confirm) {
          wx.openSetting({
            success: (result) => {
              console.log(result);
              if (result.authSetting['scope.userLocation']) {
                wx.getLocation({
                  success: (res) => {
                    console.log('get GPS location success');
                    app.globalData.location = {
                      latitude: res.latitude,
                      longitude: res.longitude
                    };
                    app.globalData.canGetGPS = true;
                    resolve(res);
                  },
                  fail: (error) => {
                    console.log('get GPS location fail', error);
                    app.globalData.canGetGPS = false;
                    reject(error);
                  }
                });
              } else {
                reject(new Error('User denied location access'));
              }
            },
            fail: (error) => {
              console.log('openSetting fail', error);
              reject(error);
            }
          });
        } else {
          reject(new Error('User cancelled location access'));
        }
      }
    });
  });
};

/**
 * 获取GPS位置
 * @param {Function} fn 回调函数
 */
const getGps = (fn) => {
  wx.getLocation({
    type: 'wgs84',
    success: (res) => {
      console.log('get GPS location success');
      app.globalData.location = {
        latitude: res.latitude,
        longitude: res.longitude
      };
      app.globalData.canGetGPS = true;
      fn && fn(res);
    },
    fail: (error) => {
      console.log('get GPS location fail', error);
      app.globalData.canGetGPS = false;
      fn && fn();
    }
  });
};

/**
 * 通过GPS获取详细位置
 * @param {number} lat 纬度
 * @param {number} lon 经度
 * @returns {Promise}
 */
const getGpsLocation = (lat, lon) => {
  var tx_map_key = wx.getStorageSync('tx_map_key');
  if (tx_map_key) {
    return new Promise((resolve, reject) => {
      analyzeGps(tx_map_key, lat, lon).then((res) => {
        resolve(res);
      }).catch((error) => {
        reject(error);
      });
    });
  } else {
    return new Promise((resolve, reject) => {
      app.util.request({
        url: 'entry/wxapp/index',
        data: {
          controller: 'index.get_community_config'
        },
        dataType: 'json',
        success: (res) => {
          if (res.data.code == 0) {
            tx_map_key = res.data.tx_map_key;
            wx.setStorage({
              key: 'tx_map_key',
              data: tx_map_key
            });
            analyzeGps(tx_map_key, lat, lon).then((res) => {
              resolve(res);
            }).catch((error) => {
              reject(error);
            });
          }
        }
      });
    });
  }
};

/**
 * 解析 GPS
 * @param {string} tx_map_key 腾讯地图API密钥
 * @param {number} lat 纬度
 * @param {number} lon 经度
 * @returns {Promise}
 */
const analyzeGps = (tx_map_key, lat, lon) => {
  var demo = new QQMapWX({
    key: tx_map_key
  });
  return new Promise((resolve, reject) => {
    demo.reverseGeocoder({
      location: {
        latitude: lat,
        longitude: lon
      },
      success: (res) => {
        resolve(res);
      },
      fail: (error) => {
        reject(error);
      }
    });
  });
};

module.exports = {
  checkGPS,
  openSetting,
  getGps,
  getGpsLocation,
  analyzeGps
}