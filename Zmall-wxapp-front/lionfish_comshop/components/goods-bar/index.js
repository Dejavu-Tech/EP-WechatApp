var t = require("../../utils/public");

Component({
    properties: {
        goodsDetail: Object,
        goodsStatus: {
            type: Number,
            value: null
        },
        cartNum: {
            type: Number,
            value: 0,
            observer: function(t) {
                console.log(t);
            }
        }
    },
    methods: {
        addToCart: function(e) {
            (0, t.collectFormIds)(e.detail.formId), this.triggerEvent("on-addToCart");
        },
        balance: function() {
            this.triggerEvent("on-balance");
        },
        submit: function(e) {
            (0, t.collectFormIds)(e.detail.formId);
        }
    }
});