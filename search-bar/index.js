const app = getApp()

Page({

  /**
 * 生命周期函数--监听页面初次渲染完成
 */
  onReady: function () {

    let query = wx.createSelectorQuery();
    query.select('#notic').boundingClientRect(res => { //获取元素1距离页面顶部高度
    console.log("res: ", res)
      this.setData({
        fixedTop: res.top
      })
    }).exec()


  },


  /**
   * 监听用户滑动页面事件--返回页面在垂直方向已滚动的距离（单位px）
   */
  onPageScroll(e){

    console.log('height: ', e, this.data.fixedTop)

    
    let isfixed = 0
    if ((parseInt(e.scrollTop) + 300) > this.data.fixedTop) isfixed = 1;
      else isfixed = 0;

    this.setData({isfixed});
    this.opacityAnimate(isfixed);
  },



  opacityAnimate(opacity) { //创建动画
    let a = wx.createAnimation({
      duration: 300,
      timingFunction: "ease",
      delay: 0
    });
    a.translateX(-50).step();
    this.setData({
      animate: a.export()
    })
  },




})
