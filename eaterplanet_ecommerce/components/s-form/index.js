import WxValidate from '../../utils/WxValidate.js';

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    formData: {
      type: Object,
      value: {}
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    form: {},
    formList: [],
    dateParams: {
      year: true,
      month: true,
      day: true,
      hour: false,
      minute: false,
      second: false
    },
    rules: {},
    time: "12:00",
  },

  attached() {
    let formList = this.data.formData.form_list || [];
    let form = {};
    let fileList = [];
    let rules = {};
    let messages = {};
    Object.keys(formList).length && Object.keys(formList).forEach((index) => {
      let item = formList[index];
      let formKey = item.type + '_' + item.random_code;
      form[formKey] = '';
      fileList.push([]);

      let message = "请填写正确的" + item.title;
      if(item.type=='image') {
        message = "请上传"+item.title;
      }
      if(item.type=='select') {
        item.index = -1;
        message = "请选择"+item.title;
      }
      if(item.type=='area') {
        item.region = [ item.province_id, item.city_id, item.country_id];
        form[formKey] = item.region.join(",");
        message = "请选择"+item.title;
      }
      if(item.type=='date') {
        if(item.date_type=="appoint_date") {
          item.default_time = item.appoint_date;
          form[formKey] = item.appoint_date;
        } else if(item.date_type=="same_day") {
          item.default_time = new Date().toLocaleDateString();
          form[formKey] = item.default_time;
        }
        message = "请选择"+item.title;
      }
      if(item.type=='date_range') {
        if(item.begin_date_type=="appoint_date") {
          item.default_begin_date = item.begin_appoint_date;
        } else if(item.begin_date_type=="same_day") {
          let cur_date = this.getDate();
          item.default_begin_date = cur_date;
        }
        if(item.end_date_type=="appoint_date") {
          item.default_end_date = item.end_appoint_date;
        } else if(item.end_date_type=="same_day") {
          let cur_date = this.getDate();
          item.default_end_date = cur_date;
        }
        if(item.default_begin_date&&item.default_end_date) {
          form[formKey] = item.default_begin_date+'~'+item.default_end_date;
        }
        item.pickerConfig = {
          endDate: true,
          column: "day",
          dateLimit: true,
          initStartTime: item.default_begin_date,
          initEndTime: item.default_end_date,
          limitStartTime: "2015-05-06",
          limitEndTime: "2065-05-06"
        }
        message = "请选择"+item.title;
      }
      if(item.type=='time') {
        let myDate = new Date();
        if(item.time_type=="appoint_time") {
          item.default_time = item.appoint_time;
          form[item.type+'_'+item.random_code] = item.appoint_time;
        } else if(item.time_type=="same_time") {
          item.default_time = myDate.getHours()+':'+myDate.getMinutes()+':'+myDate.getSeconds();
          form[item.type+'_'+item.random_code] = item.default_time;
        }
        message = "请选择"+item.title;
      }
      if(item.type=='time_range') {
        let myDate = new Date();
        item.beginTime = "";
        item.endTime = "";
        if(item.begin_time_type=="appoint_time") {
          item.beginTime = item.begin_appoint_time;
        } else if(item.begin_time_type=="same_time") {
          item.beginTime = myDate.getHours()+':'+myDate.getMinutes()+':'+myDate.getSeconds();
        }
        if(item.end_time_type=="appoint_time") {
          item.endTime = item.end_appoint_time;
        } else if(item.end_time_type=="same_time") {
          let timestamp = Date.parse(new Date());
          let nextDate = new Date(timestamp+1000);
          item.endTime = nextDate.getHours()+':'+nextDate.getMinutes()+':'+nextDate.getSeconds();
        }
        if(item.beginTime&&item.endTime) form[item.type+'_'+item.random_code] = item.beginTime+'~'+item.endTime;
        message = "请选择"+item.title;
      }

      //手机格式验证
      if(item.type=='telephone'&&item.required==1) {
        rules[formKey] = {
          required: Boolean(item.required),
          tel: true
        }
        messages[formKey] = {
          required: message,
          tel: message
        }
      } else if (item.type=='idcard'&&item.required==1) {
        rules[formKey] = {
          required: Boolean(item.required),
          idcard: true
        }
        messages[formKey] = {
          required: message,
          idcard: message
        }
      } else {
        rules[formKey] = {
          required: Boolean(item.required)
        }
        messages[formKey] = {
          required: message
        }
      }

      item.show = false;
    })

    this.setData({
      form,
      formList,
      fileList,
      formList,
      rules
    })
    console.log(rules)
    this.WxValidate = new WxValidate(rules, messages)
  },

  /**
   * 组件的方法列表
   */
  methods: {
    getDate() {
      let myDate = new Date();
      let y = myDate.getFullYear();
      let m = myDate.getMonth()+1;
      let d = myDate.getDate();
      m = m>10?m:'0'+m;
      d = d>10?d:'0'+d;
      return y+'-'+m+'-'+d;
    },
    changeImg: function (e) {
      // console.log(e.detail)
      let key = e.detail.key;
      let form = this.data.form;
      form[key] = e.detail.value.join(",");
      this.setData({
        form
      })
    },
    bindPickerChange(e) {
      // console.log(e)
      let idx = e.currentTarget.dataset.idx || "";
      let value = e.detail.value;
      let { form, formList } = this.data;
      let item = formList[idx];
      let key = item.type+'_'+item.random_code;
      item.index = value;
      formList[idx] = item;
      form[key] = item.option_val[value];
      this.setData({
        form,
        formList
      })
    },
    radioChange(e) {
      // console.log(e)
      let key = e.currentTarget.dataset.idx || "";
      let value = e.detail.value;
      let form = this.data.form;
      form[key] = value;
      // console.log(form)
      this.setData({
        form
      })
    },
    checkboxChange(e) {
      // console.log(e)
      let key = e.currentTarget.dataset.idx || "";
      let value = e.detail.value;
      let form = this.data.form;
      form[key] = value.join(",");
      // console.log(form)
      this.setData({
        form
      })
    },
    bindRegionChange(e) {
      // console.log(e)
      let idx = e.currentTarget.dataset.idx || "";
      let value = e.detail.value;
      let { form, formList } = this.data;
      let item = formList[idx];
      let key = item.type+'_'+item.random_code;
      item.region = value;
      formList[idx] = item;
      form[key] = value.join(",");
      this.setData({
        form,
        formList
      })
    },
    bindDateChange(e) {
      // console.log(e)
      let key = e.currentTarget.dataset.idx || "";
      let form = this.data.form;
      form[key] = e.detail.value;
      // console.log(form)
      this.setData({
        form
      })
    },
    bindKeyInput(e) {
      // console.log(e)
      let key = e.currentTarget.dataset.idx || "";
      let form = this.data.form;
      form[key] = e.detail.value;
      // console.log(form)
      this.setData({
        form
      })
    },
    showDateRange(e) {
      let idx = e.currentTarget.dataset.idx || "";
      let formList = this.data.formList;
      formList[idx].show = !formList[idx].show;
      this.setData({
        formList
      })
    },
    pickerHide(e) {
      // console.log(e)
      let idx = e.currentTarget.dataset.idx || "";
      let formList = this.data.formList;
      formList[idx].show = !formList[idx].show;
      this.setData({
        formList
      })
    },
    setPickerTime(e) {
      // console.log(e)
      let key = e.currentTarget.id || "";
      let form = this.data.form;
      let startTime = e.detail.startTime.slice(0, -9);
      let endTime = e.detail.endTime.slice(0, -9);
      form[key] = startTime + '~' + endTime;
      this.setData({
        form
      })
    },
    showTimeRange(e) {
      let idx = e.currentTarget.dataset.idx || "";
      let formList = this.data.formList;
      formList[idx].show = !formList[idx].show;
      this.setData({
        formList
      })
    },
    timeRangeConfirm(e) {
      // console.log(e)
      let idx = e.currentTarget.dataset.idx || "";
      let value = e.detail.time;
      let { form, formList } = this.data;
      let item = formList[idx];
      let key = item.type+'_'+item.random_code;
      item.show = false;
      formList[idx] = item;
      form[key] = value;
      this.setData({
        form,
        formList
      })
    },
    formSubmit(e) {
      const form = this.data.form
      console.log('form发生了submit事件，携带数据为：', form)
      //校验表单
      if (!this.WxValidate.checkForm(form)) {
        const error = this.WxValidate.errorList[0];
        wx.showToast({
          title: error.msg,
          icon: "none"
        })
        return false;
      } else {
        console.log('验证成功');
        let {formData, form, formList} = this.data;
        let allform_list = [];
        formList.forEach(item=>{
          let params = {
            title: item.title,
            type: item.type,
            item_value: form[item.type+'_'+item.random_code],
            random_code: item.random_code
          }
          allform_list.push(params);
        })
        console.log(allform_list);
        let formParams = {
          allform_id: formData.order_allform_id,
          allform_list: JSON.stringify(allform_list)
        };
        this.triggerEvent('success', formParams)
      }
    }
  }
})