var e = require("../../utils/timeFormat");

Component({
    properties: {
        item: {
            type: Object,
            observer: function(t) {
                var a = t;
                null === a.createTime ? a.createTime = (0, e.formatYMD)(new Date()) : a.createTime = (0, 
                e.formatYMD)(new Date(parseInt(a.createTime))), a.orderStatusName = this.switchState(a.groupOrderStatus), 
                this.setData({
                    item: a
                });
            }
        }
    },
    methods: {
        switchState: function(e) {
            var t = "";
            switch (String(e)) {
              case "-1":
                break;

              case "0":
                t = "待成团";
                break;

              case "1":
                t = "待配送";
                break;

              case "2":
                t = "待收货";
                break;

              case "3":
                t = "待提货";
                break;

              case "4":
                t = "已完成";
                break;

              case "5":
                t = "交易关闭";
                break;

              case "6":
                t = "待采购";
            }
            return t;
        }
    }
});