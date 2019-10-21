Component({
    properties: {
        defaultImage: String,
        imgType: {
            type: Number,
            value: 2
        },
        loadImage: {
            type: String,
            observer: function(t) {
                if (t) {
                    var e = Math.ceil(wx.getSystemInfoSync().pixelRatio), i = t + "?imageView2/" + this.data.imgType + "/w/" + this.getPx(this.data.width) * e + "/h/" + this.getPx(this.data.height) * e + "/ignore-error/1";
                    this.setData({
                        img: i,
                        w: this.getPx(this.data.width),
                        h: this.getPx(this.data.height)
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
        },
        isCircle: {
            type: Boolean,
            value: !1
        }
    },
    data: {
        isLoad: !1,
        img: "",
        systemInfo: {},
        w: 0,
        h: 0
    },
    methods: {
        imageLoad: function() {
            this.setData({
                isLoad: !0
            });
        },
        getPx: function(t) {
            var e = wx.getSystemInfoSync();
            return Math.round(e.windowWidth / 375 * t);
        },
        preview: function() {
            this.data.canPreview && wx.previewImage({
                urls: [ this.data.loadImage ],
                fail: function(t) {
                    wx.showToast({
                        title: "预览图片失败，请重试",
                        icon: "none"
                    }), console.log(t);
                }
            });
        }
    }
});