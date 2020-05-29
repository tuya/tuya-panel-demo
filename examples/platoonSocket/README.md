# Tuya Panel Switch Template

English | [简体中文](./README-zh_CN.md)

for docs, please visit [tuya docs](https://docs.tuya.com)

for users outside Chinese mainland, please remove `.npmrc` file.

## Download manually

```bash
$ curl https://codeload.github.com/TuyaInc/tuya-panel-kit-template/tar.gz/develop | tar -xz --strip=2 tuya-panel-kit-template-develop/examples/platoonSocket
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

## Running

```bash
$ npm install && npm run start
# or
$ yarn && yarn start
```

## API

* [s.m.dev.dp.get](https://docs.tuya.com/zh/iot/panel-development/panel-sdk-development/common-sdk-development/equipment-related-interface/equipment-related-interface?id=K9m1dlii6zkf7#title-0-%E8%8E%B7%E5%8F%96%E8%AE%BE%E5%A4%87%E6%89%80%E6%9C%89%20dp%20%E7%82%B9%E4%BF%A1%E6%81%AF)
* [s.m.dev.group.dp.get](https://docs.tuya.com/zh/iot/panel-development/panel-sdk-development/common-sdk-development/equipment-related-interface/equipment-related-interface?id=K9m1dlii6zkf7#title-2-%E8%8E%B7%E5%8F%96%E7%BE%A4%E7%BB%84%E8%AE%BE%E5%A4%87%E6%89%80%E6%9C%89%20dp%20%E7%82%B9%E4%BF%A1%E6%81%AF)
* [s.m.dev.dp.name.update](https://docs.tuya.com/zh/iot/panel-development/panel-sdk-development/common-sdk-development/equipment-related-interface/equipment-related-interface?id=K9m1dlii6zkf7#title-1-%E6%9B%B4%E6%96%B0%E8%AE%BE%E5%A4%87%20dp%20%E7%82%B9%E5%90%8D%E7%A7%B0)
* [tuya.m.group.dpname.update](https://docs.tuya.com/zh/iot/panel-development/panel-sdk-development/common-sdk-development/equipment-related-interface/equipment-related-interface?id=K9m1dlii6zkf7#title-3-%E6%9B%B4%E6%96%B0%E7%BE%A4%E7%BB%84%E8%AE%BE%E5%A4%87%20dp%20%E7%82%B9%E5%90%8D%E7%A7%B0)
* [s.m.linkage.timer.nearest.bat.get](https://docs.tuya.com/zh/iot/panel-development/panel-sdk-development/common-sdk-development/cloud-timing-interface/cloud-timing-interface?id=K9m1dlbzt0kdz#title-1-%E8%8E%B7%E5%8F%96%E5%A4%9A%E4%B8%AA%20DP%20%E7%82%B9%E6%9C%80%E8%BF%91%E7%9A%84%E5%AE%9A%E6%97%B6)

## License

Copyright © 2020
