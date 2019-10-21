var app = getApp();

Page({
    data: {
        goodShareImg: ""
    },
    onLoad: function(e) {
        "commiss" == (e.type || "") ? this.getCommissShareImage() : this.getShareImage();
    },
    getShareImage: function() {
        wx.showLoading({
            title: "获取中"
        });
        var a = this, e = wx.getStorageSync("token"), t = wx.getStorageSync("community").communityId;
        app.util.request({
            url: "entry/wxapp/user",
            data: {
                controller: "user.user_index_shareqrcode",
                community_id: t,
                token: e
            },
            dataType: "json",
            method: "POST",
            success: function(e) {
                if (0 == e.data.code) {
                    var t = e.data.image_path;
                    a.setData({
                        goodShareImg: t
                    }), wx.hideLoading();
                }
            }
        });
    },
    getCommissShareImage: function() {
        wx.showLoading({
            title: "获取中"
        });
        var a = this, e = wx.getStorageSync("token");
        app.util.request({
            url: "entry/wxapp/user",
            data: {
                controller: "distribution.get_haibao",
                token: e
            },
            dataType: "json",
            method: "POST",
            success: function(e) {
                if (0 == e.data.code) {
                    var t = e.data.commiss_qrcode;
                    a.setData({
                        goodShareImg: t
                    }), wx.hideLoading();
                }
            }
        });
    },
    preImg: function(e) {
        var t = e.currentTarget.dataset.src, a = this.data.goodShareImg;
        wx.previewImage({
            current: t,
            urls: [ a ]
        });
    },
    onShow: function() {}
});