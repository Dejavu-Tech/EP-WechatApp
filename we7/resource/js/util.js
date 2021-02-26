import {
  base64_encode,
  base64_decode
} from 'base64';
import md5 from 'md5';

var siteInfo = require('../../../siteinfo.js')

var util = {};
var app = getApp() || {siteInfo: siteInfo};

util.base64_encode = function(str) {
  return base64_encode(str)
};

util.base64_decode = function(str) {
  return base64_decode(str)
};

util.md5 = function(str) {
  return md5(str)
};

/**
	构造微擎地址, 
	@params action 微擎系统中的controller, action, do，格式为 'wxapp/home/navs'
	@params querystring 格式为 {参数名1 : 值1, 参数名2 : 值2}
*/
util.url = function(action, querystring) {
  var url = app.siteInfo.siteroot + '?i=' + app.siteInfo.uniacid + '&t=' + app.siteInfo.multiid + '&v=' + app.siteInfo.version + '&from=wxapp&';

  if (action) {
    action = action.split('/');
    if (action[0]) {
      url += 'c=' + action[0] + '&';
    }
    if (action[1]) {
      url += 'a=' + action[1] + '&';
    }
    if (action[2]) {
      url += 'do=' + action[2] + '&';
    }
  }

  if (querystring && typeof querystring === 'object') {
    for (let param in querystring) {
      if (param && querystring.hasOwnProperty(param) && querystring[param]) {
        url += param + '=' + querystring[param] + '&';
      }
    }
  }
  return url;
}

function getQuery(url) {
  var theRequest = [];
  if (url.indexOf("?") != -1) {
    var str = url.split('?')[1];
    var strs = str.split("&");
    for (var i = 0; i < strs.length; i++) {
      if (strs[i].split("=")[0] && unescape(strs[i].split("=")[1])) {
        theRequest[i] = {
          'name': strs[i].split("=")[0],
          'value': unescape(strs[i].split("=")[1])
        }
      }
    }
  }
  return theRequest;
}
/*
 * 获取链接某个参数
 * url 链接地址
 * name 参数名称
 */
function getUrlParam(url, name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象  
  var r = url.split('?')[1].match(reg); //匹配目标参数  
  if (r != null) return unescape(r[2]);
  return null; //返回参数值  
}
/**
 * 获取签名 将链接地址的所有参数按字母排序后拼接加上token进行md5
 * url 链接地址
 * date 参数{参数名1 : 值1, 参数名2 : 值2} *
 * token 签名token 非必须
 */
function getSign(url, data, token) {
  var _ = require('underscore.js');
  var md5 = require('md5.js');
  var querystring = '';
  var sign = getUrlParam(url, 'sign');
  if (sign || (data && data.sign)) {
    return false;
  } else {
    if (url) {
      querystring = getQuery(url);
    }
    if (data) {
      var theRequest = [];
      for (let param in data) {
        if (param && data[param]) {
          theRequest = theRequest.concat({
            'name': param,
            'value': data[param]
          })
        }
      }
      querystring = querystring.concat(theRequest);
    }
    //排序
    querystring = _.sortBy(querystring, 'name');
    //去重
    querystring = _.uniq(querystring, true, 'name');
    var urlData = '';
    for (let i = 0; i < querystring.length; i++) {
      if (querystring[i] && querystring[i].name && querystring[i].value) {
        urlData += querystring[i].name + '=' + querystring[i].value;
        if (i < (querystring.length - 1)) {
          urlData += '&';
        }
      }
    }
    token = token ? token : app.siteInfo.token;
    sign = md5(urlData + token);
    return sign;
  }
}
util.getSign = function(url, data, token) {
  return getSign(url, data, token);
};
/**
	二次封装微信wx.request函数、增加交互体全、配置缓存、以及配合微擎格式化返回数据
	@params option 弹出参数表，
	{
		url : 同微信,
		data : 同微信,
		header : 同微信,
		method : 同微信,
		success : 同微信,
		fail : 同微信,
		complete : 同微信,
		cachetime : 缓存周期，在此周期内不重复请求http，默认不缓存
	}
*/
util.request = function(option) {
  var _ = require('underscore.js');
  var md5 = require('md5.js');
  var option = option ? option : {};
  option.cachetime = option.cachetime ? option.cachetime : 0;
  option.showLoading = typeof option.showLoading != 'undefined' ? option.showLoading : true;

  var sessionid = wx.getStorageSync('userInfo').sessionid;
  var url = option.url;
  if (url.indexOf('http://') == -1 && url.indexOf('https://') == -1) {
    url = util.url(url);
  }
  var state = getUrlParam(url, 'state');
  if (!state && !(option.data && option.data.state) && sessionid) {
    url = url + '&state=we7sid-' + sessionid
  }
  if (!option.data || !option.data.m) {
    var nowPage = getCurrentPages();
    if (nowPage.length) {
      nowPage = nowPage[getCurrentPages().length - 1];
      if (nowPage && nowPage.__route__) {
        url = url + '&m=' + nowPage.__route__.split('/')[0];
      }
    }
  }

  var sign = getSign(url, option.data);
  if (sign) {
    url = url + "&sign=" + sign;
  }
  if (!url) {
    return false;
  }
  //wx.showNavigationBarLoading();
  if (option.showLoading) {
    //util.showLoading();
  }
  if (option.cachetime) {
    var cachekey = md5(url);
    var cachedata = wx.getStorageSync(cachekey);
    var timestamp = Date.parse(new Date());

    if (cachedata && cachedata.data) {
      if (cachedata.expire > timestamp) {
        if (option.complete && typeof option.complete == 'function') {
          option.complete(cachedata);
        }
        if (option.success && typeof option.success == 'function') {
          option.success(cachedata);
        }
        console.log('cache:' + url);
        //	wx.hideLoading();
        //wx.hideNavigationBarLoading();
        return true;
      } else {
        wx.removeStorageSync(cachekey)
      }
    }
  }
  wx.request({
    'url': url,
    'data': option.data ? option.data : {},
    'header': option.header ? option.header : {},
    'method': option.method ? option.method : 'GET',
    'header': {
      'content-type': 'application/x-www-form-urlencoded'
    },
    'success': function(response) {
      //wx.hideNavigationBarLoading();
      //wx.hideLoading();
      if (response.data.errno) {
        if (response.data.errno == '41009') {
          wx.setStorageSync('userInfo', '');
          util.getUserInfo(function() {
            util.request(option)
          });
          return;
        } else {
          if (option.fail && typeof option.fail == 'function') {
            option.fail(response);
          } else {
            if (response.data.message) {
              if (response.data.data != null && response.data.data.redirect) {
                var redirect = response.data.data.redirect;
              } else {
                var redirect = '';
              }
              app.util.message(response.data.message, redirect, 'error');
            }
          }
          return;
        }
      } else {
        if (option.success && typeof option.success == 'function') {
          option.success(response);
        }
        //写入缓存，减少HTTP请求，并且如果网络异常可以读取缓存数据
        if (option.cachetime) {
          var cachedata = {
            'data': response.data,
            'expire': timestamp + option.cachetime * 1000
          };
          wx.setStorageSync(cachekey, cachedata);
        }
      }
    },
    'fail': function(response) {
      wx.hideNavigationBarLoading();
      wx.hideLoading();

      //如果请求失败，尝试从缓存中读取数据
      var md5 = require('md5.js');
      var cachekey = md5(url);
      var cachedata = wx.getStorageSync(cachekey);
      if (cachedata && cachedata.data) {
        if (option.success && typeof option.success == 'function') {
          option.success(cachedata);
        }
        console.log('failreadcache:' + url);
        return true;
      } else {
        if (option.fail && typeof option.fail == 'function') {
          option.fail(response);
        }
      }
    },
    'complete': function(response) {
      // wx.hideNavigationBarLoading();
      // wx.hideLoading();
      if (option.complete && typeof option.complete == 'function') {
        option.complete(response);
      }
    }
  });
}
/*
 * 获取用户信息
 */
util.getUserInfo = function(cb) {
  var login = function() {
    console.log('start login');
    var userInfo = {
      'sessionid': '',
      'wxInfo': '',
      'memberInfo': '',
    };
    wx.login({
      success: function(res) {
        util.request({
          url: 'auth/session/openid',
          data: {
            code: res.code
          },
          cachetime: 0,
          success: function(session) {
            if (!session.data.errno) {
              userInfo.sessionid = session.data.data.sessionid
              wx.setStorageSync('userInfo', userInfo);
              wx.getUserInfo({
                success: function(wxInfo) {
                  userInfo.wxInfo = wxInfo.userInfo
                  wx.setStorageSync('userInfo', userInfo);
                  util.request({
                    url: 'auth/session/userinfo',
                    data: {
                      signature: wxInfo.signature,
                      rawData: wxInfo.rawData,
                      iv: wxInfo.iv,
                      encryptedData: wxInfo.encryptedData
                    },
                    method: 'POST',
                    header: {
                      'content-type': 'application/x-www-form-urlencoded'
                    },
                    cachetime: 0,
                    success: function(res) {
                      if (!res.data.errno) {
                        userInfo.memberInfo = res.data.data;
                        wx.setStorageSync('userInfo', userInfo);
                      }
                      typeof cb == "function" && cb(userInfo);
                    }
                  });
                },
                fail: function() {
                  typeof cb == "function" && cb(userInfo);
                },
                complete: function() {}
              })
            }
          }
        });
      },
      fail: function() {
        wx.showModal({
          title: '获取信息失败',
          content: '请允许授权以便为您提供给服务',
          success: function(res) {
            if (res.confirm) {
              util.getUserInfo();
            }
          }
        })
      }
    });
  };

  var app = wx.getStorageSync('userInfo');
  if (app.sessionid) {
    wx.checkSession({
      success: function() {
        typeof cb == "function" && cb(app);
      },
      fail: function() {
        app.sessionid = '';
        console.log('relogin');
        wx.removeStorageSync('userInfo');
        login();
      }
    })
  } else {
    //调用登录接口
    login();
  }
}

util.navigateBack = function(obj) {
  let delta = obj.delta ? obj.delta : 1;
  if (obj.data) {
    let pages = getCurrentPages()
    let curPage = pages[pages.length - (delta + 1)];
    if (curPage.pageForResult) {
      curPage.pageForResult(obj.data);
    } else {
      curPage.setData(obj.data);
    }
  }
  wx.navigateBack({
    delta: delta, // 回退前 delta(默认为1) 页面
    success: function(res) {
      // success
      typeof obj.success == "function" && obj.success(res);
    },
    fail: function(err) {
      // fail
      typeof obj.fail == "function" && obj.fail(err);
    },
    complete: function() {
      // complete
      typeof obj.complete == "function" && obj.complete();
    }
  })
};

util.footer = function($this) {
  let that = $this;
  let tabBar = app.tabBar;
  for (let i in tabBar['list']) {
    tabBar['list'][i]['pageUrl'] = tabBar['list'][i]['pagePath'].replace(/(\?|#)[^"]*/g, '')
  }
  that.setData({
    tabBar: tabBar,
    'tabBar.thisurl': that.__route__
  })
};
/*
 * 提示信息
 * type 为 success, error 当为 success,  时，为toast方式，否则为模态框的方式
 * redirect 为提示后的跳转地址, 跳转的时候可以加上 协议名称  
 * navigate:/we7/pages/detail/detail 以 navigateTo 的方法跳转，
 * redirect:/we7/pages/detail/detail 以 redirectTo 的方式跳转，默认为 redirect
 */
util.message = function (title, redirect, type, confirmText="确定") {
  if (!title) {
    return true;
  }
  if (typeof title == 'object') {
    redirect = title.redirect;
    type = title.type;
    title = title.title;
  }
  if (redirect) {
    var redirectType = redirect.substring(0, 9),
      url = '',
      redirectFunction = '';
    if (redirectType == 'navigate:') {
      redirectFunction = 'navigateTo';
      url = redirect.substring(9);
    } else if (redirectType == 'redirect:') {
      redirectFunction = 'redirectTo';
      url = redirect.substring(9);
    } else if (redirectType == 'switchTo:') {
      redirectFunction = 'switchTab';
      url = redirect.substring(9);
    } else {
      url = redirect;
      redirectFunction = 'redirectTo';
    }
  }
  if (!type) {
    type = 'success';
  }

  if (type == 'success') {
    wx.showToast({
      title: title,
      icon: 'success',
      duration: 2000,
      mask: url ? true : false,
      complete: function() {
        if (url) {
          setTimeout(function() {
            wx[redirectFunction]({
              url: url,
            });
          }, 1800);
        }

      }
    });
  } else if (type == 'error') {
    wx.showModal({
      title: '提示',
      content: title,
      showCancel: false,
      confirmColor: '#ff5041',
      confirmText,
      complete: function() {
        if (url) {
          wx[redirectFunction]({
            url: url,
          });
        }
      }
    });
  }
}

util.navTo = function (redirect){
  if (redirect) {
    var redirectType = redirect.substring(0, 9),
      url = '',
      redirectFunction = '';
    if (redirectType == 'navigate:') {
      redirectFunction = 'navigateTo';
      url = redirect.substring(9);
    } else if (redirectType == 'redirect:') {
      redirectFunction = 'redirectTo';
      url = redirect.substring(9);
    } else if (redirectType == 'switchTo:') {
      redirectFunction = 'switchTab';
      url = redirect.substring(9);
    } else {
      url = redirect;
      redirectFunction = 'redirectTo';
    }
    url && wx[redirectFunction]({ url });
  }
}

util.user = util.getUserInfo;

//封装微信等待提示，防止ajax过多时，show多次
util.showLoading = function() {
  var isShowLoading = wx.getStorageSync('isShowLoading');
  if (isShowLoading) {
    wx.hideLoading();
    wx.setStorageSync('isShowLoading', false);
  }

  wx.showLoading({
    title: '加载中',
    complete: function() {
      wx.setStorageSync('isShowLoading', true);
    },
    fail: function() {
      wx.setStorageSync('isShowLoading', false);
    }
  });
}

util.showImage = function(event) {
  var url = event ? event.currentTarget.dataset.preview : '';
  if (!url) {
    return false;
  }
  wx.previewImage({
    urls: [url]
  });
}

/**
 * 转换内容中的emoji表情为 unicode 码点，在Php中使用utf8_bytes来转换输出
 */
util.parseContent = function(string) {
  if (!string) {
    return string;
  }

  var ranges = [
    '\ud83c[\udf00-\udfff]', // U+1F300 to U+1F3FF
    '\ud83d[\udc00-\ude4f]', // U+1F400 to U+1F64F
    '\ud83d[\ude80-\udeff]' // U+1F680 to U+1F6FF
  ];
  var emoji = string.match(
    new RegExp(ranges.join('|'), 'g'));

  if (emoji) {
    for (var i in emoji) {
      string = string.replace(emoji[i], '[U+' + emoji[i].codePointAt(0).toString(16).toUpperCase() + ']');
    }
  }
  return string;
}

util.date = function() {
  /**
   * 判断闰年
   * @param date Date日期对象
   * @return boolean true 或false
   */
  this.isLeapYear = function(date) {
    return (0 == date.getYear() % 4 && ((date.getYear() % 100 != 0) || (date.getYear() % 400 == 0)));
  }

  /**
   * 日期对象转换为指定格式的字符串
   * @param f 日期格式,格式定义如下 yyyy-MM-dd HH:mm:ss
   * @param date Date日期对象, 如果缺省，则为当前时间
   *
   * YYYY/yyyy/YY/yy 表示年份  
   * MM/M 月份  
   * W/w 星期  
   * dd/DD/d/D 日期  
   * hh/HH/h/H 时间  
   * mm/m 分钟  
   * ss/SS/s/S 秒  
   * @return string 指定格式的时间字符串
   */
  this.dateToStr = function(formatStr, date) {
    formatStr = arguments[0] || "yyyy-MM-dd HH:mm:ss";
    date = arguments[1] || new Date();
    var str = formatStr;
    var Week = ['日', '一', '二', '三', '四', '五', '六'];
    str = str.replace(/yyyy|YYYY/, date.getFullYear());
    str = str.replace(/yy|YY/, (date.getYear() % 100) > 9 ? (date.getYear() % 100).toString() : '0' + (date.getYear() % 100));
    str = str.replace(/MM/, date.getMonth() > 9 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1));
    str = str.replace(/M/g, date.getMonth());
    str = str.replace(/w|W/g, Week[date.getDay()]);

    str = str.replace(/dd|DD/, date.getDate() > 9 ? date.getDate().toString() : '0' + date.getDate());
    str = str.replace(/d|D/g, date.getDate());

    str = str.replace(/hh|HH/, date.getHours() > 9 ? date.getHours().toString() : '0' + date.getHours());
    str = str.replace(/h|H/g, date.getHours());
    str = str.replace(/mm/, date.getMinutes() > 9 ? date.getMinutes().toString() : '0' + date.getMinutes());
    str = str.replace(/m/g, date.getMinutes());

    str = str.replace(/ss|SS/, date.getSeconds() > 9 ? date.getSeconds().toString() : '0' + date.getSeconds());
    str = str.replace(/s|S/g, date.getSeconds());

    return str;
  }


  /**
   * 日期计算  
   * @param strInterval string  可选值 y 年 m月 d日 w星期 ww周 h时 n分 s秒  
   * @param num int
   * @param date Date 日期对象
   * @return Date 返回日期对象
   */
  this.dateAdd = function(strInterval, num, date) {
    date = arguments[2] || new Date();
    switch (strInterval) {
      case 's':
        return new Date(date.getTime() + (1000 * num));
      case 'n':
        return new Date(date.getTime() + (60000 * num));
      case 'h':
        return new Date(date.getTime() + (3600000 * num));
      case 'd':
        return new Date(date.getTime() + (86400000 * num));
      case 'w':
        return new Date(date.getTime() + ((86400000 * 7) * num));
      case 'm':
        return new Date(date.getFullYear(), (date.getMonth()) + num, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());
      case 'y':
        return new Date((date.getFullYear() + num), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());
    }
  }

  /**
   * 比较日期差 dtEnd 格式为日期型或者有效日期格式字符串
   * @param strInterval string  可选值 y 年 m月 d日 w星期 ww周 h时 n分 s秒  
   * @param dtStart Date  可选值 y 年 m月 d日 w星期 ww周 h时 n分 s秒
   * @param dtEnd Date  可选值 y 年 m月 d日 w星期 ww周 h时 n分 s秒 
   */
  this.dateDiff = function(strInterval, dtStart, dtEnd) {
    switch (strInterval) {
      case 's':
        return parseInt((dtEnd - dtStart) / 1000);
      case 'n':
        return parseInt((dtEnd - dtStart) / 60000);
      case 'h':
        return parseInt((dtEnd - dtStart) / 3600000);
      case 'd':
        return parseInt((dtEnd - dtStart) / 86400000);
      case 'w':
        return parseInt((dtEnd - dtStart) / (86400000 * 7));
      case 'm':
        return (dtEnd.getMonth() + 1) + ((dtEnd.getFullYear() - dtStart.getFullYear()) * 12) - (dtStart.getMonth() + 1);
      case 'y':
        return dtEnd.getFullYear() - dtStart.getFullYear();
    }
  }

  /**
   * 字符串转换为日期对象 // eval 不可用
   * @param date Date 格式为yyyy-MM-dd HH:mm:ss，必须按年月日时分秒的顺序，中间分隔符不限制
   */
  this.strToDate = function(dateStr) {
    var data = dateStr;
    var reCat = /(\d{1,4})/gm;
    var t = data.match(reCat);
    t[1] = t[1] - 1;
    eval('var d = new Date(' + t.join(',') + ');');
    return d;
  }

  /**
   * 把指定格式的字符串转换为日期对象yyyy-MM-dd HH:mm:ss
   * 
   */
  this.strFormatToDate = function(formatStr, dateStr) {
    var year = 0;
    var start = -1;
    var len = dateStr.length;
    if ((start = formatStr.indexOf('yyyy')) > -1 && start < len) {
      year = dateStr.substr(start, 4);
    }
    var month = 0;
    if ((start = formatStr.indexOf('MM')) > -1 && start < len) {
      month = parseInt(dateStr.substr(start, 2)) - 1;
    }
    var day = 0;
    if ((start = formatStr.indexOf('dd')) > -1 && start < len) {
      day = parseInt(dateStr.substr(start, 2));
    }
    var hour = 0;
    if (((start = formatStr.indexOf('HH')) > -1 || (start = formatStr.indexOf('hh')) > 1) && start < len) {
      hour = parseInt(dateStr.substr(start, 2));
    }
    var minute = 0;
    if ((start = formatStr.indexOf('mm')) > -1 && start < len) {
      minute = dateStr.substr(start, 2);
    }
    var second = 0;
    if ((start = formatStr.indexOf('ss')) > -1 && start < len) {
      second = dateStr.substr(start, 2);
    }
    return new Date(year, month, day, hour, minute, second);
  }


  /**
   * 日期对象转换为毫秒数
   */
  this.dateToLong = function(date) {
    return date.getTime();
  }

  /**
   * 毫秒转换为日期对象
   * @param dateVal number 日期的毫秒数 
   */
  this.longToDate = function(dateVal) {
    return new Date(dateVal);
  }

  /**
   * 判断字符串是否为日期格式
   * @param str string 字符串
   * @param formatStr string 日期格式， 如下 yyyy-MM-dd
   */
  this.isDate = function(str, formatStr) {
    if (formatStr == null) {
      formatStr = "yyyyMMdd";
    }
    var yIndex = formatStr.indexOf("yyyy");
    if (yIndex == -1) {
      return false;
    }
    var year = str.substring(yIndex, yIndex + 4);
    var mIndex = formatStr.indexOf("MM");
    if (mIndex == -1) {
      return false;
    }
    var month = str.substring(mIndex, mIndex + 2);
    var dIndex = formatStr.indexOf("dd");
    if (dIndex == -1) {
      return false;
    }
    var day = str.substring(dIndex, dIndex + 2);
    if (!isNumber(year) || year > "2100" || year < "1900") {
      return false;
    }
    if (!isNumber(month) || month > "12" || month < "01") {
      return false;
    }
    if (day > getMaxDay(year, month) || day < "01") {
      return false;
    }
    return true;
  }

  this.getMaxDay = function(year, month) {
    if (month == 4 || month == 6 || month == 9 || month == 11)
      return "30";
    if (month == 2)
      if (year % 4 == 0 && year % 100 != 0 || year % 400 == 0)
        return "29";
      else
        return "28";
    return "31";
  }
  /**
   *	变量是否为数字
   */
  this.isNumber = function(str) {
    var regExp = /^\d+$/g;
    return regExp.test(str);
  }

  /**
   * 把日期分割成数组 [年、月、日、时、分、秒]
   */
  this.toArray = function(myDate) {
    myDate = arguments[0] || new Date();
    var myArray = Array();
    myArray[0] = myDate.getFullYear();
    myArray[1] = myDate.getMonth();
    myArray[2] = myDate.getDate();
    myArray[3] = myDate.getHours();
    myArray[4] = myDate.getMinutes();
    myArray[5] = myDate.getSeconds();
    return myArray;
  }

  /**
   * 取得日期数据信息  
   * 参数 interval 表示数据类型  
   * y 年 M月 d日 w星期 ww周 h时 n分 s秒  
   */
  this.datePart = function(interval, myDate) {
    myDate = arguments[1] || new Date();
    var partStr = '';
    var Week = ['日', '一', '二', '三', '四', '五', '六'];
    switch (interval) {
      case 'y':
        partStr = myDate.getFullYear();
        break;
      case 'M':
        partStr = myDate.getMonth() + 1;
        break;
      case 'd':
        partStr = myDate.getDate();
        break;
      case 'w':
        partStr = Week[myDate.getDay()];
        break;
      case 'ww':
        partStr = myDate.WeekNumOfYear();
        break;
      case 'h':
        partStr = myDate.getHours();
        break;
      case 'm':
        partStr = myDate.getMinutes();
        break;
      case 's':
        partStr = myDate.getSeconds();
        break;
    }
    return partStr;
  }

  /**
   * 取得当前日期所在月的最大天数  
   */
  this.maxDayOfDate = function(date) {
    date = arguments[0] || new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() + 1);
    var time = date.getTime() - 24 * 60 * 60 * 1000;
    var newDate = new Date(time);
    return newDate.getDate();
  }
};

util.getLightColor = function(color, level) {
  color = color ? color.toUpperCase() : color;
  var r = /^\#?[0-9A-F]{6}$/;
  if (!r.test(color)) return color;
  color = color.replace("#", "");
  var hxs = color.match(/../g);
  for (var i = 0; i < 3; i++) {
      var col = parseInt(hxs[i], 16);
      hxs[i] = Math.floor((255 - col) * level + col);
  }
  return `rgb(${hxs[0]}, ${hxs[1]}, ${hxs[2]})`;
}

util.ProReq = function(controller, params) {
  return new Promise((resolve, reject)=>{
    util.request({
      url: 'entry/wxapp/index',
      data: {
        controller,
        ...params
      },
      dataType: 'json',
      success: function (res) {
        wx.hideLoading();
        if (res.data.code == 0) {
          resolve(res.data)
        } else {
          reject(res.data)
        }
      },
      fail: err=>{
        console.log(err)
      }
    })
  })
}

module.exports = util;