var app = getApp(), flag = !0;

function addToCart(o, a) {
    flag && (flag = !1, wx.hideLoading(), wx.showToast({
        title: "已加入购物车",
        image: "../../images/addShopCart.png"
    }), flag = !0, app.globalData.cartNum += o.goodsNum, a && a(), flag = !0, a && a());
}

function skuConfirm(o, a) {
    a && a(), wx.navigateTo({
        url: "/lionfish_comshop/pages/order/placeOrder"
    });
}

function collectFormIds(o) {
    console.log(o);
    var a = app.globalData.formIds;
    a || (a = []), a.push(o), app.globalData.formIds = a;
    var e = wx.getStorageSync("token");
    app.util.request({
        url: "entry/wxapp/index",
        data: {
            controller: "user.get_member_form_id",
            token: e,
            from_id: o
        },
        dataType: "json",
        success: function(o) {}
    });
}

function checkMobile(o) {
    return /^1[1-9][0-9]\d{8}$/.test(o);
}

function isIdCard(o) {
    return /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(o);
}

module.exports = {
    addToCart: addToCart,
    skuConfirm: skuConfirm,
    collectFormIds: collectFormIds,
    checkMobile: checkMobile,
    isIdCard: isIdCard
};