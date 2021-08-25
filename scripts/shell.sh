#!/bin/bash
examples=("airPurifier" "airThermostat" "basic-ts-0.59" "basic-ts-navigation" "curtain" "curtainSwitch" "gatewayBleMesh" "gatewayZigbee" "ipcBasic" "lampClassic" "lampGeneric" "smartLockZigbee" "wirelessSwitch")

for example in ${examples[*]}
do
  echo $example 4.x
  sed -i "" 's/"tuya-panel-kit":.*/"tuya-panel-kit": "~4.7.6"/' examples/$example/package.json
  cd examples/$example/
  yarn install
  cd ../../
done

examples2=("basic" "cooker" "electricHeatingTable" "ipc" "lampDimmer" "platoonSocket" "scenario" "sensor" "smartLock", "switch")

for example in ${examples2[*]}
do
  echo $example 2.x
  sed -i "" 's/"tuya-panel-kit":.*/"tuya-panel-kit": "~2.1.0"/' examples/$example/package.json
  cd examples/$example/
  yarn install
  cd ../../
done