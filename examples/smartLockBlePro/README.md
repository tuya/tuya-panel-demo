# smartLockBlePro

English | [简体中文](./README-zh_CN.md)

for docs, please visit [tuya docs](https://docs.tuya.com)

for users outside Chinese mainland, please remove `.npmrc` file.

## Download manually

```bash
$ curl https://codeload.github.com/tuya/tuya-panel-demo/tar.gz/master | tar -xz --strip=2 tuya-panel-demo-master/examples/smartLockBlePro
$ mv basic tuya-panel-smartLockBlePro-example
$ cd tuya-panel-smartLockBlePro-example
```

## Introduction

Public version template for Bluetooth category door lock.  
The template mainly realizes the following functions: 
1. home page
	* Display of main drawing
	* Home protection label
	* Find lock button
	* Other page entry list
	* Lock off / anti lock / child lock / power status display
	* Unlock / lock animation
2. settings page
	* According to the selected DP adaptive display, DP operation can be performed

[summary]:
- The template provides the home page switch lock animation.
- The pop-up and retraction animation of the home page entry list component interact.
- It encapsulates some data needed global.
- Different types of DP interactions are provided on the settings page. Basically, other DP interactions can refer to the settings page.


You can scan the following QR code through the Tuya app to preview.

![smartLockBlePro](https://images.tuyacn.com/fe-static/docs/img/01ea27bd-7016-4d94-bb94-16100242cdcf.png)

## Running

```bash
$ npm install && npm run start
# or
$ yarn && yarn start
```

## License

Copyright © 2020
