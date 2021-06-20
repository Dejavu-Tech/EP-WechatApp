// eaterplanet_ecommerce/components/orderInfo/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    orderInfo: {
      type: Object,
      observer: function (t) {
        let real_total = t.real_total * 1;
        var goodsTotal = parseFloat(real_total) - parseFloat(t.shipping_fare);

        let disAmount = parseFloat(t.voucher_credit) + parseFloat(t.fullreduction_money);
        disAmount = (disAmount > goodsTotal) ? goodsTotal : disAmount;

        let diyshipname = '';
        let groupInfo = this.data.groupInfo;
        if(t.delivery=='express') {
          diyshipname = groupInfo.placeorder_trans_name;
        } else {
          diyshipname = groupInfo.placeorder_tuan_name;
        }

        let changePrice = 0;
        if(t.is_change_price==1) {
          changePrice = Math.abs(t.admin_change_price);
        }

        this.setData({
          goodsTotal: goodsTotal.toFixed(2),
          disAmount: disAmount.toFixed(2),
          diyshipname,
          changePrice: changePrice.toFixed(2)
        });
      }
    },
    order_goods_list: {
      type: Array,
      observer: function (t) {
        let levelAmount = 0;
        let is_vipcard_buy = 0;
        let is_level_buy = 0;
        if(t&&t.length) {
          t.forEach(function(item){
            let total = item.total * 1;
            let old_total = item.old_total * 1;
            if (item.is_level_buy==1 || item.is_vipcard_buy==1) {
              levelAmount += old_total - total;
              is_vipcard_buy = item.is_vipcard_buy;
              is_level_buy = item.is_level_buy;
            }
          })
        }
        this.setData({
          levelAmount: levelAmount.toFixed(2),
          is_level_buy,
          is_vipcard_buy
        });
      }
    },
    ordername: {
      type: String,
      value: "订单"
    },
    groupInfo: {
      type: Object,
      value: {
        group_name: '社区',
        owner_name: '团长',
        delivery_ziti_name: '社区自提',
        delivery_tuanzshipping_name: '团长配送',
        delivery_express_name: '快递配送',
        placeorder_trans_name: '配送费',
        placeorder_tuan_name: '配送费',
        localtown_modifypickingname: '包装费'
      }
    },
    goodsTot: {
      type: Number,
      default: 0
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    disAmount: 0,
    goodsTotal: 0,
    changePrice: 0
  }
})
