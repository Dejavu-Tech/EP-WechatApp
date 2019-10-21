Component({
    externalClasses: [ "i-class" ],
    properties: {
        type: {
            type: String,
            value: ""
        },
        inline: {
            type: Boolean,
            value: !1
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
            value: !1
        },
        loading: {
            type: Boolean,
            value: !1
        },
        long: {
            type: Boolean,
            value: !1
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
        showMessageCard: Boolean
    },
    methods: {
        handleTap: function() {
            return !this.data.disabled && !this.data.loading && void this.triggerEvent("click");
        },
        bindgetuserinfo: function() {
            var e = (0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : {}).detail, t = void 0 === e ? {} : e;
            this.triggerEvent("getuserinfo", t);
        },
        bindcontact: function() {
            var e = (0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : {}).detail, t = void 0 === e ? {} : e;
            this.triggerEvent("contact", t);
        },
        bindgetphonenumber: function() {
            var e = (0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : {}).detail, t = void 0 === e ? {} : e;
            this.triggerEvent("getphonenumber", t);
        },
        binderror: function() {
            var e = (0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : {}).detail, t = void 0 === e ? {} : e;
            this.triggerEvent("error", t);
        }
    }
});