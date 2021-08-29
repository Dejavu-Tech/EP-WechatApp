Component({
  /**
   * 组件的属性列表
   */
  properties: {
    pickerShow: {
      type: Boolean,
      observer: function (val) { //弹出动画
        // console.log(this.data);
        if (val) {
          let animation = wx.createAnimation({
            duration: 500,
            timingFunction: "ease"
          });
          let animationOpacity = wx.createAnimation({
            duration: 500,
            timingFunction: "ease"
          });
          setTimeout(() => {
            animation.bottom(0).step();
            animationOpacity.opacity(0.7).step();
            this.setData({
              animationOpacity: animationOpacity.export(),
              animationData: animation.export()
            })
          }, 0);
        } else {
          let animation = wx.createAnimation({
            duration: 100,
            timingFunction: "ease"
          });
          let animationOpacity = wx.createAnimation({
            duration: 500,
            timingFunction: "ease"
          });
          animation.bottom(-320).step();
          animationOpacity.opacity(0).step();
          this.setData({
            animationOpacity: animationOpacity.export(),
            animationData: animation.export()
          });
        }

        // 在picker滚动未停止前点确定，会使startValue数组各项归零，发生错误，这里判断并重新初始化
        // 微信新增了picker滚动的回调函数，已进行兼容
        if (this.data.startValue && this.data.endValue) {
          let s = 0,
            e = 0;
          let conf = this.data.config;

          this.data.startValue.map(val => {
            if (val == 0) {
              s++
            }
          })
          this.data.endValue.map(val => {
            if (val == 0) {
              e++;
            }
          });
          let tmp = {
            hour: 4,
            minute: 5,
            second: 6
          }
          let n = tmp[conf.column];
          if (s >= n || e >= n) {
            this.initPick();
            this.setData({
              startValue: this.data.startValue,
              endValue: this.data.endValue,
            });
          }
        }


      }
    },
    config: Object
  },

  /**
   * 组件的初始数据
   */
  data: {
    // pickerShow:true
    // limitStartTime: new Date().getTime()-1000*60*60*24*30,
    // limitEndTime: new Date().getTime(),
    // yearStart:2000,
    // yearEnd:2100
  },
  detached: function () {
    console.log("dele");
  },
  attached: function () {},
  ready: function () {
    this.readConfig();
    this.initPick(this.data.config || null);
    this.setData({
      startValue: this.data.startValue,
      endValue: this.data.endValue,
    });
  },
  /**
   * 组件的方法列表
   */
  methods: {
    //读取配置项
    readConfig() {
      let limitEndTime = new Date().getTime();
      let limitStartTime = new Date().getTime() - 1000 * 60 * 60 * 24 * 30;
      if (this.data.config) {
        let conf = this.data.config;
        if (typeof conf.dateLimit == "number") {
          limitStartTime = new Date().getTime() - 1000 * 60 * 60 * 24 * conf.dateLimit;
        }
        if (conf.limitStartTime) {
          limitStartTime = new Date(conf.limitStartTime.replace(/-/g, '/')).getTime();
        }
        if (conf.limitEndTime) {
          limitEndTime = new Date(conf.limitEndTime.replace(/-/g, '/')).getTime();
        }
        this.setData({
          yearStart: conf.yearStart || 2000,
          yearEnd: conf.yearEnd || 2100,
          endDate: conf.endDate || false,
          dateLimit: conf.dateLimit || false,
          hourColumn: conf.column == "hour" ||
            conf.column == "minute" ||
            conf.column == "second",
          minColumn: conf.column == "minute" || conf.column == "second",
          secColumn: conf.column == "second"
        });
      }

      let limitStartTimeArr = formatTime(limitStartTime);
      let limitEndTimeArr = formatTime(limitEndTime);

      this.setData({
        limitStartTime,
        limitStartTimeArr,
        limitEndTime,
        limitEndTimeArr
      });
    },
    preventD: function () {

    },
    //滚动开始
    handlePickStart: function (e) {
      this.setData({
        isPicking: true
      })
    },
    //滚动结束
    handlePickEnd: function (e) {
      this.setData({
        isPicking: false
      })
    },
    onConfirm: function () {
      //滚动未结束时不能确认
      if (this.data.isPicking) {
        return
      }
      let startTime = new Date(this.data.startPickTime.replace(/-/g, "/"));
      let endTime = new Date(this.data.endPickTime.replace(/-/g, "/"));
      if (startTime <= endTime || !this.data.endDate) {
        this.setData({
          startTime,
          endTime
        });
        let startArr = formatTime(startTime).arr;
        let endArr = formatTime(endTime).arr;
        let format0 = function (num) {
          return num < 10 ? '0' + num : num
        }

        let startTimeBack =
          startArr[0] +
          "-" +
          format0(startArr[1]) +
          "-" +
          format0(startArr[2]) +
          " " +
          (this.data.hourColumn ? format0(startArr[3]) : "00") +
          ":" +
          (this.data.minColumn ? format0(startArr[4]) : "00") +
          ":" +
          (this.data.secColumn ? format0(startArr[5]) : "00");

        let endTimeBack =
          endArr[0] +
          "-" +
          format0(endArr[1]) +
          "-" +
          format0(endArr[2]) +
          " " +
          (this.data.hourColumn ? format0(endArr[3]) : "00") +
          ":" +
          (this.data.minColumn ? format0(endArr[4]) : "00") +
          ":" +
          (this.data.secColumn ? format0(endArr[5]) : "00");

        let time = {
          startTime: startTimeBack,
          endTime: endTimeBack
        };

        //触发自定义事件
        this.triggerEvent("setPickerTime", time);
        this.triggerEvent("hidePicker", {});
      } else {
        wx.showToast({
          icon: "none",
          title: "时间不合理"
        });
      }
    },
    hideModal: function () {
      this.triggerEvent("hidePicker", {});
    },
    changeStartDateTime: function (e) {
      let val = e.detail.value;
      this.compareTime(val, "start");
    },

    changeEndDateTime: function (e) {
      let val = e.detail.value;
      this.compareTime(val, "end");
    },
    //比较时间是否在范围内
    compareTime(val, type) {
      let h = val[3] ? this.data.HourList[val[3]] : "00";
      let m = val[4] ? this.data.MinuteList[val[4]] : "00";
      let s = val[5] ? this.data.SecondList[val[5]] : "00";
      let time =
        this.data.YearList[val[0]] +
        "-" +
        this.data.MonthList[val[1]] +
        "-" +
        this.data.DayList[val[2]] +
        " " +
        h +
        ":" +
        m +
        ":" +
        s;

      let start = this.data.limitStartTime;
      let end = this.data.limitEndTime;
      let timeNum = new Date(time.replace(/-/g, '/')).getTime();
      let year, month, day, hour, min, sec, limitDate;
      let tempArr = []
      if (!this.data.dateLimit) {
        limitDate = [
          this.data.YearList[val[0]],
          this.data.MonthList[val[1]],
          this.data.DayList[val[2]],
          this.data.HourList[val[3]],
          this.data.MinuteList[val[4]],
          this.data.SecondList[val[5]]
        ]
      } else if (type == "start" && timeNum > new Date(this.data.endPickTime.replace(/-/g, '/')) && this.data.config.endDate) {
        limitDate = formatTime(this.data.endPickTime).arr;

      } else if (type == "end" && timeNum < new Date(this.data.startPickTime.replace(/-/g, '/'))) {
        limitDate = formatTime(this.data.startPickTime).arr;

      } else if (timeNum < start) {
        limitDate = this.data.limitStartTimeArr.arr;

      } else if (timeNum > end) {
        limitDate = this.data.limitEndTimeArr.arr;

      } else {
        limitDate = [
          this.data.YearList[val[0]],
          this.data.MonthList[val[1]],
          this.data.DayList[val[2]],
          this.data.HourList[val[3]],
          this.data.MinuteList[val[4]],
          this.data.SecondList[val[5]]
        ]

      }

      year = limitDate[0];
      month = limitDate[1];
      day = limitDate[2];
      hour = limitDate[3];
      min = limitDate[4];
      sec = limitDate[5];

      if (type == "start") {
        this.setStartDate(year, month, day, hour, min, sec);
      } else if (type == "end") {
        //20210528 S
        let monthday = this.getDays(year, month);
        if(day == monthday) {
          if(month<11) {
            month += 1;
            day = 1;
          } else {
            year += 1;
            month = 1;
            day = 1;
          }
        } else {
          day += 1;
        }
        //20210528 E
        this.setEndDate(year, month, day, hour, min, sec);
      }
    },
    getDays: function (year, month) {
      let daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      if (month === 2) {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ?
          29 :
          28;
      } else {
        return daysInMonth[month - 1];
      }
    },
    initPick: function (initData) {
      const date = initData.initStartTime ? new Date(initData.initStartTime.replace(/-/g, '/')) : new Date();
      const endDate = initData.initEndTime ? new Date(initData.initEndTime.replace(/-/g, '/')) : new Date();
      // const startDate = new Date(date.getTime() - 1000 * 60 * 60 * 24);
      const startDate = date;
      const startYear = date.getFullYear();
      const startMonth = date.getMonth() + 1;
      const startDay = date.getDate();
      const startHour = date.getHours();
      const startMinute = date.getMinutes();
      const startSecond = date.getSeconds();

      const endYear = endDate.getFullYear();
      const endMonth = endDate.getMonth() + 1;
      const endDay = endDate.getDate() + 1;
      const endHour = endDate.getHours();
      const endMinute = endDate.getMinutes();
      const endSecond = endDate.getSeconds();

      let YearList = [];
      let MonthList = [];
      let DayList = [];
      let HourList = [];
      let MinuteList = [];
      let SecondList = [];

      //设置年份列表
      for (let i = this.data.yearStart; i <= this.data.yearEnd; i++) {
        YearList.push(i);
      }

      // 设置月份列表
      for (let i = 1; i <= 12; i++) {
        MonthList.push(i);
      }
      // 设置日期列表
      for (let i = 1; i <= 31; i++) {
        DayList.push(i);
      }
      // 设置时列表
      for (let i = 0; i <= 23; i++) {
        if (0 <= i && i < 10) {
          i = "0" + i;
        }
        HourList.push(i);
      }
      // 分|秒
      for (let i = 0; i <= 59; i++) {
        if (0 <= i && i < 10) {
          i = "0" + i;
        }
        MinuteList.push(i);
        SecondList.push(i);
      }

      this.setData({
        YearList,
        MonthList,
        DayList,
        HourList,
        MinuteList,
        SecondList
      });

      this.setStartDate(startYear, startMonth, startDay, startHour, startMinute, startSecond);
      this.setEndDate(endYear, endMonth, endDay, endHour, endMinute, endSecond);

      //!!!
      // setTimeout(() => {
      //   this.setStartDate(nowYear, nowMonth, nowDay, nowHour, nowMinute)
      //   this.setEndDate(nowYear, nowMonth, nowDay, nowHour, nowMinute)
      // }, 0);
    },
    setPickerDateArr(type, year, month, day, hour, minute, second) {
      let yearIdx = 0;
      let monthIdx = 0;
      let dayIdx = 0;
      let hourIdx = 0;
      let minuteIdx = 0;
      let secondIdx = 0;

      this.data.YearList.map((v, idx) => {
        if (parseInt(v) === year) {
          yearIdx = idx;
        }
      });

      this.data.MonthList.map((v, idx) => {
        if (parseInt(v) === month) {
          monthIdx = idx;
        }
      });

      // 重新设置日期列表
      let DayList = [];
      for (let i = 1; i <= this.getDays(year, month); i++) {
        DayList.push(i);
      }

      DayList.map((v, idx) => {
        if (parseInt(v) === day) {
          dayIdx = idx;
        }
      });
      if (type == "start") {
        this.setData({
          startDayList: DayList
        });
      } else if (type == "end") {
        this.setData({
          endDayList: DayList
        });
      }

      this.data.HourList.map((v, idx) => {
        if (parseInt(v) === parseInt(hour)) {
          hourIdx = idx;
        }
      });

      this.data.MinuteList.map((v, idx) => {
        if (parseInt(v) === parseInt(minute)) {
          minuteIdx = idx;
        }
      });
      this.data.SecondList.map((v, idx) => {
        if (parseInt(v) === parseInt(second)) {
          secondIdx = idx;
        }
      });

      return {
        yearIdx,
        monthIdx,
        dayIdx,
        hourIdx,
        minuteIdx,
        secondIdx
      };
    },
    setStartDate: function (year, month, day, hour, minute, second) {
      let pickerDateArr = this.setPickerDateArr(
        "start",
        year,
        month,
        day,
        hour,
        minute,
        second
      );
      this.setData({
        startYearList: this.data.YearList,
        startMonthList: this.data.MonthList,
        // startDayList: this.data.DayList,
        startHourList: this.data.HourList,
        startMinuteList: this.data.MinuteList,
        startSecondList: this.data.SecondList,
        startValue: [
          pickerDateArr.yearIdx,
          pickerDateArr.monthIdx,
          pickerDateArr.dayIdx,
          pickerDateArr.hourIdx,
          pickerDateArr.minuteIdx,
          pickerDateArr.secondIdx
        ],
        startPickTime: this.data.YearList[pickerDateArr.yearIdx] +
          "-" +
          this.data.MonthList[pickerDateArr.monthIdx] +
          "-" +
          this.data.DayList[pickerDateArr.dayIdx] +
          " " +
          this.data.HourList[pickerDateArr.hourIdx] +
          ":" +
          this.data.MinuteList[pickerDateArr.minuteIdx] +
          ":" +
          this.data.SecondList[pickerDateArr.secondIdx]
      });
    },
    setEndDate: function (year, month, day, hour, minute, second) {
      let pickerDateArr = this.setPickerDateArr(
        "end",
        year,
        month,
        day,
        hour,
        minute,
        second
      );

      this.setData({
        endYearList: this.data.YearList,
        endMonthList: this.data.MonthList,
        // endDayList: this.data.DayList,
        endHourList: this.data.HourList,
        endMinuteList: this.data.MinuteList,
        endSecondList: this.data.SecondList,
        endValue: [
          pickerDateArr.yearIdx,
          pickerDateArr.monthIdx,
          pickerDateArr.dayIdx,
          pickerDateArr.hourIdx,
          pickerDateArr.minuteIdx,
          pickerDateArr.secondIdx
        ],
        endPickTime: this.data.YearList[pickerDateArr.yearIdx] +
          "-" +
          this.data.MonthList[pickerDateArr.monthIdx] +
          "-" +
          this.data.DayList[pickerDateArr.dayIdx] +
          " " +
          this.data.HourList[pickerDateArr.hourIdx] +
          ":" +
          this.data.MinuteList[pickerDateArr.minuteIdx] +
          ":" +
          this.data.SecondList[pickerDateArr.secondIdx]
      });
    },
  }
});


function formatTime(date) {

  if (typeof date == 'string' || 'number') {
    try {
      date = date.replace(/-/g, '/') //兼容ios
    } catch (error) {}
    date = new Date(date)
  }

  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return {
    str: [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':'),
    arr: [year, month, day, hour, minute, second]
  }
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}