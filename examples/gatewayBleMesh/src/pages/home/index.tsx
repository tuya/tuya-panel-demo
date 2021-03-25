import React, { FC, useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { TYSdk, TYText, Utils, DeprecatedNavigator } from 'tuya-panel-kit';
import { useDispatch } from 'react-redux';
import { actions, useSelector } from '@models';

import TopView from '../../components/TopView';
import SubList from './SubList';
import AddSubDev from '../add';
import Strings from '../../i18n';
import Res from '../../res';
import { SubDevInfo } from '../../config/fetchDataInterface';

const { convertX: cx, isIphoneX } = Utils.RatioUtils;
interface MainProps {
  devInfo: any;
  navigator: DeprecatedNavigator;
}

const Main: FC<MainProps> = ({ devInfo, navigator }) => {
  const dispatch = useDispatch();
  const list: SubDevInfo[] = useSelector(state => state.deviceStore.subDevList);
  useEffect(() => {
    // 获取首页子设备列表
    getSubDevList();
  }, []);
  useEffect(() => {
    // 获取房间信息
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
  }, []);

  useEffect(() => {
    // 监听通过设备列表添加子设备
    TYSdk.DeviceEventEmitter.addListener('subDevAddOrRemove', getSubDevList);
    return () => {
      TYSdk.DeviceEventEmitter.removeListener('subDevAddOrRemove', getSubDevList);
    };
  }, []);

  useEffect(() => {
    // 监听通过搜索设备添加子设备
    TYSdk.DeviceEventEmitter.addListener('subDevInfoUpdate', getSubDevList);
    return () => {
      TYSdk.DeviceEventEmitter.removeListener('subDevInfoUpdate', getSubDevList);
    };
  }, []);

  // 获取子设备列表
  const getSubDevList = () => {
    dispatch(actions.customize.getSubDevList(devInfo.devId));
  };
  const renderEmpty = () => (
    <View style={styles.emptyMain}>
      <Image source={Res.none} />
      <TYText style={styles.emptyText}>{Strings.getLang('subDevNone')}</TYText>
    </View>
  );
  return (
    <View style={styles.container}>
      <TopView devInfo={devInfo} devList={list} />
      <View style={styles.main}>
        <View style={styles.content}>
          {list.length === 0 && renderEmpty()}
          {list.length > 0 && <SubList devList={list} />}
        </View>
        <AddSubDev navigator={navigator} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: isIphoneX ? cx(20) : cx(8),
  },
  main: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: cx(8),
    overflow: 'hidden',
    margin: cx(8),
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyMain: {
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: cx(13),
    lineHeight: cx(16),
    marginTop: cx(5),
    color: '#999',
  },
});

export default Main;
