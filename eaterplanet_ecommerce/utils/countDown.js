const timeFormat = require("timeFormat");
const app = getApp();

const setCountDownData = (context, key, value) => {
  context.setData({ [`countDownMap.${key}`]: value });
};

const setActEndData = (context, key, value) => {
  context.setData({ [`actEndMap.${key}`]: value });
};

exports.default = {
  initCountDown(e) {
    const r = { day: "0", second: "00", minute: "00", hour: "00" };
    const remainingTime = e - new Date().getTime();

    if (remainingTime <= 0) {
      setCountDownData(this, e, r);
      setActEndData(this, e, true);
    } else {
      this.$data.timer[e] = app.globalData.timer.add(() => this.interval(e));
    }
  },

  interval(t) {
    const remainingTime = t - new Date().getTime();
    const n = {};

    if (remainingTime <= 0) {
      app.globalData.timer.remove(this.$data.timer[t]);
      if (!this.$data.actEndMap[t]) setActEndData(this, t, true);
      setCountDownData(this, t, { day: "0", second: "00", minute: "00", hour: "00" });
      return;
    }

    const totalSeconds = Math.ceil(remainingTime / 1000);
    const days = parseInt(totalSeconds / 86400);
    let remainingSeconds = totalSeconds % 86400;
    const hours = timeFormat.formatNumber(parseInt(remainingSeconds / 3600));
    remainingSeconds %= 3600;
    const minutes = timeFormat.formatNumber(parseInt(remainingSeconds / 60));
    const seconds = timeFormat.formatNumber(remainingSeconds % 60);

    const countDownData = { day: days, hour: hours, minute: minutes, second: seconds };
    if (this.$data.actEndMap[t]) setActEndData(this, t, false);
    setCountDownData(this, t, countDownData);
  }
};