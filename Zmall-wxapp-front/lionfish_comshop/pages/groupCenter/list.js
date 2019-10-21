var page = 1, app = getApp();

Page({
    data: {
        needAuth: !1,
        isHideLoadMore: !0,
        loadText: "正在加载",
        list: [],
        queryData: {
            createTime: null,
            communityId: null,
            page: page,
            pageSize: 20
        },
        status: [ "待配送", "配送中", "已送达团长" ],
        page: 1,
        searchKey: ""
    },
    onLoad: function(a) {
        this.data.queryData.createTime = null, this.getData();
    },
    getData: function() {
        wx.showLoading({
            title: "加载中...",
            mask: !0
        }), this.setData({
            isHideLoadMore: !0
        }), this.data.no_list = 1;
        var e = this, a = wx.getStorageSync("token");
        app.util.request({
            url: "entry/wxapp/index",
            data: {
                controller: "community.get_head_deliverylist",
                date: e.data.date,
                searchKey: e.data.searchKey,
                token: a,
                page: e.data.page
            },
            dataType: "json",
            success: function(a) {
                if (0 != a.data.code) return e.setData({
                    isHideLoadMore: !0
                }), wx.hideLoading(), !1;
                console.log(e.data.page);
                var t = e.data.list.concat(a.data.data);
                e.setData({
                    list: t,
                    hide_tip: !0,
                    no_list: 0
                }), wx.hideLoading();
            }
        });
    },
    bindSearchChange: function(a) {
        this.setData({
            searchKey: a.detail.value
        });
    },
    searchByKey: function() {
        page = 1, this.setData({
            list: [],
            no_list: 0,
            page: 1
        }), this.data.queryData.memberNickName = this.data.searchKey, this.getData();
    },
    cancel: function() {
        page = 1, this.setData({
            searchKey: "",
            list: []
        }), this.data.queryData.memberNickName = null, this.getData();
    },
    bindDateChange: function(a) {
        page = 1, this.setData({
            date: a.detail.value,
            list: [],
            no_list: 0,
            page: 1
        }), this.data.queryData.createTime = new Date(a.detail.value).getTime() - 288e5, 
        this.getData();
    },
    clearDate: function() {
        page = 1, this.setData({
            date: "",
            list: [],
            no_list: 0,
            page: 1
        }), this.data.queryData.createTime = null, this.getData();
    },
    onReady: function() {},
    onShow: function() {},
    callTelphone: function(a) {
        var t = this, e = a.currentTarget.dataset.phone;
        "未下单" != e && (this.data.isCalling || (this.data.isCalling = !0, wx.makePhoneCall({
            phoneNumber: e,
            complete: function() {
                t.data.isCalling = !1;
            }
        })));
    },
    authSuccess: function() {},
    goDetails: function(a) {
        var t = a.currentTarget.dataset.state, e = a.currentTarget.dataset.id;
        wx.navigateTo({
            url: "/lionfish_comshop/pages/groupCenter/listDetails?id=" + e + "&state=" + t
        });
    },
    onHide: function() {},
    onUnload: function() {},
    onPullDownRefresh: function() {},
    onReachBottom: function() {
        if (1 == this.data.no_list) return !1;
        this.data.page += 1, this.getData(), this.setData({
            isHideLoadMore: !1
        });
    }
});