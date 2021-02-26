Component({
  properties: {
    visible: {
      type: Boolean,
      value: false
    },
    coderList: {
      type: Array
    },
    codeImg: {
      type: String,
      value: ''
    }
  },
  data: {
    selected: null
  },
  methods: {
    close: function () {
      this.triggerEvent("cancel");
    }
  }
});