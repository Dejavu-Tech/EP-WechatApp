var t = require("../../utils/timeFormat");

Component({
    properties: {
        item: {
            type: Object,
            observer: function(e) {
                var r = e;
                r.createTime = (0, t.formatFull)(new Date(parseInt(r.createTime))), r.returnOrderStatusName = this.swithState(r.returnOrderStatus), 
                this.setData({
                    item: r
                });
            }
        }
    },
    methods: {
        swithState: function(t) {
            switch (Number(t)) {
              case 1:
                return "处理中";

              case 3:
                return "退款成功";

              case 4:
                return "已拒绝";

              case 5:
                return "已撤销";
            }
        },
        goOrderDetail: function(t) {
            this.triggerEvent("to-detail", t.currentTarget.dataset.returnorderno);
        },
        cancelApplication: function(t) {
            this.triggerEvent("cancel-application", t.currentTarget.dataset.returnorderno);
        }
    }
});