# Tuya Lamp classic panel template

English | [简体中文](./README-zh_CN.md)

for docs, please visit [tuya docs](https://docs.tuya.com)

for users outside Chinese mainland, please remove `.npmrc` file.

## Download manually

```bash
$ curl https://codeload.github.com/tuya/tuya-panel-demo/tar.gz/master | tar -xz --strip=2 tuya-panel-demo-master/examples/lampGeneric
$ mv lampGeneric tuya-panel-lamp-generic-example
$ cd tuya-panel-lamp-generic-example
```

## Introduction

The template project can be used to quickly create a standard dp protocol lighting 5-way bulb project, supporting the following functions

- White light setting
- IPL settings
- Scene setting
- Musical rhythm
- Customize the setting of scene attributes
- Countdown
- Cloud timing

The following categories are supported:

- WiFi
- BLE
- Sigmesh
- Zigbee


You can scan the following QR code through the Tuya app to preview.

![Basic-0.59](https://imagesd.tuyaus.com/tyims/rms-static/02aa3ea0-8d4a-11eb-88f2-c9819eefd6d0-1616663457674.png?tyName=lampGeneric.png)

## Running

```bash
$ npm install && npm run start
# or
$ yarn && yarn start
```

## License

Copyright © 2020
