import React, { FC, useState, useEffect } from 'react';
import { View, StyleSheet, Image, FlatList } from 'react-native';
import { Utils, TopBar, TYSdk, IconFont, Dialog } from 'tuya-panel-kit';
import { useDispatch } from 'react-redux';
import _ from 'lodash';
import Strings from '@i18n';
import Res from '@res';
import { theme } from '@config';
import { useSelector, actions } from '@models';
import { EmptyView, DeviceItem, Swipeout } from '@components';
import { jumpToPage, back, showToast } from '@utils';
import { IFormatDeviceItem, EResourceType } from '@interface';
import { hideResource } from '@api';

const { convertX: cx } = Utils.RatioUtils;

const Device: FC = () => {
  const { displayedDeviceList } = useSelector(state => state);
  const dispatch = useDispatch();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectDevId, setSelectDevId] = useState('');

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

  const onRefresh = async () => {
    setIsRefreshing(true);
    await getDevList();
    setIsRefreshing(false);
  };

  const selectItem = (devId: string) => {
    setSelectDevId(selectDevId && selectDevId === devId ? '' : devId);
  };

  const renderTopBar = () => {
    return (
      <TopBar
        title={Strings.getLang('devices')}
        background="transparent"
        onBack={back}
        actions={[
          {
            source: Res.hide,
            color: theme.fontColor,
            onPress: () => jumpToPage('deviceRestore'),
          },
        ]}
      />
    );
  };

  const gotoDevId = (devId: string) => {
    TYSdk.native.pushToNextPageWithDeviceId(devId);
  };

  const handleHide = (devId: string, resourceType: EResourceType) => {
    Dialog.confirm({
      title: Strings.getLang('hideDeviceTips'),
      cancelText: Strings.getLang('cancel'),
      cancelTextStyle: { color: '#666' },
      confirmTextStyle: { color: '#333' },
      confirmText: Strings.getLang('confirm'),
      onConfirm: (data, { close }) => {
        close();
        hideResource(resourceType, [devId])
          .then((res: any) => {
            getDevList();
            showToast(Strings.getLang('hideSuccess'));
          })
          .catch((err: any) => {
            showToast(Strings.getLang('hideFail'));
          });
      },
    });
  };

  const renderItem = ({ item }: { item: IFormatDeviceItem }) => {
    const { devId, resourceType } = item;
    return (
      <Swipeout
        autoClose={true}
        style={styles.swipe}
        buttonWidth={cx(60)}
        rowID={devId}
        close={selectDevId !== devId}
        onClose={() => setSelectDevId('')}
        right={[
          {
            backgroundColor: 'transparent',
            onPress: () => resourceType === EResourceType.device && gotoDevId(devId),
            content: (
              <View style={styles.btn}>
                <View style={[styles.row, styles.delete, { backgroundColor: '#C1C1C1' }]}>
                  <IconFont name="edit" size={cx(24)} color="#FFF" />
                </View>
              </View>
            ),
          },
          {
            backgroundColor: 'transparent',
            onPress: () => handleHide(devId, resourceType),
            content: (
              <View style={styles.btn}>
                <View style={[styles.row, styles.delete]}>
                  <Image source={Res.hide} style={{ tintColor: '#FFF' }} />
                </View>
              </View>
            ),
          },
        ]}
      >
        <DeviceItem
          {...item}
          onPress={() => selectItem(devId)}
          onLongPress={() => jumpToPage('deviceHide')}
        />
      </Swipeout>
    );
  };

  const renderList = () => {
    return (
      <FlatList
        data={displayedDeviceList}
        extraData={selectDevId}
        renderItem={renderItem}
        keyExtractor={item => item.devId.toString()}
        // style={styles.list}
        showsVerticalScrollIndicator={false}
        onRefresh={onRefresh}
        refreshing={isRefreshing}
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: cx(16), paddingVertical: cx(12) }}
        ListEmptyComponent={
          <EmptyView
            text={Strings.getLang('emptyDevices')}
            icon={Res.emptySub}
            style={{ flex: 1 }}
            hideAddBtn={true}
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
  swipe: {
    marginBottom: cx(8),
    backgroundColor: 'transparent',
    alignItems: 'flex-end',
  },
  btn: {
    width: cx(60),
    alignItems: 'flex-end',
    alignSelf: 'flex-end',
  },
  delete: {
    width: cx(52),
    height: cx(92),
    backgroundColor: '#FF4C4C',
    borderRadius: cx(12),
    justifyContent: 'center',
  },
});
export default Device;
