Component({
    externalClasses: [ "i-class" ],
    properties: {
        showHome: {
            type: Boolean,
            value: !1
        },
        cartNum: {
            type: Number,
            value: 0
        }
    },
    methods: {
        goLink: function(e) {
            var t = e.currentTarget.dataset.link;
            wx.switchTab({
                url: t
            });
        }
    }
});