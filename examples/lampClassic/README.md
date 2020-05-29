# Tuya Panel Basic Template



English | [简体中文](./README-zh_CN.md)



for docs, please visit [tuya docs](https://docs.tuya.com)



for users outside Chinese mainland, please remove `.npmrc` file.



## Download manually

```bash
$ curl https://codeload.github.com/TuyaInc/tuya-panel-kit-template/tar.gz/develop | tar -xz --strip=2 tuya-panel-kit-template-develop/examples/lampClassic
$ mv lampClassic tuya-panel-lampClassic-example
$ cd tuya-panel-lampClassic-example
```

## Introduction

The template project can be used to quickly create lighting 1-5-way bulb lamp project, supporting the following functions: color light setting / white light setting / scenario setting / cloud timing / using device storage interface


## Running

```bash
$ npm install && npm run start
# or
$ yarn && yarn start
```


## Protocols
[Lighting dp protocol description](https://docs.tuya.com/zh/hardware/lighting/lighting/product-function-definition?id=K9lf9jad5bga9)
