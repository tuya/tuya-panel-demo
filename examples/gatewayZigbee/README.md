# Tuya Panel Zigbee Gateway Template

English | [简体中文](./README-zh_CN.md)

for docs, please visit [tuya docs](https://docs.tuya.com)

for users outside Chinese mainland, please remove `.npmrc` file.

## Download manually

```bash
$ curl https://codeload.github.com/tuya/tuya-panel-demo/tar.gz/master | tar -xz --strip=2 tuya-panel-demo-master/examples/gatewayZigbee
$ mv basic tuya-panel-gatewayZigbee-example
$ cd tuya-panel-gatewayZigbee-example
```

## Introduction

The template project is applicable to Tuya zigbee gateway products, supporting the following functions:

1. Display a list of subunit devices
2. Add subunit devices
3. Go to the sub-device detail page for control

You can scan the following QR code through the Tuya app to preview.

![gatewayZigbee](https://images.tuyacn.com/rms-static/6391cf80-4f6a-11eb-bc15-27e102d5b696-1609860392056.png?tyName&#x3D;zigbeeGateway.png)

## Running

```bash
$ npm install && npm run start
# or
$ yarn && yarn start
```

## License

Copyright © 2020
