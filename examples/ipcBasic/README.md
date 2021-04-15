# The template project is React Native 0.59 version TS, based on `@tuya/tuya-panel-ipc-sdk` to encapsulate Player components and functional modules, and quickly develop panels related to Ipc

English | [简体中文](./README-zh_CN.md)

for docs, please visit [tuya docs](https://docs.tuya.com)

for users outside Chinese mainland, please remove `.npmrc` file.

## Download manually

```bash
$ curl https://codeload.github.com/tuya/tuya-panel-demo/tar.gz/master | tar -xz --strip=2 tuya-panel-demo-master/examples/ipcBasic
$ mv ipcBasic tuya-panel-ipc-basic-example
$ cd tuya-panel-ipc-basic-example
```

## Introduction

 The template project is React Native 0.59 version TS, based on `@tuya/tuya-panel-ipc-sdk` to encapsulate Player components and functional modules, and quickly develop panels related to Ipc

1. Path Alias;
2. React、Redux Hooks;

You can scan the following QR code through the Tuya app to preview.

![Basic-0.59](https://images.tuyacn.com/rms-static/4cac5b50-48d5-11eb-bc15-27e102d5b696-1609136651653.png?tyName=IpcBasic.png)

## Running

```bash
$ npm install && npm run start
# or
$ yarn && yarn start
```

## Download manually

```bash
$ curl https://codeload.github.com/tuya/tuya-panel-demo/tar.gz/master | tar -xz --strip=2 tuya-panel-demo-master/examples/ipcBasic
$ mv ipcBasic tuya-panel-ipc-basic-example
$ cd tuya-panel-ipc-basic-example
```
## Note

- Please use the app developed by Tuya Smart 3.22 and above, debug version for debugging and development

## Release Notes

2021-04-15: Optimize the adjustment method of video area according to width and height, add onChangeActiveZoomStatus: (zoomStatus: number) => any; callback function, change the video multiple when it is triggered actively

## License

Copyright © 2020

