# Central Control Screen Template

English | [简体中文](./README-zh_CN.md)

for docs, please visit [tuya docs](https://docs.tuya.com)

for users outside Chinese mainland, please remove `.npmrc` file.

## Download manually

```bash
$ curl https://codeload.github.com/tuya/tuya-panel-demo/tar.gz/master | tar -xz --strip=2 tuya-panel-demo-master/examples/centralControlScreen
$ mv basic tuya-panel-centralControlScreen-example
$ cd tuya-panel-centralControlScreen-example
```

## Introduction

This template project is suitable for Tuya central control products and supports the following functions:
- Voice scene management
- Scene management
- Device management
- Gateway function
- Jump to the music player panel
- Nickname settings (custom wake-up words)
- Relay switch control and name setting

You can scan the following QR code through the Tuya app to preview.

![centralControlScreen](https://imagesd.tuyaus.com/tyims/rms-static/edce1d80-5350-11ec-bf56-238df7ae6cb1-1638436759384.png?tyName=centralControlScreen.png)

## Running

```bash
$ npm install && npm run start
# or
$ yarn && yarn start
```

## License

Copyright © 2020
