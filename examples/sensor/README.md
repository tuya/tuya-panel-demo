# Tuya Panel Switch Template

English | [简体中文](./README-zh_CN.md)

for docs, please visit [tuya docs](https://docs.tuya.com)

for users outside Chinese mainland, please remove `.npmrc` file.

## Download manually

```bash
$ curl https://codeload.github.com/TuyaInc/tuya-panel-kit-template/tar.gz/develop | tar -xz --strip=2 tuya-panel-kit-template-develop/examples/sensor
$ mv sensor tuya-panel-sensor-example
$ cd tuya-panel-sensor-example
```

## Introduction

This template is suitable for sensing products and supports the following functions:

1. Main status display on the homepage
2. Device log history
3. Setup page - Alarm management

You can scan the following QR code through the Tuya app to preview.

![sensor](https://images.tuyacn.com/fe-static/docs/img/25a44526-44c0-4e75-b9e4-168de4b5ae61.png)

## Running

```bash
$ npm install && npm run start
# or
$ yarn && yarn start
```

## API

* [m.smart.operate.log](https://docs.tuya.com/zh/iot/panel-development/panel-sdk-development/common-sdk-development/data-statistics-related-interface/data-statistics-related-interface?id=K9m1dlf41ex5f)
* [tuya.m.linkage.dev.warn.set](https://docs.tuya.com/zh/iot/panel-development/panel-sdk-development/common-sdk-development/alarm-related-interface/alarm-related-interface?id=K9pouo57yi0b2)
* [tuya.m.linkage.rule.product.query](https://docs.tuya.com/zh/iot/panel-development/panel-sdk-development/common-sdk-development/alarm-related-interface/alarm-related-interface?id=K9pouo57yi0b2)


## License

Copyright © 2020
