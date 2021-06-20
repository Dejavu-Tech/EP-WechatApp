var app = getApp();

Component({
  properties: {
    value: {
      type: Object,
      value: {}
    },
    idx: {
      type: Number,
      value: 0
    }
  },

  data: {
    // list: [],
    _lock: false
  },

  attached: function() {
    this.setData({_lock: true },()=>{
      this.getGoodsList();
    })
  },

  pageLifetimes: {
    show: function () {
      this.data._lock || this.getGoodsList();
    }
  },

  methods: {
    getGoodsList() {
      var token = wx.getStorageSync('token');
      var that = this;
      var cur_community = wx.getStorageSync('community');
      let value = this.data.value;
      let sources = value.sources;
      let params = {};
      if(sources=='category') {
        params.gid = value.categoryId;
        params.is_random = 0;
      } else {
        params.is_random = 1;
      }
      app.util.request({
        url: 'entry/wxapp/index',
        data: {
          controller: 'index.load_gps_goodslist',
          token,
          pageNum: 1,
          head_id: cur_community.communityId || '',
          per_page: value.goodsCount,
          ...params
        },
        dataType: 'json',
        success: function (res) {
          that.setData({ _lock: false })
          that.triggerEvent('diyGoodsList', { id: that.data.idx, data: res.data });
        }
      })
    }
  }
})
