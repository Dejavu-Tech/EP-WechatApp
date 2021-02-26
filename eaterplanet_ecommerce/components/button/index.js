Component({
  externalClasses: ["i-class"],
  properties: {
    type: {
      type: String,
      value: ""
    },
    inline: {
      type: Boolean,
      value: false
    },
    size: {
      type: String,
      value: ""
    },
    shape: {
      type: String,
      value: "square"
    },
    disabled: {
      type: Boolean,
      value: false
    },
    loading: {
      type: Boolean,
      value: false
    },
    long: {
      type: Boolean,
      value: false
    },
    openType: String,
    appParameter: String,
    hoverStopPropagation: Boolean,
    hoverStartTime: {
      type: Number,
      value: 20
    },
    hoverStayTime: {
      type: Number,
      value: 140
    },
    lang: {
      type: String,
      value: "en"
    },
    sessionFrom: {
      type: String,
      value: ""
    },
    sendMessageTitle: String,
    sendMessagePath: String,
    sendMessageImg: String,
    showMessageCard: Boolean,
    styleStr: {
      type: String,
      value: ""
    }
  },
  methods: {
    handleTap: function () {
      return !this.data.disabled && (!this.data.loading && void this.triggerEvent("click"));
    },
    bindgetuserinfo: function () {
      var e = (arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}).detail, t = void 0 === e ? {} : e;
      this.triggerEvent("getuserinfo", t);
    },
    bindcontact: function () {
      var e = (arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}).detail, t = void 0 === e ? {} : e;
      this.triggerEvent("contact", t);
    },
    bindgetphonenumber: function () {
      var e = (arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}).detail, t = void 0 === e ? {} : e;
      this.triggerEvent("getphonenumber", t);
    },
    binderror: function () {
      var e = (arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}).detail, t = void 0 === e ? {} : e;
      this.triggerEvent("error", t);
    }
  }
});