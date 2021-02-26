var utils = require("../../utils/index");
var location = require("../../utils/Location");
var app = getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    item: {
      type: Object,
      value: {
        rest: 0
      }
    },
    city: Object,
    isOld: {
      type: Boolean,
      value: false
    },
    groupInfo: {
      type: Object,
      value: {
        group_name: '社区',
        owner_name: '团长'
      }
    },
    hiddenDetails: {
      type: Number,
      value: 0
    },
    skin: {
      type: Object
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    chooseCommunity: function (event) {
      var community = event.currentTarget.dataset.val;
      if ("火星社区" !== community.communityName || community.communityId) {
        var disUserHeadImg = community.disUserHeadImg || community.headImg || "", 
          disUserName = community.disUserName || community.realName || "", 
          data = {
            communityId: community.communityId,
            communityName: community.communityName,
            disUserName: disUserName,
            disUserHeadImg: disUserHeadImg,
            communityAddress: community.communityAddress,
            distance: community.distance,
            fullAddress: community.fullAddress || community.communityAddress,
            lat: community.lat,
            lon: community.lon
          }, 
          city = this.data.city;
        (0, utils.changeCommunity)(data, city);
      } else {
        location.openSetting(app).then(function () {
          location.checkGPS(app, function () { });
        });
      }
    }
  }
})
