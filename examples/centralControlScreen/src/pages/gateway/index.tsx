import React, { FC, useEffect, useState } from 'react';
import { View } from 'react-native';
import { TYSdk, DevInfo } from 'tuya-panel-kit';
import { TopView, SubList } from '@components';
import { GatewayUtils } from '@tuya/tuya-panel-gateway-sdk';
import { theme } from '@config';

const { getAllSubDevList } = GatewayUtils;

const Gateway: FC = () => {
  const [deviceList, setDeviceList] = useState<DevInfo[]>([]);

  useEffect(() => {
    getDevList();
    TYSdk.DeviceEventEmitter.addListener('activatorDidReceiveDevice', getDevList);
    TYSdk.DeviceEventEmitter.addListener('subDevInfoUpdate', changeSubDevs);
    TYSdk.DeviceEventEmitter.addListener('subDevAddOrRemove', changeSubDevs);
    return () => {
      TYSdk.DeviceEventEmitter.removeListener('activatorDidReceiveDevice', getDevList);
      TYSdk.DeviceEventEmitter.removeListener('subDevInfoUpdate', changeSubDevs);
      TYSdk.DeviceEventEmitter.removeListener('subDevAddOrRemove', changeSubDevs);
    };
  }, []);

  const getDevList = async () => {
    const list = await getAllSubDevList();
    setDeviceList(list);
  };

  const changeSubDevs = data => {
    const { devId: id, devInfo, action: subDeviceAction } = data;
    const index = deviceList.findIndex(({ devId }) => devId === id);
    const cache = Array.prototype.slice.call(deviceList);
    if (subDeviceAction) {
      switch (subDeviceAction) {
        case 'add':
          if (index !== -1) {
            cache[index] = devInfo;
          } else {
            cache.push(devInfo);
          }
          break;
        case 'rm':
          if (index === -1) return;
          cache.splice(index, 1);
          break;
        default:
          break;
      }
    } else {
      cache.splice(index, 1, devInfo);
    }
    setDeviceList(cache);
  };

  return (
    <View style={{ flex: 1 }}>
      <TopView onlineDeviceNum={deviceList.filter((d: any) => d.isOnline).length} />
      <SubList
        themeColor={theme.themeColor}
        dataSource={deviceList}
        isAdmin={TYSdk.devInfo.isAdmin}
      />
    </View>
  );
};
export default Gateway;
