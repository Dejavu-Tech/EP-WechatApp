var app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    order_id: {
      type: String,
      value: 0
    },
    show: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    list: []
  },

  attached() {
    this.initFn()
  },

  /**
   * 组件的方法列表
   */
  methods: {
    initFn: function(keyword=''){
      this.page = 1;
      this.keyword = keyword;
      this.setData({
        list: [],
        loadText: "加载中...",
        noData: 0,
        loadMore: true,
      },()=>{
        this.getData();
      })
    },

    goResult: function(e) {
      let keyword = e.detail.value.replace(/\s+/g, '');
      this.initFn(keyword);
    },

    getData: function () {
      let that = this;
      let token = wx.getStorageSync('token');
      let order_id = this.data.order_id;
      let keyword = this.keyword;

      wx.showLoading();
      app.util.request({
        url: 'entry/wxapp/index',
        data: {
          controller: 'order.choosemember',
          token,
          is_supply: 1,
          order_id,
          page: this.page,
          keyword
        },
        dataType: 'json',
        success: function (res) {
          if (res.data.code == 0) {
            let h = {};
            let list = res.data.data;
            if (list.length < 10) h.noMore = true;
            let oldList = that.data.list;
            list = oldList.concat(list);
            that.page++;
            that.setData({ list, ...h })
          } else if(res.data.code==2) {
            app.util.message(res.data.msg, 'switchTo:/eaterplanet_ecommerce/pages/user/me', 'error');
          } else {
            let h = {};
            if(that.page==1) h.noData = 1;
            h.loadMore = false;
            h.noMore = false;
            h.loadText = "没有更多记录了~";
            that.setData( h )
          }
          wx.hideLoading();
        }
      })
    },

    toLower: function() {
      if (!this.data.loadMore) return false;
      this.getData();
    },

    selectItem: function(e) {
      let distribution_id = e.currentTarget.dataset.id || '';
      let order_id = this.data.order_id;
      let token = wx.getStorageSync('token');
      wx.showLoading();
      order_id && app.util.ProReq('order.sub_orderchoose_distribution', {token, order_id, distribution_id, is_supply: 1}).then(res=>{
        wx.showToast({ title: '设置成功' })
        setTimeout(()=>{
          this.triggerEvent('update');
        }, 1500)
      }).catch(err=>{
        this.triggerEvent('update');
        app.util.message(err.msg, '', 'error');
      })
    },

    close: function() {
      this.triggerEvent('close');
    }
  }
})
