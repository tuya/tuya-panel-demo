# Tuya Panel Cooker Template

English | [简体中文](./README-zh_CN.md)

for docs, please visit [tuya docs](https://docs.tuya.com)

for users outside Chinese mainland, please remove `.npmrc` file.

## Download manually

```bash
$ curl https://codeload.github.com/tuya/tuya-panel-demo/tar.gz/master | tar -xz --strip=2 tuya-panel-demo-master/examples/cooker
$ mv cooker tuya-panel-cooker-example
$ cd tuya-panel-cooker-example
```

## Introduction

This template project can be used to quickly launch the kitchen power project, supporting the following functions: **dp function point automatic adaptation/Settings page dp point automatic adaptation/recipe related component adaptation**

You can scan the following QR code through the Tuya app to preview.

![Cooker](https://images.tuyacn.com/rms-static/b91d36c0-a195-11ea-96f0-cda03b175b6c-1590747501612.png?tyName=cooker.png)


## Attention

> 1, dp(power) is required.
>
> 2, the menu function can only be used after it is opened on the platform.
>
> 3, Determine whether to display the cloud recipe by having the dp of **cloud_recipe_number**

## API （interfaces）

[cloud recipe interfaces](https://docs.tuya.com/zh/iot/panel-development/panel-sdk-development/cooker-recipe-sdk/cooker-recipe-api?id=K9mcn0f0m1q0w)

## Running

```bash
$ npm install && npm run start
# or
$ yarn && yarn start
```

## License

Copyright © 2020
