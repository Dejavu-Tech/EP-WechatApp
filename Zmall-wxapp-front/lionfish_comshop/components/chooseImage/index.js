function e(e, t, a) {
    return t in e ? Object.defineProperty(e, t, {
        value: a,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[t] = a, e;
}

var t = [], a = 0, r = [], app = getApp();

Component({
    properties: {
        imgMax: {
            type: Number,
            value: 0
        },
        token: String,
        key: {
            type: String,
            value: "wx-upload"
        }
    },
    data: {
        imgGroup: [],
        progressList: []
    },
    methods: {
        addImg: function() {
            var l = this, s = this.data.imgGroup;
            wx.chooseImage({
                count: this.data.imgMax - s.length,
                success: function(g) {
                    l.triggerEvent("on-chooseImage"), (s = s.concat(g.tempFilePaths)).length > l.data.imgMax && s.splice(l.data.imgMax), 
                    l.setData({
                        imgGroup: s
                    });
                    var p = g.tempFilePaths.length;
                    a = s.length;
                    for (var i = 0; i < g.tempFilePaths.length; i++) !function(i) {
                        var s = g.tempFilePaths[i].split(".")[g.tempFilePaths[i].split(".").length - 1], n = new Date().getTime(), o = Math.round(1e6 * Math.random());
                        r[i + a - p] = wx.uploadFile({
                            url: app.util.url("entry/wxapp/index", {
                                m: "lionfish_comshop",
                                controller: "goods.doPageUpload"
                            }),
                            filePath: g.tempFilePaths[i],
                            name: "upfile",
                            header: {
                                "Content-Type": "multipart/form-data"
                            },
                            formData: {
                                token: l.data.token,
                                key: l.data.key + "-" + n + "-" + o + "." + s
                            },
                            success: function(r) {
                                t[i + a - p] = JSON.parse(r.data).image_o, l.setData(e({}, "progressList[" + (i + a - p) + "]", 100)), 
                                l.triggerEvent("on-changeImage", {
                                    value: t,
                                    len: a
                                });
                            }
                        }), r[i + a - p].onProgressUpdate(function(t) {
                            var r = t.progress;
                            l.setData(e({}, "progressList[" + (i + a - p) + "]", r));
                        });
                    }(i);
                }
            });
        },
        remove: function(e) {
            var i = e.currentTarget.dataset.idx, s = this.data.imgGroup, n = this.data.progressList;
            n[i] < 100 && r[i].abort(), s.splice(i, 1), r.splice(i, 1), n.splice(i, 1), t.splice(i, 1), 
            a = s.length, this.setData({
                imgGroup: s,
                progressList: n
            }), this.triggerEvent("on-changeImage", {
                value: t,
                len: a
            });
        },
        bigImg: function(e) {
            var t = e.currentTarget.dataset.src, a = e.currentTarget.dataset.list;
            wx.previewImage({
                current: t,
                urls: a
            });
        }
    },
    detached: function() {
        console.log("detached"), t = [], a = 0, r = [];
    }
});