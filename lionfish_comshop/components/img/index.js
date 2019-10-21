var app = getApp();

Component({
    externalClasses: [ "i-class" ],
    properties: {
        defaultImage: String,
        imgType: {
            type: Number,
            value: 2
        },
        loadImage: {
            type: String,
            observer: function(e) {
                if (e) {
                    var t = Math.ceil(app.globalData.systemInfo.pixelRatio), a = e + "?imageView2/" + this.data.imgType + "/w/" + this.getPx(this.data.width) * t + "/h/" + this.getPx(this.data.height) * t + "/ignore-error/1";
                    this.setData({
                        img: a
                    });
                }
            }
        },
        width: String,
        height: String,
        canPreview: {
            type: Boolean,
            value: !1
        },
        isLazy: {
            type: Boolean,
            value: !1
        }
    },
    methods: {
        imageLoad: function() {
            this.setData({
                isLoad: !0
            });
        },
        bindError: function(e) {
            console.log(e);
        },
        getPx: function(e) {
            var t = wx.getSystemInfoSync();
            return console.log(), Math.round(t.windowWidth / 375 * e);
        },
        preview: function() {
            this.data.canPreview && wx.previewImage({
                urls: [ this.data.loadImage ],
                fail: function(e) {
                    wx.showToast({
                        title: "预览图片失败，请重试",
                        icon: "none"
                    }), console.log(e);
                }
            });
        }
    }
});