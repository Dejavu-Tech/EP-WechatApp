Component({
    externalClasses: [ "i-class", "i-icon" ],
    properties: {
        showHome: {
            type: Boolean,
            value: !1
        },
        showShare: {
            type: Boolean,
            value: !1
        },
        showContact: {
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