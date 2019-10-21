Component({
    externalClasses: [ "i-class" ],
    properties: {
        name: {
            type: String,
            value: ""
        }
    },
    relations: {
        "../index/index": {
            type: "parent"
        }
    },
    data: {
        top: 0,
        height: 0,
        currentName: ""
    },
    methods: {
        updateDataChange: function() {
            var t = this;
            wx.createSelectorQuery().in(this).select(".i-index-item").boundingClientRect(function(e) {
                t.setData({
                    top: e.top,
                    height: e.height,
                    currentName: t.data.name
                });
            }).exec();
        }
    }
});