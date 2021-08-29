// eaterplanet_ecommerce/moduleB/rider/index.js
var app = getApp();
var location = require("../../utils/Location")

Page({
  data: {
    orderdistribution_info: {},
    waite_get_count: 0,
    sending_count: 0,
    sended_count: 0,
    waite_send_list: [],
    sending_send_list: [],
    scale:'15',
    controls:'40',
    latitude:'',
    longitude:'',
    markers: [],
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
  onLoad: function (options) {
    this.getMyLocal();
  },

  onReady: function (e) {
    this.mapCtx = wx.createMapContext('myMap')
  },

  getMyLocal: function() {
    let that = this;
    location.getGps().then(ret=>{
      that.setData({
        scale: 12,
        longitude: ret.longitude,
        latitude: ret.latitude
      })
      // wx.getLocation({
      //   type: 'wgs84',
      //   success: (res) => {
      //     console.log("getMyLocal",res)
      //     that.setData({
      //       scale: 12,
      //       longitude: res.longitude,
      //       latitude: res.latitude
      //     })
      //   }
      // });
    }).catch(()=>{
      app.util.message('地图功能开启失败', '', 'error');
    })
  },

  getMemberMarkers: function(listData) {
    var market = [];
    // 待取货
    if(listData[0] && listData[0].length) {
      for (let item of listData[0]) {
        let marker1 = this.createMarker(item);
        market.push(marker1)
      }
    }
    // 配送中
    if(listData[1] && listData[1].length) {
      for (let item of listData[1]) {
        let marker1 = this.createMarker(item, 1);
        market.push(marker1)
      }
    }
    return market;
  },

  createMarker: function(point, type=0) {
    let latitude = point.shop_lat;
    let longitude = point.shop_lon;
    if(type==1){
      latitude = point.member_lat;
      longitude = point.member_lon;
    }
    let marker = {
      iconPath: type==0?"../images/location-red.png":"../images/location-green.png",
      id: point.order_id+'_'+type,
      title: type==0?'待取货':'配送中',
      latitude,
      longitude,
      label:{
        anchorX: -12,
        anchorY: 0,
        content: type==0?'商家':'客户'
      },
      width: 30,
      height: 30
    };
    return marker;
  },

  markertap: function(e){
    console.log(e.detail)
  },

  controltap: function(e) {
    this.moveToLocation()
  },

  moveToLocation: function () {
    this.mapCtx.moveToLocation()
  },

  regionchange: function(){

  },

  onShow: function () {
    this.getData();
  },

  getData: function () {
    let token = wx.getStorageSync('token');
    app.util.ProReq('localtown.get_orderdistribution_info', { token }).then(res => {
      let { orderdistribution_info, waite_get_count, sending_count, sended_count, waite_send_list, sending_send_list } = res.data;
      let markers = this.getMemberMarkers([waite_send_list, sending_send_list]);
      this.setData({
        orderdistribution_info, waite_get_count, sending_count, sended_count, waite_send_list, sending_send_list, markers
      })
    }).catch(err => {
      console.log(err)
      app.util.message(err.msg || '请求出错', 'switchTo:/eaterplanet_ecommerce/pages/user/me', 'error');
    })
  },

  goLink: function(event) {
    let link = event.currentTarget.dataset.link;
    var pages_all = getCurrentPages();
    if (pages_all.length > 3) {
      wx.redirectTo({
        url: link
      })
    } else {
      wx.navigateTo({
        url: link
      })
    }
  },

  // 接单状态切换
  switchState: function(e){
    console.log(e.detail.value)
  }
})
