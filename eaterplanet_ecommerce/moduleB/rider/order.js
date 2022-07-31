var app = getApp();
var location = require("../../utils/Location")
// 0 =>'未付款，未配送',1=>'已付款，未被抢',2=>'已付款，待配送，已被抢单',3=>'已拿货，配送中',4=>'已送达',5=>'已取消'

Page({
  data: {
    tabs: [{
        id: 2,
        name: '待取货'
      },
      {
        id: 3,
        name: '配送中'
      },
      {
        id: 4,
        name: '已送达'
      }
    ],
    status: 2,
    list: [],
    loadText: "加载中...",
    noData: 0,
    loadMore: true,
  },
  page: 1,
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let status = options.status || 2;
    this.setData({
      status
    }, () => {
      this.initFn();
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  changeTabs: function (e) {
    let that = this;
    let status = e.currentTarget.dataset.type || 0;
    this.page = 1;
    this.setData({
      status,
      list: [],
      showEmpty: false,
      loadMore: true
    }, () => {
      that.initFn();
    })
  },

  initFn: function () {
    this.page = 1;
    this.setData({
      list: [],
      loadText: "加载中...",
      noData: 0,
      loadMore: true,
    }, () => {
      this.getData();
    })
  },

  getData: function () {
    let that = this;
    let token = wx.getStorageSync('token');
    let type = this.data.status;

    wx.showLoading();
    app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'localtown.get_distribution_orderlist',
        token,
        type,
        page: this.page,
      },
      dataType: 'json',
      success: function (res) {
        wx.stopPullDownRefresh();
        if (res.data.code == 0) {
          let h = {};
          let list = res.data.data;
          if (list.length == 0) {
            if (that.page == 1) {
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
          that.setData({
            list,
            ...h
          })
        } else if (res.data.code == 2) {
          let h = {};
          h.loadMore = false;
          h.noMore = false;
          h.loadText = "没有更多记录了~";
         if(that.page==1) { h.noData = 1; }
          that.setData(h)
        } else {
          app.util.message(res.data.msg, 'switchTo:/eaterplanet_ecommerce/pages/user/me', 'error');
        }
        wx.hideLoading();
      }
    })
  },

  /**
   * 查看地图
   */
  gotoMap: function (e) {
    let idx = e.currentTarget.dataset.idx;
    if (idx < 0) {
      return;
    }
    let list = this.data.list || [];
    let item = list[idx];
    let longitude = parseFloat(item.member_lon),
      latitude = parseFloat(item.member_lat),
      name = item.shop_name,
      address = item.member_address;
    wx.openLocation({
      latitude: latitude,
      longitude: longitude,
      name: name,
      address: address,
      scale: 28
    })
  },

  /**
   * 确认取货
   */
  pickup: function (e) {
    this.preConfirm('确认已取到商品？').then(() => {
      let order_id = e.currentTarget.dataset.orderid;
      if (!order_id) {
        app.util.message('订单ID错误', '', 'error');
        return;
      }
      let token = wx.getStorageSync('token');
      app.util.ProReq('localtown.distribution_deliverying_order', {
        token,
        order_id
      }).then(res => {
        app.util.message('取货失败，请重试', '', 'success');
        this.initFn();
      }).catch(err => {
        app.util.message(err.msg || '取货成功', '', 'success');
        this.initFn();
      })
    })
  },

  preConfirm: function (msg) {
    return new Promise((resolve, reject) => {
      wx.showModal({
        title: '提示',
        content: msg,
        confirmColor: '#FED206',
        success: function (res) {
          if (res.confirm) {
            resolve()
          } else {
            console.log('用户点击了取消')
          }
        }
      })
    })
  },

  /**
   * 确认送达
   */
  arrived: function (e) {
    this.preConfirm('确认已送达商品？').then(() => {
      let order_id = e.currentTarget.dataset.orderid;
      if (!order_id) {
        app.util.message('订单ID错误', '', 'error');
        return;
      }
      console.log('确认已送达商品 ---- 是');
      let ps_lon=0, ps_lat=0;
      location.getGps().then(res=>{
        console.log('经纬度结果', res);
        if(res.errCode==2) {
          console.log(res.errMsg)
          app.util.message('请检查手机定位是否开启', '', 'error');
          return;
        }
        ps_lon = res.latitude
        ps_lat = res.longitude
        let token = wx.getStorageSync('token');
        app.util.ProReq('localtown.distribution_arrived_order', {
          token,
          order_id,
          ps_lon,
          ps_lat
        }).then(ret => {
          console.log('确认失败，请重试', ret);
          app.util.message('确认失败，请重试', '', 'success');
          this.initFn();
        }).catch(err => {
          console.log('成功', err);
          if(err.code==3) {
            app.util.message(err.msg, '', 'error');
          } else {
            app.util.message(err.msg || '确认成功', '', 'error');
            this.initFn();
          }
        })
      }).catch(()=>{
        app.util.message('请先开启定位服务', '', 'error');
        return;
      })
    })
  },

  /**
   * 联系商家
   */
  phoneCall: function (e) {
    let phoneNumber = e.currentTarget.dataset.tel || '';
    phoneNumber && wx.makePhoneCall({
      phoneNumber,
      complete: function () {}
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.initFn();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log(this.data.noMore)
    this.data.loadMore && this.getData();
  }
})
