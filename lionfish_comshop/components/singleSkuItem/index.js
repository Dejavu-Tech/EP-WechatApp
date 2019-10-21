Component({
    externalClasses: [ "i-class" ],
    properties: {
        goodsInfo: {
            type: Object
        },
        status: {
            type: Number
        },
        orderNo: {
            type: String
        }
    },
    methods: {
        goodsConfirmed: function() {
            this.triggerEvent("goodsConfirmed");
        }
    }
});