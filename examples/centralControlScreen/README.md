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
1. Control the hiding and display of equipment
2. Control the hiding and display of the scene
3. Management of voice scenes
4. Gateway function
5. Custom wake word
6. Control of relay switch
7. Music player related functions

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
