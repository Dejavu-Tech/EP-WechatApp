// 保存原生的 Page 函数
const originPage = Page;

Page = (options) => {
  const { mixins } = options;
  // mixins 必须为数组
  if (Array.isArray(mixins)) {
    delete options.mixins;
    // mixins 注入并执行相应逻辑
    options = merge(mixins, options);
  }
  // 释放原生 Page 函数
  originPage(options);
};

// 定义小程序内置的属性/方法
const originProperties = ['data', 'properties', 'options'];
const originMethods = [
  'onLoad', 'onReady', 'onShow', 'onHide', 'onUnload',
  'onPullDownRefresh', 'onReachBottom', 'onShareAppMessage',
  'onPageScroll', 'onTabItemTap'
];

const merge = (mixins, options) => {
  mixins.forEach((mixin) => {
    if (Object.prototype.toString.call(mixin) !== '[object Object]') {
      throw new Error('mixin 类型必须为对象！');
    }
    // 遍历 mixin 里面的所有属性
    Object.entries(mixin).forEach(([key, value]) => {
      if (originProperties.includes(key)) {
        // 内置对象属性混入
        options[key] = { ...value, ...options[key] };
      } else if (originMethods.includes(key)) {
        // 内置方法属性混入，优先执行混入的部分
        const originFunc = options[key];
        options[key] = function (...args) {
          value.call(this, ...args);
          return originFunc && originFunc.call(this, ...args);
        };
      } else {
        // 自定义方法混入
        options = { ...mixin, ...options };
      }
    });
  });
  return options;
};