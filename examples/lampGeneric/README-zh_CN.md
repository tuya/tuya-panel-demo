# 涂鸦照明经典版面板模版

[English](./README.md) | 简体中文

如需获取更多信息，请浏览 [涂鸦官方文档](https://docs.tuya.com)

对于中国大陆以外的用户，请删除 `.npmrc` 文件。

## 手动下载

```bash
$ curl https://codeload.github.com/tuya/tuya-panel-demo/tar.gz/master | tar -xz --strip=2 tuya-panel-demo-master/examples/lampGeneric
$ mv lampGeneric tuya-panel-lamp-generic-example
$ cd tuya-panel-lamp-generic-example
```

## 介绍

该模板工程可用于快速创建标准dp协议照明5路球泡灯项目，支持以下功能

- 白光设置
- 彩光设置
- 情景设置
- 音乐律动
- 自定义情景属性设定
- 倒计时
- 云端定时

支持以下品类：

- WiFi
- BLE
- Sigmesh
- Zigbee


您可以通过涂鸦 App 扫描以下二维码进行预览。

![Basic-0.59](https://images.tuyacn.com/rms-static/02aa3ea0-8d4a-11eb-88f2-c9819eefd6d0-1616663457674.png?tyName=lampGeneric.png)

## 快速运行

```bash
$ npm install && npm run start
# 或者
$ yarn && yarn start
```


## 许可证

Copyright © 2020

