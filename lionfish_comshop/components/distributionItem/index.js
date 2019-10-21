var timeFormat = require("../../utils/timeFormat");

Component({
    properties: {
        item: {
            type: Object,
            observer: function(t) {
                var e = t, r = e.createTime;
                r = null === r ? (0, timeFormat.formatYMD)(new Date()) : (0, timeFormat.formatYMD)(new Date(parseInt(r))), 
                this.setData({
                    item: e
                });
            }
        }
    }
});