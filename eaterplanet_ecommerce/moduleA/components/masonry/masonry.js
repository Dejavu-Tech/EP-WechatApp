/**
 * 瀑布流组件
 */
Component({
  properties: {
    intervalWidth: {
      type: String,
      value: "20rpx"
    }
  },
  data: {
    items: [],
    stopMasonry: false
  },
  methods: {
    /**
     * 批量添加元素
     * 
     * @param {Array} items - 新增的元素数组 
     */
    append(items) {
      if (Object.prototype.toString.call(items) !=='[object Array]') {
        console.error("[masonry]参数类型错误，渲染失败");
        return false;
      }

      this.setData({
        stopMasonry: false
      })
      
      return this._refresh(items);
    },

    /**
     * 批量删除瀑布流中的元素
     * 
     * @param {Number} start - 开始下标 
     * @param {Number} end  - 结束下标
     */
    delete(start, end) {
      const { items } = this.data;
      if (start < end && start < items.length - 1) {
        let len = end- start;
        let newItems = items.splice(start, len);
        this._refresh(newItems)
      } else {
        console.error("[masonry]初始下标异常，删除失败！");
      }
    },

    /**
     * 更新数组中的某个元素
     * 
     * @param {Object} newItem  - 修改后的元素
     * @param {Number} index - 需要更新的数组下标
     */
    updateItem(newItem, index) {
      const { items } = this.data;
      if (index <= items.length - 1) {
        this.setData({
          items: [
            ...items.slice(0, index),
            Object.assign(items[index], newItem),
            ...items.slice(index + 1)
          ]
        })
      } else {
        console.error("[masonry]下标越界，修改失败！");
      }
    },

    /**
     * 删除瀑布流中的某个元素
     * 
     * @param {Number} index - 数组下标
     */
    deleteItem(index) {
      const { items } = this.data;
      if (index <= items.length - 1) {
        let newItems = items.splice(index, 1);
        this._refresh(newItems)
      } else {
        console.error("[masonry]下标越界，删除失败！");
      }
    },

    /**
     * 刷新瀑布流
     * 
     * @param {Array} items - 参与渲染的元素数组 
     */
    start(items) {
      if (Object.prototype.toString.call(items) !=='[object Array]') {
        console.error("[masonry]参数类型错误，渲染失败");
        return false;
      }
      
      this.setData({
        items: [],
        stopMasonry: false
      })

      return this._refresh(items);
    },

    /**
     *  停止渲染瀑布流
     */
    stop() {
      this.setData({
        stopMasonry: true,
        items: []
      })
    },

    /**
     * 刷新瀑布流
     * 
     * @param {Array} items - 参与渲染的元素数组 
     */
    _refresh(items) {
      const query = wx.createSelectorQuery().in(this)
      this.columnNodes = query.selectAll('#left-col-inner, #right-col-inner')

      return new Promise((resolve, reject) => {
        this._render(items, 0, () => {
          resolve()
        })
      })
    },

    /**
     * 渲染函数
     * 
     * @param {Array} items  - 正在渲染的数组
     * @param {Number} i  - 当前渲染元素的下标
     * @param {Function} onComplete - 完成后的回调函数
     */
    _render (items, i, onComplete) {
      if (items.length > i && !this.data.stopMasonry) {
        this.columnNodes.boundingClientRect().exec(arr => {
          const item = items[i]
          const rects = arr[0]
          const leftColHeight = rects[0].height
          const rightColHeight = rects[1].height

          this.setData({
            items: [...this.data.items, {
              ...item,
              columnPosition: leftColHeight <= rightColHeight ? 'left' : 'right'
            }]
          }, () => {
            this._render(items, ++i, onComplete)
          })
        })
      } else {
        onComplete && onComplete()
      }
    },
    
    needAuth: function () {
      this.triggerEvent('needAuth');
    }
  }
});
