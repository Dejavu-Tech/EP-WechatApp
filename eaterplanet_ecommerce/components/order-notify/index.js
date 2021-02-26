let app = getApp();
var ctime = null;

Component({
  externalClasses: ["i-class"],
  properties: {
    stopNotify: {
      type: Boolean,
      value: true,
      observer: function(t){
        t ? (clearInterval(ctime), ctime = null) : this._startReq();
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    userInfo: '',
    hide: false,
    order_id: 0
  },

  pageLifetimes: {
    hide: function() {
      console.log('notify hide')
      clearInterval(ctime), ctime = null;
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _startReq: function(){
      var that = this;
      ctime = setInterval(function(){
        that.getOrderNotify();
      }, 3000);
    },
    getOrderNotify: function (){
      let that = this;
      app.util.request({
        'url': 'entry/wxapp/index',
        'data': {
          controller: 'goods.notify_order'
        },
        dataType: 'json',
        success: function (res) {
          if (res.data.code == 0) {
            let username = res.data.username;
            let avatar = res.data.avatar;
            let order_id = res.data.order_id;
            let userInfo = { username, avatar }
            if (that.data.order_id != order_id){
              that.setData({
                hide: false,
                userInfo,
                order_id
              })
              setTimeout(() => {
                that.setData({ hide: true });
              }, 5000)
            } else {
              !that.data.hide && setTimeout(() => {
                that.setData({ hide: true });
              }, 5000)
            }
          }
        }
      })
    }
  }
})
