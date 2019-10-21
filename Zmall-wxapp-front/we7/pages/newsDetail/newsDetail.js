var appInstance = getApp(), R_htmlToWxml = require("../../resource/js/htmlToWxml.js");

Page({
    data: {
        scrollHeight: 0,
        newsData: {}
    },
    getNewsDetail: function() {
        var t = this;
        wx.request({
            url: "https://wedengta.com/wxnews/getNews?action=DiscNewsContent&type=4&id=1478677877_1406730_1_9",
            headers: {
                "Content-Type": "application/json"
            },
            success: function(e) {
                var o = e.data;
                if (0 == o.ret) {
                    var n = JSON.parse(o.content);
                    n.content = R_htmlToWxml.html2json(n.sContent), n.time = appInstance.util.formatTime(1e3 * n.iTime), 
                    t.setData({
                        newsData: n
                    });
                } else console.log("数据拉取失败");
            },
            fail: function(e) {
                console.log("数据拉取失败");
            }
        });
    },
    stockClick: function(e) {
        var o = e.currentTarget.dataset.seccode, n = e.currentTarget.dataset.secname;
        console.log("stockClick:" + o + ";secName:" + n);
    },
    onLoad: function(e) {
        this.getNewsDetail(), console.log("onLoad");
    },
    onShow: function() {
        console.log("onShow");
    },
    onReady: function() {
        console.log("onReady");
    },
    onHide: function() {
        console.log("onHide");
    },
    onUnload: function() {
        console.log("onUnload");
    }
});