# Tuya Panel Switch Template

English | [简体中文](./README-zh_CN.md)

如需获取更多信息，请浏览 [涂鸦官方文档](https://docs.tuya.com)

对于中国大陆以外的用户，请删除 `.npmrc` 文件。

## 手动下载

```bash
$ curl https://codeload.github.com/tuya/tuya-panel-demo/tar.gz/master | tar -xz --strip=2 tuya-panel-demo-master/examples/sensor
$ mv sensor tuya-panel-sensor-example
$ cd tuya-panel-sensor-example
```

## 介绍

本模板项目适用于传感品类厂品，支持以下功能:

1. 首页主状态展示
2、设备日志历史记录
3、设置页-告警管理

您可以通过涂鸦 App 扫描以下二维码进行预览。

![sensor](https://images.tuyacn.com/fe-static/docs/img/25a44526-44c0-4e75-b9e4-168de4b5ae61.png)

## 快速运行

```bash
$ npm install && npm run start
# or
$ yarn && yarn start
```

## 使用接口

* [m.smart.operate.log](https://docs.tuya.com/zh/iot/panel-development/panel-sdk-development/common-sdk-development/data-statistics-related-interface/data-statistics-related-interface?id=K9m1dlf41ex5f)
* [tuya.m.linkage.dev.warn.set](https://docs.tuya.com/zh/iot/panel-development/panel-sdk-development/common-sdk-development/alarm-related-interface/alarm-related-interface?id=K9pouo57yi0b2)
* [tuya.m.linkage.rule.product.query](https://docs.tuya.com/zh/iot/panel-development/panel-sdk-development/common-sdk-development/alarm-related-interface/alarm-related-interface?id=K9pouo57yi0b2)

## 许可证

Copyright © 2020
