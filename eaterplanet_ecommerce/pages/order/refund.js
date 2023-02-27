// pages/order/refund.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    xarray: ['点击选择退款理由', '商品有质量问题', '没有收到货', '商品少发漏发发错', '商品与描述不一致', '收到商品时有划痕或破损', '质疑假货', '其他'],
    index: 0,
    refund_type: 1,
    refund_imgs: [],
    complaint_mobile: '',
    refund_thumb_imgs: [],
    complaint_desc: '',
    order_id: 0,
    order_status_id: -1,
    complaint_name: '',
    ref_id: 0,
    complaint_money: 0,
    refund_money: 0,
    selArr: [],
    refund_score: 0,
    can_shipping_fare: 0
  },
  canRefund: true,
    handlerGobackClick(delta) {
    const pages = getCurrentPages();
    if (pages.length >= 2) {
      wx.navigateBack({
        delta: delta
      });
    } else {
      wx.switchTab({
        url: '/eaterplanet_ecommerce/pages/index/index'
      });
    }
  },
  handlerGohomeClick(url) {
    wx.switchTab({
      url: '/eaterplanet_ecommerce/pages/index/index'
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let { id, order_goods_id, ref_id, delivery } = options;
    let that = this;
    this.setData({ 
        order_id: id || 0,
        order_goods_id: order_goods_id || 0,
        ref_id: ref_id || 0,
        delivery: delivery || ''
      }, ()=> { 
        that.getData();
    })
  },

  bindPickerChange: function (e) {
    this.setData({
      index: e.detail.value
    })
  },

  choseImg: function () {
    var self = this;
    var refund_imgs = this.data.refund_imgs;
    if (refund_imgs.length >= 3) {
      wx.showToast({
        title: '最多三张图片',
        icon: 'success',
        duration: 1000
      })
      return false;
    }

    wx.chooseMedia({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        const tempFiles = res.tempFiles;

        wx.showLoading({
          title: '上传中',
        })
        
        wx.uploadFile({
          url: app.util.url('entry/wxapp/index', {'m':'eaterplanet_ecommerce','controller':'goods.doPageUpload'}), //仅为示例，非真实的接口地址
          filePath: tempFiles[0].tempFilePath,
          name: 'upfile',
          formData: {
            'name': tempFiles[0].tempFilePath
          },
          header: {
            'content-type': 'multipart/form-data'
          },
          success: function (res) {
            wx.hideLoading();
            var data = JSON.parse(res.data);
            var image_thumb = data.image_thumb;
            var orign_image = data.image_o;
            var new_img = self.data.refund_imgs;
            var new_thumb_img = self.data.refund_thumb_imgs;
            new_img.push(orign_image);
            new_thumb_img.push(image_thumb);
            self.setData({
              refund_thumb_imgs: new_thumb_img,
              refund_imgs: new_img
            })
          }
        })
      }
    })
  },

  chose_type: function (event) {
    let stype = event.currentTarget.dataset.rel;
    this.setData({
      refund_type: stype
    })
  },

  cancle_img: function (event) {
    let sr = event.currentTarget.dataset.sr;
    var j = 0;
    var refund_imgs = this.data.refund_imgs;
    var refund_thumb_imgs = this.data.refund_thumb_imgs;
    var new_refund_imgs = [];
    var new_refund_thumb_imgs = [];
    for (var i in refund_thumb_imgs) {
      if (refund_thumb_imgs[i] == sr) {
        console.log('find');
        j = i;
      } else {
        new_refund_thumb_imgs.push(refund_thumb_imgs[i]);
      }
    }

    for (var i in refund_imgs) {
      if (i != j) {
        new_refund_imgs.push(refund_imgs[i]);
      }
    }
    this.setData({
      refund_thumb_imgs: new_refund_thumb_imgs,
      refund_imgs: new_refund_imgs
    })
    console.log(new_refund_thumb_imgs.length);
    console.log(new_refund_imgs.length);
  },
  
  wenti_input: function (event) {
    var content = event.detail.value;
    //pinjia_text
    this.setData({
      complaint_desc: content
    })
  },

  mobile_input: function (event) {
    var content = event.detail.value;
    this.setData({
      complaint_mobile: content
    })
  },

  name_input: function (event) {
    var content = event.detail.value;
    this.setData({
      complaint_name: content
    })
  },

  refund_money_input: function (event) {
    var content = parseFloat(event.detail.value);
    let refund_money = this.data.refund_money;
    let data = {};
    if (content > refund_money) {
      let tip = `最大退款金额为${refund_money}`;
      if(this.data.order_goods.type=='integral') { tip = `最大可退积分为${refund_money}` }
      wx.showToast({
        title: tip,
        icon: 'none',
        duration: 1000
      })
      content = refund_money;
      data.refund_money = refund_money;
    }
    data.complaint_money = content ? content : 0;
    this.setData(data)
  },

  sub_refund: function () {
    let that = this;
    if (!that.canRefund) return;
    console.log(that.canRefund)
    let {
      index,
      xarray,
      order_id, 
      order_goods_id, 
      refund_type, 
      refund_imgs, 
      complaint_desc, 
      complaint_mobile,
      total,
      complaint_name,
      complaint_money,
      // refund_money,
      ref_id,
      real_refund_quantity
    } = this.data;

    complaint_money = parseFloat(complaint_money);

    if(real_refund_quantity<=0) {
      this.errorToast('请选择退款商品');
      return false;
    }

    if (index == 0) {
      this.errorToast('请选择问题类型');
      return false;
    }
    var rfund_name = xarray[index];

    if (complaint_money < 0) {
      this.errorToast('请填写正确退款金额');
      return false;
    }

    if (complaint_money > total) complaint_money = total;

    if (complaint_desc == '') {
      this.errorToast('请填写正确问题描述');
      return false;
    }

    if (complaint_name == '') {
      this.errorToast('请填写正确联系人');
      return false;
    }

    if (complaint_mobile == '') {
      this.errorToast('请填写正确手机号');
      return false;
    }
    var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(16[0-9]{1})|(17[0-9]{1})|(18[0-9]{1})|(19[0-9]{1}))+\d{8})$/;
    if (!myreg.test(complaint_mobile)) {
      this.errorToast('请填写正确手机号');
      return false;
    }

    let complaint_shipping_fare = this.data.order_goods.shipping_fare;
    that.canRefund = false;
    var token = wx.getStorageSync('token');
    app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'afterorder.refund_sub',
        token,
        ref_id,
        order_id, 
        order_goods_id,
        complaint_type: refund_type,
        complaint_images: refund_imgs, 
        complaint_desc, 
        complaint_mobile, 
        complaint_reason: rfund_name, 
        complaint_money,
        complaint_name,
        real_refund_quantity,
        complaint_shipping_fare
      },
      method: 'POST',
      dataType: 'json',
      success: function (msg) {
        wx.hideLoading();
        if (msg.data.code == 3) {
          wx.showToast({
            title: '未登录',
            icon: 'loading',
            duration: 1000
          })
        }
        else if (msg.data.code == 0) {
          wx.showToast({
            title: msg.data.msg,
            icon: 'success',
            duration: 1000
          })
          return;
        } else {
          wx.showToast({
            title: '申请成功',
            icon: 'success',
            duration: 3000,
            success: function (res) {
              wx.redirectTo({
                url: "/eaterplanet_ecommerce/pages/order/order?id=" + that.data.order_id + '&delivery='+that.data.delivery
              })
            }
          })
        }
      },
      complete: ()=>{
        setTimeout(()=>{
          that.canRefund = true;
        }, 1500)
      }
    })
  },

  errorToast: function(msg) {
    wx.showToast({
      title: msg,
      icon: 'none',
      duration: 1000
    })
  },

  /**
   * 获取详情 20190711
   */
  getData: function () {
    const token = wx.getStorageSync('token');
    var that = this;
    const { order_id, order_goods_id, ref_id } = this.data;

    app.util.request({
      'url': 'entry/wxapp/index',
      'data': {
        controller: 'afterorder.get_order_money',
        token: token,
        order_id,
        order_goods_id,
        ref_id
      },
      dataType: 'json',
      success: function (res) {
        if (res.data.code == 1) {
          const { order_goods, order_status_id, refund_image, refund_info, shipping_name, shipping_tel, total } = res.data;
          let xarray = that.data.xarray;
          let ref_name = refund_info.ref_name;
          let index = xarray.findIndex((item) => (item == ref_name));
          index = (index <= 0) ? 0 : index;

          let { ref_description, ref_mobile, complaint_name, ref_money } = refund_info;

          //商品数量
          let { quantity, has_refund_quantity, has_refund_money, type, total_score } = order_goods;
          let selArr = new Array(parseInt(quantity));
          has_refund_quantity = parseInt(has_refund_quantity);
          for(let i=0; i<selArr.length; i++){
            if(i>=has_refund_quantity) {
              selArr[i] = { isselect: true, isrefund: false };
            } else {
              selArr[i] = { isselect: true, isrefund: true };
            }
          }

          let can_refund_money = (total*1 - has_refund_money*1).toFixed(2);
          if(type=='integral') can_refund_money = (total_score*1 - has_refund_money*1).toFixed(2);

          let real_refund_quantity = parseInt(quantity) - has_refund_quantity;

          let can_shipping_fare = real_refund_quantity*order_goods.shipping_fare/parseInt(quantity);

          if(order_goods && order_goods.price) {
            order_goods.price = (order_goods.price*1).toFixed(2);
          }

          that.setData({
            order_goods,
            order_status_id,
            refund_image,
            refund_info,
            shipping_name,
            shipping_tel,
            total: can_refund_money,
            index: index || 0,
            complaint_desc: ref_description || '',
            complaint_mobile: ref_mobile || shipping_tel,
            complaint_name: complaint_name || shipping_name,
            complaint_money: ref_money || can_refund_money,
            refund_money: ref_money || can_refund_money,
            selArr,
            real_refund_quantity,
            max_can_refund: ref_money || can_refund_money,
            can_shipping_fare: can_shipping_fare.toFixed(2)
          })
        } else if (res.data.code == 3) {
          //un login
        }
      }
    })
  },

  goodsselect: function(e) {
    let idx = e.target.dataset.idx;
    let { selArr, order_goods, total } = this.data;
    let selItem = { isselect: !selArr[idx].isselect, isrefund: selArr[idx].isrefund};
    selArr[idx] = selItem;

    // 均分计算可退款金额
    let totNum = selArr.length || 0;
    let num = 0;
    let canfunnum = 0;
    selArr.forEach(item=>{
      if(!item.isrefund) canfunnum += 1;
      if(item.isselect&&!item.isrefund) num += 1;
    })
    let danPrice = total/canfunnum;
    let can_refund_money = danPrice*num;
    let refund_score = order_goods.one_goods_score*num;

    // 均分配送费
    let shipping_fare = order_goods.shipping_fare || 0;
    let dan_shipping_fare = shipping_fare/totNum;
    let can_shipping_fare = dan_shipping_fare*num;

    if(can_refund_money>total || totNum==num){ 
      can_refund_money = total*1; 
      refund_score = order_goods.use_score;
    }

    if(can_shipping_fare>shipping_fare || totNum==num){ 
      can_shipping_fare = shipping_fare*1;
    }

    let max_can_refund = can_refund_money.toFixed(2);
    can_shipping_fare = can_shipping_fare.toFixed(2);

    this.setData({ 
      selArr,
      real_refund_quantity: num,
      complaint_money: can_refund_money,
      refund_money: can_refund_money.toFixed(2),
      refund_score,
      max_can_refund,
      can_shipping_fare
    })
  }
})
