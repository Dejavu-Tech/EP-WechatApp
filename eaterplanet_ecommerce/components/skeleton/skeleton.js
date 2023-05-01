// components/skeleton.js
import SystemInfo from 'getSystemInfo.js'
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },
  /**
   * 组件的初始数据
   */
  data: {
    height: 0, //卡片高度，用来做外部懒加载的占位
    showSlot: true, //控制是否显示当前的slot内容
    skeletonId: ''
  },

  created() {
    //设置一个走setData的数据池
    this.extData = {
      listItemContainer: null,
    }
  },

  detached() {
    try {
      this.extData.listItemContainer.disconnect()
    } catch (error) {

    }
    this.extData = null
  },

  ready() {
    this.setData({
      skeletonId: this.randomString(8) //设置唯一标识
    })

    wx.nextTick(() => {
      // 修改了监听是否显示内容的方法，改为前后showNum屏高度渲染
      // 监听进入屏幕的范围relativeToViewport({top: xxx, bottom: xxx})
      let info = SystemInfo.getInfo()
      let { windowHeight = 667 } = info.source.system
      let showNum = 3 //超过屏幕的数量，目前这个设置是上下2屏
      try {
        this.extData.listItemContainer = this.createIntersectionObserver()
        this.extData.listItemContainer.relativeToViewport({ top: showNum * windowHeight, bottom: showNum * windowHeight })
          .observe(`#list-item-${this.data.skeletonId}`, (res) => {
            let { intersectionRatio } = res
            if (intersectionRatio === 0) {
              this.setData({
                showSlot: false
              })
            } else {
              this.setData({
                showSlot: true,
                height: res.boundingClientRect.height
              })
            }
          })
      } catch (error) {
        console.log(error)
      }
    })
    
  },
  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 生成随机的字符串
     */
    randomString(len) {
      len = len || 32;
      var $chars = 'abcdefhijkmnprstwxyz2345678'; /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
      var maxPos = $chars.length;
      var pwd = '';
      for (var i = 0; i < len; i++) {
        pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
      }
      return pwd;
    }
  }
})
