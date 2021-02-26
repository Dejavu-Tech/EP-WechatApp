let app = getApp();
module.exports = {
  data: {
    // skin: app.globalData.skin,
    isIpx: app.globalData.isIpx,
    isblack: app.globalData.isblack,
    goods_sale_unit: '件',
    isparse_formdata: 0
  },

  onReady: function() {
    let that = this;
    app.getConfig().then(res=>{
      let common_header_backgroundimage = res.data.common_header_backgroundimage || '';
      app.globalData.common_header_backgroundimage = common_header_backgroundimage;
      let skin = {};
      let primaryColor = res.data.skin || '#4facfe';
      let goods_sale_unit = res.data.goods_sale_unit;
      skin.color = primaryColor;
      if(primaryColor) {
        skin.light = app.util.getLightColor(skin.color, 0.4);
        skin.lighter = app.util.getLightColor(skin.color, 0.8);
      }
      let h = {};
      let isparse_formdata = res.data.isparse_formdata;
      let token = wx.getStorageSync('token');
      if(token){
        console.log('mixinsisparse_formdata', isparse_formdata)
        h.isparse_formdata = isparse_formdata;
      } else {
        isparse_formdata = 0;
      }
      console.log(h)
      wx.setStorageSync('isparse_formdata', isparse_formdata);
      that.setData({ skin, goods_sale_unit, ...h })
      app.globalData.skin = skin;
      app.globalData.goods_sale_unit = goods_sale_unit;
    }).catch(()=>{
      that.setData({
        skin: {
          color: '#4facfe',
          subColor: '#00f2fe',
          lighter: '#fff9f4'
        }
      })
    })
  }
}