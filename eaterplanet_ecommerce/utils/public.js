const app = getApp();

// 加入购物车
const addToCart = async (data, fn) => {
  if (!this.flag) return;
  this.flag = false;
  try {
    // 请求数据
    wx.hideLoading();
    wx.showToast({
      title: "已加入购物车",
      image: "../../images/addShopCart.png"
    });
    app.globalData.cartNum += data.goodsNum;
    fn && fn();
  } catch (error) {
    console.error(error);
  } finally {
    this.flag = true;
    fn && fn();
  }
};

// 购物车提交
const skuConfirm = async (data, fn) => {
  try {
    // 请求
    fn && fn();
    // app.globalData.settleInfo = res.data;
    wx.navigateTo({
      url: "/eaterplanet_ecommerce/pages/order/placeOrder"
    });
  } catch (error) {
    console.error(error);
    // 100008 === t.head.error && wx.showToast({
    //   title: "购买单数已达到上限，无法购买此商品",
    //   icon: "none"
    // });
  }
};

// 收集表单 ID
const collectFormIds = async (e) => {
  console.log(e);
  let formIds = app.globalData.formIds || [];
  formIds.push(e);
  app.globalData.formIds = formIds;
  const token = wx.getStorageSync('token');

  try {
    await app.util.request({
      url: 'entry/wxapp/index',
      data: {
        controller: 'user.get_member_form_id',
        token: token,
        from_id: e
      },
      dataType: 'json'
    });
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  addToCart,
  skuConfirm,
  collectFormIds
};