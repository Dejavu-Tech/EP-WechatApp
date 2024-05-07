var app = getApp()
var locat = require('../../utils/Location.js');
var util = require('../../utils/util.js');
var status = require('../../utils/index.js');
var wcache = require('../../utils/wcache.js');

Page({
  mixins: [require('../../mixin/globalMixin.js')],
  data: {
    payBtnLoading: false,
    showConfirmModal: false,
    receiverAddress: "", //快递送货地址
    tuan_send_address: "", //团长送货地址
    showGetPhone: false,
    lou_meng_hao:'',
    pickUpAddress: "",
    disUserName: "",
    pickUpCommunityName: "",
    is_limit_distance_buy: 0,
    tabList: [
      { id: 0, name: '社区自提', dispatching: 'pickup', enabled: false },
      { id: 1, name: '团长配送', dispatching: 'tuanz_send', enabled: false },
      { id: 2, name: '快递配送', dispatching: 'express', enabled: false },
      { id: 3, name: '同城配送', dispatching: 'localtown_delivery', enabled: false},
      { id: 4, name: '到店核销', dispatching: 'hexiao', enabled: false}
    ],
    originTabList: [
      { id: 0, name: '社区自提', dispatching: 'pickup' },
      { id: 1, name: '团长配送', dispatching: 'tuanz_send'},
      { id: 2, name: '快递配送', dispatching: 'express'},
      { id: 3, name: '同城配送', dispatching: 'localtown_delivery'},
      { id: 4, name: '到店核销', dispatching: 'hexiao'}
    ],
    tabIdx: 0,
    region: ['选择地址', '', ''],
    tot_price: 0,
    needAuth: false,
    reduce_money: 0,
    hide_quan: true,
    tuan_region: ['选择地址','',''],
    groupInfo: {
      group_name: '社区',
      owner_name: '团长',
      placeorder_tuan_name: '配送费',
      placeorder_trans_name: '快递费'
    },
    comment: '',
    is_yue_open: 0,
    can_yupay: 0,
    ck_yupay: 0,
    use_score: 0,
    commentArr: {},
    note_content: '',
    showAlertTime: false,
    curAlertTime: -1,
    isAgreePresale: false,
    presale_info: '',
    presalePickup: ['自提','配送','发货','配送','核销'],
    allform: ""
  },
  canPay: true,
  canPreSub: true,
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
  onLoad: function(options) {
    var that = this;
    status.setGroupInfo().then((groupInfo) => { that.setData({ groupInfo }) });
    var token = wx.getStorageSync('token');
    var community = wx.getStorageSync('community');
    var community_id = community.communityId;
    util.check_login() ? this.setData({ needAuth: false }) : (this.setData({ needAuth: true }));
    var member_info = wx.getStorageSync('member_info');
    console.log(member_info)
    // let is_limit = options.is_limit || 0;
    this.setData({
      buy_type: options.type || '',
      soli_id: options.soli_id || '',
      pickUpAddress: community.fullAddress || '',
      pickUpCommunityName: community.communityName || '',
      disUserName: community.disUserName || '',
      is_cashon_delivery: member_info.is_cashon_delivery || ''
    })
    wx.showLoading()
    app.util.request({
      url: 'entry/wxapp/user',
      data: {
        controller: 'car.checkout',
        token: token,
        community_id,
        buy_type: options.type,
        soli_id: options.soli_id
      },
      dataType: 'json',
      method: 'POST',
      success: function (res) {
        // wx.hideLoading();
        setTimeout(function(){ wx.hideLoading(); },1000);
        
        let rdata = res.data;
        // 提货方式
        let tabIdx = -1;
        let tabLength = 0;
        let tabList = that.data.tabList || {};
        let sortTabList = [];

        let { 
          delivery_express_name, 
          delivery_tuanzshipping_name, 
          delivery_ziti_name, 
          delivery_diy_sort,
          delivery_type_express,
          delivery_type_tuanz,
          delivery_type_ziti,
          delivery_tuanz_money,
          is_vip_card_member,
          vipcard_save_money,
          level_save_money,
          is_open_vipcard_buy,
          is_member_level_buy,
          total_integral,
          is_need_subscript,
          need_subscript_template,
          delvery_type_hexiao,
          order_note_open,
          order_note_name,
          order_note_content,
          delivery_type_localtown,
          localtown_dispatchtime, //预计配送需要多少分钟
          pickingup_fare, //订单包装费，只有在 同城快递的时
          localtown_shipping_fare, //同城配送费
          localtown_modifypickingname,
          localtown_shipping_fare_arr,
          localtown_moneytype_fixed_freemoney,
          localtown_makeup_delivery_money,
          localtown_expected_delivery,
          order_lou_meng_hao,
          order_lou_meng_hao_placeholder,
          presale_info,
          cashondelivery_data,
          allform
        } = res.data;

        let {
          isopen_cashondelivery,
          isopen_cashondelivery_communityhead,
          isopen_cashondelivery_express,
          isopen_cashondelivery_hexiao,
          isopen_cashondelivery_localtown
        } = cashondelivery_data;

        presale_info = Object.keys(presale_info).length ? presale_info : '';

        // 同城满免运费
        if(localtown_shipping_fare_arr) {
          let shipping_fare = 0;
          shipping_fare = localtown_shipping_fare_arr.total_yl_shipping_fare*1 - localtown_shipping_fare_arr.total_shipping_fare*1;
          localtown_shipping_fare_arr.shipping_fare = shipping_fare.toFixed(2);
        }

        if (delivery_type_localtown == 1) tabList[3].enabled = true, tabLength++;
        if (delivery_type_express == 1) tabList[2].enabled = true, tabLength++;
        if (delivery_type_tuanz == 1) tabList[1].enabled = true, tabLength++;
        if (delivery_type_ziti == 1) tabList[0].enabled = true, tabLength++;

        if (delivery_diy_sort) {
          let sortArr = delivery_diy_sort.split(',');
          if (sortArr[2] && tabList[sortArr[2]] && tabList[sortArr[2]].enabled) tabIdx = sortArr[2];
          if (sortArr[1] && tabList[sortArr[1]] && tabList[sortArr[1]].enabled) tabIdx = sortArr[1];
          if (sortArr[0] && tabList[sortArr[0]] && tabList[sortArr[0]].enabled) tabIdx = sortArr[0];

          sortArr.forEach(function(item){
            sortTabList.push(tabList[item]);
          })
        }

        delivery_express_name && (tabList[2].name = delivery_express_name);
        delivery_tuanzshipping_name && (tabList[1].name = delivery_tuanzshipping_name);
        delivery_ziti_name && (tabList[0].name = delivery_ziti_name);

        // 同城配送TODO...
        sortTabList.push({id: 3, name: '同城配送', dispatching: 'localtown_delivery', enabled: (delivery_type_localtown==1) });
        if(tabIdx==-1&&delivery_type_localtown==1) tabIdx=3;
        let localtown_delivery_space_month = '';
        if(localtown_expected_delivery&&localtown_expected_delivery.localtown_delivery_space_month) {
          localtown_delivery_space_month = localtown_expected_delivery.localtown_delivery_space_month;
        }

        // 到店核销
        sortTabList.push({id: 4, name: '到店核销', dispatching: 'hexiao', enabled: (delvery_type_hexiao==1) });
        if(tabIdx==-1&&delvery_type_hexiao) { tabIdx = 4; }

        var addres = 0;
        addres = 1;
        var seller_chose_id = 0;
        var seller_chose_store_id = 0;
        var seller_goods = rdata.seller_goodss;

        let commentArr = {};
        for (let key in seller_goods) commentArr[key] = '';

        let sel_chose_vouche = '';
        let sgvKey = 0;
        let goodsTotNum = 0;
        for (var i in seller_goods) {
          if (seller_goods[i].show_voucher == 1) {
            if (seller_goods[i].chose_vouche.id) seller_chose_id = seller_goods[i].chose_vouche.id;
            if (seller_goods[i].chose_vouche.store_id) seller_chose_store_id = seller_goods[i].chose_vouche.store_id;

            if (Object.prototype.toString.call(seller_goods[i].chose_vouche) == '[object Object]'){
              sel_chose_vouche = seller_goods[i].chose_vouche;
            }
            if(Object.keys(seller_goods[i].chose_vouche).length>0) sgvKey = i;
          }
          seller_goods[i].goodsnum = Object.keys(seller_goods[i].goods).length;
          for (var j in seller_goods[i].goods) {
            goodsTotNum += seller_goods[i].goods[j].quantity*1;
            if (seller_goods[i].goods[j].header_disc > 0 && seller_goods[i].goods[j].header_disc < 100) {
              seller_goods[i].goods[j].header_disc = (seller_goods[i].goods[j].header_disc / 10).toFixed(1);
            }
          }
        }

        let current_distance = rdata.current_distance || '';
        let current_distance_str = that.changeDistance(current_distance);

        order_note_content = order_note_content!=null?order_note_content:'';

        if(presale_info&&presale_info.goods_price) {
          let deduction_money = presale_info.deduction_money;
          deduction_money = deduction_money>0?deduction_money:presale_info.presale_ding_money;
          let totDeduction = deduction_money*goodsTotNum;
          presale_info.balance = (presale_info.goods_price*1 - totDeduction).toFixed(2);
          presale_info.totdingMoney = (goodsTotNum*presale_info.presale_ding_money).toFixed(2);
          presale_info.totDeduction = totDeduction.toFixed(2);
        }

        let param = {
          sgvKey,
          is_hexiao: delvery_type_hexiao,
          loadover: true,
          commentArr,
          sel_chose_vouche,
          tabList: sortTabList,
          is_limit_distance_buy: rdata.is_limit_distance_buy || 0,
          tabIdx: tabIdx,
          tabLength: tabLength,
          tuan_send_address: rdata.tuan_send_address,
          is_open_order_message: rdata.is_open_order_message,
          is_yue_open: rdata.is_yue_open,
          can_yupay: rdata.can_yupay,
          show_voucher: rdata.show_voucher,
          current_distance,
          man_free_tuanzshipping: rdata.man_free_tuanzshipping*1 || 0,
          man_free_shipping: rdata.man_free_shipping*1 || 0,
          index_hide_headdetail_address: rdata.index_hide_headdetail_address || 0,
          open_score_buy_score: rdata.open_score_buy_score || 0,
          score: rdata.score || 0,
          score_for_money: rdata.score_for_money || 0,
          bue_use_score: rdata.bue_use_score || 0,
          is_man_delivery_tuanz_fare: rdata.is_man_delivery_tuanz_fare,   //是否达到满xx减团长配送费
          fare_man_delivery_tuanz_fare_money: rdata.fare_man_delivery_tuanz_fare_money,   //达到满xx减团长配送费， 减了多少钱
          is_man_shipping_fare: rdata.is_man_shipping_fare,    //是否达到满xx减运费
          fare_man_shipping_fare_money: rdata.fare_man_shipping_fare_money,   //达到满xx减运费，司机减了多少运费
          is_vip_card_member,
          vipcard_save_money,
          level_save_money,
          is_open_vipcard_buy,
          is_member_level_buy,
          // canLevelBuy,
          total_integral: total_integral || '',
          is_need_subscript,
          need_subscript_template,
          current_distance_str,
          order_note_open,
          order_note_name,
          order_note_content,
          note_content: order_note_content,
          localtown_dispatchtime,
          pickingup_fare,
          localtown_shipping_fare,
          localtown_modifypickingname: localtown_modifypickingname || '包装费',
          localtown_shipping_fare_arr,
          localtown_moneytype_fixed_freemoney,
          localtown_makeup_delivery_money,
          localtown_expected_delivery,
          localtown_delivery_space_month,
          order_lou_meng_hao: order_lou_meng_hao || '楼号门牌',
          order_lou_meng_hao_placeholder: order_lou_meng_hao_placeholder || '例如:A座106室',
          presale_info,
          cashondelivery_data,
          allform
        }

        let addrObj = rdata.address || {};
        let tuan_send_address_info = rdata.tuan_send_address_info || {};
        let tuanAddress = tuan_send_address_info.address || '选择位置';
        if(tuan_send_address_info.city_name == "" || tuan_send_address_info.city_id==3708 ||  tuan_send_address_info.country_name == "" || tuan_send_address_info.country_id==3708){
          tuanAddress = '选择位置';
        }

        // 20200710 TODO
        // addrObj = tuan_send_address_info;

        param.tabAddress = [
          {
            name: rdata.ziti_name || '',
            mobile: rdata.ziti_mobile || ''
          },
          {
            name: tuan_send_address_info.name || '',
            mobile: tuan_send_address_info.telephone || '',
            receiverAddress: tuanAddress,
            lou_meng_hao: tuan_send_address_info.lou_meng_hao || '',
            region: [tuan_send_address_info.province_name || "", tuan_send_address_info.city_name || "", tuan_send_address_info.country_name || ""]
          },
          {
            name: addrObj.name || '',
            mobile: addrObj.telephone || '',
            receiverAddress: addrObj.address || '',
            region: [addrObj.province_name || "选择地址", addrObj.city_name || "", addrObj.country_name || ""]
          },
          {
            name: addrObj.name || '',
            mobile: addrObj.telephone || '',
            receiverAddress: addrObj.address || '',
            region: [addrObj.province_name || "选择地址", addrObj.city_name || "", addrObj.country_name || ""]
          },
          {
            name: rdata.ziti_name || '',
            mobile: rdata.ziti_mobile || ''
          }
        ];

        if(JSON.stringify(addrObj)!='[]') {
          if(addrObj.lon_lat=='') {
            if(tabIdx==3){
              param.tabAddress[3] = {
                name: addrObj.name || '',
                mobile: addrObj.telephone || '',
                receiverAddress: '',
                region: ["选择地址", "", ""]
              }
            }
          } else if(addrObj.lon_lat) {
            let lat_lon = addrObj.lon_lat.split(',');
            wcache.put('latitude2', lat_lon[1]);
            wcache.put('longitude2', lat_lon[0]);
          }
        }

        if (addres == 1) {
          that.setData({
            ...param,
            pick_up_time: res.data.pick_up_time,
            pick_up_type: res.data.pick_up_type,
            pick_up_weekday: res.data.pick_up_weekday,
            addressState: true,
            is_integer: res.data.is_integer,
            is_ziti: res.data.is_ziti,
            pick_up_arr: res.data.pick_up_arr,
            seller_goodss: res.data.seller_goodss,
            seller_chose_id: seller_chose_id,
            seller_chose_store_id: seller_chose_store_id,
            goods: res.data.goods,
            buy_type: res.data.buy_type,
            yupay: res.data.can_yupay,
            is_yue_open: res.data.is_yue_open,
            yu_money: res.data.yu_money,
            total_free: res.data.total_free,
            trans_free_toal: res.data.trans_free_toal,
            delivery_tuanz_money: res.data.delivery_tuanz_money,
            reduce_money: res.data.reduce_money,
            is_open_fullreduction: res.data.is_open_fullreduction,
            cha_reduce_money: res.data.cha_reduce_money
          }, () => {
            that.calcPrice();
          })
        } else {
          that.setData({
            ...param,
            is_integer: res.data.is_integer,
            addressState: false,
            goods: res.data.goods,
            is_ziti: res.data.is_ziti,
            pick_up_arr: res.data.pick_up_arr,
            seller_goodss: res.data.seller_goodss,
            seller_chose_id: seller_chose_id,
            seller_chose_store_id: seller_chose_store_id,
            buy_type: res.data.buy_type,
            yupay: res.data.can_yupay,
            is_yue_open: res.data.is_yue_open,
            yu_money: res.data.yu_money,
            total_free: res.data.total_free,
            trans_free_toal: res.data.trans_free_toal,
            delivery_tuanz_money: res.data.delivery_tuanz_money,
            reduce_money: res.data.reduce_money,
            is_open_fullreduction: res.data.is_open_fullreduction,
            cha_reduce_money: res.data.cha_reduce_money
          },()=>{
            that.calcPrice();
          })
        }
      }
    })
  },

  changeDistance: function(current_distance) {
    if(current_distance) {
      current_distance = parseFloat(current_distance);
      if(current_distance > 1000) {
        let current_distance_int = current_distance/1000;
        return current_distance_int.toFixed(2) + 'km';
      }
      return current_distance + 'm';
    }
    return current_distance;
  },

  /**
   * 授权成功回调
   */
  authSuccess: function () {
    this.onLoad();
  },

  /**
   * 设置手机号
   */
  getReceiveMobile: function (e) {
    var num = e.detail;
    this.setData({
      t_ziti_mobile: num,
      showGetPhone: false
    });
  },

  ck_wxpays: function () {
    this.setData({
      ck_yupay: 0
    })
  },

  ck_yupays: function () {
    this.setData({
      ck_yupay: 1
    })
  },

  ck_cash: function () {
    this.setData({
      ck_yupay: 2
    })
  },

  scoreChange: function (e) {
    console.log('是否使用', e.detail.value)
    let tdata = this.data;
    let score_for_money = tdata.score_for_money*1;
    let tot_price = tdata.tot_price*1;
    let disAmount = tdata.disAmount*1;
    if (e.detail.value){
      tot_price = tot_price - score_for_money;
      disAmount += score_for_money;
    } else {
      tot_price = tot_price + score_for_money;
      disAmount -= score_for_money;
    }
    this.setData({
      use_score: e.detail.value?1:0,
      tot_price: tot_price.toFixed(2),
      disAmount: disAmount.toFixed(2)
    })
  },

  /**
   * 未登录
   */
  needAuth: function(){
    this.setData({
      needAuth: true
    });
  },

  /**
   * 关闭手机授权
   */
  close: function () {
    this.setData({
      showGetPhone: false
    });
  },

  // 生成订单号 Step1
  preOrderConfirm() {
    if(this.data.allform&&this.data.allform.is_open_orderform) {
      this.selectComponent("#sForm").formSubmit();
      return false;
    } else {
      this.goOrderfrom();
    }
  },
  // 生成订单号 Step2
  goOrderfrom: function(formData={detail: {}}) {
    let that = this;
    let { tabAddress, tabIdx, note_content, order_note_open, order_note_name, isAgreePresale, buy_type, presale_info } = this.data;

    this.setData({ formData: formData.detail })
    var t_ziti_name = tabAddress[tabIdx].name;
    var t_ziti_mobile = tabAddress[tabIdx].mobile;
    var receiverAddress = tabAddress[tabIdx].receiverAddress;
    var region = tabAddress[tabIdx].region;
    var tuan_send_address = tabAddress[tabIdx].receiverAddress;
    var lou_meng_hao = tabAddress[tabIdx].lou_meng_hao;

    if (t_ziti_name == '') {
      this.setData({
        focus_name: true
      })
      let tip = '请填写收货人';
      if (tabIdx == 0) tip = '请填写提货人';
      wx.showToast({
        title: tip,
        icon: 'none'
      })
      return false;
    }
    if (t_ziti_mobile == '' || !(/^1(3|4|5|6|7|8|9)\d{9}$/.test(t_ziti_mobile))) {
      this.setData({
        focus_mobile: true
      })
      wx.showToast({
        title: '手机号码有误',
        icon: 'none'
      })
      return false;
    }

    if((tabIdx==0||tabIdx==1||tabIdx==3)&&this.data.buy_type!='virtualcard') {

      if(order_note_open==1 && note_content=='') {
        wx.showToast({
          title: '请填写' + order_note_name,
          icon: 'none'
        })
        return false;
      }
    } else {
      note_content = '';
    }
    if(order_note_open==0) note_content = '';

    if ((tabIdx == 2 || tabIdx == 3) && region[0] == '选择地址') {
      wx.showToast({
        title: '请选择所在地区',
        icon: 'none'
      })
      return false;
    }

    if ((tabIdx == 2 || tabIdx == 3) && receiverAddress == ''){
      this.setData({
        focus_addr: true
      })
      wx.showToast({
        title: '请填写详细地址',
        icon: 'none'
      })
      return false;
    }

    if (tabIdx == 1) {
      if (tuan_send_address == '选择位置' || tuan_send_address == '') {
        wx.showToast({
          title: '请选择位置',
          icon: 'none'
        })
        return false;
      }

      if (lou_meng_hao == ''){
        wx.showToast({
          title: '输入楼号门牌',
          icon: 'none'
        })
        return false;
      }

    }

    if(buy_type=='presale'&&!isAgreePresale) {
      wx.showModal({
        title: '提示',
        content: '预售商品定金不支持退款，同意后可继续下单',
        showCancel: true,
        cancelText: '我再想想',
        cancelColor: '#ff5344',
        confirmText: '同意下单',
        success (res) {
          if (res.confirm) {
            that.setData({ isAgreePresale: true });
            if (tabIdx == 2){
              that.preSubscript();
            } else {
              that.conformOrder();
            }
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
      return;
    }

    if (tabIdx == 2||this.data.buy_type=="virtualcard"){
      this.preSubscript();
    } else {
      this.conformOrder();
    }
  },

  /**
   * 支付防抖
   */
  preSubscript: function(event) {
    let that = this;
    if(!this.canPreSub) return;
    this.canPreSub = false;
    let is_need_subscript = this.data.is_need_subscript;
    if(is_need_subscript==1) {
      //弹出订阅消息
      this.subscriptionNotice().then(()=>{
        that.prepay();
      }).catch(()=>{
        that.prepay();
      });
    } else {
      that.prepay();
    }
  },

  prepay: function() {
    this.canPreSub = true;
    let { tabAddress, tabIdx, is_limit_distance_buy, note_content, seller_goodss, commentArr, formData } = this.data;
    let isVirtualcard = 0;
    if(this.data.buy_type=='virtualcard') isVirtualcard = 1;
    if (is_limit_distance_buy == 1 && (tabIdx == 1) && isVirtualcard==0){
      wx.showModal({
        title: '提示',
        content: '离团长太远了，暂不支持下单',
        showCancel: false,
        confirmColor: '#F75451'
      })
      return false;
    }
    console.log('this.canPay', this.canPay)
    if(this.canPay){
      this.setData({ payBtnLoading: true })
      this.canPay = false;
      var that = this;
      var token = wx.getStorageSync('token');

      let { seller_chose_id, seller_chose_store_id, ck_yupay, tabList } = this.data;
      var voucher_id = seller_chose_id;
      var dispatching = '';
      tabList.forEach(function(item){
        if (item.id == tabIdx) dispatching = item.dispatching;
      })

      let arr = [];
      for (let key in seller_goodss) {
        let goodsid = '';
        let goods = seller_goodss[key].goods;
        Object.keys(goods).forEach(kk=>{
          goodsid += goods[kk].goods_id+'_';
        })
        commentArr[key] = key+'_'+goodsid + commentArr[key];
      }
      for (let key in commentArr) arr.push(commentArr[key]);
      let comment = arr.join('@EOF@');
      var receiverAddress = tabAddress[tabIdx].receiverAddress || '';
      var region = tabAddress[tabIdx].region || [];
      var t_ziti_name = tabAddress[tabIdx].name;
      var t_ziti_mobile = tabAddress[tabIdx].mobile;
      let lou_meng_hao = tabAddress[tabIdx].lou_meng_hao || '';
      var quan_arr = [];

      if (voucher_id > 0) {
        var t_tmp = seller_chose_store_id + '_' + voucher_id;
        quan_arr.push(t_tmp);
      }

      let tuan_send_address = '';
      let tuan_region = '';
      let address_name = '';
      let province_name = '';
      let city_name = '';
      let country_name = '';

      if (tabIdx==1){
        tuan_send_address = receiverAddress;
        tuan_region = region;
        province_name = tuan_region[0];
        city_name = tuan_region[1];
        country_name = tuan_region[2];
      } else if (tabIdx == 2 || tabIdx == 3) {
        address_name = receiverAddress;
        province_name = region[0];
        city_name = region[1];
        country_name = region[2];
      }

      var community = wx.getStorageSync('community');
      var community_id = community.communityId;
      var pick_up_id = community_id;

      let latitude = wx.getStorageSync('latitude2');
      let longitude = wx.getStorageSync('longitude2');

      let { use_score, buy_type, soli_id } = this.data;

      // 送达时间
      let expected_delivery_time = '';
      let localtown_delivery_space_month = '';
      if(tabIdx==3){
        let { localtown_expected_delivery, curAlertTime, localtown_dispatchtime, localtown_delivery_space_month } = this.data;
        if(curAlertTime==-1) {
          expected_delivery_time = localtown_dispatchtime;
        } else {
          expected_delivery_time = localtown_expected_delivery.localtown_delivery_space_time_list[localtown_delivery_space_month][curAlertTime].time;
        }
        expected_delivery_time = localtown_delivery_space_month + ' ' + expected_delivery_time;
      }

      let cashon_delivery = (ck_yupay)==2?1:0

      wx.showLoading();
      app.util.request({
        url: 'entry/wxapp/user',
        data: {
          controller: 'car.sub_order',
          token: token,
          pay_method: 'wxpay',
          buy_type,
          pick_up_id,
          dispatching,
          ziti_name: t_ziti_name,
          quan_arr,
          comment,
          ziti_mobile: t_ziti_mobile,
          latitude,
          longitude,
          ck_yupay,
          tuan_send_address,
          lou_meng_hao,
          address_name,
          province_name,
          city_name,
          country_name,
          use_score,
          soli_id,
          note_content,
          expected_delivery_time,
          scene: app.globalData.scene,
          cashon_delivery,
          ...formData
        },
        dataType: 'json',
        method: 'POST',
        success: function (res) {
          wx.hideLoading();
          let has_yupay = res.data.has_yupay || 0;
          var order_id = res.data.order_id;
          let h = {};
          console.log('支付日志：', res);
          if (res.data.code == 0) {
            // 交易组件
            if(res.data.isRequestOrderPayment==1) {
              wx.requestOrderPayment({
                "orderInfo": res.data.order_info,
                "timeStamp": res.data.timeStamp,
                "nonceStr": res.data.nonceStr,
                "package": res.data.package,
                "signType": res.data.signType,
                "paySign": res.data.paySign,
                'success': function (wxres) {
                  that.canPay = true;
                  if (buy_type == "dan" || buy_type == "pindan" || buy_type == "integral" || buy_type == "soitaire" || buy_type == "presale" || buy_type == "virtualcard") {
                    if (res.data.is_go_orderlist<=1){
                      wx.redirectTo({
                        url: '/eaterplanet_ecommerce/pages/order/order?id=' + order_id + '&is_show=1&delivery=' + dispatching
                      })
                    } else {
                      wx.redirectTo({
                        url: '/eaterplanet_ecommerce/pages/order/index?is_show=1'
                      })
                    }
                  } else {
                    wx.redirectTo({
                      url: `/eaterplanet_ecommerce/moduleA/pin/share?id=${order_id}`
                    })
                  }
                },
                'fail': function (error) {
                  if (res.data.is_go_orderlist <= 1) {
                    wx.redirectTo({
                      url: '/eaterplanet_ecommerce/pages/order/order?id=' + order_id + '&isfail=1&delivery=' + dispatching
                    })
                  } else {
                    wx.redirectTo({
                      url: '/eaterplanet_ecommerce/pages/order/index?isfail=1'
                    })
                  }
                }
              })
            } else {
              that.changeIndexList();
              if (has_yupay == 1) {
                that.canPay = true;
                if (buy_type == "dan" || buy_type == "pindan" || buy_type == "integral" || buy_type == "soitaire" || buy_type == "presale" || buy_type == "virtualcard") {
                  if (res.data.is_go_orderlist <= 1) {
                    wx.redirectTo({
                      url: '/eaterplanet_ecommerce/pages/order/order?id=' + order_id + '&is_show=1&delivery=' + dispatching
                    })
                  } else {
                    wx.redirectTo({
                      url: '/eaterplanet_ecommerce/pages/order/index?is_show=1'
                    })
                  }
                } else {
                  wx.redirectTo({
                    url: `/eaterplanet_ecommerce/moduleA/pin/share?id=${order_id}`
                  })
                }
              } else {
                wx.requestPayment({
                  "appId": res.data.appId,
                  "timeStamp": res.data.timeStamp,
                  "nonceStr": res.data.nonceStr,
                  "package": res.data.package,
                  "signType": res.data.signType,
                  "paySign": res.data.paySign,
                  'success': function (wxres) {
                    that.canPay = true;
                    if (buy_type == "dan" || buy_type == "pindan" || buy_type == "integral" || buy_type == "soitaire" || buy_type == "presale" || buy_type == "virtualcard") {
                      if (res.data.is_go_orderlist<=1){
                        wx.redirectTo({
                          url: '/eaterplanet_ecommerce/pages/order/order?id=' + order_id + '&is_show=1&delivery=' + dispatching
                        })
                      } else {
                        wx.redirectTo({
                          url: '/eaterplanet_ecommerce/pages/order/index?is_show=1'
                        })
                      }
                    } else {
                      wx.redirectTo({
                        url: `/eaterplanet_ecommerce/moduleA/pin/share?id=${order_id}`
                      })
                    }
                  },
                  'fail': function (error) {
                    if (res.data.is_go_orderlist <= 1) {
                      wx.redirectTo({
                        url: '/eaterplanet_ecommerce/pages/order/order?id=' + order_id + '&isfail=1&delivery=' + dispatching
                      })
                    } else {
                      wx.redirectTo({
                        url: '/eaterplanet_ecommerce/pages/order/index?isfail=1'
                      })
                    }
                  }
                })
              }
            }
          } else if (res.data.code == 1) {
            that.canPay = true;
            wx.showModal({
              title: '提示',
              content: res.data.RETURN_MSG || '支付失败',
              showCancel: false,
              confirmColor: '#F75451',
              success (ret) {
                if (ret.confirm) {
                  if (res.data.is_go_orderlist <= 1) {
                    wx.redirectTo({
                      url: '/eaterplanet_ecommerce/pages/order/order?id=' + order_id + '&isfail=1&delivery=' + dispatching
                    })
                  } else {
                    wx.redirectTo({
                      url: '/eaterplanet_ecommerce/pages/order/index?is_show=1&isfail=1'
                    })
                  }
                }
              }
            })
          } else if (res.data.code == 2) {
            that.canPay = true;
            if( res.data.is_forb ==1 ){ h.btnDisable = true; h.btnText="已抢光"; }
            wx.showToast({
              title: res.data.msg,
              icon: "none"
            });
          } else {
            console.log(res);
          }
          that.setData({ btnLoading: false, payBtnLoading:false, ...h })
        },
        fail: function() {
          wx.redirectTo({
            url: '/eaterplanet_ecommerce/pages/order/index?is_show=1&isfail=1'
          })
        }
      })
    }
  },

  /**
   * 监听收货人
   */
  changeReceiverName: function(e) {
    let { tabAddress, tabIdx } = this.data;
    let receiverName = e.detail.value.trim();
    Object.keys(tabAddress).length && (tabAddress[tabIdx].name = receiverName);
    if (!receiverName) {
      let tip = '请填写收货人';
      if (tabIdx == 0) tip = '请填写提货人';
      wx.showToast({
        title: tip,
        icon: "none"
      });
    }
    this.setData({ tabAddress })
    return {
      value: receiverName
    }
  },

  /**
   * 监听备注
   */
  changeNoteName: function(e) {
    let noteName = e.detail.value.trim();
    let order_note_name = this.data.order_note_name;
    if (!noteName) {
      let tip = '请填写' + order_note_name;
      wx.showToast({
        title: tip,
        icon: "none"
      });
    }
    this.setData({ note_content: noteName })
    return {
      value: noteName
    }
  },

  /**
   * 监听手机号
   */
  bindReceiverMobile: function(e) {
    let { tabAddress, tabIdx } = this.data;
    let mobile = e.detail.value.trim();
    tabAddress[tabIdx].mobile = mobile;
    this.setData({ tabAddress });
    return {
      value: mobile
    }
  },

  /**
   * 监控快递地址变化
   */
  changeReceiverAddress: function(e){
    let { tabAddress, tabIdx } = this.data;
    tabAddress[tabIdx].receiverAddress = e.detail.value.trim();
    this.setData({ tabAddress });
    return {
      value: e.detail.value.trim()
    }
  },

  /**
   * 监控团长送货地址变化
   */
  changeTuanAddress: function (e) {
    let { tabAddress, tabIdx } = this.data;
    tabAddress[tabIdx].lou_meng_hao = e.detail.value.trim();
    this.setData({ tabAddress });
    return {
      value: e.detail.value.trim()
    }
  },

  /**
   * 结算
   */
  conformOrder: function() {
    this.setData({
      showConfirmModal: true
    });
  },

  /**
   * 关闭结算
   */
  closeConfirmModal: function() {
    this.canPay = true;
    this.setData({
      showConfirmModal: false
    });
  },

  /**
   * 地区选择
   */
  bindRegionChange: function (e) {
    let region = e.detail.value;
    region && this.checkOut(region[1]);
    this.setData({ region })
  },

  checkOut: function (mb_city_name) {
    var that = this;
    var token = wx.getStorageSync('token');
    var community = wx.getStorageSync('community');
    var community_id = community.communityId;
    let latitude = wx.getStorageSync('latitude2');
    let longitude = wx.getStorageSync('longitude2');
    let buy_type = this.data.buy_type;
    let soli_id = this.data.soli_id;

    app.util.request({
      url: 'entry/wxapp/user',
      data: {
        controller: 'car.checkout',
        token,
        community_id,
        mb_city_name,
        latitude: latitude,
        longitude: longitude,
        buy_type,
        soli_id
      },
      dataType: 'json',
      method: 'POST',
      success: function (res) {
        if(res.data.code==1){
          let rdata = res.data;
          let {
            vipcard_save_money,
            shop_buy_distance,
            is_limit_distance_buy,
            current_distance,
            level_save_money,
            score,
            score_for_money,
            bue_use_score,
            localtown_shipping_fare_arr,
            localtown_moneytype_fixed_freemoney,
            localtown_makeup_delivery_money
          } = rdata;
          if (that.data.tabIdx == 1 && is_limit_distance_buy == 1 && (current_distance > shop_buy_distance)) {
            wx.showModal({
              title: '提示',
              content: '超出配送范围，请重新选择',
              showCancel: false,
              confirmColor: '#F75451'
            })
          }

          current_distance = current_distance || '';
          let current_distance_str = that.changeDistance(current_distance);

          // 同城满免运费
          if(localtown_shipping_fare_arr) {
            let shipping_fare = 0;
            shipping_fare = localtown_shipping_fare_arr.total_yl_shipping_fare*1 - localtown_shipping_fare_arr.total_shipping_fare*1;
            localtown_shipping_fare_arr.shipping_fare = shipping_fare.toFixed(2);
          }

          that.setData({
            score: score || 0,
            score_for_money: score_for_money || 0,
            bue_use_score: bue_use_score || 0,
            vipcard_save_money,
            level_save_money,
            is_limit_distance_buy: is_limit_distance_buy || 0,
            current_distance,
            current_distance_str,
            trans_free_toal: rdata.trans_free_toal,
            is_man_delivery_tuanz_fare: rdata.is_man_delivery_tuanz_fare,   //是否达到满xx减团长配送费
            fare_man_delivery_tuanz_fare_money: rdata.fare_man_delivery_tuanz_fare_money,   //达到满xx减团长配送费， 减了多少钱
            is_man_shipping_fare: rdata.is_man_shipping_fare,    //是否达到满xx减运费
            fare_man_shipping_fare_money: rdata.fare_man_shipping_fare_money,   //达到满xx减运费，司机减了多少运费
            localtown_shipping_fare_arr,
            localtown_moneytype_fixed_freemoney,
            localtown_makeup_delivery_money
          }, () => { that.calcPrice() })
        }
      }
    })
  },

  /**
   * 定位获取地址
   */
  choseLocation: function() {
    let { tabAddress, tabIdx } = this.data;
    var that = this;
    wx.chooseLocation({
      success: function (e) {
        console.log(e);
        var s_region = that.data.region;
        var filename = e.name;
        let addr = e.address || '';
        var reg = /.+?(省|市|自治区|自治州|县|区|特别行政区)/g;
        // var result = addr.match(reg);
        var result = null;
        console.log('patt', result);
        if (result == null || filename=="") {
          locat.getGpsLocation(e.latitude, e.longitude).then((res) => {
            console.log('反推了', res);
            if (res) {
              s_region[0] = res.province;
              s_region[1] = res.city;
              s_region[2] = res.district;
              filename || (filename = res.street);
            }
            setRes();
          });
        } else {
          s_region[0] = result[0];
          s_region[1] = result[1];
          s_region[2] = result[2] || '';
          var dol_path = addr.replace(s_region.join(''), '');
          filename = dol_path + e.name;
          setRes();
        }

        wcache.put('latitude2', e.latitude);
        wcache.put('longitude2', e.longitude);

        function setRes(){
          console.log('setData');
          s_region && (s_region[1] != "市") && that.checkOut(s_region[1]);
          tabAddress[tabIdx].region = s_region;
          tabAddress[tabIdx].receiverAddress = filename;
          that.setData({ tabAddress })
        }
      },
      fail: function (error) {
        console.log(error)
        if (error.errMsg =='chooseLocation:fail auth deny') {
          console.log('无权限')
          locat.checkGPS(app, locat.openSetting())
        }
      }
    })
  },

  /**
   * 微信获取地址
   */
  getWxAddress: function() {
    let { tabAddress, tabIdx } = this.data;
    let region = tabAddress[tabIdx].region || [];
    let that = this;
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.address']) {
          wx.chooseAddress({
            success(res) {
              console.log("step1")
              region[0] = res.provinceName || "选择地址";
              region[1] = res.cityName || "";
              region[2] = res.countyName || "";
              let receiverAddress = res.detailInfo;
              tabAddress[tabIdx].name = res.userName;
              tabAddress[tabIdx].mobile = res.telNumber;
              tabAddress[tabIdx].region = region;
              tabAddress[tabIdx].receiverAddress = receiverAddress;
              that.setData({ tabAddress })
              region && (region[1] != "市") && that.checkOut(region[1]);
            },
            fail(res){
              console.log("step4")
              console.log(res)
            }
          })
        } else {
          if (res.authSetting['scope.address'] == false) {
            wx.openSetting({
              success(res) {
                console.log(res.authSetting)
              }
            })
          } else {
            console.log("step2")
            wx.chooseAddress({
              success(res) {
                console.log("step3")
                region[0] = res.provinceName || "选择地址";
                region[1] = res.cityName || "";
                region[2] = res.countyName || "";
                let receiverAddress = res.detailInfo;
                region && (region[1] != "市") && that.checkOut(region[1]);
                tabAddress[tabIdx].name = res.userName;
                tabAddress[tabIdx].mobile = res.telNumber;
                tabAddress[tabIdx].region = region;
                tabAddress[tabIdx].receiverAddress = receiverAddress;
                that.setData({ tabAddress })
              }
            })
          }
        }
      }
    })
  },

  /**
   * tab切换
   */
  tabSwitch: function (t) {
    let idx = 1 * t.currentTarget.dataset.idx;
    let id = this.data.tabList[idx].id;
    (idx != 0) && wx.showToast({ title: '配送变更，费用已变化', icon: "none"});
    this.setData({
      tabIdx: idx,
      tabId: id
    },function(){
      this.calcPrice(1);
    })
  },

  /**
   * 打开优惠券
   */
  show_voucher: function (event) {
    var that = this;
    var serller_id = event.currentTarget.dataset.seller_id;
    var voucher_list = [];
    var seller_chose_id = this.data.seller_chose_id;
    var seller_chose_store_id = this.data.seller_chose_store_id;
    var seller_goods = this.data.seller_goodss;
    for (var i in seller_goods) {
      var s_id = seller_goods[i].store_info.s_id;
      if (s_id == serller_id) {
        voucher_list = seller_goods[i].voucher_list;
        if (seller_chose_id == 0) {
          seller_chose_id = seller_goods[i].chose_vouche.id || 0;
          seller_chose_store_id = seller_goods[i].chose_vouche.store_id || 0;
        }
      }
    }
    that.setData({
      ssvoucher_list: voucher_list,
      voucher_serller_id: serller_id,
      seller_chose_id: seller_chose_id,
      seller_chose_store_id: seller_chose_store_id,
      hide_quan: false
    })
  },

  // 选择优惠券
  chose_voucher_id: function (event) {
    wx.showLoading();
    var voucher_id = event.currentTarget.dataset.voucher_id;
    var seller_id = event.currentTarget.dataset.seller_id;
    var that = this;
    var token = wx.getStorageSync('token');
    var use_quan_str = seller_id + "_" + voucher_id;
    let latitude = wx.getStorageSync('latitude2');
    let longitude = wx.getStorageSync('longitude2');
    var buy_type = that.data.buy_type;
    let soli_id = this.data.soli_id;

    var community_id = wx.getStorageSync('community').communityId || '';

    app.util.request({
      url: 'entry/wxapp/user',
      data: {
        controller: 'car.checkout',
        token,
        community_id,
        voucher_id,
        use_quan_str,
        buy_type,
        latitude,
        longitude,
        soli_id
      },
      dataType: 'json',
      method: 'POST',
      success: function (res) {
        wx.hideLoading();
        if(res.data.code ==1){
          let seller_goodss = res.data.seller_goodss;
          let sel_chose_vouche = '';
          for (var i in seller_goodss) {
            seller_goodss[i].goodsnum = Object.keys(seller_goodss[i].goods).length;
            if (Object.prototype.toString.call(seller_goodss[i].chose_vouche) == '[object Object]') {
              sel_chose_vouche = seller_goodss[i].chose_vouche;
            }
          }
          const rdata = res.data;
          let current_distance = rdata.current_distance || '';
          let current_distance_str = that.changeDistance(current_distance);
          let {score,score_for_money,bue_use_score} = rdata;
          let h = {};
          if(bue_use_score*1<=0) h.use_score = '';
          that.setData({
            ...h,
            score: score || 0,
            score_for_money: score_for_money || 0,
            bue_use_score: bue_use_score || 0,
            seller_goodss: seller_goodss,
            seller_chose_id: voucher_id,
            seller_chose_store_id: seller_id,
            hide_quan: true,
            goods: rdata.goods,
            buy_type: rdata.buy_type || 'dan',
            yupay: rdata.can_yupay,
            is_yue_open: rdata.is_yue_open,
            total_free: rdata.total_free,
            sel_chose_vouche: sel_chose_vouche,
            current_distance,
            current_distance_str
          },()=>{
            that.calcPrice(1);
          })
        }
      }
    })
  },

  //关闭优惠券
  closeCouponModal: function(){
    this.setData({
      hide_quan: true
    })
  },

  /**
   * 计算总额
   */
  calcPrice: function(isTabSwitch = 0){
    let tdata = this.data;
    let {
      total_free,
      delivery_tuanz_money,
      fare_man_shipping_fare_money,
      trans_free_toal,
      tabIdx, goods,
      is_open_vipcard_buy,
      is_vip_card_member,
      fare_man_delivery_tuanz_fare_money,
      pickingup_fare,
      localtown_makeup_delivery_money,
      buy_type
    } = tdata;
    total_free *= 1; //合计金额（扣除满减、优惠券，不含运费）
    delivery_tuanz_money *= 1; //配送费
    fare_man_shipping_fare_money *= 1; //免多少运费
    trans_free_toal = trans_free_toal*1;

    let tot_price = 0; //计算后合计+运费
    // 商品总额
    let total_goods_price = 0;
    let levelAmount = 0; //等级优惠

    for (let gidx of Object.keys(goods)) {
      let item = goods[gidx];
      total_goods_price += item.total;

      if(is_open_vipcard_buy==1&&item.is_take_vipcard==1&&is_vip_card_member==1) {
        // 会员优惠
      } else if (item.is_mb_level_buy) {
        levelAmount += item.total * 1 - item.level_total * 1;
      }
    }

    let total_all = total_goods_price; //总额
    // 商品总额+配送费
    if(tabIdx==0){
      tot_price = total_free;
    } else if (tabIdx==1){
      // 满免运费
      let is_man_delivery_tuanz_fare = tdata.is_man_delivery_tuanz_fare; //是否达到满xx减团长配送费
      if (is_man_delivery_tuanz_fare==0) {
        tot_price = delivery_tuanz_money + total_free;
      } else {
        tot_price = total_free + delivery_tuanz_money - fare_man_delivery_tuanz_fare_money*1;
      }
      total_all += delivery_tuanz_money;
    } else if(tabIdx==2) {
      // 满免快递费
      let is_man_shipping_fare = tdata.is_man_shipping_fare; //是否达到满xx减运费
      total_all += trans_free_toal;
      if (is_man_shipping_fare == 0) {
        tot_price = trans_free_toal + total_free;
      } else {
        if(buy_type=="pintuan") {
          tot_price = trans_free_toal + total_free;
        } else {
          tot_price = trans_free_toal + total_free - fare_man_shipping_fare_money*1;
        }
      }
    } else if(tabIdx==3) {
      // 同城配送
      let localtown_shipping_fare_arr = this.data.localtown_shipping_fare_arr;
      let total_yl_shipping_fare = localtown_shipping_fare_arr.total_yl_shipping_fare*1 || 0;
      let total_shipping_fare = localtown_shipping_fare_arr.total_shipping_fare*1 || 0;
      total_all += total_yl_shipping_fare;
      //包装费
      total_all += pickingup_fare*1 + localtown_makeup_delivery_money*1;
      tot_price = total_free + localtown_makeup_delivery_money*1;
      tot_price += pickingup_fare*1+total_shipping_fare*1;
    } else if (tabIdx==4) {
      tot_price = total_free;
    }

    //使用积分
    let use_score = tdata.use_score;
    if (isTabSwitch && use_score) {
      let score_for_money = tdata.score_for_money * 1;
      tot_price = tot_price - score_for_money;
    }

    let disAmount = 0; //优惠金额
    disAmount = (total_all - tot_price*1).toFixed(2);

    this.setData({
      total_all: total_all.toFixed(2),
      disAmount,
      tot_price: tot_price.toFixed(2),
      total_goods_price: total_goods_price.toFixed(2),
      levelAmount: levelAmount.toFixed(2)
    })

  },

  /**
   * 订单留言 20190219
   */
  bindInputMessage: function (event) {
    let commentArr = this.data.commentArr;
    let idx = event.currentTarget.dataset.idx;
    var val = event.detail.value;
    commentArr[idx] = val;
    this.setData({ commentArr })
  },

  /**
   * 修改首页列表商品购物车数量
   */
  changeIndexList: function(){
    let goods = this.data.goods || [];
    if(goods.length>0){
      goods.forEach((item)=>{
        item.option.length == 0 && status.indexListCarCount(item.goods_id, 0);
      })
    }
  },

  /**
   * 订阅消息
   */
  subscriptionNotice: function() {
    let that = this;
    return new Promise((resolve, reject)=>{
      let obj = that.data.need_subscript_template;
      let tmplIds =  Object.keys(obj).map(key => obj[key]); // 订阅消息模版id
      if (wx.requestSubscribeMessage) {
        tmplIds.length && wx.requestSubscribeMessage({
          tmplIds: tmplIds,
          success(res) {
            let is_need_subscript = 1;
            let acceptId = [];
            tmplIds.forEach(item=>{
              if (res[item] == 'accept') {
                //用户同意了订阅，添加进数据库
                acceptId.push(item);
              } else {
                //用户拒绝了订阅或当前游戏被禁用订阅消息
                is_need_subscript = 0;
              }
            })

            if(acceptId.length) {
              that.addAccept(acceptId);
            }
            that.setData({ is_need_subscript })
            resolve();
          },
          fail(err) {
            console.log(err)
            reject();
          }
        })
      } else {
        // 兼容处理
        reject();
      }
    })
  },

  // 用户点击订阅添加到数据库
  addAccept: function (acceptId) {
    let token = wx.getStorageSync('token');
    let type = acceptId.join(',');
    app.util.request({
      url: 'entry/wxapp/user',
      data: {
        controller: 'user.collect_subscriptmsg',
        token,
        type
      },
      dataType: 'json',
      method: 'POST',
      success: function () {}
    })
  },

  handleTimeModal: function(){
    let localtown_expected_delivery = this.data.localtown_expected_delivery;
    if(localtown_expected_delivery.localtown_expected_delivery_status&&localtown_expected_delivery.localtown_delivery_space_month) {
      this.setData({
        showAlertTime: !this.data.showAlertTime
      })
    }
  },

  selectAlertTime: function(event){
    let idx = event.currentTarget.dataset.idx;
    this.setData({
      curAlertTime: idx
    })
  },

  selectAlertDate: function(event){
    let idx = event.currentTarget.dataset.idx;
    let curAlertTime = 0;
    if(this.data.localtown_expected_delivery.localtown_delivery_space_month==idx) curAlertTime = -1;
    this.setData({
      localtown_delivery_space_month: idx,
      curAlertTime
    })
  },

  agreePresaleChange: function(e) {
    let state = e.detail.value;
    console.log('统一支付定金', state);
    this.setData({ isAgreePresale: state })
  },

  hanlePresaleModal: function(e) {
    this.setData({
      showPresaleDesc: !this.data.showPresaleDesc
    })
  },

  showPresaleAmoutDesc: function(){
    wx.showModal({
      title: '优惠说明',
      content: '优惠金额将在支付尾款时使用',
      showCancel: false
    })
  }
})
