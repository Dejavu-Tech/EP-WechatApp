var t = require("../../utils/index");

Component({
  externalClasses: ["i-class"],
  properties: {
    lineBgColor: {
      type: String
    },
    fontColor: {
      type: String
    },
    tabs: {
      type: Array,
      value: []
    },
    activeIndex: {
      type: Number,
      value: 0,
      observer: function (e) {
        if(-1 === this.properties.activeIndex) {
          this.resetIndicator();
        } else {
          this.executeAnimcation(e)
        }
      }
    }
  },
  data: {
      out_link: "",
    indicatorAnamationData: {},
    scrollLeft: 0
  },
  ready: function () {
    this.tabsWidth = [], this.tabsLeft = [], this.screenWidth = wx.getSystemInfoSync().screenWidth,
      this.setData({
          fontColor: this.data.fontColor ? this.data.fontColor : "#fff!important"
      }), this.data.lineColor && this.setData({
        lineBgColor: this.data.lineBgColor
      });
  },
  methods: {
    handleTabItemTap: function (t) {
      var e = t.target.dataset.index, a = t.target.dataset.id;
      e !== this.data.activeIndex && (this.setData({
        activeIndex: e
      }), this.triggerEvent("activeIndexChange", {a,e}));
    },
        goLink: function () {
          wx.switchTab({
            url: "/eaterplanet_ecommerce/pages/type/index",
          });
        },
    executeAnimcation: function (t) {
      var e = this;
      this.getLeftAndWidth(t).then(function (a) {
        var i = e.generateAnimationData(a.left, a.width, a.firstTabLeft);
        e.centerTheTab(t, a), e.setData({
          indicatorAnamationData: i
        });
      });
    },
    centerTheTab: function (t, e) {
      var a = e.width, i = (e.left, this.tabsWidth.slice(0, t).reduce(function (t, e) {
        return t + e + 25;
      }, 15));
      this.setData({
        scrollLeft: i - (this.screenWidth - a) / 2
      });
    },
    getLeftAndWidth: function (e) {
      var a = this;
      return new Promise(function (i) {
        (0, t.getRect)(a, ".tabs__nav", !0).then(function (t) {
          a.tabsWidth = t.map(function (t) {
            return t.width;
          }), a.tabsLeft = t.map(function (t) {
            return t.left;
          }), i({
            width: a.tabsWidth[e],
            left: a.tabsLeft[e],
            firstTabLeft: a.tabsLeft[0]
          });
        });
      });
    },
    generateAnimationData: function (t, e) {
      var a = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 0, i = wx.createAnimation({
        duration: 200,
        timingFunction: "ease"
      });
      return [{
        width: e,
        left: t - a
      }].forEach(function (t) {
        var e = t.width, a = t.left;
        i.translateX(a).width(e).step();
      }), i.export();
    },
    resetIndicator: function () {
      let tabs = this.data.tabs || [];
      let initWidth = 28;
      if (tabs.length) initWidth = (tabs[0].name && tabs[0].name.length*14);
      var t = wx.createAnimation({
        duration: 200,
        timingFunction: "ease"
      });
      t.translateX(0).width(initWidth).step(), this.setData({
        scrollLeft: 0,
        indicatorAnamationData: t.export()
      });
    }
  }
});
