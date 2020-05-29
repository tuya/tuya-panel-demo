# Tuya Panel Basic Template

[English](./README.md) | 简体中文

如需获取更多信息，请浏览 [涂鸦官方文档](https://docs.tuya.com)

对于中国大陆以外的用户，请删除 `.npmrc` 文件。

## 手动下载

```bash
$ curl https://codeload.github.com/TuyaInc/tuya-panel-kit-template/tar.gz/develop | tar -xz --strip=2 tuya-panel-kit-template-develop/examples/platoonSocket
$ mv platoonSocket tuya-panel-platoonSocket-example
$ cd tuya-panel-platoonSocket-example
```

## 介绍

该模板工程适用于涂鸦排插品类产品，可支持以下功能:
1. 多路排插 DP 功能自动适配
2. DP 点改名功能
3. DP 点定时功能
4. DP 点倒计时功能
5. DP 点设置页自适配

您可以通过涂鸦 App 扫描以下二维码进行预览。

![PlatoonSocket](https://images.tuyacn.com/rms-static/31ac00e0-a190-11ea-9acd-135316db2bdb-1590745126894.png?tyName=platoonSocket.png)

## 快速运行

```bash
$ npm install && npm run start
# 或者
$ yarn && yarn start
```

## 使用接口

* [s.m.dev.dp.get](https://docs.tuya.com/zh/iot/panel-development/panel-sdk-development/common-sdk-development/equipment-related-interface/equipment-related-interface?id=K9m1dlii6zkf7#title-0-%E8%8E%B7%E5%8F%96%E8%AE%BE%E5%A4%87%E6%89%80%E6%9C%89%20dp%20%E7%82%B9%E4%BF%A1%E6%81%AF)
* [s.m.dev.group.dp.get](https://docs.tuya.com/zh/iot/panel-development/panel-sdk-development/common-sdk-development/equipment-related-interface/equipment-related-interface?id=K9m1dlii6zkf7#title-2-%E8%8E%B7%E5%8F%96%E7%BE%A4%E7%BB%84%E8%AE%BE%E5%A4%87%E6%89%80%E6%9C%89%20dp%20%E7%82%B9%E4%BF%A1%E6%81%AF)
* [s.m.dev.dp.name.update](https://docs.tuya.com/zh/iot/panel-development/panel-sdk-development/common-sdk-development/equipment-related-interface/equipment-related-interface?id=K9m1dlii6zkf7#title-1-%E6%9B%B4%E6%96%B0%E8%AE%BE%E5%A4%87%20dp%20%E7%82%B9%E5%90%8D%E7%A7%B0)
* [tuya.m.group.dpname.update](https://docs.tuya.com/zh/iot/panel-development/panel-sdk-development/common-sdk-development/equipment-related-interface/equipment-related-interface?id=K9m1dlii6zkf7#title-3-%E6%9B%B4%E6%96%B0%E7%BE%A4%E7%BB%84%E8%AE%BE%E5%A4%87%20dp%20%E7%82%B9%E5%90%8D%E7%A7%B0)
* [s.m.linkage.timer.nearest.bat.get](https://docs.tuya.com/zh/iot/panel-development/panel-sdk-development/common-sdk-development/cloud-timing-interface/cloud-timing-interface?id=K9m1dlbzt0kdz#title-1-%E8%8E%B7%E5%8F%96%E5%A4%9A%E4%B8%AA%20DP%20%E7%82%B9%E6%9C%80%E8%BF%91%E7%9A%84%E5%AE%9A%E6%97%B6)

## 许可证

Copyright © 2020
