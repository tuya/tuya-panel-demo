# Multimode Gateway Template

English | [简体中文](./README-zh_CN.md)

for docs, please visit [tuya docs](https://docs.tuya.com)

for users outside Chinese mainland, please remove `.npmrc` file.

## Download manually

```bash
$ curl https://codeload.github.com/tuya/tuya-panel-demo/tar.gz/master | tar -xz --strip=2 tuya-panel-demo-master/examples/gatewayMultimode
$ mv basic tuya-panel-gatewayMultimode-example
$ cd tuya-panel-gatewayMultimode-example
```

## Introduction

This template project is suitable for Tuya multi-mode gateway products and supports the following functions:
1. List of Bluetooth and Zigbee sub-devices
2. Add Zigbee sub-device
3. Bind and unbind Bluetooth sub-devices
4. Enter the sub-device details page to control

You can scan the following QR code through the Tuya app to preview.

![gatewayMultimode](https://imagesd.tuyaus.com/tyims/rms-static/5c152260-e552-11eb-b60d-0f9713885502-1626342745990.png?tyName=multimodeGateway.png)

## Running

```bash
$ npm install && npm run start
# or
$ yarn && yarn start
```

## License

Copyright © 2020
