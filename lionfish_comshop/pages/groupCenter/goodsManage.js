var app = getApp(), util = require("../../utils/util.js");

Page({
    data: {
        isIpx: !1,
        goods: [ {
            name: "大苹果",
            image: "https://shiziyu.liofis.com/attachment/images/3/2019/03/S3sWb8he8w9ujHJ70bI8JUh2wuJjbS.jpg?imageView2/2/w/240/h/240/ignore-error/1",
            status_name: "上架",
            checked: !1
        }, {
            name: "大苹果",
            image: "https://shiziyu.liofis.com/attachment/images/3/2019/03/S3sWb8he8w9ujHJ70bI8JUh2wuJjbS.jpg?imageView2/2/w/240/h/240/ignore-error/1",
            status_name: "上架",
            checked: !0
        } ],
        checkedAll: !1,
        checkedCount: 0
    },
    onLoad: function(e) {
        util.check_login() || wx.redirectTo({
            url: "/lionfish_comshop/pages/user/me"
        }), app.globalData.isIpx && this.setData({
            isIpx: !0
        });
    },
    onShow: function() {},
    checkboxChange: function(e) {
        var t = e.currentTarget.dataset.type, c = e.currentTarget.dataset.index, a = this.data.goods, i = this.data.checkedAll;
        if ("all" === t) {
            var o = 0;
            i ? a.forEach(function(e) {
                e.checked = 0;
            }) : (a.forEach(function(e) {
                e.checked = 1;
            }), o = a.length), this.setData({
                checkedCount: o,
                goods: a,
                checkedAll: !i
            });
        } else if ("item" === t) {
            a.forEach(function(e, t) {
                c == t && (e.checked ? e.checked = 0 : e.checked = 1);
            });
            var h = 0;
            a.forEach(function(e) {
                e.checked && h++;
            }), this.setData({
                checkedCount: h,
                goods: a,
                checkedAll: h == a.length
            });
        }
    },
    onPullDownRefresh: function() {},
    onReachBottom: function() {}
});