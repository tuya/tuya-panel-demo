# Tuya Panel ElectricHeatingTable Template

[English](./README.md) | 简体中文

如需获取更多信息，请浏览 [涂鸦官方文档](https://docs.tuya.com)

对于中国大陆以外的用户，请删除 `.npmrc` 文件。

## 手动下载

```bash
$ curl https://codeload.github.com/tuya/tuya-panel-demo/tar.gz/master | tar -xz --strip=2 tuya-panel-demo-master/examples/electricHeatingTable
$ mv electricHeatingTable tuya-panel-electricHeatingTable-example
$ cd tuya-panel-electricHeatingTable-example
```

## 介绍

该模板工程可用于快速启动电暖桌项目，支持以下功能: **dp 功能点自动适配 / 设置页面 DP 点自动适配 / 云端定时 / 使用设备统计接口**

您可以通过涂鸦 App 扫描以下二维码进行预览。

![ElectricHeatingTable](https://images.tuyacn.com/rms-static/3667db40-a190-11ea-9acd-135316db2bdb-1590745134836.png?tyName=electricHeatingTable.png)

## 注意事项

> 1、dp(countdown_left,countdown_set)同时存在时，才会有倒计时动画。
>
> 2、加热方向，根据 dp 的不同，展示不同的 ui。
>
> 3、使用电量统计功能，需开通统计能力。
>
> 4、switch_cooking 为 false 时，不允许在面板上调节 cook_mode。

## API

[tuya.m.dp.rang.stat.day.list](https://docs.tuya.com/zh/iot/panel-development/panel-sdk-development/common-sdk-development/data-statistics-related-interface/data-statistics-related-interface?id=K9m1dlf41ex5f)

## 快速运行

```bash
$ npm install && npm run start
# 或者
$ yarn && yarn start
```

## 许可证

Copyright © 2020
