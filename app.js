const util = require('lib/util.js');
const timeQueue = require('eaterplanet_ecommerce/utils/timeQueue');
const mta = require('lib/mta_analysis.js');
require('eaterplanet_ecommerce/utils//mixins.js');
require('/lib/SPage.js');

App({
    onLaunch: async function (options) {
        const scene = options.scene || '';
        this.globalData.scene = scene;
        console.log(`scene: ${scene}`);
        const userInfo = wx.getStorageSync('userInfo');
        this.globalData.userInfo = userInfo;
        wx.setStorageSync('isparse_formdata', 0);
        const currentCommunity = wx.getStorageSync('community');
        this.globalData.hasDefaultCommunity = !!currentCommunity;
        this.globalData.community = currentCommunity;
        this.globalData.systemInfo = wx.getSystemInfoSync();
        const model = this.globalData.systemInfo.model;
        this.globalData.isIpx = model.indexOf('iPhone X') > -1 || model.indexOf('unknown<iPhone') > -1;
        this.globalData.timer = new timeQueue.default();
        mta.App.init({
            appID: '',
            eventID: '',
            autoReport: true,
            statParam: true,
            ignoreParams: ['test_adt'],
            lauchOpts: true,
            statPullDownFresh: true,
            statShareApp: true,
            statReachBottom: true
        });
    },
    $mixinP: {
        onLoad(options) {
            console.log('options', options);
        }
    },
    onShow: function () {
        if (this.globalData.scene !== 1154) this.getUpdate();
    },
    onHide: function () { },
    util,
    userInfo: {
        sessionid: null,
    },
    globalData: {
        systemInfo: {},
        isIpx: false,
        userInfo: {},
        canGetGPS: true,
        city: {},
        community: {},
        location: {},
        hasDefaultCommunity: true,
        historyCommunity: [],
        changedCommunity: false,
        disUserInfo: {},
        changeCity: '',
        timer: 0,
        formIds: [],
        community_id: '',
        placeholdeImg: '',
        cartNum: 0,
        cartNumStamp: 0,
        common_header_backgroundimage: '',
        appLoadStatus: 1,
        goodsListCarCount: [],
        typeCateId: 0,
        navBackUrl: '',
        isblack: 0,
        statusBarHeight: wx.getSystemInfoSync()['statusBarHeight'],
        skin: {
            color: '#ff5344',
            subColor: '#ed7b3a',
            lighter: '#fff9f4'
        },
        goods_sale_unit: '件',
        scene: '',
        indexCateId: '',
    },
    getUpdate: function () {
        if (!wx.canIUse("getUpdateManager")) {
            wx.showModal({
                title: "提示",
                content: "当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。"
            });
            return;
        }

        const updateManager = wx.getUpdateManager();
        updateManager.onCheckForUpdate(function (res) {
            if (res.hasUpdate) {
                updateManager.onUpdateReady(function () {
                    wx.showModal({
                        title: "更新提示",
                        content: "新版本已经准备好，是否马上重启小程序？",
                        success: function (t) {
                            if (t.confirm) {
                                updateManager.applyUpdate();
                            }
                        }
                    });
                });
                updateManager.onUpdateFailed(function () {
                    wx.showModal({
                        title: "已经有新版本了哟~",
                        content: "新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~"
                    });
                });
            }
        });
    },
    getConfig: function () {
        const token = wx.getStorageSync('token');
        return util.request({
            url: 'entry/wxapp/user',
            data: {
                controller: 'index.get_firstload_msg',
                token,
                m: 'eaterplanet_ecommerce'
            },
            method: 'post',
            dataType: 'json'
        }).then(res => {
            if (res.data.code === 0) {
                const { new_head_id, default_head_info, isparse_formdata } = res.data;
                if (!token) {
                    isparse_formdata = 0;
                }
                wx.setStorageSync('isparse_formdata', isparse_formdata);

                if (new_head_id > 0 && Object.keys(default_head_info).length) {
                    wx.setStorageSync('community', default_head_info);
                }
                return res;
            } else {
                throw new Error('获取小程序配置失败');
            }
        });
    },

    setShareConfig: function () {
        wx.showShareMenu({
            menus: ['shareAppMessage', 'shareTimeline']
        });
    },

    siteInfo: require('siteinfo.js')
});
