Component({
    properties: {
        visible: {
            type: Boolean,
            value: !1
        },
        title: {
            type: String,
            value: ""
        },
        optionsList: {
            type: Array
        },
        defaultVal: {
            type: Number,
            value: null
        }
    },
    data: {
        selected: null
    },
    methods: {
        close: function() {
            this.triggerEvent("cancel");
        },
        radioChange: function(t) {
            this.setData({
                selected: Number(t.detail.value),
                defaultVal: Number(t.detail.value)
            });
        },
        cancel: function() {
            this.triggerEvent("cancel");
        },
        confirm: function() {
            (this.data.defaultVal || 0 === this.data.defaultVal) && (this.triggerEvent("selectOption", this.data.defaultVal), 
            this.triggerEvent("cancel")), (this.data.selected || 0 === this.data.selected) && (this.triggerEvent("selectOption", this.data.selected), 
            this.triggerEvent("cancel"));
        }
    }
});