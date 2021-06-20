var app = getApp();

Page({
  data: {
    placeholdeImg: app.globalData.placeholdeImg,
    navList: [{
        name: "出售中",
        status: "1"
      }, {
        name: "库存预警",
        status: "8"
      }, {
        name: "已下架",
        status: "0"
      }, {
        name: "待审核",
        status: "4"
      }
    ],
    currentTab: 1,
    list: [],
    loadText: "加载中...",
    noData: 0,
    loadMore: true,
    showActionsheet: false,
    groups: [
      { text: '删除', type: 'warn', value: 1 },
      { text: '下架', value: 2 },
      { text: '修改库存', value: 5 }
      // { text: '编辑', value: 3 }
    ],
    buttons: [{text: '取消'}, {text: '确定'}],
    editSkuNum: 0
  },
  page: 1,
  keywords: '',
  goodsId: '', //当前操作的商品id
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
    let currentTab = options.status || 1;
    this.setData({
      currentTab
    }, ()=>{
      this.initFn();
    })
  },

  initFn: function(keywords=''){
    this.page = 1;
    this.keywords = keywords;
    this.setData({
      list: [],
      loadText: "加载中...",
      noData: 0,
      loadMore: true,
    },()=>{
      this.getData();
    })
  },

  /**
   * 切换导航
   */
  switchNav: function (e) {
    let that = this;
    let curIdx = e.target.dataset.current*1;
    if (this.data.currentTab === curIdx) return false;
    let groups = [
      { text: '删除', type: 'warn', value: 1 },
      { text: '下架', value: 2 },
      { text: '修改库存', value: 5 }
      // { text: '编辑', value: 3 }
    ]
    if(curIdx==0) {
      groups = [
        { text: '删除', type: 'warn', value: 1 },
        { text: '上架', value: 4 },
        { text: '修改库存', value: 5 }
        // { text: '编辑', value: 3 }
      ]
    } else if(curIdx==4){
      groups = [
        { text: '删除', type: 'warn', value: 1 },
        { text: '修改库存', value: 5 }
        // { text: '编辑', value: 3 }
      ]
    } else if(curIdx==8){
      groups = [
        { text: '删除', type: 'warn', value: 1 },
        { text: '下架', value: 2 },
        { text: '修改库存', value: 5 }
      ]
    }

    this.setData({
      currentTab: 1 * e.target.dataset.current,
      groups
    }, ()=>{
      that.initFn();
    });
  },

  goResult: function(e) {
    let keyword = e.detail.value.replace(/\s+/g, '');
    // if (!keyword) {
    //   wx.showToast({
    //     title: '请输入关键词',
    //     icon: 'none'
    //   })
    //   return;
    // }
    this.initFn(keyword);
  },

  getData: function () {
    let that = this;
    let token = wx.getStorageSync('token');
    let grounding = this.data.currentTab;
    let keywords = this.keywords;

    wx.showLoading();
    app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'supplymobile.get_supply_goodslist',
        token,
        grounding,
        page: this.page,
        keywords
      },
      dataType: 'json',
      success: function (res) {
        if (res.data.code == 0) {
          let h = {};
          let list = res.data.data;
          if (list.length == 0) {
            if(that.page==1) {
              h.noData = 1;
            } else {
              h.loadMore = false;
              h.noMore = false;
              h.loadText = "没有更多记录了~"
            }
          }
          if (list.length < 10) h.noMore = true;
          let oldList = that.data.list;
          list = oldList.concat(list);
          that.page++;
          that.setData({ list, ...h })
        } else {
          app.util.message(res.data.msg, 'switchTo:/eaterplanet_ecommerce/pages/user/me', 'error');
        }
        wx.hideLoading();
      }
    })
  },

  handleActionsheet: function (e) {
    let idx = (e && e.currentTarget.dataset.index) || 0;
    let id = (e && e.currentTarget.dataset.id) || 0;
    let list = this.data.list;
    let goodsItem = list[idx];
    let h = {};
    if(id) { h.goodsItem = goodsItem }
    this.setData({
      showActionsheet: !this.data.showActionsheet,
      ...h
    })
  },

  handleBtn(e) {
    let goodsItem = this.data.goodsItem;
    let goodsId = goodsItem.id;
    let hasoption = goodsItem.hasoption;
    let type = e.detail.value; // 1删除 2下架 3编辑 4上下架 5修改库存
    this.handleActionsheet();
    switch(type) {
      case 1:
        this.actionConfirm('是否删除该商品').then(()=>{
          this.delGoods(goodsId)
        });
        break;
      case 2:
        this.actionConfirm('是否下架该商品').then(()=>{
          this.undercarriage(goodsId)
        });
        break;
      case 3:
        console.log('3编辑')
        break;
      case 4:
        this.actionConfirm('是否上架该商品').then(()=>{
          this.upcarriage(goodsId)
        });
        break;
      case 5:
        // 修改库存
        if(hasoption==1) {
          wx.navigateTo({ url: `/eaterplanet_ecommerce/moduleB/supply/editSku?id=${goodsId}` })
        } else {
          // 显示弹窗
          this.setData({ editSkuVisible: true, editSkuNum: goodsItem.total || 0 })
        }
        break;
      default:
        console.log('默认操作')
    }
  },

  /**
   * 下架
   * @param {*} goods_id
   */
  undercarriage: function (goods_id) {
    let that = this;
    let token = wx.getStorageSync('token');
    wx.showLoading();
    app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'supplymobile.down_supply_goods',
        token,
        goods_id
      },
      dataType: 'json',
      success: function (res) {
        wx.hideLoading();
        if (res.data.code == 0) {
          let list = that.data.list || [];
          list = list.filter(item=>item.id!=goods_id);
          let h = {};
          if(list.length==0) h.noData = 1;
          h.list = list;
          that.setData(h);
          wx.showToast({
            title: '下架成功',
            icon: 'none'
          })
        } else {
          app.util.message(res.data.msg, '', 'error');
        }
      }
    })
  },

  /**
   * 上架
   * @param {*} goods_id
   */
  upcarriage: function (goods_id) {
    let that = this;
    let token = wx.getStorageSync('token');
    wx.showLoading();
    app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'supplymobile.up_supply_goods',
        token,
        goods_id
      },
      dataType: 'json',
      success: function (res) {
        wx.hideLoading();
        if (res.data.code == 0) {
          let list = that.data.list || [];
          list = list.filter(item=>item.id!=goods_id);
          let h = {};
          if(list.length==0) h.noData = 1;
          h.list = list;
          that.setData(h);
          wx.showToast({
            title: '上架成功',
            icon: 'none'
          })
        } else {
          that.initFn();
          app.util.message(res.data.msg, '', 'error');
        }
      }
    })
  },

  delGoods: function (goods_id) {
    let that = this;
    let token = wx.getStorageSync('token');
    wx.showLoading();
    app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'supplymobile.delete_supply_goods',
        token,
        goods_id
      },
      dataType: 'json',
      success: function (res) {
        wx.hideLoading();
        if (res.data.code == 0) {
          let list = that.data.list || [];
          list = list.filter(item=>item.id!=goods_id);
          let h = {};
          if(list.length==0) h.noData = 1;
          h.list = list;
          that.setData(h);
          wx.showToast({
            title: '删除成功',
            icon: 'none'
          })
        } else {
          app.util.message(res.data.msg, '', 'error');
        }
      }
    })
  },

  actionConfirm: function(content) {
    return new Promise((resolve, reject)=>{
      wx.showModal({
        title: '提示',
        content,
        showCancel: true,
        success: (result) => {
          if (result.confirm) {
            resolve();
          } else if (result.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    })
  },

  /**
   * 修改库存
   */
  editSku: function(e){
    if(e.detail.index==0) {
      this.setData({ editSkuVisible: false })
    } else {
      let editSkuNum = this.data.editSkuNum;
      if(editSkuNum==='') {
        return wx.showToast({
          title: '请输入正确的数量',
          icon: 'none'
        })
      }
      this.subSku();
    }
  },

  subSku: function(){
    let goodsItem = this.data.goodsItem;
    let goodsId = goodsItem.id;
    console.log(goodsId);
    let editSkuNum = this.data.editSkuNum;
    let token = wx.getStorageSync('token');
    let params = {
      token,
      goods_id: goodsId,
      is_has_option: 0,
      quantity: editSkuNum
    };
    app.util.ProReq('supplymobile.modify_supply_goods_quantity', params).then(res=>{
      let list = this.data.list || [];
      list.map(item=>{ if(item.id == goodsId) item.total = editSkuNum; })
      this.setData({ list, editSkuVisible: false, editSkuNum: 0, goodsItem: '' })
    }).catch(err=>{
      app.util.message(err.msg || '请求出错', 'switchTo:/eaterplanet_ecommerce/pages/user/me', 'error');
    })
  },

  bindSkuIpt: function(e) {
    let val = e.detail.value || 0;
    this.setData({ editSkuNum: parseInt(val) });
    return parseInt(val)
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (!this.data.loadMore) return false;
    this.getData();
  }
})
