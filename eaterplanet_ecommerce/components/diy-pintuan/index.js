var app = getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    refresh: {
      type: Boolean,
      value: false,
      observer: function (t) {
        if (t) this.setData({ list: [] }), this.getPinList();
      }
    },
    diyInfo: {
      type: Object,
      observer: function (t) {
        if (t) {
          let list = t.list || [];
          list.forEach((item, index)=>{
            if(item.imageUrl.indexOf('http')==-1) {
              list[index].imageUrl = t.host + item.imageUrl;
            }
          })
          this.setData({ style: t.style*1-1, styleList: list });
        }
      }
    },
    skin: {
      type: Object
    }
  },

  data: {
    style: 0,
    list: [],
    styleList: [],
    placeholdeImg: app.globalData.placeholdeImg
  },

  attached() {
    this.getPinList();
  },

  /**
   * 组件的方法列表
   */
  methods: {
    getPinList: function () {
      let that = this;
      var community = wx.getStorageSync('community');
      let head_id = community.communityId || '';
      var token = wx.getStorageSync('token');
      app.util.request({
        url: 'entry/wxapp/index',
        data: {
          controller: 'group.get_pintuan_list',
          is_index: 1,
          head_id,
          token
        },
        dataType: 'json',
        success: function (res) {
          if (res.data.code == 0) {
            let pinList = {};
            let { list, pintuan_index_coming_img, pintuan_index_show } = res.data;
            pinList.list = list || [];
            pinList.img = pintuan_index_coming_img || '';
            pinList.show = pintuan_index_show || 0;
            that.setData({ pinList })
            console.log('pinList', pinList)
          }
        }
      })
    },
    goLink: function(event) {
      let url = event.currentTarget.dataset.link;
      url && wx.navigateTo({ url })
    }
  }
})
