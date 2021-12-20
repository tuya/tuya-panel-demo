# 中控屏模板

[English](./README.md) | 简体中文

如需获取更多信息，请浏览 [涂鸦官方文档](https://docs.tuya.com)

对于中国大陆以外的用户，请删除 `.npmrc` 文件。

## 手动下载

```bash
$ curl https://codeload.github.com/tuya/tuya-panel-demo/tar.gz/master | tar -xz --strip=2 tuya-panel-demo-master/examples/centralControlScreen
$ mv basic tuya-panel-centralControlScreen-example
$ cd tuya-panel-centralControlScreen-example
```

## 介绍

该模板工程适用于涂鸦中控品类产品，支持以下功能: 
- 语音场景的管理
- 场景管理
- 设备管理
- 网关功能
- 跳转到音乐播放面板
- 昵称设置（自定义唤醒词）
- 继电器开关的控制和名称设置


您可以通过涂鸦 App 扫描以下二维码进行预览。

![centralControlScreen](https://imagesd.tuyaus.com/tyims/rms-static/c24e08b0-6173-11ec-90a0-319a18fd1baa-1639991035067.png?tyName=centralControlScreen.png)

## 快速运行

```bash
$ npm install && npm run start
# 或者
$ yarn && yarn start
```

## 许可证

Copyright © 2020
