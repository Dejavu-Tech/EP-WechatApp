var app = getApp();

Component({
  properties: {
    item: {
      type: Object
    }
  },
  methods: {
    agree: function() {
      let that = this;
      let item = this.data.item;
      let token = wx.getStorageSync('token');

      app.util.request({
        'url': 'entry/wxapp/index',
        'data': {
          controller: 'recipe.fav_recipe_do',
          token: token,
          id: item.id
        },
        dataType: 'json',
        success: function (res) {
          if(res.data.code == 0) {
            //成功
            wx.showToast({
              title: '已喜欢~',
              icon: 'none'
            })
            item.fav_count = res.data.fav_count;
            item.has_fav = 1;
            that.setData({ item })
          } else if (res.data.code == 1) {
            //未登录
            that.triggerEvent('needAuth');
          } else if (res.data.code == 2) {
            //取消收藏
            item.fav_count = res.data.fav_count;
            item.has_fav = 0;
            that.setData({ item })
            wx.showToast({
              title: '取消喜欢~',
              icon: 'none'
            })
          }
        }
      })
    },
    goDetails: function(e){
      let id = e.currentTarget.dataset.id || '';
      let url = `/eaterplanet_ecommerce/moduleA/menu/details?id=${id}`
      var pages_all = getCurrentPages();
      if (pages_all.length > 3) {
        id && wx.redirectTo({ url })
      } else {
        id && wx.navigateTo({ url })
      }
    }
  }
})
