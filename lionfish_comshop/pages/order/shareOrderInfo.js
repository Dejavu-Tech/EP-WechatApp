var app = getApp();

Page({
    data: {
        order: []
    },
    onLoad: function(o) {
        var a = o.order_id || 0;
        null != a && a || wx.redirectTo({
            url: "/lionfish_comshop/pages/index/index"
        }), wx.showLoading(), this.getData(a);
    },
    onShow: function() {},
    getData: function(o) {
        var a = this;
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "order.order_head_info",
                id: o,
                is_share: 1
            },
            dataType: "json",
            method: "POST",
            success: function(o) {
                wx.hideLoading(), 0 == o.data.code && a.setData({
                    order: o.data.data
                });
            }
        });
    },
    goGoodsDetails: function(o) {
        var a = o.currentTarget.dataset.id || 0, e = this.data.order.order_info.head_id || "";
        wx.navigateTo({
            url: "/lionfish_comshop/pages/goods/goodsDetail?id=" + a + "&community_id=" + e
        });
    },
    onHide: function() {},
    onUnload: function() {},
    onPullDownRefresh: function() {}
});