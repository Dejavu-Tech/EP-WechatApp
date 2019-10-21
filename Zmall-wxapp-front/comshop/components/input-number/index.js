function t(t, a) {
    var e, i = void 0, n = void 0;
    try {
        i = t.toString().split(".")[1].length;
    } catch (t) {
        i = 0;
    }
    try {
        n = a.toString().split(".")[1].length;
    } catch (t) {
        n = 0;
    }
    return e = Math.pow(10, Math.max(i, n)), (Math.round(t * e) + Math.round(a * e)) / e;
}

Component({
    externalClasses: [ "i-class", "i-class-number-text" ],
    properties: {
        size: String,
        value: {
            type: Number,
            value: 1
        },
        min: {
            type: Number,
            value: -1 / 0
        },
        max: {
            type: Number,
            value: 1 / 0
        },
        step: {
            type: Number,
            value: 1
        },
        reduceImage: {
            type: String,
            value: "../../images/icon-input-reduce.png"
        },
        addImage: {
            type: String,
            value: "../../images/icon-input-add.png"
        },
        idx: {
            type: Number,
            value: 0
        }
    },
    data: {
        canChange: !0
    },
    methods: {
        handleChangeStep: function(a, e, i) {
            var n = this.data.value, s = a.currentTarget.dataset, u = (void 0 === s ? {} : s).disabled, h = this.data.step;
            if (u) return null;
            "minus" === e ? n = t(n, -h) : "plus" === e && (n = t(n, h)), this.handleEmit(n, e, i);
        },
        handleMinus: function(t) {
            this.data.canChange && this.handleChangeStep(t, "minus", !0);
        },
        handlePlus: function(t) {
            this.data.canChange && this.handleChangeStep(t, "plus", !0);
        },
        handleFocus: function() {
            this.data.canChange = !1, this.triggerEvent("focus");
        },
        getType: function(t) {
            return t > this.data.value ? "plus" : t < this.data.value ? "minus" : "";
        },
        handleBlur: function(t) {
            this.data.canChange = !0;
            var a = this.data.value, e = t.detail.value, i = "";
            "" === e && (e = 1), (e -= a) <= 0 && (e = 1);
            var n = this.data.min;
            if (!(e *= 1)) return e = 0 === e ? n : 1, i = "plus", void this.handleEmit(e, i, this.data.value !== e);
            e = +e, i = this.getType(e);
            var s = this.data.value !== e;
            this.handleEmit(e, i, s);
        },
        handleEmit: function(t, a) {
            t < this.data.min && this.triggerEvent("outOfMin", t), t > this.data.max && this.triggerEvent("outOfMax", t);
            var e = this.data, i = e.min, n = e.max;
            n < t ? t = n : t < i ? t = i : t || (t = i);
            var s = t !== this.data.value, u = {
                value: t,
                type: a,
                idx: this.data.idx
            };
            a && (u.type = a), s ? this.triggerEvent("change", u) : (this.setData({
                value: t
            }), this.triggerEvent("change"));
        },
        returnTap: function() {}
    }
});