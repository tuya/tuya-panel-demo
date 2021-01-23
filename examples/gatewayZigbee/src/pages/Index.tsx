import React, { FC, useEffect, useState, useRef, useLayoutEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { DevInfo, TYSdk } from 'tuya-panel-kit';

import TopView from '../components/TopView';
import SubList from './SubList';
import { getDeviceLists, getSubDevice } from '../api';
import AddSubDev from './AddSubDev';

interface MainProps {
  devInfo: DevInfo;
}

interface SubDevItem {
  meshId: string;
  devId: string;
  isOnline: boolean;
  [keyName: string]: any;
}

const Main: FC<MainProps> = ({ devInfo }) => {
  const init: SubDevItem[] = [];
  const [list, setList] = useState(init);

  const ref = useRef(() => {
    setList([]);
  });
  useLayoutEffect(() => {
    ref.current = getSubDevList;
  }, []);

  useEffect(() => {
    ref.current();
  }, []);

  useEffect(() => {
    TYSdk.DeviceEventEmitter.addListener('subDevInfoUpdate', ref.current);
    return () => {
      TYSdk.DeviceEventEmitter.removeListener('subDevInfoUpdate', ref.current);
    };
  }, []);
  useEffect(() => {
    TYSdk.DeviceEventEmitter.addListener('subDevAddOrRemove', ref.current);
    return () => {
      TYSdk.DeviceEventEmitter.removeListener('subDevAddOrRemove', ref.current);
    };
  }, []);

  const getSubDevList = useCallback(async () => {
    try {
      const { devId } = devInfo;
      const { appRnVersion } = TYSdk.mobile.mobileInfo;
      let lists;
      if (appRnVersion >= '5.14' && appRnVersion <= '5.28') {
        const data = (await getDeviceLists()) as SubDevItem[];
        lists = data.filter(({ meshId, devId: id }) => meshId === devId && id !== devId);
      } else {
        lists = await getSubDevice();
      }
      if (Array.isArray(lists)) {
        setList(lists);
      }
    } catch (error) {
      __DEV__ && console.log(error);
    }
  }, []);
  return (
    <View style={styles.container}>
      <TopView devInfo={devInfo} devList={list} />
      <SubList devList={list} />
      <AddSubDev />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Main;
