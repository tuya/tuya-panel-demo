# Tuya Panel Switch Template

English | [简体中文](./README-zh_CN.md)

如需获取更多信息，请浏览 [涂鸦官方文档](https://docs.tuya.com)

对于中国大陆以外的用户，请删除 `.npmrc` 文件。

## 手动下载

```bash
$ curl https://codeload.github.com/tuya/tuya-panel-demo/tar.gz/master | tar -xz --strip=2 tuya-panel-demo-master/examples/scenario
$ mv scenario tuya-panel-scenario-example
$ cd tuya-panel-scenario-example
```

## 介绍

本模板项目适用于场景品类厂品，支持以下功能:

1. 场景联动创建
2. 场景联动绑定/解绑
3. 场景联动触发

您可以通过涂鸦 App 扫描以下二维码进行预览。

![scenario](https://images.tuyacn.com/fe-static/docs/img/68a3f0db-5185-4de6-be4b-34a8a4b7cf4e.png)

## 快速运行

```bash
$ npm install && npm run start
# or
$ yarn && yarn start
```

## 使用接口

* [tuya.m.linkage.rule.trigger](https://docs.tuya.com/zh/iot/panel-development/panel-sdk-development/common-sdk-development/scene-related-interface/scene-related-interface?id=K9pemz7l3wz0t)
* [tuya.m.linkage.rule.bind.wifi.query](https://docs.tuya.com/zh/iot/panel-development/panel-sdk-development/common-sdk-development/scene-related-interface/scene-related-interface?id=K9pemz7l3wz0t)
* [tuya.m.linkage.rule.brief.query](https://docs.tuya.com/zh/iot/panel-development/panel-sdk-development/common-sdk-development/scene-related-interface/scene-related-interface?id=K9pemz7l3wz0t)
* [tuya.m.linkage.rule.bind.wifi.save](https://docs.tuya.com/zh/iot/panel-development/panel-sdk-development/common-sdk-development/scene-related-interface/scene-related-interface?id=K9pemz7l3wz0t)
* [tuya.m.linkage.rule.bind.wifi.remove](https://docs.tuya.com/zh/iot/panel-development/panel-sdk-development/common-sdk-development/scene-related-interface/scene-related-interface?id=K9pemz7l3wz0t)

## 许可证

Copyright © 2020
