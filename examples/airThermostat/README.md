# Tuya Panel Dimmer Template

English | [简体中文](./README-zh_CN.md)

for docs, please visit [tuya docs](https://docs.tuya.com)

for users outside Chinese mainland, please remove `.npmrc` file.

## Download manually

```bash
$ curl https://codeload.github.com/tuya/tuya-panel-demo/tar.gz/master | tar -xz --strip=2 tuya-panel-demo-master/examples/airThermostat
$ mv airThermostat tuya-panel-airThermostat-example
$ cd tuya-panel-airThermostat-example
```

## Introduction

The template project can be used to quickly create lighting dimmer projects, supporting the following functions: 1 channel dimming / 2 channel dimming / dimming lamp type configuration / setting lamp brightness adjustable range / cloud timing / using device storage interface

You can scan the following QR code through the Tuya app to preview.

![LampClassic](https://images.tuyacn.com/rms-static/249dac90-0c67-11eb-897d-85bb9e60451e-1602492270041.png?tyName=airThermostat.png)



## Running

```bash
$ npm install && npm run start
# or
$ yarn && yarn start
```
