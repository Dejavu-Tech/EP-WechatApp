Component({
    properties: {
        visible: {
            type: Boolean,
            value: !1
        },
        coderList: {
            type: Array
        },
        codeImg: {
            type: String,
            value: ""
        }
    },
    data: {
        selected: null
    },
    methods: {
        close: function() {
            this.triggerEvent("cancel");
        }
    }
});