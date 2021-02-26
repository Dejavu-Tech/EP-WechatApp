Component({
  properties: {
    visible: {
      type: Boolean,
      value: false,
      observer: function (t) {
        let that = this;
        if (t) setTimeout(()=>{
          that.setData({ visible: false })
        }, 10000);
      }
    },
    templateId: {
      type: Object,
      value: {}
    }
  },

  methods: {
    /**
     * 订阅
     */
    subscriptionNotice: function() {
      wx.vibrateShort();
      let that = this;
      let obj = this.data.templateId;
      let tmplIds =  Object.keys(obj).map(key => obj[key]); // 订阅消息模版id
      if (wx.requestSubscribeMessage) {
        tmplIds.length && wx.requestSubscribeMessage({
          tmplIds: tmplIds,
          success(res) {
            // let isAccept = 1;
            let acceptId = [];
            Object.keys(obj).forEach(item=>{
              if (res[obj[item]] == 'accept') {
                //用户同意了订阅，添加进数据库
                acceptId.push(item);
              } else {
                //用户拒绝了订阅或当前游戏被禁用订阅消息
                // isAccept = 0;
              }
            })

            if(acceptId.length) {
              that.addAccept(acceptId);
              that.setData({ visible: false });
            }
            // wx.showToast({
            //   title: '订阅失败',
            //   icon: 'none'
            // })
          },
          fail(res) {
            console.log(res)
            wx.showToast({
              title: '订阅失败',
              icon: 'none'
            })
          },
          complete(res) {
            console.log(res)
          }
        })
      } else {
        // 兼容处理
        wx.showModal({
          title: '提示',
          content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
        })
        that.setData({ visible: false })
      }
    },

    // 用户点击订阅添加到数据库
    addAccept: function (acceptId) {
      let token = wx.getStorageSync('token');
      let type = acceptId.join(',');
      getApp().util.request({
        url: 'entry/wxapp/user',
        data: {
          controller: 'user.collect_subscriptmsg',
          token,
          type
        },
        dataType: 'json',
        method: 'POST',
        success: function (res) {
          wx.showToast({
            title: '订阅成功'
          })
        }
      })
    }
  }
})
