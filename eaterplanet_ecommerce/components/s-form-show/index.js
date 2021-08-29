// eaterplanet_ecommerce/s-form-show/index.js
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
    formList: []
  },

  attached() {
    let formList = this.data.formData.form_list || [];
    this.setData({
      formList
    })
  },

  /**
   * 组件的方法列表
   */
  methods: {
    prevImg: function(e){
      let current = e.currentTarget.dataset.current;
      let urls = e.currentTarget.dataset.urls;
      wx.previewImage({
        current, // 当前显示图片的http链接
        urls // 需要预览的图片http链接列表
      })
    },
  }
})
