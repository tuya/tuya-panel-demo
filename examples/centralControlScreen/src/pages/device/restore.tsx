import React, { FC, useState, useMemo, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Utils, TopBar, TYSdk } from 'tuya-panel-kit';
import { useDispatch } from 'react-redux';
import _ from 'lodash';
import Strings from '@i18n';
import Res from '@res';
import { theme } from '@config';
import { useSelector, actions } from '@models';
import { EmptyView, DeviceItem, Tabs } from '@components';
import { IFormatDeviceItem, EResourceType } from '@interface';
import { restoreResource } from '@api';
import { alertDialog } from '@utils';

const { convertX: cx } = Utils.RatioUtils;

const DeviceRestore: FC = () => {
  const { hiddenDeviceList, roomList } = useSelector(state => state);
  const dispatch = useDispatch();

  const [selectedTab, setSelectedTab] = useState(0);

  const allDeviceRoom = { value: 0, label: Strings.getLang('allDevs') };

  // 选中的设备id数组
  const [selectedDevIds, setSelectedDevIds] = useState<string[]>([]);
  // 选中的群组id数组
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);

  useEffect(() => {
    getData();
  }, []);

  const displayedRoomList = useMemo(() => {
    const list = roomList.map(d => ({ value: d.roomId, label: d.name }));
    list.unshift(allDeviceRoom);
    console.log(list);

    return list;
  }, [roomList]);

  const getData = async () => {
    await getRoomList();
    getDevList();
  };

  const getRoomList = () => {
    dispatch(actions.async.getRoomList());
  };

  const getDevList = () => {
    dispatch(actions.async.getDeviceList());
  };

  const renderTopBar = () => {
    return (
      <TopBar
        title={Strings.getLang('deviceRestore')}
        background="transparent"
        onBack={TYSdk.Navigator.pop}
        actions={[
          {
            source: Strings.getLang('confirm'),
            color: theme.themeColor,
            onPress: save,
          },
        ]}
      />
    );
  };

  const renderContent = () => {
    return (
      <Tabs
        style={styles.tab}
        dataSource={displayedRoomList as any}
        background="transparent"
        swipeable={false}
        underlineWidth={cx(10)}
        activeColor="#FF4800"
        tabTextStyle={{ fontSize: 15, color: '#666' }}
        tabActiveTextStyle={{ fontSize: 16, color: '#22242C', fontWeight: 'bold' }}
        extraSpace={50}
      >
        {displayedRoomList.map(d => {
          // 0 代表所有设备，别的数字代表不同的room
          const arr =
            d.value === 0
              ? hiddenDeviceList
              : hiddenDeviceList.filter(item => item.roomId === d.value);
          console.log(arr);

          const panel = (
            <FlatList
              data={arr}
              renderItem={renderItem}
              keyExtractor={item => item.devId}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1 }}
              ListEmptyComponent={
                <EmptyView
                  text={Strings.getLang('emptyHideDevices')}
                  addText={Strings.getLang('add')}
                  icon={Res.noneDev}
                  iconStyle={{ width: cx(160), height: cx(160) }}
                  hideAddBtn={true}
                />
              }
            />
          );
          return (
            <Tabs.TabPanel key={d.value}>
              <View style={{ flex: 1, paddingHorizontal: cx(16) }}>{panel}</View>
            </Tabs.TabPanel>
          );
        })}
      </Tabs>
    );
  };

  const save = () => {
    if (!selectedDevIds.length && !selectedGroupIds.length) {
      return alertDialog(Strings.getLang('noChooseDevices'));
    }
    // TYSdk.mobile.showLoading();
    const promiseList: any[] = [];
    selectedDevIds.length &&
      promiseList.push(restoreResource(EResourceType.device, selectedDevIds));
    selectedGroupIds.length &&
      promiseList.push(restoreResource(EResourceType.group, selectedGroupIds));
    Promise.all(promiseList)
      .then(() => {
        // TYSdk.mobile.hideLoading();
        getDevList();
        alertDialog(Strings.getLang('saveSuccess'), TYSdk.Navigator.pop);
      })
      .catch((err: any) => {
        console.log(err);
        // TYSdk.mobile.hideLoading();
        alertDialog(Strings.getLang('saveFail'), TYSdk.Navigator.pop);
      });
  };

  const renderItem = ({ item }: { item: IFormatDeviceItem }) => {
    const { devId, resourceType } = item;
    const isSelect =
      (resourceType === EResourceType.device && selectedDevIds.includes(devId)) ||
      (resourceType === EResourceType.group && selectedGroupIds.includes(devId));
    return (
      <View style={[styles.row, styles.item]}>
        <DeviceItem {...item} isSelect={isSelect} onPress={() => chooseItem(devId, resourceType)} />
      </View>
    );
  };

  const chooseItem = (devId: string, resourceType: EResourceType) => {
    if (resourceType === EResourceType.device) {
      let list = _.cloneDeep(selectedDevIds);
      if (list.includes(devId)) {
        list = list.filter(d => d !== devId);
      } else {
        list.push(devId);
      }
      setSelectedDevIds(list);
    } else if (resourceType === EResourceType.group) {
      let list = _.cloneDeep(selectedGroupIds);
      if (list.includes(devId)) {
        list = list.filter(d => d !== devId);
      } else {
        list.push(devId);
      }
      setSelectedGroupIds(list);
    }
  };

  return (
    <View style={styles.container}>
      {renderTopBar()}
      {renderContent()}
      {/* {renderTestContent()} */}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  tab: {
    marginLeft: 20,
    marginBottom: cx(20),
    paddingVertical: cx(17),
  },
  item: {
    height: cx(92),
    borderRadius: cx(8),
    marginBottom: cx(8),
    backgroundColor: '#FFF',
  },
});
export default DeviceRestore;
