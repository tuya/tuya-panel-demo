# Tuya Panel Basic Template



English | [简体中文](./README-zh_CN.md)



for docs, please visit [tuya docs](https://docs.tuya.com)



for users outside Chinese mainland, please remove `.npmrc` file.



## Download manually

```bash
$ curl https://codeload.github.com/TuyaInc/tuya-panel-kit-template/tar.gz/develop | tar -xz --strip=2 tuya-panel-kit-template-develop/examples/lampClassic
$ mv lampClassic tuya-panel-lampClassic-example
$ cd tuya-panel-lampClassic-example
```

## Introduction
该模板工程可用于快速创建照明1-5路球泡灯项目，支持以下功能: 彩光设置 / 白光设置 / 情景设置 / 云端定时 / 使用设备存储接口



## Running

```bash
$ npm install && npm run start
# or
$ yarn && yarn start
```


## Protocols
[Lighting dp protocol description](https://docs.tuya.com/zh/hardware/lighting/lighting/product-function-definition?id=K9lf9jad5bga9)
