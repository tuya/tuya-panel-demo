# Tuya Panel AirPurifier Template

English | [简体中文](./README-zh_CN.md)

for docs, please visit [tuya docs](https://docs.tuya.com)

for users outside Chinese mainland, please remove `.npmrc` file.

## Download manually

```bash
$ curl https://codeload.github.com/tuya/tuya-panel-demo/tar.gz/master | tar -xz --strip=2 tuya-panel-demo-master/examples/airPurifier
$ mv airPurifier tuya-panel-airPurifier-example
$ cd tuya-panel-airPurifier-example
```

## Introduction

The template project can be used to quickly start the air purifier project, supporting the following functions: **cloud interface to obtain weather, city / multiple function buttons to control the air purifier**

You can scan the following QR code through the Tuya app to preview.

![AirPurifier](https://images.tuyacn.com/fe-static/docs/img/2d7d2936-84bb-43d5-8244-aff29d76e3c5.png?tyName=airPurifier.png)

## Attention

1. The template supports the display of city、air condition and so on.

2. This template supports adaptive Dp.

3. This template supports timing.

## API （interfaces）

[tuya.m.public.weather.get](https://docs.tuya.com/zh/iot/panel-development/panel-sdk-development/common-sdk-development/equipment-related-interface/equipment-related-interface?id=K9m1dlii6zkf7#title-4-%E4%BA%94%E3%80%81%E8%8E%B7%E5%8F%96%E8%AE%BE%E5%A4%87%E5%9F%8E%E5%B8%82%E5%A4%A9%E6%B0%94%E4%BF%A1%E6%81%AF)

## Running

```bash
$ npm install && npm run start
# or
$ yarn && yarn start
```

## License

Copyright © 2020
