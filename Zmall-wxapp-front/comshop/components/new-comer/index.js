var app = getApp();

Component({
    properties: {
        refresh: {
            type: Boolean,
            value: !1,
            observer: function(t) {
                var a = this;
                t && this.setData({
                    pageNum: 1,
                    noMore: !1,
                    list: []
                }, function() {
                    a.getData();
                });
            }
        }
    },
    data: {
        disabled: !1,
        list: [],
        pageNum: 1,
        noMore: !1
    },
    methods: {
        getData: function() {
            var t = wx.getStorageSync("token"), e = this, a = wx.getStorageSync("community");
            app.util.request({
                url: "entry/wxapp/index",
                data: {
                    controller: "index.load_new_buy_goodslist",
                    token: t,
                    pageNum: e.data.pageNum,
                    head_id: a.communityId
                },
                dataType: "json",
                success: function(t) {
                    if (0 == t.data.code) {
                        var a = e.data.list.concat(t.data.list);
                        e.setData({
                            list: a
                        });
                    } else e.setData({
                        noMore: !0
                    });
                }
            });
        },
        getMore: function() {
            if (!this.data.noMore) {
                var t = this, a = t.data.pageNum + 1;
                console.log(a), this.setData({
                    pageNum: a
                }, function() {
                    t.getData();
                });
            }
        },
        openSku: function(t) {
            var a = t.currentTarget.dataset.idx;
            this.setData({
                disabled: !1
            });
            var e = this.data.list[a];
            this.triggerEvent("openSku", {
                actId: e.actId,
                skuList: e.skuList,
                promotionDTO: e.promotionDTO || "",
                allData: {
                    spuName: e.spuName,
                    skuImage: e.skuImage,
                    actPrice: e.actPrice,
                    canBuyNum: e.spuCanBuyNum,
                    stock: e.spuCanBuyNum,
                    marketPrice: e.marketPrice
                }
            });
        }
    }
});