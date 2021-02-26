var timeFormat = require("../../utils/timeFormat");

Component({
  properties: {
    item: {
      type: Object,
      observer: function (val) {
        var obj = val;
        var cTime = obj.createTime;
        null === cTime ? cTime = (0, timeFormat.formatYMD)(new Date()) : cTime = (0,
          timeFormat.formatYMD)(new Date(parseInt(cTime))), this.setData({
            item: obj
          });
      }
    }
  }
});