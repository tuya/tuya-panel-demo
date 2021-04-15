# Tuya Panel Ipc Template By `@tuya/tuya-panel-ipc-sdk` （React Native 0.59）

[English](./README.md) | 简体中文

如需获取更多信息，请浏览 [涂鸦官方文档](https://docs.tuya.com)

对于中国大陆以外的用户，请删除 `.npmrc` 文件。

## 手动下载

```bash
$ curl https://codeload.github.com/tuya/tuya-panel-demo/tar.gz/master | tar -xz --strip=2 tuya-panel-demo-master/examples/ipcBasic
$ mv ipcBasic tuya-panel-ipc-basic-example
$ cd tuya-panel-ipc-basic-example
```

## 介绍

该模板工程为 React Native 0.59 版本的 TS, 基于`@tuya/tuya-panel-ipc-sdk`封装 Player 组件及功能模块, 快速开发与 Ipc 相关面板：

1. Path Alias;
2. React、Redux Hooks;

您可以通过涂鸦 App 扫描以下二维码进行预览。

![ipcBasic](https://images.tuyacn.com/rms-static/4cac5b50-48d5-11eb-bc15-27e102d5b696-1609136651653.png?tyName=IpcBasic.png)

## 快速运行

```bash
$ npm install && npm run start
# 或者
$ yarn && yarn start
```

## 注意

- 请使用涂鸦智能 3.22 及以上开发的 App, 调试版进行调试开发

## 更新说明

2021-04-15: 优化视频区域按宽按高调节方式, 添加 onChangeActiveZoomStatus: (zoomStatus: number) => any; 回调函数, 主动触发时再更改视频倍数

## 许可证

Copyright © 2020
