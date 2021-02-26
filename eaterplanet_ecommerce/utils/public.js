var app = getApp(), flag = true;

/**
 * 加入购物车
 */
function addToCart(data, fn) {
  if (flag){
    flag = false;
    // 请求数据
    // 成功
    wx.hideLoading();
    wx.showToast({
      title: "已加入购物车",
      image: "../../images/addShopCart.png"
    })
    flag = true;
    app.globalData.cartNum += data.goodsNum;
    fn && fn();
    // 失败
    flag = true;
    fn && fn();
  }
}

/**
 * 购物车提交
 */
function skuConfirm(data, fn) {
  //请求
  //成功
  fn && fn();
  // app.globalData.settleInfo = res.data;
  wx.navigateTo({
    url: "/eaterplanet_ecommerce/pages/order/placeOrder"
  });
  // 失败
  // 100008 === t.head.error && wx.showToast({
  //   title: "购买单数已达到上限，无法购买此商品",
  //   icon: "none"
  // });
}

/**
 * 手机formID
 */
function collectFormIds(e) {
  console.log(e)
  var formIds = app.globalData.formIds;
  if (!formIds)
  {
    formIds = [];
  }
  formIds.push(e), app.globalData.formIds = formIds;
  var token = wx.getStorageSync('token');
  
  app.util.request({
    'url': 'entry/wxapp/index',
    'data': {
      controller: 'user.get_member_form_id',
      token: token,
      from_id: e
    },
    dataType: 'json',
    success: function (res) {
    }
  })

}

/**
 * 手机验证
 */
function checkMobile(t) {
  return /^1[1-9][0-9]\d{8}$/.test(t);
}

/**
 * 身份证验证
 */
function isIdCard(t) {
  return /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(t);
}

module.exports = {
  addToCart,
  skuConfirm,
  collectFormIds, 
  checkMobile,
  isIdCard
}
