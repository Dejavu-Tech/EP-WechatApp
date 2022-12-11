module.exports =
Component({
  onHide: function () { },
  onUnload: function () { },
  options: {
    multipleSlots: true,
    addGlobalClass: true
  },
  properties: {
    extClass: {
      type: String,
      value: ''
    },
    background: {
      type: String,
      value: '',
      observer: '_showChange'
    },
    backgroundColorTop: {
      type: String,
      value: 'rgba(44, 44, 44, 0)',
      observer: '_showChangeBackgroundColorTop'
    },
    color: {
      type: String,
      value: 'rgba(0, 0, 0, 1)'
    },
    title: {
      type: String,
      value: ''
    },
    searchText: {
      type: String,
      value: '点我搜索'
    },
    titleimg: {
      type: Boolean,
      value: false
    },
    titleimgplus: {
      type: Boolean,
      value: false
    },
    weather: {
      type: Boolean,
      value: false
    },
    filter: {
      type: Boolean,
      value: false
    },
    group: {
      type: Boolean,
      value: false
    },
    searchBar: {
      type: Boolean,
      value: false
    },
    back: {
      type: Boolean,
      value: false
    },
    home: {
      type: Boolean,
      value: false
    },
    iconTheme: {
      type: String,
      value: 'black'
    },
    /* animated: {
      type: Boolean,
      value: true
    },
    show: {
      type: Boolean,
      value: true,
      observer: '_showChange'
    }, */
    delta: {
      type: Number,
      value: 1
    }
  },
  created: function created() {
    this.getSystemInfo();
  },
  attached: function attached() {
    this.setStyle(); // 设置样式
  },

  data: {},
  pageLifetimes: {
    show: function show() {
      if (getApp().globalSystemInfo.ios) {
        this.getSystemInfo();
        this.setStyle(); // 设置样式1
      }
    },
    hide: function hide() {}
  },
  methods: {
    goResult: function (t) {
      var a = t.detail.value.replace(/\s+/g, "");
      a ? wx.navigateTo({
        url: "/eaterplanet_ecommerce/pages/type/result?keyword=" + a
      }) : wx.showToast({
        title: "请输入关键词",
        icon: "none"
      });
    },
    setStyle: function setStyle(life) {
      var _getApp$globalSystemI = getApp().globalSystemInfo,
          statusBarHeight = _getApp$globalSystemI.statusBarHeight,
          navBarHeight = _getApp$globalSystemI.navBarHeight,
          capsulePosition = _getApp$globalSystemI.capsulePosition,
          navBarExtendHeight = _getApp$globalSystemI.navBarExtendHeight,
          ios = _getApp$globalSystemI.ios,
          windowWidth = _getApp$globalSystemI.windowWidth;
      var _data = this.data,
          back = _data.back,
          home = _data.home,
          title = _data.title;

      var rightDistance = windowWidth - capsulePosition.right; // 胶囊按钮右侧到屏幕右侧的边距
      var leftWidth = windowWidth - capsulePosition.left; // 胶囊按钮左侧到屏幕右侧的边距

      var navigationbarinnerStyle = ['color: ' + this.data.color, 'background: ' + this.data.background, 'height:' + (navBarHeight + navBarExtendHeight) + 'px', 'padding-top:' + statusBarHeight + 'px', 'padding-right:' + leftWidth + 'px', 'padding-bottom:' + navBarExtendHeight + 'px'].join(';');
      var navBarLeft = [];
      if (back && !home || !back && home) {
        navBarLeft = ['width:' + capsulePosition.width + 'px', 'height:' + capsulePosition.height + 'px'].join(';');
      } else if (back && home || title) {
        navBarLeft = ['width:' + capsulePosition.width + 'px', 'height:' + capsulePosition.height + 'px', 'margin-left:' + rightDistance + 'px'].join(';');
      } else {
        navBarLeft = ['width:auto', 'margin-left:0px'].join(';');
      }
      if (life === 'created') {
        this.data = {
          navigationbarinnerStyle: navigationbarinnerStyle,
          navBarLeft: navBarLeft,
          navBarHeight: navBarHeight,
          capsulePosition: capsulePosition,
          navBarExtendHeight: navBarExtendHeight,
          ios: ios
        };
      } else {
        this.setData({
          navigationbarinnerStyle: navigationbarinnerStyle,
          navBarLeft: navBarLeft,
          navBarHeight: navBarHeight,
          capsulePosition: capsulePosition,
          navBarExtendHeight: navBarExtendHeight,
          ios: ios
        });
      }
    },
    _showChange: function _showChange() {
      this.setStyle();
    },

    // 返回事件
    back: function back() {
      this.triggerEvent('back', { delta: this.data.delta });
    },
    home: function home() {
      this.triggerEvent('home', { delta: this.data.delta });
    },
    search: function search() {
      this.triggerEvent('search', {});
    },
    getMenuButtonBoundingClientRect: function getMenuButtonBoundingClientRect(systemInfo) {
      var ios = !!(systemInfo.system.toLowerCase().search('ios') + 1);
      var rect = void 0;
      try {
        rect = wx.getMenuButtonBoundingClientRect ? wx.getMenuButtonBoundingClientRect() : null;
        if (rect === null) {
          throw new Error('getMenuButtonBoundingClientRect error');
        }
      } catch (error) {
        var gap = ''; // 胶囊按钮上下间距 使导航内容居中
        var width = 96; // 胶囊的宽度
        if (systemInfo.platform === 'android') {
          gap = 8;
          width = 96;
        } else if (systemInfo.platform === 'devtools') {
          if (ios) {
            gap = 5.5; // 开发工具中ios手机
          } else {
            gap = 7.5; // 开发工具中android和其他手机
          }
        } else {
          gap = 4;
          width = 88;
        }
        if (!systemInfo.statusBarHeight) {
          // 开启wifi的情况下修复statusBarHeight值获取不到
          systemInfo.statusBarHeight = systemInfo.screenHeight - systemInfo.windowHeight - 20;
        }
        rect = {
          // 获取不到胶囊信息就自定义重置一个
          bottom: systemInfo.statusBarHeight + gap + 32,
          height: 32,
          left: systemInfo.windowWidth - width - 10,
          right: systemInfo.windowWidth - 10,
          top: systemInfo.statusBarHeight + gap,
          width: width
        };
      }
      return rect;
    },
    getSystemInfo: function getSystemInfo() {
      var app = getApp();
      if (app.globalSystemInfo && !app.globalSystemInfo.ios) {
        return app.globalSystemInfo;
      } else {
        var systemInfo = wx.getSystemInfoSync();
        var ios = !!(systemInfo.system.toLowerCase().search('ios') + 1);
        var rect = this.getMenuButtonBoundingClientRect(systemInfo);

        var navBarHeight = '';
        if (!systemInfo.statusBarHeight) {
          systemInfo.statusBarHeight = systemInfo.screenHeight - systemInfo.windowHeight - 20;
          navBarHeight = function () {
            var gap = rect.top - systemInfo.statusBarHeight;
            return 2 * gap + rect.height;
          }();

          systemInfo.statusBarHeight = 0;
          systemInfo.navBarExtendHeight = 0; // 下方扩展4像素高度 防止下方边距太小
        } else {
          navBarHeight = function () {
            var gap = rect.top - systemInfo.statusBarHeight;
            return systemInfo.statusBarHeight + 2 * gap + rect.height;
          }();
          if (ios) {
            systemInfo.navBarExtendHeight = 4; // 下方扩展4像素高度 防止下方边距太小
          } else {
            systemInfo.navBarExtendHeight = 0;
          }
        }
        systemInfo.navBarHeight = navBarHeight; // 导航栏高度不包括statusBarHeight
        systemInfo.capsulePosition = rect;
        systemInfo.ios = ios; // 是否ios

        app.globalSystemInfo = systemInfo; // 将信息保存到全局变量中,后边再用就不用重新异步获取了

        // console.log('systemInfo', systemInfo);
        return systemInfo;
      }
    }
    
  }
});

