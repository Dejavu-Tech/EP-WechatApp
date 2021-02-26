class SEvent {
  constructor(eventName, isGetEvent) {
    if (!isGetEvent) {
      throw 'SEventError：get SEvent instance from SEvent.getEvent！'
    }
    this.handlers = []
    SEvent.events[eventName] = this
  }

  static getEvent(eventName) {
    SEvent.events = SEvent.events || {};
    const keys = Object.keys(SEvent.events)
    for (const key of keys) {
      if (key === eventName) {
        return SEvent.events[key]
      }

    }
    return new SEvent(eventName, true)
  }

  static removeEvent(eventName) {
    const keys = Object.keys(SEvent.events)
    for (const key of keys) {
      if (key === eventName) {
        SEvent.events[key].handlers = null
        delete SEvent.events[key]
      }
    }
  }

  static off(listenerId){
    for(const key of Object.keys(SEvent.events)){
      for(let i=0; i<SEvent.events[key].handlers.length; i++){
        if (listenerId === SEvent.events[key].handlers[i].id){
          SEvent.events[key].handlers.splice(i, 1)
          break
        }
      }
    }
  }

  on(handler) {
    if (handler && typeof (handler) === 'function') {
      this.handlers.push({
        id: SEvent.listenerId,
        handler
      })
      return SEvent.listenerId++
    }
    return 0
  }

  once(handler){
    const originHandler = handler
    handler = (args) => {
      originHandler(args)
      this.off(handler)
    }
    this.on(handler)
  }

  emit(args) {
    if (!(this.handlers && this.handlers.length)) return
    let l = this.handlers.length
    let i = 0
    while(i < this.handlers.length){
      this.handlers[i++].handler(...arguments)
      // 防止删除某些once事件的handler导致length改变
      if (this.handlers.length == l - 1) {
        i--
        l--
      }
    }
  }

  off(handler) {
    if (!(this.handlers && this.handlers.length)) return
    for (let i = 0; i < this.handlers.length; i++) {
      if (this.handlers[i].handler === handler) {
        this.handlers.splice(i, 1)
        break
      }
    }
  }
}
SEvent.listenerId = 1

module.exports = SEvent


