var goodsBehavior = require('../behavior/goods.js');
var app = getApp();
Component({
    attached() {
        this.setData({ placeholdeImg: app.globalData.placeholdeImg })
    },
    data: {
        placeholderImage: '{{placeholdeImg ? placeholdeImg : "../../images/placeholder-refund.png"}}'
    },
    behaviors: [goodsBehavior]
});