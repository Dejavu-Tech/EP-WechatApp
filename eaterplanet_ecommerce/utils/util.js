function getdomain() {
  var app = getApp();

  var new_domain = app.siteInfo.uniacid + '_' + app.siteInfo.siteroot;

  var api = new_domain;
  return api;
}

function api() {
  var api = 'https://www.eaterplanet.com/api/';
  return api;
}

function check_login() {
  let token = wx.getStorageSync('token');
  let member_id = wx.getStorageSync('member_id');
  if (token && member_id != undefined && member_id.length > 0) {
    return true;
  } else {
    return false;
  }
}

/**
 * 检查登录状态
 * return promise [Boolean]
 */
function check_login_new() {
  let token = wx.getStorageSync('token');
  let member_id = wx.getStorageSync('member_id');
  return new Promise(function (resolve, reject) {
    wx.checkSession({
      success() {
        console.log('checkSession 未过期');
        if (token && member_id != undefined && member_id.length > 0) {
          resolve(true)
        } else {
          resolve(false)
        }
      },
      fail() {
        console.log('checkSession 过期');
        resolve(false)
      }
    })
  })
}

/**
 * 检查跳转权限控制
 * return [Boolean]
 */
function checkRedirectTo(url, needAuth) {
  let status = false;
  if (needAuth) {
    const needAuthUrl = [
      "/eaterplanet_ecommerce/moduleA/groupCenter/apply",
      "/eaterplanet_ecommerce/pages/supply/apply",
      "/eaterplanet_ecommerce/pages/user/charge",
      "/eaterplanet_ecommerce/pages/order/index",
      "/eaterplanet_ecommerce/moduleA/solitaire/index",
      "/eaterplanet_ecommerce/moduleA/vip/upgrade",
      "eaterplanet_ecommerce/moduleA/coupon/getCoupon"
    ];
    let idx = needAuthUrl.indexOf(url);
    if (idx !== -1) status = true;
  }
  return status;
}

/**
 * s_link: 回调链接
 * type：跳转方式 0 redirectTo， 1 switchTab
 */
function login(s_link, type = 0) {
  var app = getApp();
  var share_id = wx.getStorageSync('share_id');
  if (share_id == undefined) {
    share_id = '0';
  }

  wx.login({
    success: function (res) {
      if (res.code) {
        console.log(res.code);
        app.util.request({
          'url': 'entry/wxapp/user',
          'data': {
            controller: 'user.applogin',
            'code': res.code
          },
          dataType: 'json',
          success: function (res) {
            console.log(res);
            wx.setStorage({
              key: "token",
              data: res.data.token
            })
            wx.getUserInfo({
              success: function (msg) {
                var userInfo = msg.userInfo
                wx.setStorage({
                  key: "userInfo",
                  data: userInfo
                })
                console.log(msg.userInfo);
                app.util.request({
                  'url': 'entry/wxapp/user',
                  'data': {
                    controller: 'user.applogin_do',
                    'token': res.data.token,
                    share_id: share_id,
                    nickName: msg.userInfo.nickName,
                    avatarUrl: msg.userInfo.avatarUrl,
                    encrypteddata: msg.encryptedData,
                    iv: msg.iv
                  },
                  method: 'post',
                  dataType: 'json',
                  success: function (res) {
                    wx.setStorage({
                      key: "member_id",
                      data: res.data.member_id
                    })
                    wx.showToast({
                      title: '资料已更新',
                      icon: 'success',
                      duration: 2000,
                      success: function () {
                        //s_link
                        if (s_link && s_link.length > 0) {
                          if (type == 1) {
                            wx.switchTab({
                              url: s_link,
                            })
                          } else {
                            wx.redirectTo({
                              url: s_link
                            })
                          }
                        }
                      }
                    })
                  }
                })
              },
              fail: function (msg) {
                // console.log(msg);
              }
            })
          }
        });
      } else {
        //console.log('获取用户登录态失败！' + res.errMsg)
      }
    }
  })
}

function login_prosime(needPosition = true, userInfo = {}) {
  return new Promise(function (resolve, reject) {
    getCode().then(token => {
      wxGetUserInfo(needPosition, token, userInfo).then(res => {
        resolve(res)
      }).catch(res => {
        console.log(res);
        reject(res)
      });
    })
  })
}

function login_promise(needPosition = true, userInfo = {}) {
  return new Promise(function (resolve, reject) {
    getCode().then(token => {
      let member_info = wx.getStorageSync('member_info')
      console.log(typeof (member_info))
      let wxGetUserInfoFunc = member_info !== null ? wxGetMemberInfo : wxGetUserInfo;
      function handleResponse(res) {
        resolve(res)
      }
      function handleError(res) {
        reject(res)
      }
      wxGetUserInfoFunc(needPosition, token, userInfo, member_info).then(handleResponse).catch(handleError);
    })
  })
}

function getCode() {
  return new Promise(function (resolve, reject) {
    var app = getApp();
    wx.login({
      success: function (res) {
        if (res.code) {
          console.log(res.code);
          app.util.request({
            url: 'entry/wxapp/user',
            data: {
              controller: 'user.applogin',
              code: res.code
            },
            dataType: 'json',
            success: function (res) {
              resolve(res.data.token);
              wx.setStorage({
                key: "token",
                data: res.data.token
              })
              wx.setStorage({
                key: "member_info",
                data: res.data.member_info
              })
            }
          });
        } else {
          reject(res.errMsg)
        }
      }
    })
  })
}

function wxGetMemberInfo(needPosition, token, userInfo, member_info) {
  return new Promise(function (resolve, reject) {
    var app = getApp();
    var share_id = wx.getStorageSync('share_id');
    var member_info = wx.getStorageSync('member_info');
    if (share_id == undefined) {
      share_id = '0';
    }
    var community = wx.getStorageSync('community');
    var community_id = community && (community.communityId || 0);
    community && wx.setStorageSync('lastCommunity', community);
    app.util.request({
      url: 'entry/wxapp/user',
      data: {
        controller: 'user.applogin_do',
        token,
        member_info,
        share_id: share_id,
        nickName: member_info.username,
        avatarUrl: member_info.avatar,
        community_id
      },
      method: 'post',
      dataType: 'json',
      success: function (res) {
        let isblack = res.data.isblack || 0;
        let isparse_formdata = res.data.isparse_formdata || 0;
        if (isblack == 1) {
          app.globalData.isblack = 1;
          wx.removeStorageSync('token');
          wx.switchTab({
            url: '/eaterplanet_ecommerce/pages/index/index',
          })
        } else if (isparse_formdata == 1) {
          wx.setStorageSync('isparse_formdata', 1);
          wx.setStorage({
            key: "member_id",
            data: res.data.member_id
          })
          wx.reLaunch({
            url: '/eaterplanet_ecommerce/pages/index/index',
          })
        } else {
          wx.setStorage({
            key: "member_id",
            data: res.data.member_id
          })
          console.log('needPosition', needPosition)
          needPosition && getCommunityInfo();
        }
        resolve(res);
      },
      fail: (err) => {
        reject(err);
      }
    })
  })
}

function wxGetUserInfo(needPosition, token, userInfo) {
  return new Promise(function (resolve, reject) {
    var app = getApp();
    var share_id = wx.getStorageSync('share_id');
    if (share_id == undefined) {
      share_id = '0';
    }
    var community = wx.getStorageSync('community');
    var community_id = community && (community.communityId || 0);
    community && wx.setStorageSync('lastCommunity', community);

    app.util.request({
      url: 'entry/wxapp/user',
      data: {
        controller: 'user.applogin_do',
        token,
        share_id: share_id,
        nickName: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl,
        community_id
      },
      method: 'post',
      dataType: 'json',
      success: function (res) {
        let isblack = res.data.isblack || 0;
        let isparse_formdata = res.data.isparse_formdata || 0;

        if (isblack == 1) {
          app.globalData.isblack = 1;
          wx.removeStorageSync('token');
          wx.switchTab({
            url: '/eaterplanet_ecommerce/pages/index/index',
          })
        } else if (isparse_formdata == 1) {
          wx.setStorageSync('isparse_formdata', 1);
          wx.setStorage({
            key: "member_id",
            data: res.data.member_id
          })
          wx.reLaunch({
            url: '/eaterplanet_ecommerce/pages/index/index',
          })
        } else {
          wx.setStorage({
            key: "member_id",
            data: res.data.member_id
          })
          console.log('needPosition', needPosition)
          needPosition && getCommunityInfo();
        }
        resolve(res);
      },
      fail: (err) => {
        reject(err);
      }
    })
  })
}

function stringToJson(data) {
  return JSON.parse(data);
}

function jsonToString(data) {
  return JSON.stringify(data);
}

function imageUtil(e) {
  var imageSize = {};
  var originalWidth = e.detail.width; //图片原始宽  
  var originalHeight = e.detail.height; //图片原始高  
  var originalScale = originalHeight / originalWidth; //图片高宽比  

  //获取屏幕宽高  
  wx.getSystemInfo({
    success: function (res) {
      var windowWidth = res.windowWidth;
      var windowHeight = res.windowHeight;
      var windowscale = windowHeight / windowWidth; //屏幕高宽比  

      //console.log('windowWidth: ' + windowWidth)
      //console.log('windowHeight: ' + windowHeight)
      if (originalScale < windowscale) { //图片高宽比小于屏幕高宽比  
        //图片缩放后的宽为屏幕宽  
        imageSize.imageWidth = windowWidth;
        imageSize.imageHeight = (windowWidth * originalHeight) / originalWidth;
      } else { //图片高宽比大于屏幕高宽比  
        //图片缩放后的高为屏幕高  
        imageSize.imageHeight = windowHeight;
        imageSize.imageWidth = (windowHeight * originalWidth) / originalHeight;
      }
    }
  })
  //console.log('缩放后的宽: ' + imageSize.imageWidth)
  //console.log('缩放后的高: ' + imageSize.imageHeight)
  return imageSize;
}

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

//获取社区存本地
const getCommunityInfo = function (param = {}) {
  // let community = wx.getStorageSync('community');
  let app = getApp();
  // let that = this;
  var token = wx.getStorageSync('token');
  return new Promise(function (resolve, reject) {
    // if (!community){
    app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'index.load_history_community',
        token: token
      },
      dataType: 'json',
      success: function (res) {
        if (res.data.code == 0) {
          let history_communities = res.data.list;
          if (Object.keys(history_communities).length > 0 || history_communities.communityId != 0) {
            wx.setStorageSync('community', history_communities);
            app.globalData.community = history_communities;
            resolve(history_communities);
          } else {
            resolve('');
          }
        } else if (res.data.code == 1) {
          console.log(param)
          if (check_login() && param.communityId === void 0) {
            wx.redirectTo({
              url: '/eaterplanet_ecommerce/pages/position/community',
            })
            resolve('');
          } else {
            resolve(param);
          }
        } else {
          // 未登录
          resolve('');
        }
      }
    })
    // } else {
    //   resolve('')
    // }
  })
}

/**
 * 通过社区id获取社区信息
 * 单社区控制
 * data：该id社区信息
 * open_danhead_model：是否开启单社区
 * default_head_info： 自定义单社区信息
 */
const getCommunityById = function (community_id) {
  return new Promise(function (resolve, reject) {
    getApp().util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'index.get_community_info',
        community_id
      },
      dataType: 'json',
      success: function (res) {
        if (res.data.code == 0) resolve(res.data);
      }
    })
  })
}

/**
 * 历史社区
 */
const addhistory = function (community, isNew = false) {
  var community_id = community.communityId;
  console.log('addhistory');
  var token = wx.getStorageSync('token');
  getApp().util.request({
    url: 'entry/wxapp/index',
    data: {
      controller: 'index.addhistory_community',
      community_id,
      token: token
    },
    dataType: 'json',
    success: function (res) {
      if (isNew) {
        console.log('新人 社区')
        app.util.request({
          url: 'entry/wxapp/index',
          data: {
            controller: 'index.get_community_info',
            community_id: community_id
          },
          dataType: 'json',
          success: function (result) {
            if (result.data.code == 0) {
              let community = result.data.data;
              app.globalData.community = community;
              app.globalData.changedCommunity = true;
              wx.setStorage({
                key: "community",
                data: community
              })
            }
          }
        })
      }
    }
  })
}

/**
 * 获取wx的版本号
 */
const getWxVersion = function () {
  return wx.getSystemInfoSync().SDKVersion
}

/**
 * 微信版本比较， v1 大于 v2，返回1，否则返回 0
 * @param {Object} v1
 * @param {Object} v2
 */
const wxCompareVersion = function (v1, v2) {
  v1 = v1.split('.')
  v2 = v2.split('.')
  const len = Math.max(v1.length, v2.length)
  while (v1.length < len) {
    v1.push('0')
  }
  while (v2.length < len) {
    v2.push('0')
  }
  for (let i = 0; i < len; i++) {
    const num1 = parseInt(v1[i])
    const num2 = parseInt(v2[i])

    if (num1 > num2) {
      return 1
    } else if (num1 < num2) {
      return -1
    }
  }
  return 0
}

const addCart = function (option) {
  return new Promise((resolve, reject) => {
    let token = wx.getStorageSync('token');
    getApp().util.request({
      url: 'entry/wxapp/user',
      data: {
        controller: 'car.add',
        token,
        ...option
      },
      dataType: 'json',
      method: 'POST',
      success: function (res) {
        if (res.data.code == 7) {
          let {
            has_image,
            pop_vipmember_buyimage
          } = res.data;
          if (has_image == 1 && pop_vipmember_buyimage) {
            res.showVipModal = 1;
            res.data.pop_vipmember_buyimage = pop_vipmember_buyimage;
            resolve(res)
          } else {
            resolve(res)
          }
        } else {
          resolve(res)
        }
      },
      fail: function (res) {
        reject(res)
      }
    })
  })
}

const filterTel = function (shipping_tel) {
  if (shipping_tel) {
    var pat = /(\d{7})\d*(\d{0})/;
    return shipping_tel.replace(pat, '$1****$2');
  }
  return shipping_tel;
}

/*函数节流*/
function throttle(fn, interval) {
  var enterTime = 0; //触发的时间
  var gapTime = interval || 300; //间隔时间，如果interval不传，则默认300ms
  return function () {
    var context = this;
    var backTime = new Date(); //第一次函数return即触发的时间
    if (backTime - enterTime > gapTime) {
      fn.call(context, arguments);
      enterTime = backTime; //赋值给第一次触发的时间，这样就保存了第二次触发的时间
    }
  };
}

/*函数防抖*/
function debounce(fn, interval) {
  var timer;
  var gapTime = interval || 1000; //间隔时间，如果interval不传，则默认1000ms
  return function () {
    clearTimeout(timer);
    var context = this;
    var args = arguments; //保存此处的arguments，因为setTimeout是全局的，arguments不是防抖函数需要的。
    timer = setTimeout(function () {
      fn.call(context, args);
    }, gapTime);
  };
}

const fileSystem = wx.getFileSystemManager()
/**
 * 缓存图片
 */
const getStorageImage = (web_image) => {
  return new Promise((resolve, reject) => {
    let webImages = wx.getStorageSync('webImages') || []
    let webImage = webImages.find(y => y.web_path === web_image)
    if (webImage) {
      try {
        fileSystem.accessSync(webImage.local_path)
        resolve(webImage.local_path)
        return webImage.local_path
      } catch (e) {
        // let webImageIdx = webImages.findIndex(y => y.web_path === web_image)
        // webImages.splice(webImageIdx, 1)
        wx.setStorageSync('webImages', webImages)
      }
      resolve(web_image)
    } else {
      wx.downloadFile({
        url: web_image,
        success(res) {
          if (res.statusCode === 200) {
            let filePath = res.tempFilePath
            // let webImageStorage = wx.getStorageSync('webImages') || []
            let webImageStorage = []
            wx.getImageInfo({
              src: filePath,
              success(ret) {
                let windowWidth = getApp().globalData.systemInfo.windowWidth || 375;
                let h = ret.height;
                let w = ret.width;
                let height = h * windowWidth / w;
                let storage = {
                  web_path: web_image,
                  local_path: filePath,
                  height,
                  last_time: Date.parse(new Date()),
                }
                webImageStorage.push(storage)
                wx.setStorageSync('webImages', webImageStorage)
                resolve(web_image)
              },
              fail(err) {
                console.log(err)
                reject()
              }
            })
          } else {
            reject()
          }
        },
        fail() {
          reject()
        }
      })
    }
    // return web_image
  })
}

module.exports = {
  formatTime: formatTime,
  login: login,
  check_login: check_login,
  api: api,
  getdomain: getdomain,
  imageUtil: imageUtil,
  jsonToString: jsonToString,
  stringToJson: stringToJson,
  login_prosime,
  login_promise,
  wxGetMemberInfo,
  getCommunityInfo,
  check_login_new,
  checkRedirectTo,
  getCommunityById,
  addhistory,
  wxGetUserInfo,
  getWxVersion,
  wxCompareVersion,
  addCart,
  filterTel,
  throttle,
  debounce,
  getStorageImage
}