var app = getApp();

Page({
    data: {
        goods_industrial: []
    },
    onLoad: function(a) {
        wx.showLoading(), this.getData();
    },
    getData: function() {
        var t = this;
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "goods.get_instructions"
            },
            dataType: "json",
            success: function(a) {
                wx.hideLoading(), 0 == a.data.code && t.setData({
                    goods_industrial: a.data.data.goods_industrial || []
                });
            }
        });
    }
});