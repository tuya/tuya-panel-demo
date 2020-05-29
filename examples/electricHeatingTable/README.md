# Tuya Panel ElectricHeatingTable Template

English | [简体中文](./README-zh_CN.md)

for docs, please visit [tuya docs](https://docs.tuya.com)

for users outside Chinese mainland, please remove `.npmrc` file.

## Download manually

```bash
$ curl https://codeload.github.com/TuyaInc/tuya-panel-kit-template/tar.gz/develop | tar -xz --strip=2 tuya-panel-kit-template-develop/examples/electricHeatingTable
$ mv HeatingTable tuya-panel-electricHeatingTable-example
$ cd tuya-panel-electricHeatingTable-example
```

## Introduction

This template project can be used to quickly start the electric heating desk project, supporting the following functions: **dp function point automatic adaptation/dp point rename/setting page dp point automatic adaptation/cloud timing/use device statistics interface **

You can scan the following QR code through the Tuya app to preview.

![ElectricHeatingTable](https://images.tuyacn.com/rms-static/3667db40-a190-11ea-9acd-135316db2bdb-1590745134836.png?tyName=electricHeatingTable.png)

## Attention

> 1、 dp(countdown_left,countdown_set) exists at the same time, then there will be a countdown animation.
>
> 2、heating direction, according to the different dp, show different UI.
>
> 3、The statistical function of electricity consumption needs to be opened.
>
> 4、When switch_cooking is false, tuning cook_mode on the panel is not allowed.

## API

[tuya.m.dp.rang.stat.day.list](https://docs.tuya.com/zh/iot/panel-development/panel-sdk-development/common-sdk-development/data-statistics-related-interface/data-statistics-related-interface?id=K9m1dlf41ex5f)

## Running

```bash
$ npm install && npm run start
# or
$ yarn && yarn start
```

## License

Copyright © 2020
