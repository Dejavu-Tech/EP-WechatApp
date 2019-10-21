function prop(e, a, s) {
    return a in e ? Object.defineProperty(e, a, {
        value: s,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[a] = s, e;
}

Page({
    data: {
        url: "",
        shareMessage: {
            title: "",
            path: "",
            imageUrl: ""
        }
    },
    onLoad: function(e) {
        var a = decodeURIComponent(e.url);
        e.url && this.setData(prop({
            url: a
        }, "shareMessage.path", "/lionfish_comshop/pages/web-view?url=" + a)), console.log("webviewUrl", this.data.url);
    },
    getPostMessage: function(e) {
        var a = e.detail;
        console.log("收到的信息", a);
        var s = Object.assign({}, this.data.shareMessage, a.data[0]);
        this.setData({
            shareMessage: s
        }), wx.showShareMenu({
            withShareTicket: !0,
            success: function() {
                console.log("成功");
            },
            fail: function() {
                console.log("失败");
            }
        }), wx.updateShareMenu();
    },
    onPageLoad: function(e) {
        e.detail;
    },
    onPageError: function(e) {
        e.detail;
    },
    onShareAppMessage: function() {
        return console.log(this.data.shareMessage), Object.assign({}, this.data.shareMessage, {
            success: function() {
                console.log("share succeed");
            },
            error: function() {
                console.log("share failed");
            }
        });
    }
});