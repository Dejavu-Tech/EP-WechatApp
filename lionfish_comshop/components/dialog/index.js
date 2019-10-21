Component({
    properties: {
        visible: {
            type: Boolean,
            value: !1
        },
        text: String,
        confirmText: {
            type: String,
            value: "确定"
        }
    },
    methods: {
        confirm: function() {
            this.triggerEvent("confirm");
        },
        cancel: function() {
            this.triggerEvent("cancel");
        }
    }
});