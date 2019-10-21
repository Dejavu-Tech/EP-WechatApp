require("../../utils/timeFormat"), Component({
    properties: {
        status: {
            type: String
        },
        pickUpTotal: {
            type: Number
        },
        tradeStatusInfo: {
            type: Object
        }
    },
    data: {
        maxPayTime: 30
    },
    methods: {
        timeOut: function() {
            this.triggerEvent("timeOut");
        }
    }
});