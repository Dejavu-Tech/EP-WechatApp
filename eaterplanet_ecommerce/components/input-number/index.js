function t(t, a) {
  var e = void 0,
    i = void 0,
    n = void 0;
  try {
    e = t.toString().split(".")[1].length;
  } catch (t) {
    e = 0;
  }
  try {
    i = a.toString().split(".")[1].length;
  } catch (t) {
    i = 0;
  }
  return n = Math.pow(10, Math.max(e, i)), (Math.round(t * n) + Math.round(a * n)) / n;
}

Component({
  externalClasses: ["i-class", "i-class-number-text", "i-number-view", "i-number-img"],
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
    canChange: true,
    skin: getApp().globalData.skin,
  },
  attached(){
    this.setData({
      skin: getApp().globalData.skin,
    })
  },
  methods: {
    handleChangeStep: function(a, e, i) {
      var n = this.data.value,
        s = a.currentTarget.dataset,
        h = (void 0 === s ? {} : s).disabled,
        u = this.data.step;
      if (h) return null;
      "minus" === e ? n = t(n, -u) : "plus" === e && (n = t(n, u)), this.handleEmit(n, e, i);
    },
    handleMinus: function(t) {
      this.data.canChange && this.handleChangeStep(t, "minus", true);
    },
    handlePlus: function(t) {
      this.data.canChange && this.handleChangeStep(t, "plus", true);
    },
    handleFocus: function() {
      this.data.canChange = false, this.triggerEvent("focus");
    },
    getType: function(t) {
      return t > this.data.value ? "plus" : t < this.data.value ? "minus" : "";
    },
    handleBlur: function(t) {
      this.data.canChange = true;
      var oldValue = this.data.value;
      var a = t.detail.value,
        e = "";
      "" === a && (a = 1);
      a = (a - oldValue);
      (a<=0) && (a=1);
      var i = this.data.min;
      // e = this.getType(a)
      if (!(a *= 1)) return a = 0 === a ? i : 1, e = 'plus', void this.handleEmit(a, e, this.data.value !== a);
      a = +a, e = this.getType(a);
      var n = this.data.value !== a;
      this.handleEmit(a, e, n);
    },
    handleEmit: function(t, a) {
      t < this.data.min && this.triggerEvent("outOfMin", t), t > this.data.max && this.triggerEvent("outOfMax", t);
      var e = this.data,
        i = e.min,
        n = e.max;
      t > n ? t = n : t < i ? t = i : t || (t = i);
      var s = t !== this.data.value,
        h = {
          value: t,
          type: a,
          idx: this.data.idx
        };
      a && (h.type = a), s ? this.triggerEvent("change", h) : (this.setData({
        value: t
      }), this.triggerEvent("change"));
    },
    returnTap: function(){}
  }
});