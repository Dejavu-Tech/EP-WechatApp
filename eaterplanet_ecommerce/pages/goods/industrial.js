var app = getApp();

Page({
  data: {
    goods_industrial: []
  },

  onLoad: function (options) {
    let goods_id = options.id || '';
    wx.showLoading();
    this.getData(goods_id);
  },

  getData(goods_id){
    let that = this;
    app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'goods.get_instructions',
        goods_id
      },
      dataType: 'json',
      success: function (res) {
        wx.hideLoading();
        if (res.data.code == 0) {
          that.setData({
            goods_industrial: res.data.data.goods_industrial || []
          })
        }
      }
    })
  }
})