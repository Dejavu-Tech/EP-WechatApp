var e = require("../../utils/timeFormat");

Component({
    properties: {
        spuItem: {
            type: Object,
            value: {
                spuImage: "",
                spuName: "",
                endTime: "",
                beginTime: "",
                actPrice: [],
                marketPrice: [],
                desc: "新鲜自然 唇齿留香",
                surplusNum: 0,
                soldNum: 0,
                limitOrderNum: 0,
                limitMemberNum: 0,
                serverTime: 0,
                skuImage: ""
            },
            observer: function(m) {
                if (m) {
                    var i = (0, e.formatTime)(new Date(1 * m.endTime)), r = (0, e.getBeginTime)(m.beginTime, m.serverTime), t = (0, 
                    e.formatNumber)(i.month) + "月" + (0, e.formatNumber)(i.day) + "日 " + (0, e.formatNumber)(i.hour) + ":" + (0, 
                    e.formatNumber)(i.minute);
                    this.setData({
                        formatBeginTime: r,
                        endTime: t
                    });
                }
            }
        },
        isPast: {
            type: Boolean,
            value: !1
        }
    },
    data: {
        formatBeginTime: "",
        endTime: ""
    }
});