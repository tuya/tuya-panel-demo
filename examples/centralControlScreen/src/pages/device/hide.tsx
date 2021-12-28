import React, { FC, useState, useEffect } from 'react';
import { View, StyleSheet, Image, FlatList } from 'react-native';
import { Utils, TopBar, TYSdk, IconFont, Swipeout } from 'tuya-panel-kit';
import { useDispatch } from 'react-redux';
import _ from 'lodash';
import Strings from '@i18n';
import Res from '@res';
import { dpCodes, theme } from '@config';
import { useSelector, actions } from '@models';
import { EmptyView, DeviceItem } from '@components';
import { jumpToPage, alertDialog, back } from '@utils';
import { IFormatDeviceItem, EResourceType } from '@interface';
import { hideResource } from '@api';

const { convertX: cx } = Utils.RatioUtils;

const DeviceHide: FC = () => {
  const { displayedDeviceList } = useSelector(state => state);
  const dispatch = useDispatch();

  // 选中的设备id数组
  const [selectedDevIds, setSelectedDevIds] = useState<string[]>([]);
  // 选中的群组id数组
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);

  useEffect(() => {
    getData();
  }, []);

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

  const save = () => {
    if (!selectedDevIds.length && !selectedGroupIds.length) {
      return alertDialog(Strings.getLang('noChooseDevices'));
    }
    const promiseList: any[] = [];
    selectedDevIds.length && promiseList.push(hideResource(EResourceType.device, selectedDevIds));
    selectedGroupIds.length &&
      promiseList.push(hideResource(EResourceType.group, selectedGroupIds));
    Promise.all(promiseList)
      .then(() => {
        getDevList();
        alertDialog(Strings.getLang('saveSuccess'), back);
      })
      .catch((err: any) => {
        console.log(err);
        alertDialog(Strings.getLang('saveFail'), back);
      });
  };

  const renderTopBar = () => {
    return (
      <TopBar
        title={Strings.getLang('devicesLess')}
        background="transparent"
        onBack={back}
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

  const renderItem = ({ item }: { item: IFormatDeviceItem }) => {
    const { devId, resourceType } = item;
    const isSelect =
      (resourceType === EResourceType.device && selectedDevIds.includes(devId)) ||
      (resourceType === EResourceType.group && selectedGroupIds.includes(devId));
    return (
      <View style={[styles.row, styles.item]}>
        <DeviceItem
          {...item}
          isSelect={isSelect}
          onPress={() => chooseItem(devId, resourceType)}
          onLongPress={() => jumpToPage('deviceHide')}
        />
      </View>
    );
  };

  const renderList = () => {
    return (
      <FlatList
        data={displayedDeviceList}
        renderItem={renderItem}
        keyExtractor={item => item.devId}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: cx(16), paddingVertical: cx(12) }}
        ListEmptyComponent={
          <EmptyView
            text={Strings.getLang('emptyDevices')}
            addText={Strings.getLang('add')}
            icon={Res.emptySub}
            style={{ flex: 1 }}
            hideAddBtn={true}
            onPress={() => jumpToPage('deviceRestore')}
          />
        }
      />
    );
  };

  return (
    <View style={styles.container}>
      {renderTopBar()}
      {renderList()}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  item: {
    marginBottom: cx(8),
    backgroundColor: 'transparent',
  },
});
export default DeviceHide;
