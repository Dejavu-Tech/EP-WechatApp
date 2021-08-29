var util = require('../../utils/util.js');
var app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    list: {
      type: Object,
      value: {},
      observer: function (t) {
        if(t.selectedTemplate=="imageNavigation") {
          let num = t.showType*2;
          let len = t.list.length;
          let number = Math.ceil(len/num);
          let isSwiper = false;
          if(number>1) {
            isSwiper = true;
          }
          let newlist = this.chunk(t.list, num);
          this.setData({ isSwiper, number, newlist })
        }
      }
    },
    skin: {
      type: Object
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    isSwiper: false,
    number: 0,
    newlist: [],
    current: 0,
    swiperHeight: 0
  },

  attached() {
    this.getCurH()
  },

  /**
   * 组件的方法列表
   */
  methods: {
    chunk: function(array, size) {
      var result = [];
      for (var x = 0; x < Math.ceil(array.length / size); x++) {
          var start = x * size;
          var end = start + size;
          result.push(array.slice(start, end));
      }
      return result;
    },
    getCurH() {
      let current = this.data.current;
      let that = this;
      const query = wx.createSelectorQuery().in(this);
      query.select('#nav_'+current).boundingClientRect(function (rect) {
        rect&&that.setData({ swiperHeight: rect.height })
      }).exec();
    },
    goDiysliderUrl: function(t) {
      let link = t.currentTarget.dataset.link;
      let needAuth = this.data.needAuth;

      if (Object.keys(link).length > 0) {
        let type = link.parents;
        if (util.checkRedirectTo(link.wap_url, needAuth)) {
          this.authModal();
          return;
        }
        switch(type) {
          case "WEBVIEW":
            let url = link.wap_url;
            url && wx.navigateTo({ url: '/eaterplanet_ecommerce/pages/web-view?url=' + encodeURIComponent(url) });
            break;
          case "MALL_LINK":
            url = link.wap_url;
            if (url.indexOf('eaterplanet_ecommerce/pages/index/index') != -1 || url.indexOf('eaterplanet_ecommerce/pages/order/shopCart') != -1 || url.indexOf('eaterplanet_ecommerce/pages/user/me') != -1 || url.indexOf('eaterplanet_ecommerce/pages/type/index') != -1) {
              url && wx.switchTab({ url })
            } else {
              url && wx.navigateTo({ url })
            }
            break;
          case "OTHER_APPLET":
            // 跳转小程序
            let appId = link.appid;
            let path = link.wap_url;
            appId && wx.navigateToMiniProgram({
              appId,
              path,
              extraData: {},
              envVersion: 'release',
              success(res) {},
              fail(error) {  wx.showModal({ title: "提示", content: error.errMsg, showCancel: false }) }
            })
            break;
          case "CUSTOM_LINK":
            url = link.wap_url;
            if (url.indexOf('eaterplanet_ecommerce/pages/index/index') != -1 || url.indexOf('eaterplanet_ecommerce/pages/order/shopCart') != -1 || url.indexOf('eaterplanet_ecommerce/pages/user/me') != -1 || url.indexOf('eaterplanet_ecommerce/pages/type/index') != -1) {
              url && wx.switchTab({ url })
            } else {
              url && wx.navigateTo({ url })
            }
            break;
          case "GOODS_CATEGORY":
            //独立分类
            let cateId = link.id;
            app.globalData.typeCateId = cateId;
            wx.switchTab({
              url: '/eaterplanet_ecommerce/pages/type/index'
            })
            break;
          default:
            url = link.wap_url;
            url && wx.navigateTo({ url })
            break;
        }
      }
    },
    onCurrent(e) {
      this.setData({
        current: e.detail.current
      }, ()=>{
        this.getCurH()
      })
    }
  }
})
