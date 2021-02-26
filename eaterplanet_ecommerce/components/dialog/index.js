Component({
  externalClasses: ["i-class", "i-btn"],
  properties: {
    visible: {
      type: Boolean,
      value: false
    },
    text: String,
    confirmText: {
      type: String,
      value: "确定"
    },
    showCancel: {
      type: Boolean,
      value: true
    }
  },
  methods: {
    confirm: function () {
      this.triggerEvent("confirm");
    },
    cancel: function () {
      this.triggerEvent("cancel");
    },
    close: function () {
      this.triggerEvent("cancel");
    }
  }
});