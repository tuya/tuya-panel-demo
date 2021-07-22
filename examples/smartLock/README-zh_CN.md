# Tuya Panel SmartLock Template

[English](./README.md) | 简体中文

如需获取更多信息，请浏览 [涂鸦官方文档](https://docs.tuya.com)

对于中国大陆以外的用户，请删除 `.npmrc` 文件。

## 注意

该模板使用的 RN 版本为 0.51，模板已不再继续维护，仅供参考，建议使用 [basic-ts-0.59](../basic-ts-0.59)

## 手动下载

```bash
$ curl https://codeload.github.com/tuya/tuya-panel-demo/tar.gz/master | tar -xz --strip=2 tuya-panel-demo-master/examples/smartLock
$ mv smartLock tuya-panel-smartLock-example
$ cd tuya-panel-smartLock-example
```

## 介绍

该模板工程为WiFi门锁模板，可支持以下功能:
1. 开门记录查看
2. 告警消息查看
3. 童锁、反锁、电量显示
4. 保护天数

您可以通过涂鸦 App 扫描以下二维码进行预览。

![SmartLock](https://images.tuyacn.com/rms-static/a56b0770-bb89-11ea-96f0-cda03b175b6c-1593601044839.png?tyName=smartLock.png)

## 快速运行

```bash
$ npm install && npm run start
# 或者
$ yarn && yarn start
```

## 使用接口

* [tuya.m.device.lock.active.period](https://docs.tuya.com/zh/iot/panel-development/panel-sdk-development/lock-sdk/lock-api/lock-api?id=K9ppulorxzebv)
* [tuya.m.device.lock.alarm.unread](https://docs.tuya.com/zh/iot/panel-development/panel-sdk-development/lock-sdk/lock-api/lock-api?id=K9ppulorxzebv)
* [tuya.m.scale.history.list](https://docs.tuya.com/zh/iot/panel-development/panel-sdk-development/lock-sdk/lock-api/lock-api?id=K9ppulorxzebv)
* [tuya.m.device.lock.alarm.list](https://docs.tuya.com/zh/iot/panel-development/panel-sdk-development/lock-sdk/lock-api/lock-api?id=K9ppulorxzebv)

## 许可证

Copyright © 2020
