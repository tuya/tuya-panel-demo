# Tuya Panel Lamp Template

English | [简体中文](./README-zh_CN.md)

for docs, please visit [tuya docs](https://docs.tuya.com)

for users outside Chinese mainland, please remove `.npmrc` file.

## Download manually

```bash
$ curl https://codeload.github.com/tuya/tuya-panel-demo/tar.gz/master | tar -xz --strip=2 tuya-panel-demo-master/examples/lampClassic
$ mv basic tuya-panel-lampClassic-example
$ cd tuya-panel-lampClassic-example
```

## Introduction

This template project is based on React Native 0.59 version of the JS basic template, which can be used to quickly create lighting 1-5 bulb project, supports the following functions:

- Color light setting
- White light setting
- Scene setting
- Cloud timing
- Customize scene property settings

The following categories are supported:

- WiFi
- BLE
- Sigmesh
- Zigbee

You can scan the following QR code through the Tuya app to preview.

![lampClassic](https://images.tuyacn.com/rms-static/5c2c6430-0c67-11eb-897d-85bb9e60451e-1602492363251.png?tyName&#x3D;lampClassic.png)

## Running

```bash
$ npm install && npm run start
# or
$ yarn && yarn start
```

## License

Copyright © 2020
