Component({
    properties: {
        changeCommunity: {
            type: Object,
            value: {}
        },
        community: {
            type: Object,
            value: {}
        },
        visible: {
            type: Boolean,
            value: !1
        },
        canChange: {
            type: Boolean,
            value: !0
        },
        groupInfo: {
            type: Object,
            value: {
                group_name: "社区",
                owner_name: "团长"
            }
        }
    },
    methods: {
        switchCommunity: function(e) {
            0 != e.currentTarget.dataset.type && this.data.canChange ? this.data.canChange && this.triggerEvent("changeComunity") : this.closeModal();
        },
        closeModal: function() {
            this.setData({
                visible: !1
            });
        }
    }
});