/* eslint-disable react/prefer-stateless-function */
import React, { FC, useEffect } from 'react';
import { View } from 'react-native';
import { useDispatch } from 'react-redux';
import { TYSdk, DeprecatedNavigator } from 'tuya-panel-kit';
import { actions } from '@models';
import PanResponder from './PanResponder';

interface MainProps {
  devInfo: any;
  navigator: DeprecatedNavigator;
}

const Home: FC<MainProps> = ({ devInfo, navigator }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    getSubDevList();
    getRoomInfo();
    // 监听通过设备列表添加子设备
    TYSdk.DeviceEventEmitter.addListener('subDevAddOrRemove', getSubDevList);
    // 监听通过搜索设备添加子设备
    TYSdk.DeviceEventEmitter.addListener('subDevInfoUpdate', getSubDevList);
    return () => {
      TYSdk.DeviceEventEmitter.removeListener('subDevAddOrRemove', getSubDevList);
      TYSdk.DeviceEventEmitter.removeListener('subDevInfoUpdate', getSubDevList);
    };
  }, []);

  // 获取子设备列表
  const getSubDevList = () => {
    dispatch(actions.customize.getSubDevList());
  };
  // 获取房间信息
  const getRoomInfo = () => {
    TYSdk.native.getRoomsInCurrentHome(
      d => {
        const data = {};
        d.forEach(item => {
          data[item.roomId] = item.name;
        });
        dispatch(actions.customize.getRoomInfo(data));
      },
      e => console.log(e)
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <PanResponder devInfo={devInfo} navigator={navigator} />
    </View>
  );
};

export default Home;
