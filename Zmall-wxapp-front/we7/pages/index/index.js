var app = getApp();

Page({
    data: {
        navs: [],
        slide: [],
        commend: [],
        userInfo: {}
    },
    onLoad: function() {
        var a = this;
        app.util.footer(a), app.util.request({
            url: "wxapp/home/nav",
            cachetime: "30",
            success: function(e) {
                e.data.message.errno || (console.log(e.data.message.message), a.setData({
                    navs: e.data.message.message
                }));
            }
        }), app.util.request({
            url: "wxapp/home/slide",
            cachetime: "30",
            success: function(e) {
                e.data.message.errno || a.setData({
                    slide: e.data.message.message
                });
            }
        }), app.util.request({
            url: "wxapp/home/commend",
            cachetime: "30",
            success: function(e) {
                e.data.message.errno || a.setData({
                    commend: e.data.message.message
                });
            }
        });
    }
});