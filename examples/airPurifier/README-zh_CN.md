# Tuya Panel AirPurifier Template

[English](./README.md) | 简体中文

如需获取更多信息，请浏览 [涂鸦官方文档](https://docs.tuya.com)

对于中国大陆以外的用户，请删除 `.npmrc` 文件。

## 手动下载

```bash
$ curl https://codeload.github.com/TuyaInc/tuya-panel-kit-template/tar.gz/develop | tar -xz --strip=2 tuya-panel-kit-template-develop/examples/airPurifier
$ mv airPurifier tuya-panel-airPurifier-example
$ cd tuya-panel-airPurifier-example
```

## 介绍

该模板项目可以用来快速启动空气净化器项目，支持以下功能:**云端接口获取天气、城市/控制空气净化器多个功能按钮**

您可以通过涂鸦 App 扫描以下二维码进行预览。

![AirPurifier](https://images.tuyacn.com/fe-static/docs/img/2d7d2936-84bb-43d5-8244-aff29d76e3c5.png?tyName=airPurifier.png)

## 注意事项

1. 该模板支持展示城市、天气等信息。

2. 该模板支持自适应 dp。

3. 该模板支持定时。

## API （使用接口）

[tuya.m.public.weather.get](https://docs.tuya.com/zh/iot/panel-development/panel-sdk-development/common-sdk-development/equipment-related-interface/equipment-related-interface?id=K9m1dlii6zkf7#title-4-%E4%BA%94%E3%80%81%E8%8E%B7%E5%8F%96%E8%AE%BE%E5%A4%87%E5%9F%8E%E5%B8%82%E5%A4%A9%E6%B0%94%E4%BF%A1%E6%81%AF)

## 快速运行

```bash
$ npm install && npm run start
# 或者
$ yarn && yarn start
```

## 许可证

Copyright © 2020
