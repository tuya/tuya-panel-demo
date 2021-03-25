import React, { FC, useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import {
  TopBar,
  TYText,
  Utils,
  DeprecatedNavigator,
  DeprecatedNavigatorRoute,
  TYSdk,
  Dialog,
  Popup,
} from 'tuya-panel-kit';
import { useSelector } from '@models';

import SubDevItem from '../../components/SubDevItem';
import AddProgress from '../../components/AddProgress';
import { getDeviceLists, bleSubDevChange, sigmeshSubDevChange } from '../../api';
import { theme } from '../../config';
import { SubDevInfo } from '../../config/fetchDataInterface';
import Strings from '../../i18n';
import { getSubDev } from '../../utils';

const { convertX: cx, convertY: cy } = Utils.RatioUtils;

interface MainProps {
  navigator: DeprecatedNavigator;
  route: DeprecatedNavigatorRoute;
}

interface SubDevs {
  [devId: string]: SubDevInfo;
}

interface AddBleSubDev {
  uuid: string;
  devId: string;
}

const Main: FC<MainProps> = ({ navigator, route }) => {
  const roomInfo = useSelector(state => state.deviceStore.roomInfo);
  const [devList, setDevListList] = useState([] as SubDevInfo[]);
  const [devInfo, setDevInfo] = useState({} as SubDevs);
  const [selects, setSelects] = useState([] as string[]);

  useEffect(() => {
    // 获取当前家庭下可添加的子设备
    getSubDevList();
  }, []);
  const getSubDevList = useCallback(async () => {
    try {
      // 获取当前家庭下的所有设备
      const data = await getDeviceLists();
      // 子设备过滤
      const lists = getSubDev(data);
      if (Array.isArray(lists)) {
        const info = {};
        lists.forEach(({ isSigMesh, uuid, nodeId, devId, meshId }) => {
          info[devId] = { isSigMesh, uuid, nodeId, devId, meshId };
        });
        setDevInfo(info);
        setDevListList(lists);
      }
    } catch (error) {
      __DEV__ && console.log(error);
    }
  }, []);

  const selectAll = () => {
    if (selects.length < devList.length) {
      const allDevIds = devList.map(item => item.devId);
      setSelects(allDevIds);
    } else {
      setSelects([]);
    }
  };

  const select = devId => {
    const newSelects = [...selects];
    if (newSelects.includes(devId)) {
      newSelects.splice(newSelects.indexOf(devId), 1);
    } else {
      newSelects.push(devId);
    }
    setSelects(newSelects);
  };

  const addHandle = () => {
    if (selects.length === 0) {
      Dialog.alert({
        title: Strings.getLang('tip'),
        subTitle: Strings.getLang('noSelect'),
        confirmText: Strings.getLang('confirm'),
        onConfirm: (_, { close }) => {
          close();
        },
      });
    } else {
      Dialog.confirm({
        title: Strings.getLang('addDialogTitle'),
        subTitle: Strings.getLang('addDialogTip'),
        cancelText: Strings.getLang('cancel'),
        confirmText: Strings.getLang('join'),
        onConfirm: (_, { close }) => {
          add();
          close();
          setTimeout(() => popProgress(), 300);
        },
      });
    }
  };
  const popProgress = () => {
    Popup.custom(
      {
        content: <AddProgress selects={selects} />,
        footer: <View />,
        title: <View />,
        wrapperStyle: {
          alignSelf: 'center',
          backgroundColor: 'transparent',
        },
        onMaskPress: () => null,
      },
      {
        alignContainer: 'center',
        maskStyle: { backgroundColor: 'rgba(51,51,51,0.7)' },
      }
    );
  };
  const add = () => {
    const { devId: id, sigmeshId } = TYSdk.devInfo;
    const addBleSubDevs: AddBleSubDev[] = [];
    const addSigmeshSubDevs: string[] = [];
    let getMeshId = '';
    selects.forEach(item => {
      const { isSigMesh, nodeId, uuid, devId, meshId } = devInfo[item];
      if (isSigMesh) {
        if (meshId) {
          getMeshId = meshId;
        }
        addSigmeshSubDevs.push(nodeId);
      } else {
        addBleSubDevs.push({ uuid, devId });
      }
    });
    const fetchs: Promise<any>[] = [];
    if (addBleSubDevs.length > 0) {
      // 蓝牙子设备的添加和删除
      fetchs.push(bleSubDevChange(sigmeshId, addBleSubDevs, id));
    }
    if (addSigmeshSubDevs.length > 0) {
      // SIG Mesh子设备的添加和删除
      fetchs.push(sigmeshSubDevChange(getMeshId, addSigmeshSubDevs, id));
    }
    Promise.all(fetchs)
      .then(data => {
        console.log(data);
      })
      .catch(error => {
        console.log(error);
      });
  };

  const renderItem = useCallback(
    data => {
      const { devId } = data.item;
      return (
        <SubDevItem
          data={data}
          roomInfo={roomInfo}
          id={route.id}
          onPress={() => select(devId)}
          selected={selects.includes(devId)}
        />
      );
    },
    [selects]
  );
  const renderTopBar = () => (
    <TopBar
      leftActions={[
        {
          name: 'backIos',
          onPress: navigator.pop,
        },
      ]}
      actions={[
        {
          source: Strings.getLang('confirm'),
          onPress: addHandle,
        },
      ]}
      title={Strings.getLang('addSubDev')}
    />
  );
  const renderTop = () => (
    <View style={styles.top}>
      <TYText style={styles.tip}>{Strings.getLang('addTip')}</TYText>
      <TouchableOpacity activeOpacity={0.9} onPress={() => selectAll()}>
        <TYText style={styles.selectText}>{Strings.getLang('selectAll')}</TYText>
      </TouchableOpacity>
    </View>
  );
  return (
    <View style={styles.main}>
      {renderTopBar()}
      {renderTop()}
      <View style={{ flex: 1, padding: cx(6) }}>
        <FlatList
          data={devList}
          keyExtractor={(item: SubDevInfo) => item.devId}
          extraData={devList}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: cy(60) }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  top: {
    backgroundColor: '#F8F8F8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: cx(15),
    height: cy(40),
  },
  tip: {
    fontSize: cx(14),
    color: '#888',
  },
  selectText: {
    fontSize: cx(14),
    color: theme.themeColor,
  },
});

export default Main;
