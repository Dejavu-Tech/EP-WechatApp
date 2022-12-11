var util = require('../../utils/util.js');
var status = require('../../utils/index.js');
var locat = require('../../utils/Location.js');
var app = getApp()
var clearTime = null;
Page({
  mixins: [require('../../mixin/globalMixin.js')],
  data: {
    pass: -2,
    canSubmit: false,
    region: ['选择地址', '', ''],
    addr_detail: '',
    lon_lat: '',
    focus_mobile: false,
    showCountDown: true,
    timeStamp: 60,
    apply_complete: false,
    wechat: '',
    needAuth: false,
    member_info: {
      is_head: 0
    },
    groupInfo: {
      group_name: '社区',
      owner_name: '团长'
    }
  },
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
  community_id: '',
  cansub: true,

  bindRegionChange: function(e) {
    this.setData({
      region: e.detail.value.replace(/^\s*|\s*$/g, "")
    })
  },

  inputAddress: function(e) {
    this.setData({
      addr_detail: e.detail.value.replace(/^\s*|\s*$/g, "")
    })
  },

  inputCommunity: function(e) {
    this.setData({
      community_name: e.detail.value.replace(/^\s*|\s*$/g, "")
    })
  },

  inputMobile: function(e) {
    this.setData({
      mobile_detail: e.detail.value.replace(/^\s*|\s*$/g, "")
    })
  },

  inputRealName: function(e) {
    this.setData({
      head_name: e.detail.value.replace(/^\s*|\s*$/g, "")
    })
  },

  inputWechat: function(e) {
    this.setData({
      wechat: e.detail.value.replace(/^\s*|\s*$/g, "")
    })
  },

  chose_location: function() {
    var that = this;
    wx.chooseLocation({
      success: function(e) {
        var lon_lat = e.longitude + ',' + e.latitude;
        var path = e.address;
        var s_region = that.data.region;
        var dol_path = '';

        var str = path;
        var patt = new RegExp("(.*?省)(.*?市)(.*?区)", "g");
        var result = patt.exec(str);
        if (result == null) {
          patt = new RegExp("(.*?省)(.*?市)(.*?市)", "g");
          result = patt.exec(str);
          if (result == null) {
            patt = new RegExp("(.*?省)(.*?市)(.*县)", "g");
            result = patt.exec(str);
            if (result != null) {
              s_region[0] = result[1];
              s_region[1] = result[2];
              s_region[2] = result[3];
              dol_path = path.replace(result[0], '');
            }
          } else {
            s_region[0] = result[1];
            s_region[1] = result[2];
            s_region[2] = result[3];
            dol_path = path.replace(result[0], '');
          }
        } else {
          s_region[0] = result[1];
          s_region[1] = result[2];
          s_region[2] = result[3];
          dol_path = path.replace(result[0], '');
        }
        var filename = dol_path + e.name;
        let addr_detail = filename;

        let address_component = '';
        locat.getGpsLocation(e.latitude, e.longitude).then((res) => {
          console.log(res)
          address_component = res;
          if (address_component) {
            s_region[0] = address_component.province;
            s_region[1] = address_component.city;
            s_region[2] = address_component.district;
            s_region[3] = address_component.town;
            addr_detail = filename || address_component.street;
          }
          that.setData({
            region: s_region,
            lon_lat: lon_lat,
            addr_detail
          })
        });

        if (s_region[0] == '省') {
          wx.showToast({
            title: '请重新选择省市区',
            icon: 'none',
          })
        }
      },
      fail: function(e) {
        console.log('地址获取失败', e)
      }
    })
  },

  /**
   * 订阅消息
   */
  subscriptionNotice: function() {
    console.log('subscriptionNotice')
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
          fail() {
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

  submit: function() {
    if (!this.authModal()) return;

    let that = this;
    var token = wx.getStorageSync('token');
    var province_name = this.data.region[0];
    var city_name = this.data.region[1];
    var area_name = this.data.region[2];
    let country_name = this.data.region[3] || '';
    var addr_detail = this.data.addr_detail;
    var community_name = this.data.community_name;
    var mobile = this.data.mobile_detail;
    var lon_lat = this.data.lon_lat;
    var head_name = this.data.head_name;
    var wechat = this.data.wechat;
    let member_info = this.data.member_info;

    if (head_name == '' || head_name === void 0) {
      wx.showToast({
        title: '请填写姓名',
        icon: 'none'
      })
      return false;
    }

    if (mobile == '' || !(/^1(3|4|5|6|7|8|9)\d{9}$/.test(mobile))) {
      this.setData({
        focus_mobile: true
      })
      wx.showToast({
        title: '手机号码有误',
        icon: 'none'
      })
      return false;
    }

    if (wechat == '' || wechat === void 0) {
      wx.showToast({
        title: '请填写' + (member_info.wechat_div?member_info.wechat_div:'微信号'),
        icon: 'none'
      })
      return false;
    }

    if (community_name == '' || community_name === void 0) {
      wx.showToast({
        title: '请填写小区名称',
        icon: 'none'
      })
      return false;
    }

    if (province_name == '省' && city_name == '市' && area_name == '区') {
      wx.showToast({
        title: '请选择地区',
        icon: 'none'
      })
      return false;
    }

    if (lon_lat == '' || lon_lat === void 0) {
      wx.showToast({
        title: '请选择地图位置',
        icon: 'none'
      })
      return false;
    }

    if (addr_detail == '' || addr_detail === void 0) {
      wx.showToast({
        title: '请填写详细地址',
        icon: 'none'
      })
      return false;
    }

    var s_data = {
      province_name,
      city_name,
      area_name,
      lon_lat,
      addr_detail,
      community_name,
      mobile,
      head_name,
      wechat,
      controller: 'community.sub_community_head',
      token: token,
      community_id: this.community_id,
      country_name
    };

    let is_need_subscript = this.data.is_need_subscript;
    if(is_need_subscript==1) {
      //弹出订阅消息
      this.subscriptionNotice().then(()=>{
        that.preSubmit(s_data);
      }).catch(()=>{
        that.preSubmit(s_data);
      });
    } else {
      that.preSubmit(s_data);
    }
  },

  preSubmit: function(s_data) {
    if(!this.cansub) return;
    this.cansub = false;
    var that = this;
    app.util.request({
      url: 'entry/wxapp/user',
      data: s_data,
      method: 'post',
      dataType: 'json',
      success: function(res) {
        if (res.data.code == 0) {
          wx.showToast({
            title: '提交成功，等待审核',
            icon: 'none',
            duration: 2000
          })
          that.setData({
            apply_complete: true
          })
        } else {
          that.setData({
            needAuth: true
          })
        }
        that.cansub = true;
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;
    status.setNavBgColor();
    status.setGroupInfo().then((groupInfo) => {
      let owner_name = groupInfo && groupInfo.owner_name || '团长';
      that.setData({ groupInfo })
      wx.setNavigationBarTitle({
        title: `${owner_name}申请`,
      })
    });

    var scene = decodeURIComponent(options.scene);
    if (scene != 'undefined') {
      this.community_id = scene;
    }
    this.getUserInfo();
    this.checkSubscript();
  },

  onShow: function () {
    let that = this;
    util.check_login_new().then((res) => {
      if (res) {
        that.setData({ needAuth: false });
      } else {
        that.setData({ needAuth: true });
      }
    })
  },

  authModal: function () {
    if (this.data.needAuth) {
      this.setData({ showAuthModal: !this.data.showAuthModal });
      return false;
    }
    return true;
  },

  /**
   * 授权成功回调
   */
  authSuccess: function() {
    let that = this;
    this.setData({
      needAuth: false
    }, () => {
      that.getUserInfo();
    })
  },

  getUserInfo: function() {
    let that = this;
    var token = wx.getStorageSync('token');
    app.util.request({
      'url': 'entry/wxapp/user',
      'data': {
        controller: 'user.get_user_info',
        token: token
      },
      dataType: 'json',
      success: function(res) {
        if (res.data.code == 0) {
          let member_info = res.data.data || { is_head: 0 };
          if(member_info.is_head==1){
            app.util.message('您已通过审核', '/eaterplanet_ecommerce/moduleA/groupCenter/index', 'error');
          }
          that.setData({
            member_info
          });
        } else {
          //is_login
          that.setData({
            needAuth: true
          })
        }
      }
    })
  },

  applyAgain: function() {
    var member_info = this.data.member_info;
    member_info.is_head = 0;

    this.setData({
      member_info: member_info
    });
  },

  countDown: function() {
    var that = this;
    clearInterval(clearTime),
      clearTime = setInterval(function() {
        var ts = that.data.timeStamp,
          ct = that.data.showCountDown;
        ts > 0 ? ts-- : (ct = true, clearInterval(clearTime), ts = 60),
          that.setData({
            showCountDown: ct,
            timeStamp: ts
          });
      }, 1000);
  },

  checkSubscript: function() {
    let that = this;
    var token = wx.getStorageSync('token');
    token && app.util.request({
      url: 'entry/wxapp/user',
      data: {
        controller: 'community.check_head_subscriptapply',
        token: token
      },
      dataType: 'json',
      success: function(res) {
        if (res.data.code == 0) {
          let { is_need_subscript,need_subscript_template } = res.data;
          that.setData({
            is_need_subscript,
            need_subscript_template
          });
        }
      }
    })
  }
})
