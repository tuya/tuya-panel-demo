# Tuya Panel Templates

[English](./README.md) | 简体中文

`Tuya Panel Templates` 提供了一些常见品类的开发模板。

您可以阅读[涂鸦官方文档](https://developer.tuya.com/cn/docs/iot)以了解更多信息。

## 前置条件

- nodejs 8+
- `npm` 或者 `yarn`

## 快速运行

快速启动一个面板项目，您可以运行以下命令：

```bash
$ cd examples/${TemplateName}
$ npm install && npm run start
# 或者
$ yarn && yarn start
```

然后打开涂鸦 App 开始调试 :)

## 示例模板

> 建议使用模板为 `tuya-panel-kit` **4.0.0** 以上版本进行开发，2.0.0 系列已不再维护

- [airPurifier](./examples/airPurifier)
- [airThermostat](./examples/airThermostat)
- [basic-ts-0.59](./examples/basic-ts-0.59)
- [basic-ts-navigation](./examples/basic-ts-navigation)
- [basic](./examples/basic)
- [cooker](./examples/cooker)
- [curtain](./examples/curtain)
- [curtainSwitch](./examples/curtainSwitch)
- [electricHeatingTable](./examples/electricHeatingTable)
- [gatewayBleMesh](./examples/gatewayBleMesh)
- [gatewayZigbee](./examples/gatewayZigbee)
- [ipc](./examples/ipc)
- [ipcBasic](./examples/ipcBasic)
- [lampClassic](./examples/lampClassic)
- [lampDimmer](./examples/lampDimmer)
- [lampGeneric](./examples/lampGeneric)
- [platoonSocket](./examples/platoonSocket)
- [scenario](./examples/scenario)
- [sensor](./examples/sensor)
- [smartLock](./examples/smartLock)
- [smartLockZigbee](./examples/smartLockZigbee)
- [switch](./examples/switch)
- [wirelessSwitch](./examples/wirelessSwitch)

### 您可以在[此处](./examples)查看完整的涂鸦品类模板

## 批量升级 tuya-panel-kit 依赖

```sh
# 4.x 和 2.x
$ sudo ./scripts/tuya-panel-kit 4.x 2.x
# 4.x
$ sudo ./scripts/tuya-panel-kit 4.x
# 2.x
$ sudo ./scripts/tuya-panel-kit "" 2.x
```

## 许可证

Copyright © 2020
