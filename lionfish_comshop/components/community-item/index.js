var utils = require("../../utils/index"), location = require("../../utils/Location"), app = getApp();

Component({
    properties: {
        item: {
            type: Object,
            value: {}
        },
        city: Object,
        isOld: {
            type: Boolean,
            value: !1
        },
        groupInfo: {
            type: Object,
            value: {
                group_name: "社区",
                owner_name: "团长"
            }
        },
        hiddenDetails: {
            type: Number,
            value: 0
        }
    },
    methods: {
        chooseCommunity: function(e) {
            var t = e.currentTarget.dataset.val;
            if ("火星社区" !== t.communityName || t.communityId) {
                var i = t.disUserHeadImg || t.headImg || "", a = t.disUserName || t.realName || "", m = {
                    communityId: t.communityId,
                    communityName: t.communityName,
                    disUserName: a,
                    disUserHeadImg: i,
                    communityAddress: t.communityAddress,
                    distance: t.distance,
                    fullAddress: t.fullAddress || t.communityAddress
                }, n = this.data.city;
                (0, utils.changeCommunity)(m, n);
            } else location.openSetting(app).then(function() {
                location.checkGPS(app, function() {});
            });
        }
    }
});