# Tuya Panel Basic Template

[English](./README.md) | 简体中文

如需获取更多信息，请浏览 [涂鸦官方文档](https://docs.tuya.com)

对于中国大陆以外的用户，请删除 `.npmrc` 文件。

## 注意

该模板使用的 RN 版本为 0.51，模板已不再继续维护，仅供参考，建议使用 [basic-ts-0.59](../basic-ts-0.59)

## 手动下载

```bash
$ curl https://codeload.github.com/tuya/tuya-panel-demo/tar.gz/master | tar -xz --strip=2 tuya-panel-demo-master/examples/cooker
$ mv cooker tuya-panel-cooker-example
$ cd tuya-panel-cooker-example
```

## 介绍

该模板项目可以用来快速启动厨电项目，支持以下功能:**dp 功能点自动适配/设置页面 dp 点自动适配/食谱相关组件适配**

您可以通过涂鸦 App 扫描以下二维码进行预览。

![Cooker](https://images.tuyacn.com/rms-static/b91d36c0-a195-11ea-96f0-cda03b175b6c-1590747501612.png?tyName=cooker.png)

## 注意事项

> 1, dp(power)为必选项。
>
> 2，菜谱功能需要在平台上进行开通后才可以使用。
>
> 3, 通过是否有 **cloud_recipe_number** 这个 dp 来判断是否要展示云菜谱相关内容

## API （使用接口）

[cloud recipe interfaces](https://developer.tuya.com/cn/docs/control-panel-sdk/cooker-recipe-api?id=K9mcn0f0m1q0w)

## 快速运行

```bash
$ npm install && npm run start
# 或者
$ yarn && yarn start
```

## 许可证

Copyright © 2020
