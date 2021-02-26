var _extends = Object.assign || function(e) {
  for (var t = 1; t < arguments.length; t++) {
      var o = arguments[t];
      for (var a in o) Object.prototype.hasOwnProperty.call(o, a) && (e[a] = o[a]);
  }
  return e;
}, util = require("../../utils/util.js"), status = require("../../utils/index.js"), wcache = require("../../utils/wcache.js"), app = getApp();

Page({


    
  mixins: [ require("../../mixin/globalMixin.js") ],
  data: {
    isIpx: true,
    common_header_backgroundimage: "",
  },

  getCopyright: function() {
    var C = this;
    app.util.request({
        url: "entry/wxapp/user",
        data: {
            controller: "user.get_copyright"
        },
        dataType: "json",
        success: function(e) {
            if (0 == e.data.code) {
                var t = e.data,   c = t.supply_diy_name, h = t.common_header_backgroundimage;

                 C.setData({

                    common_header_backgroundimage: h || ""
                }, );
            }
        }
    });
},

onShow: function() {
    var t = this;
    t.getCopyright();
},



onReady() {
  //5s后跳转
  this.data.Time = setInterval(() => {
    this.setData({
      time: --this.data.time
    })
    if (this.data.time <= 0) {
      clearInterval(this.data.Time)
      this.goHome()
    }
  }, 1000)
},
goHome() {
  clearInterval(this.data.Time)
  wx.reLaunch({
    url: '../index/index'
  })
},
  data: {
    time: 5,
  },
})