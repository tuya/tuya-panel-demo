# Tuya Panel Bluetooth MESH(SIG) Gateway Template

English | [简体中文](./README-zh_CN.md)

for docs, please visit [tuya docs](https://docs.tuya.com)

for users outside Chinese mainland, please remove `.npmrc` file.

## Download manually

```bash
$ curl https://codeload.github.com/tuya/tuya-panel-demo/tar.gz/master | tar -xz --strip=2 tuya-panel-demo-master/examples/gatewayBleMesh
$ mv basic tuya-panel-gatewayBleMesh-example
$ cd tuya-panel-gatewayBleMesh-example
```

## Introduction

The template project is applicable to Tuya Bluetooth MESH(SIG) Gateway products, supporting the following functions:

1. Display a list of subunit devices
2. Add subunit devices
3. Delete subunit devices
4. Go to the sub-device detail page for control

You can scan the following QR code through the Tuya app to preview.

![gatewayBleMesh](https://images.tuyacn.com/rms-static/d19f3270-7c19-11eb-b60c-35c3dc2e2583-1614773589783.png?tyName=gatewayBleMesh.png)

## Running

```bash
$ npm install && npm run start
# or
$ yarn && yarn start
```

## License

Copyright © 2020
