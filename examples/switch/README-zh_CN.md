# Tuya Panel Switch Template

[English](./README.md) | 简体中文

如需获取更多信息，请浏览 [涂鸦官方文档](https://docs.tuya.com)

对于中国大陆以外的用户，请删除 `.npmrc` 文件。

## 注意

该模板使用的 RN 版本为 0.51，模板已不再继续维护，仅供参考，建议使用 [basic-ts-0.59](../basic-ts-0.59)

## 手动下载

```bash
$ curl https://codeload.github.com/tuya/tuya-panel-demo/tar.gz/master | tar -xz --strip=2 tuya-panel-demo-master/examples/switch
$ mv switch tuya-panel-switch-example
$ cd tuya-panel-switch-example
```

## 介绍

该模板工程适用于涂鸦开关品类产品，支持以下功能:

1. 多路开关 DP 功能自适配
2. DP 点设置页自适配
3. DP 点改名功能
4. DP 点定时功能

您可以通过涂鸦 App 扫描以下二维码进行预览。

![Switch](https://images.tuyacn.com/rms-static/5a7867d0-a199-11ea-9acd-135316db2bdb-1590749060813.png?tyName=switch.png)

## 快速运行

```bash
$ npm install && npm run start
# 或者
$ yarn && yarn start
```

## 许可证

Copyright © 2020
