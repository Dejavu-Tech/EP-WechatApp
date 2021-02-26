Component({
  properties: {
    pos: {
      type: String,
      value: 0
    }
  },
  data: {
    info: '', 
    ishow: false
  },

  attached: function(){
    this.getData();
  },

  pageLifetimes: {
    show: function() {
      console.log('pageLifetimes')
      this.getData();
    }
  },
  
  methods: {
    getData: function() {
      let that = this;
      getApp().util.request({
        url: 'entry/wxapp/index',
        data: {
          controller: 'index.get_advimg'
        },
        dataType: 'json',
        success: function (res) {
          if(res.data.code==0) {
            let info = res.data.data;
            let pos = info.pos || [];
            let ishow = pos.includes(that.data.pos);
            that.setData({ info, ishow })
          } else {
            that.setData({ ishow: false })
          }
        }
      })
    },
    goNav: function(){
      let info = this.data.info;
      let type = info.linktype;
      let url = info.link;
      if (type == 0) {
        // 跳转webview
        wx.navigateTo({
          url: '/eaterplanet_ecommerce/pages/web-view?url=' + encodeURIComponent(url),
        })
      } else if (type == 1) {
        if (url.indexOf('eaterplanet_ecommerce/pages/index/index') != -1 || url.indexOf('eaterplanet_ecommerce/pages/order/shopCart') != -1 || url.indexOf('eaterplanet_ecommerce/pages/user/me') != -1 || url.indexOf('eaterplanet_ecommerce/pages/type/index') != -1) {
          url && wx.switchTab({ url })
        } else {
          url && wx.navigateTo({ url })
        }
      } else if (type == 2) {
        // 跳转小程序
        let appId = info.appid;
        appId && wx.navigateToMiniProgram({
          appId,
          path: url,
          extraData: {},
          envVersion: 'release',
          success(res) {
            // 打开成功
          },
          fail(error) {
            console.log(error)
          }
        })
      } else if (type == 3) {
        if(this.data.pos==0) {
          this.triggerEvent("switchType", url);
        } else {
          getApp().globalData.indexCateId = url;
          wx.switchTab({
            url: '/eaterplanet_ecommerce/pages/index/index'
          })
        }
      } else if (type == 4) {
        //独立分类
        getApp().globalData.typeCateId = url;
        wx.switchTab({
          url: '/eaterplanet_ecommerce/pages/type/index'
        })
      }else if (type==5){
        // 跳转小程序
        let appId = info.appid;
        appId && wx.navigateToMiniProgram({
          appId,
          path: url,
          extraData: {},
          envVersion: 'release',
          success(res) {
            // 打开成功
          },
          fail(error) {
            console.log(error)
          }
        })
      }
    }
  }
})
