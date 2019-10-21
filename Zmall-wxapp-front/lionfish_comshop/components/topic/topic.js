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
            var t = wx.getStorageSync("token"), e = this, a = wx.getStorageSync("community");
            app.util.request({
                url: "entry/wxapp/index",
                data: {
                    controller: "marketing.get_special_list",
                    token: t,
                    head_id: a.communityId
                },
                dataType: "json",
                success: function(t) {
                    if (0 == t.data.code) {
                        var a = t.data.data;
                        e.setData({
                            list: a
                        });
                    }
                }
            });
        },
        goSpecial: function(t) {
            var a = t.currentTarget.dataset.id;
            a && wx.navigateTo({
                url: "/lionfish_comshop/moduleA/special/index?id=" + a
            });
        },
        openSku: function(t) {
            var a = t.currentTarget.dataset.idx, e = t.currentTarget.dataset.gidx;
            this.setData({
                disabled: !1
            });
            var i = this.data.list[a].list[e];
            this.triggerEvent("openSku", {
                actId: i.actId,
                skuList: i.skuList,
                promotionDTO: i.promotionDTO || "",
                allData: {
                    spuName: i.spuName,
                    skuImage: i.skuImage,
                    actPrice: i.actPrice,
                    canBuyNum: i.spuCanBuyNum,
                    stock: i.spuCanBuyNum,
                    marketPrice: i.marketPrice
                }
            });
        }
    }
});