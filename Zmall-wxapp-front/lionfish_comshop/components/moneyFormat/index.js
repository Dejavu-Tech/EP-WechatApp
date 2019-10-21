Component({
    properties: {
        money: {
            type: Number,
            observer: function(e) {
                var s = (e / 100).toFixed(2);
                this.setData({
                    showMoney: s
                });
            }
        }
    },
    data: {
        showMoney: 0
    },
    externalClasses: [ "i-class" ]
});