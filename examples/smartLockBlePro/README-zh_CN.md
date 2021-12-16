# 门锁对外蓝牙模版

[English](./README.md) | 简体中文

如需获取更多信息，请浏览 [涂鸦官方文档](https://docs.tuya.com)

对于中国大陆以外的用户，请删除 `.npmrc` 文件。

## 手动下载

```bash
$ curl https://codeload.github.com/tuya/tuya-panel-demo/tar.gz/master | tar -xz --strip=2 tuya-panel-demo-master/examples/smartLockBlePro
$ mv basic tuya-panel-smartLockBlePro-example
$ cd tuya-panel-smartLockBlePro-example
```

## 介绍
适用于蓝牙品类门锁的公版模板。  
模板主要实现以下功能： 
1. 首页
	* 主图的展示
	* 离家布防标签
	* 寻找锁按钮
	* 其他页面入口列表
	* 锁上提/反锁/童锁/电量状态展示
	* 开锁/关锁动画
2. 设置页
	* 根据选中的dp自适应展示，并可以进行dp操作

[概述]:
- 该模板提供了首页开关锁动画
- 首页入口列表组件的向上弹出与收回动画交互
- 对全局需要的一些数据进行了封装。
- 在设置页提供了不同类型的dp交互，基本上其他的dp交互都可参考设置页。


您可以通过涂鸦 App 扫描以下二维码进行预览。

![smartLockBlePro](https://images.tuyacn.com/fe-static/docs/img/01ea27bd-7016-4d94-bb94-16100242cdcf.png)

## 快速运行

```bash
$ npm install && npm run start
# 或者
$ yarn && yarn start
```

## 许可证

Copyright © 2020
