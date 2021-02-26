let app = getApp();
Page({
  data: {
    need_data: []
  },
  goods_id: 0,
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
  onLoad: function (options) {
    let id = options.id || '';
    if(!id) {
      app.util.message('参数错误', '/eaterplanet_ecommerce/moduleB/supply/goodsManage', 'error');
      return;
    }
    this.goods_id = id;
  },

  onShow: function () {
    this.getData();
  },

  formSubmit: function(e) {
    console.log(e.detail.value)
    let res = e.detail.value || {};
    let resArr = [];
    Object.keys(res).forEach(k=>{
      if(res[k]) {
        let idsArr = k.split("_");
        let num = parseInt(res[k]);
        if(num!=='') {
          let ids = idsArr[1]+'_'+num;
          resArr.push(ids);
        }
      }
    })
    if(resArr.length==0) {
      return wx.showToast({
        title: '请输入修改数量',
        icon: 'none'
      })
    }

    let sku_list_str = resArr.join(',');
    let token = wx.getStorageSync('token');
    let params = {
      token,
      goods_id: this.goods_id,
      is_has_option: 1,
      sku_list_str
    };
    app.util.ProReq('supplymobile.modify_supply_goods_quantity', params).then(res=>{
      app.util.message(res.msg || '修改成功', 'redirect:/eaterplanet_ecommerce/moduleB/supply/goodsManage', 'error');
    }).catch(err=>{
      app.util.message(err.msg || '请求出错', '', 'error');
    })
  },

  getData: function() {
    let token = wx.getStorageSync('token');
    let params = {
      token,
      goods_id: this.goods_id
    };
    app.util.ProReq('supplymobile.get_supply_goods_sku', params).then(res=>{
      let { goods_stock_notice, need_data } = res;
      this.setData({ goods_stock_notice, need_data })
    }).catch(err=>{
      app.util.message(err.msg || '请求出错', 'switchTo:/eaterplanet_ecommerce/pages/user/me', 'error');
    })
  }
})
