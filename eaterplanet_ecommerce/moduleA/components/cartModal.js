var app = getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    show: {
      type: Boolean,
      value: false
    },
    carts: {
      type: Object || Array,
      value: {}
    },
    soliId: {
      type: Number,
      value: 0
    },
    stitle: {
      type: String,
      value: '已选商品'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    token: '',
    community: ''
  },

  attached: function(){
    var token = wx.getStorageSync('token');
    var community = wx.getStorageSync('community');
    this.setData({
      token,
      community
    })
  },

  /**
   * 组件的方法列表
   */
  methods: {
    changeNumber: function(e){
      let that = this;
      let cartId = e.currentTarget.dataset.cartid; //购物车商家索引
      let gidx = e.currentTarget.dataset.gidx; //商品索引
      let num = e.detail.value; //改变后数量
      if (num==0) {
        this.cofirm_del(cartId, gidx);
      } else {
        let carts = that.data.carts;
        let lastGoodsNum = carts[cartId].shopcarts[gidx].goodsnum; //记录上次数量
        carts[cartId].shopcarts[gidx].goodsnum = num;
        this.setData({ carts },()=>{
          that.go_record().then(() => {
            that.triggerEvent('changeCart', carts);
          }).catch(() => {
            carts[cartId].shopcarts[gidx].goodsnum = lastGoodsNum;
            that.setData({ carts })
          });
        })
      }
    },
    handleModal: function(){
      console.log('关闭购物车弹窗')
      this.triggerEvent('hideModal');
    },
    /**
     * 确认删除提示框
     */
    cofirm_del: function (parentid, index) {
      let that = this;
      wx.showModal({
        title: '提示',
        content: '确定删除这件商品吗？',
        confirmColor: '#FF0000',
        success: function (res) {
          if (res.confirm) {
            let carts = that.data.carts;
            let goodsItem = carts[parentid].shopcarts[index];
            let del_car_keys = goodsItem.key;
            carts[parentid].shopcarts.splice(index, 1);
            that.setData({ carts })
            that.del_car_goods(del_car_keys);
          } else {
            console.log('取消删除')
          }
        }
      })
    },

    /**
     * 删除商品
     */
    del_car_goods: function (carkey) {
      var that = this;
      console.log('del_car_goods:开始');
      let { token, community } = this.data;
      let community_id = community.communityId;
      app.util.request({
        url: 'entry/wxapp/index',
        data: {
          controller: 'car.del_car_goods',
          carkey,
          community_id,
          token
        },
        method: 'POST',
        dataType: 'json',
        success: function (msg) {
          if (msg.data.code == 0) {
            that.triggerEvent('changeCart', that.data.carts);
          }
        }
      })
    },

    //记录购物车状态值，为了下次进来还是和上次一样
    go_record: function () {
      var that = this;
      return new Promise(function (resolve, reject) {
        let { carts, token, community, soliId } = that.data;
        var keys_arr = [];
        var all_keys_arr = [];
        let community_id = community.communityId;
        for (var i in carts) {
          for (var j in carts[i]['shopcarts']) {
            keys_arr.push(carts[i]['shopcarts'][j]['key']);
            all_keys_arr.push(carts[i]['shopcarts'][j]['key'] + '_' + carts[i]['shopcarts'][j]['goodsnum']);
          }
        }
        app.util.request({
          url: 'entry/wxapp/index',
          data: {
            controller: 'car.checkout_flushall',
            token,
            car_key: keys_arr,
            community_id,
            all_keys_arr,
            buy_type: 'soitaire',
            soli_id: soliId
          },
          method: 'POST',
          dataType: 'json',
          success: function (msg) {
            if (msg.data.code == 0) {
              resolve();
            } else {
              wx.showToast({
                title: msg.data.msg,
                icon: 'none',
                duration: 2000
              })
              reject();
            }
          }
        })
      })
    }
  }
})
