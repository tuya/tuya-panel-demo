# 多模网关模板

[English](./README.md) | 简体中文

如需获取更多信息，请浏览 [涂鸦官方文档](https://docs.tuya.com)

对于中国大陆以外的用户，请删除 `.npmrc` 文件。

## 手动下载

```bash
$ curl https://codeload.github.com/tuya/tuya-panel-demo/tar.gz/master | tar -xz --strip=2 tuya-panel-demo-master/examples/gatewayMultimode
$ mv basic tuya-panel-gatewayMultimode-example
$ cd tuya-panel-gatewayMultimode-example
```

## 介绍

该模板工程适用于涂鸦多模网关品类产品，支持以下功能: 
1. 蓝牙和Zigbee子设备列表展示 
2. 添加Zigbee子设备
3. 绑定和解绑蓝牙子设备
4. 进入子设备详情页控制

您可以通过涂鸦 App 扫描以下二维码进行预览。

![gatewayMultimode](https://imagesd.tuyaus.com/tyims/rms-static/5c152260-e552-11eb-b60d-0f9713885502-1626342745990.png?tyName=multimodeGateway.png)

## 快速运行

```bash
$ npm install && npm run start
# 或者
$ yarn && yarn start
```

## 许可证

Copyright © 2020
