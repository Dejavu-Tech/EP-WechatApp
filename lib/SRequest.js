class Interceptor {
  handlerId = 1

  constructor() {
    this.id = Interceptor.id++
    this.handlers = []
  }

  use(success, fail) {
    this.handlers.push({
      id: this.handlerId,
      success,
      fail
    })
    return this.handlerId++
  }

  eject(handlerId) {
    for (let i = 0; i < this.handlers.length; i++) {
      if (this.handlers[i].id === handlerId) {
        return this.handlers.splice(i, 1)
      }
    }
  }

  go(config, isSuccess) {
    if(!isSuccess){
      return this.handlers[0].fail(config)
    }else{
      for (const v of this.handlers) {
        config = v.success(config)
      }
      return config
    }
  }
}
Interceptor.id = 1

function isHttpSuccess(status){
  return status >= 200 && status < 300 || status === 304
}

class SRequest {
  config = {
    baseUrl:'',
    dataType: 'json',
    responseType: 'text',
    header: {},
  }

  constructor(config) {
    this.config = Object.assign(this.config, config)
    this.interceptors = {
      request: new Interceptor(),
      response: new Interceptor()
    }
  }

  request(config) {
    config = config ? Object.assign({}, this.config, config) : this.config
    config = this.interceptReq(config, true)

    let { url, method, data, header, dataType, responseType } = config
    if (!url.startsWith('https://')) {
      url = config.baseUrl + url
    }
    return new Promise((resolve, reject) => {
      wx.request({
        url,
        data,
        header: header || this.header,
        method,
        dataType,
        responseType,
        success: res => {
          if(isHttpSuccess(res.statusCode)){
            res = this.interceptRes(res, true)
            resolve(res.data)
          }else{
            res = this.interceptRes(res, false)
            reject(res)
          }
        },
        fail: res => {
          res = this.interceptRes(res, false)
          reject(res)
        },
      })
    })
  }
  // 遍历请求拦截器
  interceptReq(config, isSuccess) {
    return this.interceptors.request.go(config, isSuccess)
  }

  // 遍历响应拦截器
  interceptRes(response, isSuccess) {
    return this.interceptors.response.go(response, isSuccess)
  }

  get(url, config) {
    const options = { url, method: 'GET' }
    Object.assign(options, config || null)
    return this.request(options)
  }

  post(url, data, config) {
    const options = { url, method: 'POST' }
    Object.assign(options, data ? { data } : null, config || null)
    return this.request(options)
  }
  put(url, data, config) {
    const options = { url, method: 'PUT' }
    Object.assign(options, data ? { data } : null, config || null)
    return this.request(options)
  }
  delete(url, config) {
    const options = { url, method: 'DELETE' }
    Object.assign(options, config || null)
    return this.request(options)
  }
}

module.exports = SRequest