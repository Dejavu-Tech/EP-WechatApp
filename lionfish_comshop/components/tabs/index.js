var t = require("../../utils/index");

Component({
    externalClasses: [ "i-class" ],
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
            observer: function(t) {
                -1 === this.properties.activeIndex ? this.resetIndicator() : this.executeAnimcation(t);
            }
        }
    },
    data: {
        indicatorAnamationData: {},
        scrollLeft: 0
    },
    ready: function() {
        this.tabsWidth = [], this.tabsLeft = [], this.screenWidth = wx.getSystemInfoSync().screenWidth, 
        this.setData({
            fontColor: this.data.fontColor ? this.data.fontColor : "#000"
        }), this.data.lineColor && this.setData({
            lineBgColor: this.data.lineBgColor
        });
    },
    methods: {
        handleTabItemTap: function(t) {
            var e = t.target.dataset.index, a = t.target.dataset.id;
            e !== this.data.activeIndex && (this.setData({
                activeIndex: e
            }), this.triggerEvent("activeIndexChange", {
                a: a,
                e: e
            }));
        },
        executeAnimcation: function(a) {
            var i = this;
            this.getLeftAndWidth(a).then(function(t) {
                var e = i.generateAnimationData(t.left, t.width, t.firstTabLeft);
                i.centerTheTab(a, t), i.setData({
                    indicatorAnamationData: e
                });
            });
        },
        centerTheTab: function(t, e) {
            var a = e.width, i = (e.left, this.tabsWidth.slice(0, t).reduce(function(t, e) {
                return t + e + 25;
            }, 15));
            this.setData({
                scrollLeft: i - (this.screenWidth - a) / 2
            });
        },
        getLeftAndWidth: function(a) {
            var i = this;
            return new Promise(function(e) {
                (0, t.getRect)(i, ".tabs__nav", !0).then(function(t) {
                    i.tabsWidth = t.map(function(t) {
                        return t.width;
                    }), i.tabsLeft = t.map(function(t) {
                        return t.left;
                    }), e({
                        width: i.tabsWidth[a],
                        left: i.tabsLeft[a],
                        firstTabLeft: i.tabsLeft[0]
                    });
                });
            });
        },
        generateAnimationData: function(t, e) {
            var a = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : 0, i = wx.createAnimation({
                duration: 200,
                timingFunction: "ease"
            });
            return [ {
                width: e,
                left: t - a
            } ].forEach(function(t) {
                var e = t.width, a = t.left;
                i.translateX(a).width(e).step();
            }), i.export();
        },
        resetIndicator: function() {
            var t = wx.createAnimation({
                duration: 200,
                timingFunction: "ease"
            });
            t.translateX(0).width(28).step(), this.setData({
                scrollLeft: 0,
                indicatorAnamationData: t.export()
            });
        }
    }
});