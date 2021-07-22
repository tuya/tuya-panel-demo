# Tuya Panel Switch Template

English | [简体中文](./README-zh_CN.md)

for docs, please visit [tuya docs](https://docs.tuya.com)

for users outside Chinese mainland, please remove `.npmrc` file.

## Attention

The RN version of the template is 0.51, and the template is no longer maintained. It is for reference only, and it is recommended to use [basic-ts-0.59](../basic-ts-0.59)

## Download manually

```bash
$ curl https://codeload.github.com/tuya/tuya-panel-demo/tar.gz/master | tar -xz --strip=2 tuya-panel-demo-master/examples/scenario
$ mv scenario tuya-panel-scenario-example
$ cd tuya-panel-scenario-example
```

## Introduction

This template is applicable to the scene, supporting the following functions:

1. Scene linkage creation
2. Scene linkage binding/unbinding
3. Scene linkage trigger

You can scan the following QR code through the Tuya app to preview.

![scenario](https://images.tuyacn.com/fe-static/docs/img/68a3f0db-5185-4de6-be4b-34a8a4b7cf4e.png)

## Running

```bash
$ npm install && npm run start
# or
$ yarn && yarn start
```

## API

* [tuya.m.linkage.rule.trigger](https://docs.tuya.com/zh/iot/panel-development/panel-sdk-development/common-sdk-development/scene-related-interface/scene-related-interface?id=K9pemz7l3wz0t)
* [tuya.m.linkage.rule.bind.wifi.query](https://docs.tuya.com/zh/iot/panel-development/panel-sdk-development/common-sdk-development/scene-related-interface/scene-related-interface?id=K9pemz7l3wz0t)
* [tuya.m.linkage.rule.brief.query](https://docs.tuya.com/zh/iot/panel-development/panel-sdk-development/common-sdk-development/scene-related-interface/scene-related-interface?id=K9pemz7l3wz0t)
* [tuya.m.linkage.rule.bind.wifi.save](https://docs.tuya.com/zh/iot/panel-development/panel-sdk-development/common-sdk-development/scene-related-interface/scene-related-interface?id=K9pemz7l3wz0t)
* [tuya.m.linkage.rule.bind.wifi.remove](https://docs.tuya.com/zh/iot/panel-development/panel-sdk-development/common-sdk-development/scene-related-interface/scene-related-interface?id=K9pemz7l3wz0t)

## License

Copyright © 2020
