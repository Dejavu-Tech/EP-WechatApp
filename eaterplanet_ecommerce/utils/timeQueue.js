exports.default = class {
  constructor(name) {
    this.queue = {};
    this.timer = -1;
  }

  action(){
    if ("{}" !== JSON.stringify(this.queue)) {
      for (let i in this.queue) this.queue[i][0]();
      this.timer = -1, this.begin();
    } else {
      this.stop();
    }
  }

  add(e){
    var t = "" + new Date().getTime() + Math.ceil(1000 * Math.random());
    return this.queue["" + t] = [e], -1 === this.timer && this.start(), t;
  }

  remove(e) {
    delete this.queue["" + e], "{}" === JSON.stringify(this.queue) && (this.timer = -1);
  }

  del() {
    this.queue = {}, "{}" === JSON.stringify(this.queue) && (this.timer = -1);
  }

  stop() {
    clearTimeout(this.timer), this.timer = -1;
  }

  start() {
    this.timer > -1 || this.action();
  }

  begin() {
    var that = this;
    this.timer = setTimeout(function () {
      that.action();
    }, 1000);
  }
}
