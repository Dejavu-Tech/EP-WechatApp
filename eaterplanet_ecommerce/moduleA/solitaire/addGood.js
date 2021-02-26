var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabs: [{
        id: 0,
        name: '社区商品'
      },
      {
        id: 1,
        name: '仅快递'
      }
    ],
    currentIdx: 0,
    list: [],
    loadText: "加载中...",
    noData: 0,
    loadMore: true,
    checkedAll: false,
    checkedCount: 0
  },
  page: 1,
  keyword: '',
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
  onLoad: function(options) {
    let currentIdx = options.type || 0;
    let that = this;
    this.setData({
      currentIdx
    }, ()=>{
      that.getData();
    })
  },

  initFn: function() {
    this.page = 1;
    this.setData({
      list: [],
      loadText: "加载中...",
      noData: 0,
      loadMore: true,
      checkedAll: false,
      checkedCount: 0
    },()=>{
      this.getData();
    })
  },

  /**
   * 切换导航
   */
  changeTabs: function(e) {
    let that = this;
    let currentIdx = e.currentTarget.dataset.type || 0;
    this.page = 1;
    this.setData({
      currentIdx,
      list: [],
      noData: 0,
      showEmpty: false,
      loadMore: true,
      loadOver: false
    }, () => {
      that.getData();
    })
  },

  /**
   * 获取列表
   */
  getData: function() {
    let that = this;
    let keyword = this.keyword || '';
    const token = wx.getStorageSync('token');
    app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'solitaire.search_head_goodslist',
        token: token,
        page: this.page,
        is_only_express: this.data.currentIdx,
        keyword,
        is_soli: 1
      },
      dataType: 'json',
      success: function(res) {
        wx.hideLoading();
        if (res.data.code == 0) {
          let h = {};
          let list = res.data.data;
          if (list.length < 20) h.noMore = true;
          let oldList = that.data.list;
          list = oldList.concat(list);
          that.page++;
          that.setData({ list, ...h, checkedAll: false })
        } else if (res.data.code == 1) {
          // 无数据
          if (that.page == 1) that.setData({ noData: 1 })
          that.setData({ loadMore: false, noMore: false, loadText: "没有更多记录了~" })
        } else if (res.data.code == 2) {
          app.util.message('您还未登录', 'switchTo:/eaterplanet_ecommerce/pages/index/index', 'error');
          return;
        } else {
          app.util.message(res.data.msg, 'switchTo:/eaterplanet_ecommerce/pages/index/index', 'error');
          return;
        }
      }
    })
  },

  /**
   * selType: 0单选 1多选
   */
  selectGoods: function(t){
    let selType = t.currentTarget.dataset.type || 0;
    let currentIdx = this.data.currentIdx;
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];  //上一个页面
    let goods = prevPage.data.goods || [];
    let goodsItem = t.detail;
    if (selType==0) {
      if(goods.length>0) {
        let idx = goods.findIndex(item => { return (item.gid == goodsItem.gid) })
        if (idx === -1) goods.push(goodsItem);
      } else {
        goods.push(goodsItem);
      }
    } else {
      let list = this.data.list || [];
      let selGoods = list.filter(item => item.checked==1 );
      let newGoods = goods.concat(selGoods);
      let uniq = new Map()
      // 去重合并
      for (let i = 0; i < newGoods.length; i++) {
        let gid = newGoods[i].gid, val = newGoods[i];
        if (uniq.has(gid)) uniq.set(gid, val)
        else uniq.set(gid, val)
      }
      let res = [];
      // 放入数组
      for (let comb of uniq) {
        console.log(comb[1])
        res.push(comb[1])
      }
      goods = res;
    }
    prevPage.setData({
      goods,
      type: currentIdx
    })
    wx.navigateBack({
      delta: 1
    })
  },

  /**
   * 勾选
   */
  checkboxChange: function (e) {
    var type = e.currentTarget.dataset.type,
      idx = e.currentTarget.dataset.index,
      list = this.data.list,
      checkedAll = this.data.checkedAll;

    if ("all" === type) {
      let ck = 0;
      if (checkedAll) {
        list.forEach(function (item) {
          item.checked = 0;
        })
      } else {
        list.forEach(function (item) {
          item.checked = 1;
        })
        ck = list.length;
      }
      this.setData({
        checkedCount: ck,
        list,
        checkedAll: !checkedAll
      })
    } else if ("item" === type) {
      list.forEach(function (item, t) {
        if (idx == t) {
          if (item.checked) {
            item.checked = 0
          } else {
            item.checked = 1
          }
        }
      })
      var ck = 0;
      list.forEach(function (item) {
        if (item.checked) {
          ck++;
        }
      })
      this.setData({
        checkedCount: ck,
        list,
        checkedAll: ck == list.length ? true : false
      })
    }
  },

  goResult: function(e){
    let keyword = e.detail.value || '';
    (this.keyword = keyword), this.initFn();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if (!this.data.loadMore) return false;
    this.getData();
  }
})
