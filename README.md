# Tuya Panel Templates

<!--ttss-->

English | [简体中文](./README-zh_CN.md)

This document provides development templates of common categories.

You can read the [official documents](https://developer.tuya.com/en/docs/iot) for more information.

## Prerequisites

- nodejs 8+
- `npm` or `yarn`

## Running

To quickly run a panel project, run:

```bash
$ cd examples/${TemplateName}
$ npm install && npm run start
# or
$ yarn && yarn start # if you use yarn
```

Then, open your Tuya Smart app for debugging.

## Examples

> It is recommended to use the template of `tuya-panel-ki` **4.0.0** or above for development, and the 2.0.0 series is no longer maintained

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

You can check the complete list of Tuya Panel examples [here](./examples).

## Batch upgrade tuya-panel-kit

```sh
# 4.x & 2.x
$ sudo ./scripts/tuya-panel-kit 4.x 2.x
# 4.x
$ sudo ./scripts/tuya-panel-kit 4.x
# 2.x
$ sudo ./scripts/tuya-panel-kit "" 2.x
```

## License

Copyright © 2020
