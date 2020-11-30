# Tuya Panel Basic Template



English | [简体中文](./README-zh_CN.md)



for docs, please visit [tuya docs](https://docs.tuya.com)



for users outside Chinese mainland, please remove `.npmrc` file.



## Download manually

```bash
$ curl https://codeload.github.com/tuya/tuya-panel-demo/tar.gz/master | tar -xz --strip=2 tuya-panel-demo-master/examples/lampClassic
$ mv lampClassic tuya-panel-lampClassic-example
$ cd tuya-panel-lampClassic-example
```

## Introduction

The template project can be used to quickly create lighting 1-5-way bulb lamp project, supporting the following functions: color light setting / white light setting / scenario setting / cloud timing / using device storage interface

You can scan the following QR code through the Tuya app to preview.

![LampClassic](https://images.tuyacn.com/rms-static/5c2c6430-0c67-11eb-897d-85bb9e60451e-1602492363251.png?tyName=lampClassic.png)



## Running

```bash
$ npm install && npm run start
# or
$ yarn && yarn start
```


## Protocols
[Lighting dp protocol description](https://docs.tuya.com/zh/hardware/lighting/lighting/product-function-definition?id=K9lf9jad5bga9)
