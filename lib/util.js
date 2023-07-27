import {
    base64_encode,
    base64_decode
} from 'base64';
import md5 from 'md5';

var siteInfo = require('../siteinfo.js')

var util = {};
var app = getApp() || { siteInfo: siteInfo };

util.base64_encode = function (str) {
    return base64_encode(str)
};

util.base64_decode = function (str) {
    return base64_decode(str)
};

util.md5 = function (str) {
    return md5(str)
};

/**
    构造微擎地址, 
    @params action 微擎系统中的controller, action, do，格式为 'wxapp/home/navs'
    @params querystring 格式为 {参数名1 : 值1, 参数名2 : 值2}
*/
util.url = function (action, querystring) {
    const { siteroot, uniacid, multiid, version } = app.siteInfo;
    const urlParts = [siteroot, '?i=', uniacid, '&t=', multiid, '&v=', version, '&from=wxapp&'];
    if (action) {
        const [controller, actionName, queryString] = action.split('/');
        if (controller) {
            urlParts.push('c=', controller, '&');
        }
        if (actionName) {
            urlParts.push('a=', actionName, '&');
        }
        if (queryString) {
            urlParts.push('do=', queryString, '&');
        }
    }
    if (querystring && typeof querystring === 'object') {
        const keys = Object.keys(querystring);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const value = querystring[key];
            if (key && querystring.hasOwnProperty(key) && value) {
                urlParts.push(key, '=', value, '&');
            }
        }
    }
    return urlParts.join('');
}

function getQuery(url) {
    const theRequest = [];
    const queryStringIndex = url.indexOf('?');
    if (queryStringIndex !== -1) {
        const queryString = url.substring(queryStringIndex + 1);
        const queryParts = queryString.split('&');
        queryParts.forEach((queryPart, index) => {
            const [name, value] = queryPart.split('=');
            if (name && unescape(value)) {
                theRequest[index] = {
                    name,
                    value: unescape(value)
                };
            }
        });
    }
    return theRequest;
}
/*
 * 获取链接某个参数
 * url 链接地址
 * name 参数名称
 */
// 从 URL 中获取指定名称的查询字符串参数
function getUrlParam(url, name) {
    const queryStringIndex = url.indexOf('?');
    if (queryStringIndex !== -1) {
        const queryString = url.substring(queryStringIndex + 1);
        const queryParts = queryString.split('&');
        for (let i = 0; i < queryParts.length; i++) {
            const [paramName, paramValue] = queryParts[i].split('=');
            if (paramName === name) {
                return unescape(paramValue);
            }
        }
    }
    return null;
}
/**
 * 获取签名 将链接地址的所有参数按字母排序后拼接加上token进行md5
 * url 链接地址
 * date 参数{参数名1 : 值1, 参数名2 : 值2} *
 * token 签名token 非必须
 */
function getSign(url, data, token) {
    const _ = require('underscore.js');
    const md5 = require('md5.js');
    let querystring = '';
    const sign = getUrlParam(url, 'sign');
    if (sign || (data && data.sign)) {
        return false;
    } else {
        if (url) {
            querystring = getQuery(url);
        }
        if (data) {
            let theRequest = [];
            for (let param in data) {
                if (param && data[param]) {
                    theRequest = theRequest.concat({
                        'name': param,
                        'value': data[param]
                    });
                }
            }
            querystring = querystring.concat(theRequest);
        }
        // 排序
        querystring = _.sortBy(querystring, 'name');
        // 去重
        querystring = _.uniq(querystring, true, 'name');
        var urlData = '';
        for (let i = 0; i < querystring.length; i++) {
            if (querystring[i] && querystring[i].name && querystring[i].value) {
                urlData += querystring[i].name + '=' + querystring[i].value;
                if (i < (querystring.length - 1)) {
                    urlData += '&';
                }
            }
        } token = token || app.siteInfo.token;
        const sign = md5(urlData + token);
        return sign;
    }
}

util.getSign = function (url, data, token) {
    return getSign(url, data, token);
};

function getCacheKey(url) {
    return md5(url);
}

function getCacheData(url, cachetime) {
    const cachekey = getCacheKey(url);
    const cachedata = wx.getStorageSync(cachekey);
    const timestamp = Date.parse(new Date());
    if (cachedata && cachedata.data) {
        if (cachedata.expire > timestamp) {
            return cachedata;
        } else {
            wx.removeStorageSync(cachekey);
        }
    }
    return null;
}

function setCacheData(url, data, cachetime) {
    const cachekey = getCacheKey(url);
    const timestamp = Date.parse(new Date());
    const cachedata = {
        'data': data,
        'expire': timestamp + cachetime * 1000
    };
    wx.setStorageSync(cachekey, cachedata);
}
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
util.request = (option) => {
    const _ = require('underscore.js');
    const md5 = require('md5.js');
    option = option || {};
    option.cachetime = option.cachetime || 0;
    option.showLoading = typeof option.showLoading !== 'undefined' ? option.showLoading : true;

    const sessionid = wx.getStorageSync('userInfo').sessionid;
    let url = option.url;
    if (url.indexOf('http://') === -1 && url.indexOf('https://') === -1) {
        url = util.url(url);
    }
    const state = getUrlParam(url, 'state');
    if (!state && !(option.data && option.data.state) && sessionid) {
        url = url + '&state=we7sid-' + sessionid;
    }
    if (!option.data || !option.data.m) {
        const nowPage = getCurrentPages();
        if (nowPage.length) {
            const currentPage = nowPage[nowPage.length - 1];
            if (currentPage && currentPage.__route__) {
                url = url + '&m=' + currentPage.__route__.split('/')[0];
            }
        }
    }

    const sign = getSign(url, option.data);
    if (sign) {
        url = url + "&sign=" + sign;
    }
    if (!url) {
        return Promise.reject(new Error('请求地址不能为空'));
    }

    if (option.showLoading) {
        wx.showLoading({
            title: '加载中',
            mask: true
        });
    }
    const cacheData = getCacheData(url, option.cachetime);
    if (cacheData) {
        if (option.complete && typeof option.complete === 'function') {
            option.complete(cacheData);
        }
        if (option.success && typeof option.success === 'function') {
            option.success(cacheData);
        }
        if (option.showLoading) {
            wx.hideLoading();
        }
        return Promise.resolve(cacheData);
    }
    return new Promise((resolve, reject) => {
        wx.request({
            url: url,
            data: option.data || {},
            header: option.header || {},
            method: option.method || 'GET',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            success: function (response) {
                if (response.data.errno) {
                    if (response.data.errno === '41009') {
                        wx.setStorageSync('userInfo', '');
                        util.getUserInfo(function () {
                            request(option).then(resolve).catch(reject);
                        });
                        return;
                    } else {
                        if (option.fail && typeof option.fail === 'function') {
                            option.fail(response);
                        } else {
                            if (response.data.message) {
                                if (response.data.data !== null && response.data.data.redirect) {
                                    const redirect = response.data.data.redirect;
                                } else {
                                    const redirect = '';
                                }
                                app.util.message(response.data.message, redirect, 'error');
                            }
                        }
                        reject(new Error(response.data.message || '请求失败'));
                        return;
                    }
                } else {
                    if (option.success && typeof option.success === 'function') {
                        option.success(response);
                    }
                    if (option.cachetime) {
                        setCacheData(url, response.data, option.cachetime);
                    }
                    resolve(response.data);
                }
            },
            fail: function (response) {
                const cacheData = getCacheData(url, option.cachetime);
                if (cacheData) {
                    if (option.success && typeof option.success === 'function') {
                        option.success(cacheData);
                    }
                    reject(new Error('请求失败，已读取缓存数据'));
                } else {
                    if (option.fail && typeof option.fail === 'function') {
                        option.fail(response);
                    }
                    reject(new Error('请求失败'));
                }
            },
            complete: function (response) {
                if (option.complete && typeof option.complete === 'function') {
                    option.complete(response);
                }
                if (option.showLoading) {
                    wx.hideLoading();
                }
            }
        });
    });
}
/*
 * 获取用户信息
 */
util.getUserInfo = () => {
    const login = () => {
        console.log('start login');
        const userInfo = {
            sessionid: '',
            wxInfo: '',
            memberInfo: '',
        };
        return new Promise((resolve, reject) => {
            wx.login({
                success: (res) => {
                    util.request({
                        url: 'auth/session/openid',
                        data: {
                            code: res.code
                        },
                        cacheTime: 0,
                    }).then((session) => {
                        if (!session.data.errno) {
                            userInfo.sessionid = session.data.data.sessionid;
                            wx.setStorageSync('userInfo', userInfo);
                            return wx.getUserInfo();
                        }
                    }).then((wxInfo) => {
                        userInfo.wxInfo = wxInfo.userInfo;
                        wx.setStorageSync('userInfo', userInfo);
                        return util.request({
                            url: 'auth/session/userinfo',
                            data: {
                                signature: wxInfo.signature,
                                rawData: wxInfo.rawData,
                                iv: wxInfo.iv,
                                encryptedData: wxInfo.encryptedData
                            },
                            methodType: 'POST',
                            header: {
                                'content-type': 'application/x-www-form-urlencoded'
                            },
                            cacheTime: 0,
                        });
                    }).then((res) => {
                        if (!res.data.errno) {
                            userInfo.memberInfo = res.data.data;
                            wx.setStorageSync('userInfo', userInfo);
                        }
                        resolve(userInfo);
                    }).catch((err) => {
                        reject(err);
                    });
                },
                fail: () => {
                    wx.showModal({
                        title: '获取信息失败',
                        content: '请允许授权以便为您提供给服务',
                    }).then((res) => {
                        if (res.confirm) {
                            resolve(util.getUserInfo());
                        } else {
                            reject('用户拒绝授权');
                        }
                    });
                }
            });
        });
    };

    const app = wx.getStorageSync('userInfo');
    if (app.sessionid) {
        return new Promise((resolve, reject) => {
            wx.checkSession({
                success: () => {
                    resolve(app);
                },
                fail: () => {
                    app.sessionid = '';
                    console.log('relogin');
                    wx.removeStorageSync('userInfo');
                    login().then((userInfo) => {
                        resolve(userInfo);
                    }).catch((err) => {
                        reject(err);
                    });
                }
            });
        });
    } else {
        return login();
    }
};

util.navigateBack = (obj) => {
    const delta = obj.delta || 1;
    if (obj.data) {
        const pages = getCurrentPages();
        const curPage = pages[pages.length - (delta + 1)];
        if (curPage.pageForResult) {
            curPage.pageForResult(obj.data);
        } else {
            curPage.setData(obj.data);
        }
    }
    wx.navigateBack({
        delta: delta,
        success: (res) => {
            obj.success && obj.success(res);
        },
        fail: (err) => {
            obj.fail && obj.fail(err);
        },
        complete: () => {
            obj.complete && obj.complete();
        }
    });
};

util.footer = ($this) => {
    const that = $this;
    const tabBar = app.tabBar;
    for (const i in tabBar['list']) {
        tabBar['list'][i]['pageUrl'] = tabBar['list'][i]['pagePath'].split('?')[0].split('#')[0];
    }
    that.setData({
        tabBar: tabBar,
        'tabBar.thisurl': that.__route__
    });
};
/*
 * 提示信息
 * type 为 success, error 当为 success,  时，为toast方式，否则为模态框的方式
 * redirect 为提示后的跳转地址, 跳转的时候可以加上 协议名称  
 * navigate:/we7/pages/detail/detail 以 navigateTo 的方法跳转，
 * redirect:/we7/pages/detail/detail 以 redirectTo 的方式跳转，默认为 redirect
 */
util.message = (title, redirect, type, confirmText = "确定") => {
    if (!title) {
        return false;
    }
    if (typeof title === 'object') {
        redirect = title.redirect;
        type = title.type;
        title = title.title;
    }
    if (redirect) {
        const redirectType = redirect.substring(0, 9);
        let url = '';
        let redirectFunction = '';
        if (redirectType === 'navigate:') {
            redirectFunction = 'navigateTo';
            url = redirect.substring(9);
        } else if (redirectType === 'redirect:') {
            redirectFunction = 'redirectTo';
            url = redirect.substring(9);
        } else if (redirectType === 'switchTo:') {
            redirectFunction = 'switchTab';
            url = redirect.substring(9);
        } else {
            url = redirect;
            redirectFunction = 'redirectTo';
        }
    }
    type = type || 'success';
    if (type === 'success') {
        wx.showToast({
            title: title,
            icon: 'success',
            duration: 2000,
            mask: url ? true : false,
            complete: function () {
                if (url) {
                    setTimeout(function () {
                        wx[redirectFunction]({
                            url: url,
                        });
                    }, 1800);
                }
            }
        });
    } else if (type === 'error') {
        wx.showModal({
            title: '提示',
            content: title,
            showCancel: false,
            confirmColor: '#ff5041',
            confirmText,
            complete: function () {
                if (url) {
                    wx[redirectFunction]({
                        url: url,
                    });
                }
            }
        });
    }
};

util.navTo = (redirect) => {
    if (redirect && typeof redirect === 'string') {
        let redirectType = redirect.substring(0, 9);
        let url = '';
        let redirectFunction = '';
        if (redirectType === 'navigate:') {
            redirectFunction = 'navigateTo';
            url = redirect.substring(9);
        } else if (redirectType === 'redirect:') {
            redirectFunction = 'redirectTo';
            url = redirect.substring(9);
        } else if (redirectType === 'switchTo:') {
            redirectFunction = 'switchTab';
            url = redirect.substring(9);
        } else {
            url = redirect;
            redirectFunction = 'redirectTo';
        }
        if (url) {
            wx[redirectFunction]({ url });
        }
    }
};

util.user = util.getUserInfo;

util.showLoading = () => {
    let isShowLoading = wx.getStorageSync('isShowLoading');
    if (isShowLoading) {
        wx.hideLoading();
        wx.setStorageSync('isShowLoading', false);
    }

    wx.showLoading({
        title: '加载中',
        complete: () => {
            wx.setStorageSync('isShowLoading', true);
        },
        fail: () => {
            wx.setStorageSync('isShowLoading', false);
        }
    });
};

util.showImage = (event) => {
    let url = event ? event.currentTarget.dataset.preview : '';
    if (url) {
        wx.previewImage({
            urls: [url]
        });
    }
};
/**
 * 转换内容中的emoji表情为 unicode 码点，在Php中使用utf8_bytes来转换输出
 */
util.parseContent = (string) => {
    if (!string) {
        return string;
    }

    const ranges = [
        '\ud83c[\udf00-\udfff]', // U+1F300 to U+1F3FF
        '\ud83d[\udc00-\ude4f]', // U+1F400 to U+1F64F
        '\ud83d[\ude80-\udeff]' // U+1F680 to U+1F6FF
    ];
    const emoji = string.match(new RegExp(ranges.join('|'), 'g'));

    if (emoji) {
        for (const i in emoji) {
            string = string.replace(emoji[i], `[U+${emoji[i].codePointAt(0).toString(16).toUpperCase()}]`);
        }
    }
    return string;
};

util.date = {
    /**
     * 判断闰年
     * @param date Date日期对象
     * @return boolean true 或false
     */
    isLeapYear(date) {
        return (0 == date.getYear() % 4 && ((date.getYear() % 100 != 0) || (date.getYear() % 400 == 0)));
    },

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
    dateToStr(formatStr = "yyyy-MM-dd HH:mm:ss", date = new Date()) {
        const Week = ['日', '一', '二', '三', '四', '五', '六'];
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hour = date.getHours();
        const minute = date.getMinutes();
        const second = date.getSeconds();

        const str = formatStr.replace(/yyyy|YYYY/, year)
            .replace(/yy|YY/, (year % 100) > 9 ? (year % 100).toString() : `0${year % 100}`)
            .replace(/MM/, month > 9 ? month.toString() : `0${month}`)
            .replace(/M/g, month)
            .replace(/w|W/g, Week[date.getDay()])
            .replace(/dd|DD/, day > 9 ? day.toString() : `0${day}`)
            .replace(/d|D/g, day)
            .replace(/hh|HH/, hour > 9 ? hour.toString() : `0${hour}`)
            .replace(/h|H/g, hour)
            .replace(/mm/, minute > 9 ? minute.toString() : `0${minute}`)
            .replace(/m/g, minute)
            .replace(/ss|SS/, second > 9 ? second.toString() : `0${second}`)
            .replace(/s|S/g, second);

        return str;
    },

    /**
     * 日期计算  
     * @param strInterval string  可选值 y 年 m月 d日 w星期 ww周 h时 n分 s秒  
     * @param num int
     * @param date Date 日期对象
     * @return Date 返回日期对象
     */
    dateAdd(strInterval, num, date = new Date()) {
        const timeMap = {
            's': 1000,
            'n': 60000,
            'h': 3600000,
            'd': 86400000,
            'w': 604800000
        };

        const time = timeMap[strInterval] * num;
        const newDate = new Date(date.getTime() + time);

        if (strInterval === 'm') {
            return new Date(newDate.getFullYear(), newDate.getMonth() + 1, newDate.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());
        } else if (strInterval === 'y') {
            return new Date(date.getFullYear() + num, date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());
        } else {
            return newDate;
        }
    },

    /**
     * 比较日期差 dtEnd 格式为日期型或者有效日期格式字符串
     * @param strInterval string  可选值 y 年 m月 d日 w星期 ww周 h时 n分 s秒  
     * @param dtStart Date  可选值 y 年 m月 d日 w星期 ww周 h时 n分 s秒
     * @param dtEnd Date  可选值 y 年 m月 d日 w星期 ww周 h时 n分 s秒 
     */
    dateDiff(strInterval, dtStart, dtEnd) {
        const timeMap = {
            's': 1000,
            'n': 60000,
            'h': 3600000,
            'd': 86400000,
            'w': 604800000
        };

        const time = dtEnd.getTime() - dtStart.getTime();

        if (strInterval === 'm') {
            const months = (dtEnd.getMonth() + 1) + ((dtEnd.getFullYear() - dtStart.getFullYear()) * 12) - (dtStart.getMonth() + 1);
            return months;
        } else if (strInterval === 'y') {
            const years = dtEnd.getFullYear() - dtStart.getFullYear();
            return years;
        } else {
            const diff = parseInt(time / timeMap[strInterval]);
            return diff;
        }
    },

    /**
     * 字符串转换为日期对象 // eval 不可用
     * @param date Date 格式为yyyy-MM-dd HH:mm:ss，必须按年月日时分秒的顺序，中间分隔符不限制
     */
    strToDate(dateStr) {
        const reCat = /(\d{1,4})/gm;
        const t = dateStr.match(reCat);
        t[1] = t[1] - 1;
        const d = new Date(...t);
        return d;
    },

    /**
     * 把指定格式的字符串转换为日期对象yyyy-MM-dd HH:mm:ss
     * 
     */
    strFormatToDate(formatStr, dateStr) {
        const yearIndex = formatStr.indexOf('yyyy');
        const year = yearIndex > -1 ? dateStr.substr(yearIndex, 4) : 0;

        const monthIndex = formatStr.indexOf('MM');
        const month = monthIndex > -1 ? parseInt(dateStr.substr(monthIndex, 2)) - 1 : 0;

        const dayIndex = formatStr.indexOf('dd');
        const day = dayIndex > -1 ? parseInt(dateStr.substr(dayIndex, 2)) : 0;

        const hourIndex = formatStr.indexOf('HH') > -1 ? formatStr.indexOf('HH') : formatStr.indexOf('hh');
        const hour = hourIndex > -1 ? parseInt(dateStr.substr(hourIndex, 2)) : 0;

        const minuteIndex = formatStr.indexOf('mm');
        const minute = minuteIndex > -1 ? parseInt(dateStr.substr(minuteIndex, 2)) : 0;

        const secondIndex = formatStr.indexOf('ss');
        const second = secondIndex > -1 ? parseInt(dateStr.substr(secondIndex, 2)) : 0;

        return new Date(year, month, day, hour, minute, second);
    },


    /**
     * 日期对象转换为毫秒数
     */
    dateToLong(date) {
        return date.getTime();
    },

    /**
     * 毫秒转换为日期对象
     * @param dateVal number 日期的毫秒数 
     */
    longToDate(dateVal) {
        return new Date(dateVal);
    },

    /**
     * 判断字符串是否为日期格式
     * @param str string 字符串
     * @param formatStr string 日期格式， 如下 yyyy-MM-dd
     */
    isDate(str, formatStr = 'yyyyMMdd') {
        const yearIndex = formatStr.indexOf('yyyy');
        const year = yearIndex > -1 ? str.substring(yearIndex, yearIndex + 4) : '';

        const monthIndex = formatStr.indexOf('MM');
        const month = monthIndex > -1 ? str.substring(monthIndex, monthIndex + 2) : '';

        const dayIndex = formatStr.indexOf('dd');
        const day = dayIndex > -1 ? str.substring(dayIndex, dayIndex + 2) : '';

        if (!/^\d{4}$/.test(year) || year > '2100' || year < '1900') {
            return false;
        }

        if (!/^\d{2}$/.test(month) || month > '12' || month < '01') {
            return false;
        }

        if (day > getMaxDay(year, month) || day < '01') {
            return false;
        }

        return true;
    },

    getMaxDay(year, month) {
        const leapYear = year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
        const days = ['31', leapYear ? '29' : '28', '31', '30', '31', '30', '31', '31', '30', '31', '30', '31'];
        return days[month - 1];
    },

    /**
     *	变量是否为数字
     */
    isNumber(str) {
        const regExp = /^\d+$/g;
        return regExp.test(str);
    },

    /**
     * 把日期分割成数组 [年、月、日、时、分、秒]
     */
    toArray(myDate = new Date()) {
        return [
            myDate.getFullYear(),
            myDate.getMonth(),
            myDate.getDate(),
            myDate.getHours(),
            myDate.getMinutes(),
            myDate.getSeconds()
        ];
    },

    /**
     * 取得日期数据信息  
     * 参数 interval 表示数据类型  
     * y 年 M月 d日 w星期 ww周 h时 n分 s秒  
     */
    datePart(interval, myDate = new Date()) {
        const week = ['日', '一', '二', '三', '四', '五', '六'];
        switch (interval) {
            case 'y':
                return myDate.getFullYear();
            case 'M':
                return myDate.getMonth() + 1;
            case 'd':
                return myDate.getDate();
            case 'w':
                return week[myDate.getDay()];
            case 'ww':
                return myDate.WeekNumOfYear();
            case 'h':
                return myDate.getHours();
            case 'm':
                return myDate.getMinutes();
            case 's':
                return myDate.getSeconds();
            default:
                return '';
        }
    },

    /**
     * 取得当前日期所在月的最大天数  
     */
    maxDayOfDate(date = new Date()) {
        const newDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        return newDate.getDate();
    }
};

util.getLightColor = (color, level) => {
    color = color && color.toUpperCase();
    const r = /^\#?[0-9A-F]{6}$/i;
    if (!r.test(color)) {
        return color;
    }
    color = color.replace("#", "");
    const hxs = color.match(/../g);
    for (let i = 0; i < 3; i++) {
        const col = parseInt(hxs[i], 16);
        hxs[i] = Math.floor((255 - col) * level + col);
    }
    return `rgb(${hxs[0]}, ${hxs[1]}, ${hxs[2]})`;
};

util.ProReq = (controller, params) => {
    return new Promise((resolve, reject) => {
        wx.showLoading({
            title: '加载中'
        });
        wx.request({
            url: 'entry/wxapp/index',
            method: 'POST',
            data: {
                controller,
                ...params
            },
            header: {
                'content-type': 'application/json'
            },
            success: function (res) {
                wx.hideLoading();
                if (res.data.code === 0) {
                    resolve(res.data);
                } else {
                    reject(res.data);
                }
            },
            fail: err => {
                wx.hideLoading();
                reject(err);
            }
        });
    });
};

module.exports = util;