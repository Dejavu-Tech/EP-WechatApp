Object.defineProperty(exports, "__esModule", {
  value: true
});

const formatTime = (date) => ({
  year: date.getFullYear(),
  month: date.getMonth() + 1,
  day: date.getDate(),
  hour: date.getHours(),
  minute: date.getMinutes(),
  second: date.getSeconds(),
  weekday: date.getDay()
});

const formatNumber = (n) => n.toString().padStart(2, '0');

const formatYMDLocal = (date) => {
  const { year, month, day } = formatTime(date);
  return `${year}/${formatNumber(month)}/${formatNumber(day)}`;
};

const formatYMD = (date) => {
  const { year, month, day } = formatTime(date);
  return `${year}-${formatNumber(month)}-${formatNumber(day)}`;
};

const formatHMS = (date) => {
  const { hour, minute, second } = formatTime(date);
  return `${formatNumber(hour)}:${formatNumber(minute)}:${formatNumber(second)}`;
};

const formatWithoutSecond = (date) => {
  const { year, month, day, hour, minute } = formatTime(date);
  return `${year}-${formatNumber(month)}-${formatNumber(day)} ${formatNumber(hour)}:${formatNumber(minute)}`;
};

const formatFull = (date) => {
  const { year, month, day, hour, minute, second } = formatTime(date);
  return `${year}-${formatNumber(month)}-${formatNumber(day)} ${formatNumber(hour)}:${formatNumber(minute)}:${formatNumber(second)}`;
};

const formatMD = (date) => {
  const { month, day } = formatTime(date);
  return `${formatNumber(month)}月${formatNumber(day)}日`;
};

const formatYMDPoint = (date) => {
  const { year, month, day } = formatTime(date);
  return `${year}.${formatNumber(month)}.${formatNumber(day)}`;
};

const formatYMDHMPoint = (date) => {
  const { year, month, day, hour, minute } = formatTime(date);
  return `${year}.${formatNumber(month)}.${formatNumber(day)} ${formatNumber(hour)}:${formatNumber(minute)}`;
};

const formatMDHM = (date) => {
  const { month, day, hour, minute } = formatTime(date);
  return `${formatNumber(month)}.${formatNumber(day)} ${formatNumber(hour)}:${formatNumber(minute)}`;
};

const formatWeekday = (date) => {
  const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  const { weekday } = formatTime(date);
  return weekdays[weekday];
};

const getBeginTime = (startTime, endTime) => {
  const nextDay = new Date(new Date(endTime).getTime() + 86400000);
  nextDay.setHours(0, 0, 0, 0);
  const nextDayTime = nextDay.getTime();
  const { hour, minute } = formatTime(new Date(startTime));
  const formattedTime = `${formatNumber(hour)}:${formatNumber(minute)}`;

  if (nextDayTime > startTime) {
    return `今日${formattedTime}开抢`;
  } else if (nextDayTime < startTime && nextDayTime + 86400000 > startTime) {
    return `明日${formattedTime}开抢`;
  } else {
    return "即将开抢";
  }
};

exports.formatTime = formatTime;
exports.formatYMDLocal = formatYMDLocal;
exports.formatYMD = formatYMD;
exports.formatHMS = formatHMS;
exports.formatWithoutSecond = formatWithoutSecond;
exports.formatFull = formatFull;
exports.formatMD = formatMD;
exports.formatYMDPoint = formatYMDPoint;
exports.formatYMDHMPoint = formatYMDHMPoint;
exports.formatMDHM = formatMDHM;
exports.formatWeekday = formatWeekday;
exports.getBeginTime = getBeginTime;
exports.formatNumber = formatNumber;