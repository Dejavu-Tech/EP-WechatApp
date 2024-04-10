var app = getApp();
var util = require('./util.js');
var wcache = require('./wcache.js');

function loadStatus() {
  return new Promise(function (resolve) {
    util.check_login_new().then((res) => {
      let appLoadStatus = 1;
      if (res) {
        if (!app.globalData.hasDefaultCommunity) {
          appLoadStatus = 2;
        }
      } else {
        appLoadStatus = 0;
      }
      app.globalData.appLoadStatus = appLoadStatus;
      resolve();
    })
  });
};

function changeCommunity(community, city) {
  let token = wx.getStorageSync('token') || '';
  if (community.communityId && community.communityId !== app.globalData.community.communityId) {
    app.globalData.timer.del();
    app.globalData.changedCommunity = true;
    app.globalData.community = community;
    app.globalData.refresh = true;
    app.globalData.hasDefaultCommunity = true;
    wx.setStorage({
      key: "community",
      data: community
    });
    app.globalData.city = city;
    wx.setStorage({
      key: "city",
      data: city
    });

    var data = {
      community: community,
      city: city
    };

    var historyCommunity = app.globalData.historyCommunity || [];
    if (0 === historyCommunity.length || historyCommunity[0] && historyCommunity[0].communityId !== community.communityId) {
      historyCommunity.length > 1 && historyCommunity.shift();
      historyCommunity.push(data);
      app.globalData.historyCommunity = historyCommunity;
      wx.setStorage({
        key: "historyCommunity",
        data: historyCommunity
      })
    }

    app.globalData.changedCommunity = true;
    app.globalData.goodsListCarCount = [];
    if (token) {
      console.log('changeCommunity step2')
      // 请求提交社区id
      app.util.request({
        'url': 'entry/wxapp/index',
        'data': {
          controller: 'index.switch_history_community',
          token: token,
          head_id: community.communityId
        },
        dataType: 'json',
        success: function (res) {
          swithNavBack(community)
        }
      })
    } else {
      swithNavBack(community)
    }
  } else {
    if (!app.globalData.community.disUserHeadImg) {
      app.globalData.community = community;
      wx.setStorage({
        key: "community",
        data: community
      })
    }
    app.globalData.changedCommunity = true;
    app.globalData.goodsListCarCount = [];
    wx.switchTab({
      url: "/eaterplanet_ecommerce/pages/index/index"
    });
  }
}

// 切换社区跳转
function swithNavBack(community) {
  app.globalData.community_id = community.communityId;
  let navBackUrl = app.globalData.navBackUrl;
  if (navBackUrl) {
    let tabUrls = ['/eaterplanet_ecommerce/pages/index/index', '/eaterplanet_ecommerce/pages/order/shopCart', '/eaterplanet_ecommerce/pages/user/me', '/eaterplanet_ecommerce/pages/type/index'];
    if (tabUrls.indexOf(navBackUrl) != -1) {
      wx.switchTab({
        url: navBackUrl,
        success: () => {
          app.globalData.navBackUrl = '';
        }
      })
    } else {
      wx.redirectTo({
        url: navBackUrl,
        success: () => {
          app.globalData.navBackUrl = '';
        }
      })
    }
  } else {
    wx.switchTab({
      url: "/eaterplanet_ecommerce/pages/index/index"
    });
  }
}

function isIdCard(t) {
  return /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(t);
}

/**
 * 购物车数量
 */
function cartNum() {
  function getTab(cb) {
    let token = wx.getStorageSync('token') || '';
    app.util.request({
      'url': 'entry/wxapp/index',
      'data': {
        controller: 'car.count',
        token: token,
        community_id: app.globalData.community.communityId
      },
      dataType: 'json',
      success: function (res) {
        if (res.data.code == 0) {
          app.globalData.cartNum = res.data.data;
          wx.setStorageSync("cartNum", res.data.data);
          setTab(res.data.data);
          cb(res.data);
        }
      }
    })
  }

  function setTab(t) {
    if ("number" == typeof t && t) {
      // wx.setTabBarBadge({
      //   index: 1,
      //   text: t + "",
      //   fail: function (error) {
      //     console.log(error);
      //   }
      // })
    } else {
      // wx.removeTabBarBadge({
      //   index: 1,
      //   fail: function (error) {
      //     console.log(error);
      //   }
      // });
    }
  }
  var n = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "",
    i = arguments.length > 1 && void 0 !== arguments[1] && arguments[1];
  return new Promise(function (resolve) {
    if (i) {
      getTab(resolve);
    } else {
      var nowTime = new Date().getTime();
      if (app.globalData.cartNumStamp < nowTime) {
        getTab(resolve);
      } else {
        ("number" == typeof n && (app.globalData.cartNum = n), setTab(app.globalData.cartNum), resolve(n))
      }
      app.globalData.cartNumStamp = new Date().getTime() + 60000;
    }
  });
}

function getRect(t, e, r) {
  return new Promise(function (n) {
    wx.createSelectorQuery().in(t)[r ? "selectAll" : "select"](e).boundingClientRect(function (t) {
      r && Array.isArray(t) && t.length && n(t), !r && t && n(t);
    }).exec();
  });
}

/**
 * 设置缓存过期时间
 */
function getInNum() {
  return new Promise((resolve, reject) => {
    let timestamp = Date.parse(new Date());
    let inNum = parseInt(wx.getStorageSync('inNum')) || 0;
    let inNumExp = parseInt(wx.getStorageSync('inNumExp')) || 0;
    let today = new Date(new Date().toLocaleDateString()).getTime();

    if ((timestamp - inNumExp) > 86400000 || inNumExp == 0) {
      console.log('过期了');
      inNum = 1;
      wx.setStorage({
        key: 'inNumExp',
        data: today
      })
    } else {
      inNum += 1;
    }
    wx.setStorage({
      key: 'inNum',
      data: inNum
    })
    let isThree = inNum > 3 ? false : true;
    resolve(isThree);
  })
}

/**
 * 设置导航颜色
 */
function setNavBgColor() {
  let navBgColor = wcache.get('navBgColor', 1);
  let navFontColor = wcache.get('navFontColor', 1);
  if (navBgColor == 1 || navFontColor == 1) {
    app.util.request({
      'url': 'entry/wxapp/index',
      'data': {
        controller: 'index.get_nav_bg_color'
      },
      dataType: 'json',
      success: function (res) {
        if (res.data.code == 0) {
          let nav_bg_color = res.data.data || '#4d9ee9';
          let nav_font_color = res.data.nav_font_color || '#ffffff';
          wx.setNavigationBarColor({
            frontColor: nav_font_color,
            backgroundColor: nav_bg_color
          })
          wcache.put('navBgColor', nav_bg_color, 100);
          wcache.put('navFontColor', nav_font_color, 100);
        }
      }
    })
  } else {
    wx.setNavigationBarColor({
      frontColor: navFontColor,
      backgroundColor: navBgColor
    })
  }
}

/**
 * 获取配置名字 团长快递等
 */
function setGroupInfo() {
  return new Promise(function (resolve, reject) {
    // let groupInfo = wcache.get('groupInfo', 1);
    // if (groupInfo == 1) {
      app.util.request({
        'url': 'entry/wxapp/index',
        'data': {
          controller: 'index.get_group_info'
        },
        dataType: 'json',
        success: function (res) {
          if (res.data.code == 0) {
            let obj = res.data.data;
            console.log(obj);
            obj.commiss_diy_name = obj.commiss_diy_name || '分销';
            obj.group_name = obj.group_name || '社区';
            obj.owner_name = obj.owner_name || '团长';
            obj.delivery_ziti_name = obj.delivery_ziti_name || '社区自提';
            obj.delivery_tuanzshipping_name = obj.delivery_tuanzshipping_name || '团长配送';
            obj.delivery_express_name = obj.delivery_express_name || '快递配送';
            obj.placeorder_tuan_name = obj.placeorder_tuan_name;
            obj.placeorder_trans_name = obj.placeorder_trans_name;
            obj.localtown_modifypickingname = obj.localtown_modifypickingname
            // wcache.put('groupInfo', obj, 60);
            resolve(obj);
          }
        }
      })
    // } else {
    //   resolve(groupInfo);
    // }
  })
}

/**
 * 获取首页、购物车图标
 */
function setIcon() {
  let tabList = wcache.get('tabList', 1);
  return new Promise(function (resolve, reject) {
    if (tabList == 1) {
      app.util.request({
        'url': 'entry/wxapp/index',
        'data': {
          controller: 'index.get_tabbar'
        },
        dataType: 'json',
        success: function (res) {
          if (res.data.code == 0) {
            let list = res.data.data;
            let iconArr = {
              home: '',
              car: '',
              user: ''
            };
            iconArr.home = list['i1'] || '/eaterplanet_ecommerce/images/icon-tab-index1.png';
            iconArr.car = list['i2'] || '/eaterplanet_ecommerce/images/icon-tab-shop1.png';
            iconArr.user = list['i3'] || '/eaterplanet_ecommerce/images/icon-tab-me.png';
            resolve(iconArr);
          }
        }
      })
    } else {
      let iconArr = {
        home: '',
        car: ''
      };
      iconArr.home = tabList.list[0].iconPath;
      iconArr.car = tabList.list[2].iconPath;
      iconArr.user = tabList.list[3].iconPath;
      resolve(iconArr);
    }
  })
}

function getPx(t) {
  return Math.round(app.globalData.systemInfo.windowWidth / 375 * t);
}

/**
 * canvas画文字
 */
function drawText(context, obj, o, a, n, i) {
  var r = o.split(""),
    l = "",
    u = [];
  context.setFillStyle(obj.color);
  // context.fillStyle = obj.color;
  context.textAlign = obj.textAlign;
  context.setFontSize(obj.size);
  // context.font = obj.size +'px Arial';
  for (var s = 0; s < r.length; s++) {
    context.measureText(l).width < i || (u.push(l), l = ""), l += r[s];
  }
  u.push(l);
  for (var m = 0; m < u.length; m++) {
    context.fillText(u[m], a, n + 12 * m);
  }
}

/**
 * 下载图片至本地
 */
function download(t) {
  return new Promise(function (e) {
    wx.downloadFile({
      url: t,
      success: function (t) {
        200 === t.statusCode && e(t);
      },
      fail: function (t) {
        console.log(t), wx.hideLoading();
      }
    });
  });
}

/**
 * 更新首页列表购物车数量
 * actId: 商品id
 * num：数量
 */
function indexListCarCount(actId, num = 0) {
  let obj = {
    actId,
    num
  };
  if (!actId) return;
  let goodsListCarCount = app.globalData.goodsListCarCount || [];
  if(Object.prototype.toString.call(goodsListCarCount) !== '[object Array]') {
    goodsListCarCount = [];
  }
  if (goodsListCarCount.length == 0) {
    goodsListCarCount.push(obj);
  } else {
    let k = goodsListCarCount.findIndex((n) => n.actId == obj.actId);
    if (k == -1) {
      goodsListCarCount.push(obj);
    } else {
      goodsListCarCount[k].num = obj.num;
    }
  }
  app.globalData.goodsListCarCount = goodsListCarCount;
}

module.exports = {
  changeCommunity,
  loadStatus,
  isIdCard,
  cartNum,
  getRect,
  getInNum,
  setNavBgColor,
  setGroupInfo,
  setIcon,
  getPx,
  drawText,
  download,
  indexListCarCount
}
