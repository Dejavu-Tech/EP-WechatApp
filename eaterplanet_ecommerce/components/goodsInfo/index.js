// eaterplanet_ecommerce/components/goodsInfo/index.js
Component({
  properties: {
    order: {
      type: Object,
      observer: function (t) {
        let real_total = t.order_info.real_total * 1;
        let shipping_tel = t && t.order_info && t.order_info.shipping_tel || '';
        var goodsTotal = parseFloat(real_total) - parseFloat(t.order_info.shipping_fare);
        let h = {};
        h.goodsTotal = goodsTotal;
        if(shipping_tel) {
          shipping_tel = "" + shipping_tel;
          var pat=/(\d{3})\d*(\d{4})/;
          let tel = shipping_tel.replace(pat,'$1****$2');
          h.tel = tel;
        }
        this.setData(h);
      }
    },
    showNickname: {
      type: Boolean,
      default: false
    },
    hidePhone: {
      type: Number,
      default: 0
    },
    groupInfo: {
      type: Object,
      default: {
        group_name: '社区',
        owner_name: '团长',
        delivery_ziti_name: '社区自提',
        delivery_tuanzshipping_name: '团长配送',
        delivery_express_name: '快递配送'
      }
    },
    hideInfo: {
      type: Boolean,
      default: false
    },
    goodsTot: {
      type: Number,
      default: 0
    },
    goods_sale_unit: {
      type: String
    }
  },
  data: {
    isCalling: false
  },
  methods: {
    callTelphone: function(t) {
      var e = this;
      this.data.isCalling || (this.data.isCalling = true, wx.makePhoneCall({
        phoneNumber: t.currentTarget.dataset.phone,
        complete: function() {
          e.data.isCalling = false;
        }
      }));
    }
  }
})
