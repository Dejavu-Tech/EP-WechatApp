var _value;

function _defineProperty(e, t, a) {
    return t in e ? Object.defineProperty(e, t, {
        value: a,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[t] = a, e;
}

var app = getApp();

Component({
    properties: {
        spuItem: {
            type: Object,
            value: (_value = {
                actId: "",
                skuId: "",
                spuImage: "",
                spuName: "",
                endTime: 0,
                beginTime: "",
                actPrice: [ "", "" ],
                marketPrice: [ "", "" ],
                spuCanBuyNum: "",
                soldNum: ""
            }, _defineProperty(_value, "actId", ""), _defineProperty(_value, "limitMemberNum", ""), 
            _defineProperty(_value, "limitOrderNum", ""), _defineProperty(_value, "serverTime", ""), 
            _defineProperty(_value, "isLimit", !1), _defineProperty(_value, "skuList", []), 
            _defineProperty(_value, "spuDescribe", ""), _defineProperty(_value, "is_take_fullreduction", 0), 
            _defineProperty(_value, "bigImg", ""), _defineProperty(_value, "car_count", 0), 
            _value)
        },
        isPast: {
            type: Boolean,
            value: !1
        },
        actEnd: {
            type: Boolean,
            value: !1
        },
        reduction: {
            type: Object,
            value: {
                full_money: "",
                full_reducemoney: "",
                is_open_fullreduction: 0
            }
        }
    },
    attached: function() {
        this.setData({
            placeholdeImg: app.globalData.placeholdeImg
        });
    },
    data: {
        disabled: !1,
        placeholdeImg: ""
    },
    methods: {
        goLink: function() {
            var e = this.data.spuItem.actId;
            e && wx.navigateTo({
                url: "/lionfish_comshop/moduleA/pin/goodsDetail?&id=" + e
            });
        }
    }
});