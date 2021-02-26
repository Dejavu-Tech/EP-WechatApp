Component({
  externalClasses: ["i-class"],
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
    updateDataChange: function () {
      var that = this;
      wx.createSelectorQuery().in(this).select(".i-index-item").boundingClientRect(function (t) {
        that.setData({
          top: t.top,
          height: t.height,
          currentName: that.data.name
        });
      }).exec();
    }
  }
});