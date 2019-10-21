var app = getApp();

Page({
    data: {},
    onLoad: function(e) {
        var o = this, a = wx.getStorageSync("token"), d = e.id;
        wx.showLoading(), app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "user.goods_express",
                token: a,
                order_id: d
            },
            dataType: "json",
            success: function(e) {
                wx.hideLoading(), 2 == e.data.code ? wx.redirectTo({
                    url: "/lionfish_comshop/pages/index/index"
                }) : 0 == e.data.code && o.setData({
                    seller_express: e.data.seller_express,
                    goods_info: e.data.goods_info,
                    order_info: e.data.order_info
                });
            }
        });
    }
});