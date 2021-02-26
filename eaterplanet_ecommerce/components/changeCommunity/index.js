Component({
  properties: {
    changeCommunity: {
      type: Object,
      value: {}
    },
    community: {
      type: Object,
      value: {}
    },
    visible: {
      type: Boolean,
      value: false
    },
    canChange: {
      type: Boolean,
      value: true
    },
    groupInfo: {
      type: Object,
      value: {
        group_name: '社区',
        owner_name: '团长'
      }
    },
    cancelFn: {
      type: Boolean,
      value: false
    }
  },

  attached() {
    this.countDistance()
  },

  methods: {
    countDistance: function () {
      let that = this;
      wx.getLocation({
        type: 'wgs84',
        success(res) {
          let {changeCommunity, community} = that.data;
          const latitude = res.latitude;
          const longitude = res.longitude;
          let lat1 = community.lat || '';
          let lon1 = community.lon || '';
          let lat2 = changeCommunity.lat || '';
          let lon2 = community.lon || '';
          if(lat1 && lon1 && lat2 && lon2) {
            let distance1 = that.getDistance(latitude, longitude, lat1, lon1);
            let distance2 = that.getDistance(latitude, longitude, lat2, lon2);
            community.distance = "距您"+distance1.toFixed(2)+"km";
            changeCommunity.distance = "距您"+distance2.toFixed(2)+"km";
            that.setData({ community, changeCommunity })
          }
        }
      })
    },
    getDistance: function (lat1, lng1, lat2, lng2) {
      var radLat1 = lat1 * Math.PI / 180.0;
      var radLat2 = lat2 * Math.PI / 180.0;
      var a = radLat1 - radLat2;
      var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
      var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
        Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
      s = s * 6378.137;
      s = Math.round(s * 10000) / 10000;
      return s;
    },
    switchCommunity: function (e) {
      let type = e.currentTarget.dataset.type;
      if (type == 0 || !this.data.canChange) {
        this.closeModal();
      } else {
        this.data.canChange && this.triggerEvent('changeComunity'), getApp().globalData.goodsListCarCount = [];
      }
    },
    closeModal: function () {
      this.data.cancelFn && this.triggerEvent('noChange');
      this.setData({
        visible: false
      })
    }
  }
})