Component({
    properties: {
        status: {
            type: String,
            default: "",
            observer: function(t, e, s) {
                var a = this.statusChange(t);
                this.setData({
                    showStatus: a
                });
            }
        }
    },
    data: {
        showStatus: ""
    },
    methods: {
        statusChange: function(t) {
            switch (t) {
              case "0":
                return "待付款";

              case "1":
                return "待提货";

              case "2":
                return "已完成";

              case "3":
                return "已取消";

              case "4":
                return "待配送";

              default:
                return "";
            }
        }
    }
});