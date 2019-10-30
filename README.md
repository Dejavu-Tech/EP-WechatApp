<img src="https://github.com/zhrrobert/dejavu/blob/master/images/logo.jpg" width="80px" align="left"/>  

# 蒂佳芙科技-Zmall吃货星球项目仓库
## 区域化电商团购商城H5/微信小程序/支付宝小程序/APP/公众号  统一后台多端项目
[![](https://img.shields.io/badge/Author-Albert.Z-blue.svg)](http://www.dejavu871.com)
[![](https://img.shields.io/badge/version-1.7.5-brightgreen)](https://github.com/zhrrobert/dejavu)
[![AUR](https://img.shields.io/badge/GPL-v3-red)](https://github.com/zhrrobert/dejavu/blob/master/License)
[![GitHub stars](https://img.shields.io/github/stars/zhrrobert/dejavu.svg?style=social&label=Stars)](https://github.com/zhrrobert/dejavu)
[![GitHub forks](https://img.shields.io/github/forks/zhrrobert/dejavu.svg?style=social&label=Fork)](https://github.com/zhrrobert/dejavu)
## 简介
> 吃货星球S2B2C新零售团购系统

> 基于SOA架构的分布式前后端分离，一后台多前端电商系统

> 运行于微擎或独立版后端商城管理系统
<img src="https://github.com/zhrrobert/dejavu/blob/master/images/intro.png"  align="left"/>  

### 系统功能

> wxapp截止1.6.8版本:
- 云打印机小票自动打印
- 前后台充值，余额支付
- 供应商独立后台，可独立上传商品，查看财务数据
- 支持添加独立分类页面
- 团长可添加核销人员
- 支持多种商品图片组合
- 支持客户距离团长显示范围
- 支持商品搜索
- 支持团长等级
- 支持团长三级分销
- 支持商品详情页添加视频播放
- 支持七牛云远程附件
- 支持不同商品，不同提成比例设置
- 支持商品多规格定义
- 支持独立供应商订单分拆
- 支持后台满减和满多少可下单
- 支持redis解决高并发场景
- 新人专享/秒杀/拼团
- 支持微信支付企业付款
- 团长提现直接到零钱
- 支持公众号同步通知消息
- 支持多种配送方式
- 支持商品详情页加群引导
- 支持不同会员等级不同会员折扣
- 支持无限三级分销裂变
- 支持无限创建各种专题活动页面

> 后续版本更新日志将在公众号发布
### 开发进度
> 后台系统 95%

> 微信小程序 99%

> 支付宝小程序 80%

> app 20%

> web端商城 40%

### 已部署项目
- web端商城（在线测试中）
> 测试网址Demo：http://www.ch871.com
- 商城管理系统前台
> 测试网址Demo：http://wxapp.dejavu871.com
- 微信小程序（v1.7.5）已正式运营
> 微信扫码可体验：
<img src="https://github.com/zhrrobert/dejavu/blob/master/images/value_img1_pc.png" width="300px"/> 

### 项目宣传视频
- 霸气妖吃货星球微信小程序 [点我观看](https://www.bilibili.com/video/av69788389/)

### 项目截图
- 商城管理系统前台

<img src="https://github.com/zhrrobert/dejavu/blob/master/images/master0.png" />  
<img src="https://github.com/zhrrobert/dejavu/blob/master/images/master1.png" />  
<img src="https://github.com/zhrrobert/dejavu/blob/master/images/master2.png" />  

- 微信小程序

   <td><img src="https://github.com/zhrrobert/dejavu/blob/master/images/wxapp0.png" width="280px"/></td>
   <td><img src="https://github.com/zhrrobert/dejavu/blob/master/images/wxapp1.png" width="280px"/></td> 
   <td><img src="https://github.com/zhrrobert/dejavu/blob/master/images/wxapp2.png" width="280px"/></td>


## 技术选型

### 后端技术

| 技术                 | 说明                | 官网                                                         |
| -------------------- | ------------------- | ------------------------------------------------------------ |
| Spring Boot          | 容器+MVC框架        | [https://spring.io/projects/spring-boot](https://spring.io/projects/spring-boot) |
| we7                  | 微擎管理框架      |  [https://www.w7.cc](https://www.w7.cc)   |
| Nginx                  | 反向代理web服务器      |  [http://nginx.org/](http://nginx.org/)   |
| Spring Security      | 认证和授权框架      | [https://spring.io/projects/spring-security](https://spring.io/projects/spring-security) |
| MyBatis              | ORM框架             | [http://www.mybatis.org/mybatis-3/zh/index.html](http://www.mybatis.org/mybatis-3/zh/index.html) |
| MyBatisGenerator     | 数据层代码生成      | [http://www.mybatis.org/generator/index.html](http://www.mybatis.org/generator/index.html) |
| PageHelper           | MyBatis物理分页插件 | [http://git.oschina.net/free/Mybatis_PageHelper](http://git.oschina.net/free/Mybatis_PageHelper) |
| Swagger-UI           | Api文档生产工具        | [https://github.com/swagger-api/swagger-ui](https://github.com/swagger-api/swagger-ui) |
| Hibernator-Validator | 验证框架            | [http://hibernate.org/validator/](http://hibernate.org/validator/) |
| Elasticsearch        | 搜索引擎            | [https://github.com/elastic/elasticsearch](https://github.com/elastic/elasticsearch) |
| RabbitMq             | 消息队列            | [https://www.rabbitmq.com/](https://www.rabbitmq.com/)       |
| Redis                | 分布式缓存          | [https://redis.io/](https://redis.io/)                       |
| MongoDb              | NoSql数据库         | [https://www.mongodb.com/](https://www.mongodb.com/)         |
| Docker               | 应用容器引擎        | [https://www.docker.com/](https://www.docker.com/)           |
| Druid                | 数据库连接池        | [https://github.com/alibaba/druid](https://github.com/alibaba/druid) |
| OSS                  | 对象存储            | [https://github.com/aliyun/aliyun-oss-java-sdk](https://github.com/aliyun/aliyun-oss-java-sdk) |
| JWT                  | 独立版JWT登录支持         | [https://github.com/jwtk/jjwt](https://github.com/jwtk/jjwt) |
| LogStash             | 日志收集工具        | [https://github.com/logstash/logstash-logback-encoder](https://github.com/logstash/logstash-logback-encoder) |
| Mycat              | 数据库分库中间件    | [http://www.mycat.io](http://www.mycat.io) |
| ZooKeeper              | 分布式协调工具    | [https://zookeeper.apache.org/releases.html](https://zookeeper.apache.org/releases.html) |
| ActiveMQ               | 分布式消息队列中间件   | [http://activemq.apache.org/components/classic/download/](http://activemq.apache.org/components/classic/download/) |
| Maven               | 项目对象模型(POM)    | [http://maven.apache.org/](http://maven.apache.org/) |
| lombok              | 简化对象封装工具    | [https://github.com/rzwitserloot/lombok](https://github.com/rzwitserloot/lombok) |
| webpack              | 模块封装工具    | [http://webpack.github.io/](http://webpack.github.io/k) |
| layui               | 后端前台框架    | [https://www.layui.com/](https://www.layui.com/) |

### 第三方插件& SDK

| 技术                 | 说明                | 官网                                                         |
| -------------------- | ------------------- | ------------------------------------------------------------ |
| 七牛云          | 文件存储服务        | [https://developer.qiniu.com/kodo/sdk/1239/java](https://developer.qiniu.com/kodo/sdk/1239/java) |
| vaptcha                  | 人机验证码SDK       |  [https://www.vaptcha.com/](https://www.vaptcha.com/)   |
| 百度统计                  | web端统计工具      |  [https://tongji.baidu.com](https://tongji.baidu.com)   |
| 腾讯移动统计                  | 小程序/app统计工具      |  [https://mta.qq.com/mta/ctr_index/download](https://mta.qq.com/mta/ctr_index/download)   |
| 腾讯位置服务                 | 腾讯移动端定位SDK      |  [https://lbs.qq.com/iosgeo/index.html](https://lbs.qq.com/iosgeo/index.html)   |
| 飞鹅云打印机                 | 云小票打印机API      |  [http://www.feieyun.com/open/index.html?name=1](http://www.feieyun.com/open/index.html?name=1)   |
| Mob                 | 全国天气预报接口      |  [http://api.mob.com/#/apiwiki/weather](http://api.mob.com/#/apiwiki/weather)   |
| Hotjar                 | web端热力图分析反馈      |  [https://www.hotjar.com/tour](https://www.hotjar.com/tour)   |
| 253云通讯                 | 营销短信及验证码      |  [https://zz.253.com/v5.html#/api_word](https://zz.253.com/v5.html#/api_word)   |
| UEditor               | 富文本编辑器    | [http://ueditor.baidu.com/website/thirdproject.html](https://github.com/rzwitserloot/lombok) |

> 某些插件及接口需注册生成AppKey，作者不保证其免费期限


### 前端技术

| 技术       | 说明                  | 官网                                                         |
| ---------- | --------------------- | ------------------------------------------------------------ |
| Vue        | H5前端框架              | [https://vuejs.org/](https://vuejs.org/)                     |
| Vue-router | 路由框架              | [https://router.vuejs.org/](https://router.vuejs.org/)       |
| Vuex       | 全局状态管理框架      | [https://vuex.vuejs.org/](https://vuex.vuejs.org/)           |
| Element    | H5前端UI框架            | [https://element.eleme.io/](https://element.eleme.io/)       |
| Axios      | H5前端HTTP框架          | [https://github.com/axios/axios](https://github.com/axios/axios) |
| v-charts   | 基于Echarts的图表框架 | [https://v-charts.js.org/](https://v-charts.js.org/)         |
| Js-cookie  | cookie管理工具        | [https://github.com/js-cookie/js-cookie](https://github.com/js-cookie/js-cookie) |
| okam  | 支付宝小程序框架            | [https://ecomfe.github.io/okam/#/](https://ecomfe.github.io/okam/#/) |
| wepy  | 微信小程序框架            | [https://tencent.github.io/wepy/document.html#/](https://tencent.github.io/wepy/document.html#/) |
| Taro UI  | 多端UI组件库            | [https://github.com/rstacruz/nprogress](https://github.com/rstacruz/nprogress) |

### 模块介绍

> 敬请期待



## 环境搭建

### 开发工具

| 工具          | 说明                | 官网                                            |
| ------------- | ------------------- | ----------------------------------------------- |
| IDEA          | 开发IDE             | https://www.jetbrains.com/idea/download         |
| RedisDesktop  | redis客户端连接工具 | https://redisdesktop.com/download               |
| Robomongo     | mongo客户端连接工具 | https://robomongo.org/download                  |
| SwitchHosts   | 本地host管理        | https://oldj.github.io/SwitchHosts/             |
| X-shell       | Linux远程连接工具   | http://www.netsarang.com/download/software.html |
| Navicat       | 数据库连接工具      | http://www.formysql.com/xiazai.html             |
| PowerDesigner | 数据库设计工具      | http://powerdesigner.de/                        |
| Axure         | Android系统UI设计工具        | https://www.axure.com/                          |
| MindMaster    | 思维导图设计工具    | http://www.edrawsoft.cn/mindmaster              |
| ScreenToGif   | gif录制工具         | https://www.screentogif.com/                    |
| ProcessOn     | 流程图绘制工具      | https://www.processon.com/                      |
| PicPick       | 图片处理工具        | https://picpick.app/zh/                         |
| Snipaste      | 屏幕截图工具        | https://www.snipaste.com/                       |
| 微信开发者工具         | 微信公众平台前端开发   |https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html |
| 支付宝小程序开发工具         | 支付宝小程序前端开发  |https://docs.alipay.com/mini/ide/download|
| Sketch         | Mac系统UI设计工具   |https://github.com/airbnb/react-sketchapp|
| Adobe Illustrator         | 矢量图形处理工具   |https://www.adobe.com/products/illustrator.html|

### 开发环境

| 工具          | 版本号 | 下载                                                         |
| ------------- | ------ | ------------------------------------------------------------ |
| JDK           | 1.8    | https://www.oracle.com/technetwork/java/javase/downloads/index.html |
| Mysql         | 8.0.18    | https://www.mysql.com/                                       |
| redis         | 3.2    | https://redis.io/download                                    |
| elasticsearch | 7.3.2  | https://www.elastic.co/downloads                             |
| MongoDb       | 3.2    | https://www.mongodb.com/download-center                      |
| RabbitMq      | 3.7.14 | http://www.rabbitmq.com/download.html                        |
| nginx         | 1.17.4  | http://nginx.org/en/download.html                            |
| tomcat         | 8.5.47    | https://tomcat.apache.org/download-80.cgi                         |
| apache-maven         | 3.6.2    | http://maven.apache.org                        |


## 参考资料

- [Java核心技术·卷 I（原书第10版）](https://book.douban.com/subject/26880667/)
- [Vue.js项目实战](https://book.douban.com/subject/30395202/)
- [Node.js开发实战](https://book.douban.com/subject/30373587/)
- [PHP和MySQL Web开发(原书第4版)](https://book.douban.com/subject/3549421/)
- [Java编程思想](https://book.douban.com/subject/2130190/)
- [Spring实战（第4版）](https://book.douban.com/subject/26767354/)
- [Spring Data实战](https://book.douban.com/subject/25975186/)
- [MyBatis从入门到精通](https://book.douban.com/subject/27074809/)
- [深入浅出MySQL](https://book.douban.com/subject/25817684/)
- [Elasticsearch 技术解析与实战](https://book.douban.com/subject/26967826/)
- [MongoDB实战(第二版)](https://book.douban.com/subject/27061123/)







## 开发部署&技术疑问交流
> Windows环境部署仅限开发测试

> Linux环境部署
- 个人及企业用户请在阿里云或腾讯云可免费领取,系统在1g1核服务器CenterOs7.x可流畅运行
- 获取各项目详细文档及交流学习请联系QQ:`142997`<a target="_blank" href="http://wpa.qq.com/msgrd?v=3&uin=142997&site=qq&menu=yes"><img border="0" src="http://wpa.qq.com/pa?p=2:142997:41"/></a>，`909189188`<a target="_blank" href="http://wpa.qq.com/msgrd?v=3&uin=142997&site=qq&menu=yes"><img border="0" src="http://wpa.qq.com/pa?p=2:142997:41"/></a>
> 作者本科设计专业，擅长前端开发及UI设计，非专业后端开发，本项目至2019年10月耗时13个月，项目将持续优化升级，后端前台将于2020年全面升级Spring5，请各位大神多指导和建议

## 捐赠
> 欢迎捐赠吃货星球系统，您的支持是作者开发的动力！

<td><img src="https://github.com/zhrrobert/dejavu/blob/master/images/wxpay.png" width="200px"/></td>
<td><img src="http://pzvxl42tq.bkt.clouddn.com/alipay.png" width="200px"/></td> 


## 商用获取及授权
- 个人学习使用遵循GPL开源协议
- 后端源码商用可无限多开，需联系作者低价授权


## 公众号

关注公众号可第一时间获取更新文档和商业运营信息

<img src="https://github.com/zhrrobert/dejavu/blob/master/images/wxgzh.jpg" width="200px"/>

## 许可证

[GPL-3.0](https://github.com/zhrrobert/dejavu/blob/master/License)

## 版权所有

<img src="https://github.com/zhrrobert/dejavu/blob/master/images/company.png" width="28px" align="left"/> 

Copyright © 2019 Dejavu Technology (YN) Co., Ltd. [http://www.dejavu871.com](http://www.dejavu871.com)
