exports.default = class {
  constructor(name) {
    this.queue = {};
    this.timer = -1;
  }

  action = () => {
    if (Object.keys(this.queue).length) {
      Object.values(this.queue).forEach(([fn]) => fn());
      this.timer = -1;
      this.begin();
    } else {
      this.stop();
    }
  }

  add = (e) => {
    const t = `${Date.now()}${Math.ceil(1000 * Math.random())}`;
    this.queue[t] = [e];
    if (this.timer === -1) this.start();
    return t;
  }

  remove = (e) => {
    delete this.queue[e];
    if (!Object.keys(this.queue).length) this.timer = -1;
  }

  del = () => {
    this.queue = {};
    if (!Object.keys(this.queue).length) this.timer = -1;
  }

  stop = () => {
    clearTimeout(this.timer);
    this.timer = -1;
  }

  start = () => {
    if (this.timer === -1) this.action();
  }

  begin = () => {
    this.timer = setTimeout(this.action, 1000);
  }
}