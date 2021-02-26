// 引入事件模块 https://github.com/GravityC/SPage
const SEvent = require('SEvent.js')
wx.$event = {
  on(eventName, handler) {
    return SEvent.getEvent(eventName).on(handler)
  },
  once(eventName, handler) {
    SEvent.getEvent(eventName).once(handler)
  },
  emit(eventName) {
    const args = Array.from(arguments).slice(1)
    SEvent.getEvent(eventName).emit(...args)
  },
  off(nameOrId, handler) {
    if(handler && typeof (handler) === 'function'){
      SEvent.getEvent(nameOrId).off(handler)
    }else{
      SEvent.off(nameOrId)
    }
  },
  remove(eventName) {
    SEvent.removeEvent(eventName)
  }
}

// 引入request模块
const SRequest = require('SRequest.js')
const $http = new SRequest()
wx.$http = $http
wx.$request = $http.request.bind($http)
wx.$get = $http.get.bind($http)
wx.$post = $http.post.bind($http)
wx.$put = $http.put.bind($http)
wx.$delete = $http.delete.bind($http)


/* ----------------------------------------------------------------------------- */
wx.$pages = {}
// 获取当前页面实例
wx.$getCurPage = function() {
  return getCurrentPages()[getCurrentPages().length - 1]
}

// 获取当前页面实例对应的页面名
wx.$getCurPageName = function() {
  return wx.$getCurPage().$name
}

// $place与$take,$take调用完即删除引用
let channel = {}
wx.$place = function(id, value) {
  channel[id] = value
}

wx.$take = function(id) {
  const v = channel[id]
  channel[id] = null
  return v
}

/**
 * 封装wx.navigateTo
 * @url {string} - 跳转路径
 * @query {object} - 携带参数
 */
wx.$route = function(url, query) {
  const page = getPage(url)
  query = query || {}
  query.from = wx.$getCurPageName() // Page || Component
  // 若page已加载可调用onNavigate方法
  if (page && page.onNavigate) {
    page.onNavigate(query)
  }
  url = url + '?' + parseQuery(query)
  wx.navigateTo({
    url
  })
}

// -----------------------------以下是工具函数----------------------

//装饰器
//@afterOrigin {Boolean} - true:装饰函数在原函数之后触发
const decorator = function(originFn, decorateFn, afterOrigin) {
  const origin = originFn
  originFn = function(args) {
    if (afterOrigin) {
      if (origin) origin.call(this, args)
      decorateFn.call(this, args)
    } else {
      decorateFn.call(this, args)
      if (origin) origin.call(this, args)
    }
  }
  return originFn
}

// 解析query对象成string
const parseQuery = function(query) {
  return Object.keys(query).map(k => `${k}=${query[k]}`).join('&')
}

// 从url中得到pageName
const getPageName = function(url) {
  url = url.includes('?') ? url.split('?')[0] : url
  const arr = url.split('/')
  return arr[arr.length - 1]
}

/**
 * @str - pageName或者url
 */
const getPage = function(str) {
  const name = str.includes('/') ? getPageName(str) : str
  return wx.$pages[name]
}

// 判断是否是空对象
const isEmpty = function(obj) {
  return !Object.keys(obj).length
}

/**
 * 扩展computed计算属性
 */
const extendComputed = function(option) {
  let page
  // 为$setData方法响应computed
  option.$setData = function(obj) {
    this.setData(obj)
    page = this // 绑定page实例
    const needUpdate = calcComputed() // 将需要改变的computed属性添加到接下来要setData的对象中
    if (!isEmpty(needUpdate)) {
      this.setData(needUpdate)
    }
  }

  const computed = option.computed || {}
  const computedKeys = Object.keys(computed)
  let computedCache = {}

  // 计算需更改的计算属性
  const calcComputed = function(isInit) {
    const needUpdate = {}
    const that = isInit ? option : page
    for (const key of computedKeys) {
      const value = computed[key].call(that)
      if (value !== computedCache[key]) needUpdate[key] = computedCache[key] = value
      if (isInit) option.data[key] = needUpdate[key] // 初始化操作
    }
    return needUpdate
  }

  // 页面unload时清空computedCache
  option.onUnload = decorator(option.onUnload, function() {
    computedCache = {}
  })

  calcComputed(true);
}

/**
 * 为所有Page和Component扩展方法
 */
const extendFunctions = function(option) {
  option.$route = wx.$route
  option.$place = wx.$place
  option.$take = wx.$take
  // 封装wx.request
  option.$request = wx.$request
  option.$get = wx.$get
  option.$post = wx.$post
  option.$put = wx.$put
  option.$delete = wx.$delete
  // 事件机制
  option.$on = function(eventName, handler){
    this.$listeners = this.$listeners || []
    this.$listeners.push(wx.$event.on(eventName, handler))
  }
  option.$once = wx.$event.once
  option.$emit = wx.$event.emit
  option.$off = wx.$event.off
  option.$remove = wx.$event.remove
}

/**
 * -------------扩展App-------------------
 */
let initPageObject
let initCompObject
const extendApp = function() {
  const originApp = App
  App = function(option) {
    if (option.$mixinP) {
      initPageObject = option.$mixinP
    }

    if (option.$mixinC) {
      initCompObject = option.$mixinC
    }

    originApp(option)
  }
}

/**
 * -------------扩展Page----------------
 */
const extendPage = function() {
  const originPage = Page
  Page = function(option) {
    // 混合app.$mixinP
    if (initPageObject) {
      const hooks = ['onLoad', 'onShow', 'onReady', 'onHide', 'onUnload', 'onPullDownRefresh', 'onReachBottom', 'onShareAppMessage', 'onPageScroll', 'onResize', 'onTabItemTap']
      for (const k in initPageObject) {
        if (hooks.includes(k)) {
          option[k] = decorator(option[k], initPageObject[k])
        } else if (k === 'data') {
          option.data = Object.assign({}, initPageObject.data, option.data)
        } else if (!option.hasOwnProperty(k)) {
          option[k] = initPageObject[k]
        }
      }
    }

    // 若定义了$name, 则添加到wx.$pages中
    if (option.$name) {
      wx.$pages[option.$name] = option
    } else {
      option.$name = 'unKnow' //此处强行给$name赋值，为了后续区分是Page还是Component
    }

    // 添加$status属性
    option.$status = {
      isFirstShow: true
    }
    // 是否已执行过onNavigate函数
    option.$$isNavigated = false

    // 扩展computed属性
    extendComputed(option)
    // 扩展方法
    extendFunctions(option)

    // 装饰onNavigate
    option.onNavigate = decorator(option.onNavigate, function(query) {
      option.$$isNavigated = true
    })

    // 装饰onLoad
    option.onLoad = decorator(option.onLoad, function(query) {
      // 若页面有onNavigate方法但还没运行，则运行onNavigate方法
      if (option.onNavigate && !option.$$isNavigated) {
        option.onNavigate(query)
      }
    })

    // 装饰onShow
    option.onShow = decorator(option.onShow, function() {
      this.$status.isFirstShow = false
    }, true)

    // 隐藏页面时隐藏标题栏加载动画（坑爹的微信官方bug）
    option.onHide = decorator(option.onHide, function() {
      wx.hideNavigationBarLoading()
    })

    // 装饰onUnload
    option.onUnload = decorator(option.onUnload, function(){
      // 卸载本页面的监听器
      if (this.$listeners && this.$listeners.length) {
        for (const id of this.$listeners) {
          wx.$event.off(id)
        }
      }
    })

    //原生Page构造
    originPage(option)
  }
}

/**
 * --------------------------------------------扩展Component
 */
const extendComponent = function() {
  const originComponent = Component
  Component = function(option) {
    option.methods = option.methods || {}
    // 混合app.$mixinC
    if (initCompObject) {
      const mixinObj = ['properties', 'data', 'observers', 'methods', 'options']
      for (const k in initCompObject) {
        if (k === 'lifetimes' || k === 'pageLifetimes') {
          if (!option[k]) {
            option[k] = initCompObject[k]
          } else {
            for (const h in initCompObject[k]) {
              option[k][h] = decorator(option[k][h], initCompObject[k][h])
            }
          }
        } else if (mixinObj.includes(k)) {
          option[k] = Object.assign({}, initCompObject[k], option[k])
        } else if (!option.hasOwnProperty(k)) {
          option[k] = initCompObject[k]
        }
      }
    }
    // 扩展computed属性
    extendComputed(option)
    // 扩展方法
    extendFunctions(option.methods)

    option.lifetimes = option.lifetimes || {}
    // 装饰detached
    option.lifetimes.detached = decorator(option.lifetimes.detached, function () {
      // 卸载本组件的监听器
      if (this.$listeners && this.$listeners.length) {
        for (const id of this.$listeners) {
          wx.$event.off(id)
        }
      }
    })

    // 获取当前页面实例
    option.methods.$getCurPage = wx.$getCurPage

    // 获取当前页面实例对应的页面名
    option.methods.$getCurPageName = wx.$getCurPageName

    // 重新定义$setData，便于扩展其他功能
    const originData = option.$setData
    option.methods.$setData = function(obj) {
      return originData.call(this, obj)
    }
    //原生Component构造
    originComponent(option)
  }
}

module.exports = (function() {
  extendApp()
  extendPage()
  extendComponent()
}())