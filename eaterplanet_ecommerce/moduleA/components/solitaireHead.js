var status = require('../../utils/index.js');

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    community: {
      type: Object,
      value: {
        "head_id": 0,
        "community_name": "团长",
        "head_name": "社区",
        "avatar": ""
      }
    },
    showShare: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    groupInfo: {
      group_name: '社区',
      owner_name: '团长'
    }
  },

  attached() {
    let that = this;
    status.setGroupInfo().then((groupInfo) => {
      that.setData({ groupInfo })
    });
  },

  methods: {
    shareQuan: function(){
      this.triggerEvent('share');
    }
  }
})
