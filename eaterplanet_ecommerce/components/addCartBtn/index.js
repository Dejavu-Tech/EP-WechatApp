Component({
  externalClasses: ['i-class'],
  properties: {
    fontsize: {
      type: Number,
      value: 24
    }
  },
  data: {
    skin: getApp().globalData.skin,
  },

  attached(){
    this.setData({
      skin: getApp().globalData.skin,
    })
  }
})
