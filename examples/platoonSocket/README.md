# Tuya Panel Switch Template

English | [简体中文](./README-zh_CN.md)

for docs, please visit [tuya docs](https://docs.tuya.com)

for users outside Chinese mainland, please remove `.npmrc` file.

## Attention

The RN version of the template is 0.51, and the template is no longer maintained. It is for reference only, and it is recommended to use [basic-ts-0.59](../basic-ts-0.59)

## Download manually

```bash
$ curl https://codeload.github.com/tuya/tuya-panel-demo/tar.gz/master | tar -xz --strip=2 tuya-panel-demo-master/examples/platoonSocket
$ mv platoonSocket tuya-panel-platoonSocket-example
$ cd tuya-panel-platoonSocket-example
```

## Introduction

This template project is suitable for doodling and inserting products of different categories, and can support the following functions:

1. Multi - channel slot DP function automatic adaptation
2. DP point rename function
3. DP point timing function
4. DP point countdown function
5. DP point setting page self-adaptation

You can scan the following QR code through the Tuya app to preview.

![PlatoonSocket](https://images.tuyacn.com/rms-static/31ac00e0-a190-11ea-9acd-135316db2bdb-1590745126894.png?tyName=platoonSocket.png)

## Running

```bash
$ npm install && npm run start
# or
$ yarn && yarn start
```

## API

* [s.m.dev.dp.get](https://developer.tuya.com/en/docs/iot/equipment-related-interface?id=K9m1dlii6zkf7)
* [s.m.dev.group.dp.get](https://developer.tuya.com/en/docs/iot/equipment-related-interface?id=K9m1dlii6zkf7)
* [s.m.dev.dp.name.update](https://developer.tuya.com/en/docs/iot/equipment-related-interface?id=K9m1dlii6zkf7)
* [tuya.m.group.dpname.update](https://developer.tuya.com/en/docs/iot/equipment-related-interface?id=K9m1dlii6zkf7)
* [s.m.linkage.timer.nearest.bat.get](https://developer.tuya.com/en/docs/iot/equipment-related-interface?id=K9m1dlii6zkf7)

## License

Copyright © 2020
