// eaterplanet_ecommerce/components/ad-alert/index.js
Component({
  /**
   * 组件的属性列表
   * pop_page 投放页面类型：0、商城首页，1、商品分类，2、商城购物车，3、商城个人中心
   */
  properties: {
    pop_page: {
      type: Number,
      value: ''
    }
  },

  data: {
    imgheights: [],//所有图片的高度
    current:0,
    visible: false,
    adv_list: []
  },

  attached: function() {
    // this.getData();
  },

  pageLifetimes: {
    show: function () {
      this.getData();
    }
  },

  methods: {
    getData: function(){
      let token = wx.getStorageSync('token');
      let pop_page = this.data.pop_page;
      getApp().util.ProReq('popadv.popadv_list', {token, pop_page}).catch(res=>{
        console.log(res.popadvs)
        if(res.popadvs) {
          let adv_list = res.popadvs.adv_list || [];
          this.setData({
            adv_list,
            visible: adv_list.length>0
          })
        }
      })
    },
    imageLoad(e){
      //当图片载入完毕时
      var imgwidth = e.detail.width,
        imgheight = e.detail.height,
        //宽高比
        ratio = imgwidth / imgheight;
        console.log(imgwidth, imgheight)
      // 计算的高度值
      var viewHeight = 600 / ratio;
      var imgheight = viewHeight;
      var imgheights = this.data.imgheights;
      //把每一张图片的对应的高度记录到数组里
      imgheights[e.target.dataset.id] = imgheight;
      console.log('图片的高度：'+imgheights)
      this.setData({
        imgheights: imgheights
      })
    },
    bindchange: function (e) {
      // current 改变时会触发 change 事件
      this.setData({ current: e.detail.current })
    },
    close: function() {
      this.setData({ visible: false })
    },
    popclick: function(e){
      let idx = e.currentTarget.dataset.idx;
      if(idx!=='') {
        let adv_list = this.data.adv_list;
        let linktype = adv_list[idx].linktype;
        let url = adv_list[idx].link;
        let ad_id = adv_list[idx].ad_id;
        if (linktype == 0) {
          // 跳转webview
          wx.navigateTo({
            url: '/eaterplanet_ecommerce/pages/web-view?url=' + encodeURIComponent(url),
          })
        } else if (linktype == 1) {
          let tabUrls = ['/eaterplanet_ecommerce/pages/index/index', '/eaterplanet_ecommerce/pages/order/shopCart', '/eaterplanet_ecommerce/pages/user/me', '/eaterplanet_ecommerce/pages/type/index'];
          if (tabUrls.indexOf(url) != -1) {
            url && wx.switchTab({ url: url })
          } else {
            url && wx.navigateTo({ url: url })
          }
        } else if (linktype == 2) {
          // 跳转小程序
          let appId = adv_list[idx].appid;
          appId && wx.navigateToMiniProgram({
            appId,
            path: url,
            extraData: {},
            envVersion: 'release',
            success(res) {
              console.log(`弹窗广告：打开外链 appId:${appId} url:${url} 成功`)
            },
            fail(error) {
              console.log(`弹窗广告：打开外链 appId:${appId} url:${url} 失败`)
              console.log('失败原因：' + error.errMsg)
              if(error.errMsg == 'navigateToMiniProgram:fail invalid appid') {
                wx.showToast({
                  icon: 'none',
                  title: 'appid验证失败，请检查！',
                })
              }
            }
          })
        }
        //添加点击量
        this.addview(ad_id);
      }
    },
    addview: function(id){
      getApp().util.ProReq('popadv.popadv_click', {id})
    }
  }
})
