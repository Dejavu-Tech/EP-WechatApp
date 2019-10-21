var t = getApp();

Component({
    data: {
        isIpx: !1
    },
    attached: function() {
        t.globalData.isIpx && this.setData({
            isIpx: !0
        });
    }
});