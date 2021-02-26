var app = getApp();
var status = require('../../utils/index.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    type: 1, // 1：今日，2：昨日，3：上周，4：上月
    list: []
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
    let that = this;
    status.setGroupInfo().then((groupInfo) => {
      let owner_name = groupInfo && groupInfo.owner_name || '团长';
      wx.setNavigationBarTitle({
        title: `${owner_name}排行`,
      })
      that.setData({ groupInfo })
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getData();
  },

  getData: function () {
    let token = wx.getStorageSync('token');
    wx.showLoading();
    app.util.ProReq('community.community_ranking_list', { token, type: this.data.type }).then(res => {
      wx.hideLoading();
      if(res.is_show_community_ranking!=1) {
        return app.util.message('访问页面不存在或已关闭', 'redirect:/eaterplanet_ecommerce/moduleA/groupCenter/index', 'error');
      }
      this.setData({
        list: res.data
      })
    })
  },

  changeType: function(e) {
    let type = e.currentTarget.dataset.type || 1;
    this.setData({
      type
    }, ()=>{
      this.getData();
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  }
})
