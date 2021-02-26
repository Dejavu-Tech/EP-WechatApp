var app = getApp();
var timer = null;
var location = require("../../utils/Location")
const bgMusic = wx.getBackgroundAudioManager();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    noData: 0
  },
  _onPlay: false,
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
    this.getData();
  },

  onReady: function() {
    bgMusic.onEnded(()=>{
      this._onPlay = false;
    })
  },

  initFn: function(){
    timer = setInterval(()=>{
      this.getData();
    }, 1500)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.initFn();
  },

  onHide: function () {
    clearInterval(timer);
    timer = null;
  },

  onUnload: function () {
    clearInterval(timer);
    timer = null;
  },

  getData: function () {
    let token = wx.getStorageSync('token');
    app.util.ProReq('localtown.get_localtown_delivery', { token }).then(res => {
      let list = res.data || [];
      if(res.new_order_notice==1 && !this._onPlay) {
        this._onPlay = true;
        bgMusic.src = "https://shiziyu.liofis.com/addons/eaterplanet_ecommerce/static/mp3/click.mp3";
        bgMusic.title = '您有新订单';
        bgMusic.play()
      }
      this.setData({
        noData: false,
        list
      })
    }).catch(err => {
      console.log(err)
      if(err.code==2) {
        this.setData({
          list: [],
          noData: true
        })
        return;
      }
      app.util.message(err.msg || '请求出错', 'switchTo:/eaterplanet_ecommerce/pages/user/me', 'error');
    })
  },

  /**
   * 查看地图
   */
  gotoMap: function (e) {
    let idx = e.currentTarget.dataset.idx;
    if(idx<0) { return; }
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
   * 抢单
   */
  rob: function(e){
    let order_id = e.currentTarget.dataset.orderid;
    if(!order_id) {
      app.util.message('订单ID错误', '', 'error');
      return;
    }
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
      app.util.ProReq('localtown.rob_distribution_order', { token, order_id, ps_lon, ps_lat }).then(res => {
        app.util.message('抢单失败，请重试', '', 'error');
        this.getData();
      }).catch(err => {
        if(err.code==1) {
          app.util.message(err.msg || '抢单成功', '', 'error');
        } else {
          app.util.message(err.msg || '抢单失败', '', 'error');
        }
        this.getData();
      })
    }).catch(()=>{
      app.util.message('请先开启定位服务', '', 'error');
      return;
    })
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

  }

})
