<div align="center">
  <br/>
  <img align="center" src="https://image.ch871.com/new_logo.png" style="width:100px"/>
  <h2>EATER PLANET<br/>吃货星球 v5.x</h2>
</div>
<h1 align="center">社区团购微信小程序前端</h1>

<p align="center">
  <a href="http://wpa.qq.com/msgrd?v=3&uin=142997&site=qq&menu=yes"><img alt="Albert.Z" src="https://img.shields.io/badge/Author-Albert.Z-blue.svg"></a>
  <a href="[https://github.com/Dejavu-Tech/EP-WechatApp/License](https://github.com/Dejavu-Tech/EP-WechatApp/blob/master/LICENSE)"><img alt="GPL-v3协议" src="https://img.shields.io/badge/GPL-v3-red"></a>
  <a href="https://github.com/Dejavu-Tech/EP-WechatApp/releases"><img alt="最新版本" src="https://img.shields.io/badge/version-5.5.1-brightgreen"></a>
  <a href="https://img.shields.io/github/stars/Dejavu-Tech/EP-WechatApp.svg?style=social&label=Stars"><img alt="笔芯" src="https://img.shields.io/github/stars/Dejavu-Tech/EP-WechatApp.svg?style=social&label=Stars"></a>
  <br/>
  <a href="https://github.com/Dejavu-Tech/EP-WechatApp/issues/new/choose">报告 Bug</a>&nbsp;·&nbsp;<a href="https://github.com/Dejavu-Tech/EP-WechatApp/new/choose">性能优化建议</a>
</p>


## 🌻简介
> 吃货星球5.x是一套基于SOA架构的分布式S2B2C新零售团购电商系统，包括前端微信小程序及后端管理系统。
> `EP-WechatApp`前端基于原生组件开发，繁琐但易于优化和维护，秉承高颜高速且功能强大是我们的一贯宗旨。
> 本项目需要配合项目后端使用，Github: https://github.com/Dejavu-Tech/EP-Admin

## 💾组织结构
``` lua
EATER-PLANET
├── EP-WechatApp -- 微信小程序前端 5.x
├── EP-Admin -- 微信小程序后端/CMS 5.x
├── EP-WeApp -- 新版微信小程序前端 ^6.0（即将发布）
├── EP-AliApp -- 新版支付宝小程序前端 ^6.0（即将发布）
├── EP-Commerce -- 新版后端 ^6.0（重构）
├── EP-Documents -- 部署及运营文档
├── Rexo-UI -- 新版后端CMS模板
└── EP-UI -- 移动端组件库（即将发布）
```

## ✨功能特性
- 限时秒杀、整点秒杀、优惠券、兑换码、礼品卡、预售、接龙、签到、积分、拼团、菜谱、礼品卡、虚拟销量、虚拟评价等营销模式
- 商品自定义售卖时间、多规格、多分类、标签、置顶、送达时间、满减、新人、会员专享、限购、限制地域/距离、门店、团长、自提点等多种功能
- 自定义专题活动、单团长（非社区团购模式）、快递模式
- 团长多等级、分销、分佣、提成等多功能
- 客户等级、充值、会员卡、多级分销、分享、邀请新人、加群、海报等裂变功能
- 免登陆后置模式
- 支持易联云、飞鹅、美团云小票打印机
- 支持快递鸟、蜂鸟、美团、顺丰同城、达达等第三方配送/快递API
- 子商户自动生成独立后台可独立上货、结算、平台服务费提取
- 类美团/联联周边游到店核销二维码（虚拟商品）功能
- 后台订单统计、财务数据、分销列表、佣金提成统计、门店核销统计
- 订单一键发货、配送单一键生成、货物一键送达、运费模板自定义
- 独立的配送员、核销员、配送路线模块
- 支持公众号关注组件、抖音/本地视频链接
- 支持redis解决高并发场景稳定输出
- 支持微信支付、余额支付、企业付款
- 七牛云、腾讯云COS、阿里云OSS对象存储远程附件
- 前端一体化集成商户、团长、配送、拼团、接龙模块
- 微信订阅消息推送
- 支持小程序直播、交易组件、微信商店、微信视频号

## 📺DEMO
#### 后端 ➡️<a href="https://demo.ch871.com">https://demo.ch871.com</a>
#### 前端 微信搜索`霸气妖吃货星球`或扫码：
<img src="https://image.ch871.com/ep-qrcode.png" width="300px" /> 

## 🖼️项目截图
<div align="center">
  <img src="https://image.ch871.com/front_screenshot1.png"/>
  <br/>
  <br/>
  <img src="https://image.ch871.com/front_screenshot2.png"/> 
</div>

## ⚙️简易部署
- ⭕以下为本项目正常商用运营的最低条件要求❗❗❗忽略下列任意步骤会导致数据获取、定位、支付、退款等不可预知的错误，详细部署文档请联系作者获取。
#### 1.注册开通小程序账号
打开<a href="https://mp.weixin.qq.com">微信公众平台</a>，根据实际情况选择 “企业”或“个体工商户”身份，注册小程序账号（不支持个人用户上线商城类小程序）获得并保存你自己小程序的 AppID 和 AppSecret（开发→开发设置）。
#### 2.注册微信商户号
打开<a href="https://pay.weixin.qq.com">微信支付平台</a>，根据注册微信公众平台时的资料注册微信商户号，打开账户中心→api安全→设置并下载api证书、设置api秘钥并保存；打开产品中心→我的产品→JSAPI→支付添加关联小程序AppID。
#### 3.注册腾讯地图AppKey
打开<a href="https://lbs.qq.com">腾讯地图</a>注册后，右上角点击控制台→创建应用→添加Key→输入Key名称→勾选微信小程序→填入小程序的AppID，获得并保存Key。
#### 4.添加小程序的合法域名
按照后端<a href="https://github.com/Dejavu-Tech/EP-Admin">EP-Admin</a>中服务器环境搭建完毕后。登录<a href="https://mp.weixin.qq.com">微信公众平台</a>→平台开发→开发管理→开发设置→服务器域名→修改，“request合法域名”填入：
```
https://自己的后端服务器域名;
https://apis.map.qq.com;
https://pingtas.qq.com;
```
“socket合法域名”、“uploadFile合法域名”填入：
```
https://自己的后端服务器域名;
```
“downloadFile合法域名”填入：
```
https://自己的后端服务器域名;
https://thirdwx.qlogo.cn
https://wx.qlogo.cn
```
> 以上简易教程（小白向）适用于绝大多数微信电商小程序，详细部署请参阅<a href="https://docs.ch871.com">文档</a>。

## 📦️环境搭建
#### 1.下载本项目
<a href="https://api.github.com/repos/Dejavu-Tech/EP-WechatApp/tarball/5.0.0">点此下载压缩包</a>或使用 `git clone https://github.com/Dejavu-Tech/EP-WechatApp.git` 克隆本仓库到本地，亦或fork本项目后在<a href="https://api.github.com/repos/Dejavu-Tech/EP-WechatApp/tarball/4.7.0">GitHub Desktop</a>中打开。

#### 2.微信开发者工具
下载<a href="https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html">微信开发者工具</a>，微信扫码登录后点击创建小程序→目录选择本项目根目录→填入自己小程序的 AppID→后端服务勾选不使用云服务→语言选择JavaScript→新建；
工具右上角详情→本地设置分别勾选"ES6转ES5"、"增强编译"、"使用npm模块"、"样式自动补全"、"自动压缩样式"、"自动压缩混淆"、"启动多核心编译"；
打开根目录`siteinfo.js`输入域名并保存：
```
var siteinfo = { "siteroot": "https://自己的后端服务器域名/wxapp.php"}
module.exports = siteinfo
```
点击右上角上传，即可在微信公众平台中扫码预览体验版或发布。

## 🔎文档源码
<a target="_blank" href="https://github.com/Dejavu-Tech/EP-Documents">EP-Documents</a>

## 🔨版本说明
本项目源码为基础版，未包含拼团、分销、接龙、预售等营销功能，点⭐并同意我公司《服务协议》和《隐私条款》即可商用

## 👽联系
全功能版商用授权及部署请联系
- QQ:`142997`<a target="_blank" href="http://wpa.qq.com/msgrd?v=3&uin=142997&site=qq&menu=yes"><img width=80px align=center src="https://image.ch871.com/qq-contact .png"/></a>
- 企业微信:  
<img src="https://image.ch871.com/qywx-contact .png" width="300px" />

## 🌱远程招贤纳猿
新版吃货星球☢其他项目需要Go、前端等人柱力加持，按代码量贡献度持股，有意者猛戳<a target="_blank" href="http://wpa.qq.com/msgrd?v=3&uin=142997&site=qq&menu=yes">👆👆👆</a>

## 📜许可证 [Apache-2.0](https://github.com/Dejavu-Tech/EP-WechatApp/blob/master/LICENSE)

## 🌎️软件著作权及其他版权所有
<img src="https://image.ch871.com/rexotech.png" width="25px" align="left"/>
&nbsp;&nbsp;Copyright © 2019-2023 Dejavu Tech. (YN) Co., Ltd. <a href="https://www.rexotech.cn">官网</a>
