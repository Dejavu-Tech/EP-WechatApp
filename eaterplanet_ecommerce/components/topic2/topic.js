var app = getApp();

Component({
    properties: {
        refresh: {
            type: Boolean,
            value: !1,
            observer: function(t) {
                t && (this.setData({
                    list: []
                }), this.getData());
            }
        }
    },
    data: {
        disabled: !1,
        list: [],
        placeholdeImg: app.globalData.placeholdeImg
    },
    attached: function() {
        this.getData();
    },
    methods: {
        getData: function() {
            var e = this;
            app.util.request({
                url: "entry/wxapp/user",
                data: {
                    controller: "user.get_copyright",
                    common_header_backgroundimage: "",
                },
                dataType: "json",
                success: function(t) {
                    if (0 == t.data.code) {
                        var a = t.data.data;
                        e.setData({
                            common_header_backgroundimage: a
                        });
                    }
                }
            });
        },

    }
});