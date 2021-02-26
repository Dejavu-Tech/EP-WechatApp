var app = getApp();
var status = require('../../utils/index.js');

Page({
  data: {
    currentTab: 0,
    pageSize: 10,
    navList: [{
      name: "全部",
      id: "0"
    }, {
      name: "待配送",
      id: "1"
    },
    {
      name: "待签收",
      id: "2"
    },
    {
      name: "待提货",
      id: "3"
    }, {
      name: "已完成",
      id: "4"
    }
    ],
    loadText: "",
    disUserId: "",
    no_order: 0,
    page: 1,
    hide_tip: true,
    order: [],
    tip: '正在加载',
    searchfield: [
      {
        field: 'ordersn',
        name: '订单号'
      },
      {
        field: 'member',
        name: '会员昵称'
      },
      {
        field: 'address',
        name: '配送联系人'
      },
      {
        field: 'mobile',
        name: '下单手机号'
      },
      {
        field: 'location',
        name: '配送地址'
      },
      {
        field: 'goodstitle',
        name: '商品标题'
      }
    ],
    fieldIdx: 0,
    groupInfo: {
      group_name: '社区',
      owner_name: '团长'
    }
  },
  searchOBj: {},
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
    let that = this;
    status.setGroupInfo().then((groupInfo) => {
      that.setData({ groupInfo })
    });
    var currentTab = 0;
    if (options != undefined) {
      currentTab = options.tab;
    }
    this.setData({
      currentTab: currentTab
    });
    this.getData(currentTab);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // todo
  },

  bindFiledChange: function (e) {
    this.setData({
      fieldIdx: e.detail.value
    })
  },

  searchByKey: function (e) {
    let that = this;
    let { searchfield, fieldIdx } = this.data;
    let field = searchfield[fieldIdx].field;
    let keyword = e.detail.value || '';
    this.searchOBj = { keyword, searchfield: field };
    this.setData({
      page: 1,
      order: []
    },()=>{
      that.getData();
    });
  },

  callPhone: function(e){
    var that = this;
    var phoneNumber = e.currentTarget.dataset.phone;
    phoneNumber && wx.makePhoneCall({
      phoneNumber: phoneNumber
    });
  },

  /**
   * 导航切换
   */
  switchNav: function (t) {
    if (this.data.currentTab === 1 * t.currentTarget.dataset.id) return false;
    this.setData({
      currentTab: 1 * t.currentTarget.dataset.id,
      page: 1,
      order: []
    });
    this.getData();
  },

  /**
   * 获取数据
   */
  getData: function () {
    wx.showLoading({
      title: "加载中...",
      mask: true
    });
    this.setData({
      isHideLoadMore: true
    })

    this.data.no_order = 1
    let that = this;
    var token = wx.getStorageSync('token');

    var currentTab = this.data.currentTab;
    var order_status = -1;
    if (currentTab == 1) {
      order_status = 1;
    } else if (currentTab == 2) {
      order_status = 14;
    } else if (currentTab == 3) {
      order_status = 4;
    } else if (currentTab == 4) {
      order_status = 6;
    }

    //currentTab

    app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'order.orderlist',
        is_tuanz: 1,
        token: token,
        page: that.data.page,
        order_status: order_status,
        ...this.searchOBj
      },
      dataType: 'json',
      success: function (res) {
        let { open_aftersale, open_aftersale_time } = res.data;
        let h = { open_aftersale, open_aftersale_time };
        if (res.data.code == 0) {
          console.log(that.data.page);
          let data = res.data.data;
          let rushList = that.data.order.concat(data);

          that.setData({
            order: rushList,
            hide_tip: true,
            no_order: 0,
            ...h
          });
          wx.hideLoading();
        } else {
          that.setData({
            isHideLoadMore: true,
            ...h
          })
          wx.hideLoading();
          return false;
        }

      }
    })
  },

  sign_one: function (e) {
    var that = this;
    var order_id = e.currentTarget.dataset.order_id;
    var token = wx.getStorageSync('token');
    wx.showModal({
      title: '提示',
      content: '确认提货',
      confirmColor: '#F75451',
      success(res) {
        if (res.confirm) {
          app.util.request({
            'url': 'entry/wxapp/index',
            'data': {
              controller: 'order.sign_dan_order',
              token: token,
              order_id: order_id
            },
            dataType: 'json',
            success: function (res) {
              wx.showToast({
                title: '签收成功',
                duration: 1000
              })

              var order = that.data.order;
              var new_order = [];
              for (var i in order) {
                if (order[i].order_id != order_id) {
                  new_order.push(order[i]);
                }
              }
              that.setData({
                order: new_order
              })
            }
          })
        }
      }
    })
  },

  /**
   * 跳转订单详情
   */
  goOrderDetail: function (t) {
    var a = t.currentTarget.dataset.order_id;
    wx.navigateTo({
      url: "/eaterplanet_ecommerce/moduleA/groupCenter/groupDetail?groupOrderId=" + a
    });
  },

  onReachBottom: function () {
    if (this.data.no_order == 1) return false;
    this.data.page += 1;
    this.getData();

    this.setData({
      isHideLoadMore: false
    })

  },

  handleTipDialog: function(e){
    let fen_type = e.currentTarget.dataset.type || 0;
    this.setData({
      showTipDialog: !this.data.showTipDialog,
      fen_type
    })
  }
})
