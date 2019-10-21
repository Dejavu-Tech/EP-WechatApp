Component({
    properties: {
        visible: {
            type: Boolean,
            value: !1
        },
        coderList: {
            type: Array
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