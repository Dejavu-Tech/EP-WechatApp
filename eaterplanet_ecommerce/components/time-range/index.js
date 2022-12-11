let minutes = [];
for (let i = 0; i <= 59; i++) {
	if (i < 10) {
		i = '0' + i;
	}
	minutes.push(i);
}

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    show: {
			type: Boolean,
			value: false
		},
		beginTime: {
			type: String,
			value: ""
    },
    isOne: {
			type: Boolean,
			value: false
		},
		endTime: {
			type: String,
			default: ""
		},
		remark: {
			type: Object,
			default: ""
		}
  },

  /**
   * 组件的初始数据
   */
  data: {
    value: '', //默认结束开始时间
    hoursList: ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'],
    minutes,
    second: minutes
  },

  attached() {
    let { beginTime, endTime } = this.data;
    let value = "";
		if(beginTime||endTime) {
			let beginArr = beginTime.split(':');
			let endArr = endTime.split(':');
			value = [
				beginArr[0]*1,
				beginArr[1]*1,
				beginArr[2]*1,
				0,
				endArr[0]*1,
				endArr[1]*1,
				endArr[2]*1,
			];
		} else {
			let timestamp = Date.parse(new Date());
			let myDate = new Date();
			let nextDate = new Date(timestamp+1000);
			value = [
				myDate.getHours(),
				myDate.getMinutes(),
				myDate.getSeconds(),
				0,
				nextDate.getHours(),
				nextDate.getMinutes(),
				nextDate.getSeconds()
			];
    }
    this.setData({ value })
  },

  /**
   * 组件的方法列表
   */
  methods: {
    confirm() {
			let { value, hoursList } = this.data;
			let time = hoursList[value[0]*1] + ':' + minutes[value[1]*1]  + ':' + minutes[value[2]*1] + '~' + hoursList[value[4]*1] + ':' + minutes[value[5]*1] + ':' + minutes[value[6]*1];
      if(this.data.isOne) {
        time = hoursList[value[0]*1] + ':' + minutes[value[1]*1]  + ':' + minutes[value[2]*1];
      }
      this.triggerEvent('confrim', { time, remark: this.data.remark });
		},
		cancel() {
			let { value, hoursList } = this.data;
			let time = hoursList[value[0]*1] + ':' + minutes[value[1]*1]  + ':' + minutes[value[2]*1] + '~' + hoursList[value[4]*1] + ':' + minutes[value[5]*1] + ':' + minutes[value[6]*1];
      if(this.data.isOne) {
        time = hoursList[value[0]*1] + ':' + minutes[value[1]*1]  + ':' + minutes[value[2]*1];
      }
      this.triggerEvent('cancel', { time, remark: this.data.remark });
		},
		getime(e) {
			let val = e.detail.value;
			let sh = this.data.hoursList[val[0]];
			let sm = this.data.minutes[val[1]];
			let ss = this.data.minutes[val[2]];
			let eh = this.data.hoursList[val[4]];
			let em = this.data.minutes[val[5]];
			let es = this.data.minutes[val[6]];
      // 比较前后时间
      if(!this.data.isOne) {
        if (sh * 1 > eh * 1) {
          sh = eh;
          sm = 0;
          ss = 0;
          es = 1;
        } else if (sh * 1 == eh * 1) {
          if (sm * 1 > em * 1) {
            sm = em;
          } else if (sm * 1 == em * 1) {
            if (ss * 1 >= es * 1) {
              if (es > 0) {
                ss = es - 1;
              } else {
                if (sm > 0) {
                  sm = sm * 1 - 1;
                  ss = 0;
                } else {
                  if (sh > 0) {
                    sh = sh * 1 - 1;
                    sm = 0;
                    ss = 0;
                  } else {
                    sh = 0;
                    sm = 0;
                    ss = 0;
                    es = 1;
                  }
                }
              }
            }
          }
        }
      }
      this.setData({
        value: [sh, sm, ss, '0', eh, em, es]
      })
		}
  }
})
