module.exports = {
    data: {
        visible: !1,
        stopClick: !1
    },
    authModal: function() {
        return !this.data.needAuth || (this.setData({
            showAuthModal: !this.data.showAuthModal
        }), !1);
    }
};