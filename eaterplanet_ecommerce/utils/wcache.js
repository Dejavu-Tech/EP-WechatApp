const dtime = '_deadtime';

const put = (k, v, t) => {
  wx.setStorageSync(k, v);
  const seconds = parseInt(t);
  if (seconds > 0) {
    const timestamp = Math.floor(Date.now() / 1000) + seconds;
    wx.setStorageSync(k + dtime, timestamp.toString());
  } else {
    wx.removeStorageSync(k + dtime);
  }
};

const get = (k, def) => {
  const deadtime = parseInt(wx.getStorageSync(k + dtime));
  if (deadtime && deadtime < Math.floor(Date.now() / 1000)) {
    wx.removeStorageSync(k);
    wx.removeStorageSync(k + dtime);
    return def;
  }
  const res = wx.getStorageSync(k);
  return res !== '' ? res : def;
};

const remove = (k) => {
  wx.removeStorageSync(k);
  wx.removeStorageSync(k + dtime);
};

const clear = () => {
  wx.clearStorageSync();
};

module.exports = {
  put,
  get,
  remove,
  clear,
};