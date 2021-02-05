# 涂鸦照明面板模板

[English](./README.md) | 简体中文

如需获取更多信息，请浏览 [涂鸦官方文档](https://docs.tuya.com)

对于中国大陆以外的用户，请删除 `.npmrc` 文件。

## 手动下载

```bash
$ curl https://codeload.github.com/tuya/tuya-panel-demo/tar.gz/master | tar -xz --strip=2 tuya-panel-demo-master/examples/lampClassic
$ mv basic tuya-panel-lampClassic-example
$ cd tuya-panel-lampClassic-example
```

## 介绍

本模板工程基于 React Native 0.59版本的 JS基础模板， 可用于快速创建照明1-5路球泡灯项目，支持以下功能：
  
- 彩光设置
- 白光设置
- 情景设置
- 云端定时
- 自定义情景属性设定

支持以下品类：
- WiFi
- BLE
- Sigmesh
- Zigbee

您可以通过涂鸦 App 扫描以下二维码进行预览。

![lampClassic](https://images.tuyacn.com/rms-static/5c2c6430-0c67-11eb-897d-85bb9e60451e-1602492363251.png?tyName&#x3D;lampClassic.png)

## 快速运行

```bash
$ npm install && npm run start
# 或者
$ yarn && yarn start
```

## 许可证

Copyright © 2020
