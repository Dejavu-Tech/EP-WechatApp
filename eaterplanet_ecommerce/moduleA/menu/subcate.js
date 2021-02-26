const app = getApp();

Page({
  data: {
    subCate: []
  },
      handlerGobackClick(delta) {
    const pages = getCurrentPages();
    if (pages.length >= 2) {
      wx.navigateBack({
        delta: delta
      });
    } else {
      wx.switchTab({
        url: '/eaterplanet_ecommerce/pages/index/index'
      });
    }
  },
  handlerGohomeClick(url) {
    wx.switchTab({
      url: '/eaterplanet_ecommerce/pages/index/index'
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getCate();
  },

  /**
   * 获取子分类
   */
  getCate: function () {
    let that = this;
    app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'recipe.get_recipe_categorylist'
      },
      dataType: 'json',
      success: function (res) {
        if (res.data.code == 0) {
          let subCate = res.data.data || [];
          that.setData({ subCate })
        }
      }
    })
  },

  goList: function(e){
    let subId = e.currentTarget.dataset.id || '';
    let name = e.currentTarget.dataset.name || '';
    wx.navigateTo({
      url: `/eaterplanet_ecommerce/moduleA/menu/list?gid=${subId}&name=${name}`
    })
  }
})
