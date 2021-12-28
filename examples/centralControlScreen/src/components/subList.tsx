import React, { FC, useState, useEffect } from 'react';
import _ from 'lodash';
import { useDispatch } from 'react-redux';
import { Utils, Toast, IconFont, TYSdk, DevInfo, TYText } from 'tuya-panel-kit';
import { AddDeviceTipModal } from '@tuya/tuya-panel-gateway-sdk';
import { StyleSheet, View, TouchableOpacity, Image, FlatList } from 'react-native';
import Strings from '@i18n';
import Res from '@res';
import { useSelector, actions } from '@models';

const { convertY: cy, convertX: cx, width, isIphoneX } = Utils.RatioUtils;
const { compareVersion } = Utils.CoreUtils;

const newVersion = '5.17';
interface ISubListProps {
  dataSource: DevInfo[];
  isAdmin?: boolean;
  showTitle?: boolean;
  showAddBtn?: boolean;
  themeColor?: string;
}

const tipList = [
  {
    name: Strings.getLang('tipName1'),
    icon: Res.iconSensor,
    content: Strings.getLang('tipContent1'),
  },
  {
    name: Strings.getLang('tipName2'),
    icon: Res.iconSocket,
    content: Strings.getLang('tipContent2'),
  },
  {
    name: Strings.getLang('tipName3'),
    icon: Res.iconLight,
    content: Strings.getLang('tipContent3'),
  },
];

const SubList: FC<ISubListProps> = ({ dataSource, isAdmin, showTitle, showAddBtn, themeColor }) => {
  const { roomList } = useSelector(state => state);
  const dispatch = useDispatch();

  const [isShowToast, setIsShowToast] = useState(false);

  useEffect(() => {
    dispatch(actions.async.getRoomList());
  }, []);

  const gotoDms = () => {
    if (isAdmin || TYSdk.devInfo.isAdmin) {
      const result = compareVersion(TYSdk.mobile.mobileInfo.appRnVersion, newVersion);
      if (result < 0) {
        return TYSdk.mobile.jumpTo(
          `tuyaSmart://presentGatewayCategroy?gwId=${TYSdk.devInfo.devId}`
        );
      }
      AddDeviceTipModal.show({
        dataSource: tipList,
        addButtonStyle: { backgroundColor: themeColor },
      });
    } else {
      setIsShowToast(true);
    }
  };

  const gotoNextPage = (devId: string) => {
    TYSdk.native.pushToNextPageWithDeviceId(devId);
  };

  const getRoomName = (roomId: number) => {
    return roomList.find(d => d.roomId === roomId)?.name || '';
  };

  const renderNone = () => {
    return (
      <View
        style={[styles.mainContainer, { justifyContent: 'center', alignItems: 'center', flex: 1 }]}
      >
        <Image source={Res.none} />
        <TYText text={Strings.getLang('subDevNone')} style={styles.noneText} />
      </View>
    );
  };

  const renderItem = ({ item }) => {
    const { iconUrl, icon, name, devId, roomId, isOnline } = item;
    const roomName = getRoomName(roomId);
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => gotoNextPage(devId)}
        style={[styles.itemContainer, { justifyContent: 'space-between' }]}
      >
        <View style={[styles.itemContainer, { width: width - 100 }]}>
          <Image source={{ uri: iconUrl || icon }} style={styles.itemIcon} />
          <View style={styles.devInfoContainer}>
            <TYText text={name} style={styles.itemText} numberOfLines={1} />
            <View style={styles.statusContainer}>
              {!!roomName && (
                <TYText
                  text={roomName}
                  style={[
                    styles.alarmItemText,
                    { fontSize: cx(12), color: '#dbdbdb', marginRight: cx(8) },
                  ]}
                />
              )}
              {!isOnline && (
                <View style={styles.offlineWrap}>
                  <TYText text={Strings.getLang('deviceOffline')} style={styles.offlineText} />
                </View>
              )}
            </View>
          </View>
        </View>
        <Image source={Res.arrow} resizeMode="center" style={styles.itemArrow} />
      </TouchableOpacity>
    );
  };

  const renderToast = () => {
    return (
      <Toast
        text={Strings.getLang('isNotAdmin')}
        show={isShowToast}
        onFinish={() => setIsShowToast(false)}
      />
    );
  };
  return (
    <View style={styles.container}>
      {showTitle && (
        <TYText text={Strings.formatValue('subDevTitle')} style={styles.title} numberOfLines={1} />
      )}

      {dataSource.length ? (
        <FlatList
          data={dataSource}
          style={{ flex: 1 }}
          contentContainerStyle={styles.mainContainer}
          renderItem={renderItem}
        />
      ) : (
        renderNone()
      )}

      {showAddBtn && (
        <TouchableOpacity style={styles.btnContainer} activeOpacity={0.9} onPress={gotoDms}>
          <View style={[styles.addBtn, { backgroundColor: themeColor }]}>
            <IconFont name="plus" color="#FFF" />
          </View>
          <TYText
            text={Strings.getLang('addSubDev')}
            style={[styles.btnText, { color: themeColor }]}
          />
        </TouchableOpacity>
      )}
      {renderToast()}
    </View>
  );
};

SubList.defaultProps = {
  isAdmin: false,
  showTitle: true,
  showAddBtn: true,
  themeColor: '#FF4800',
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: isIphoneX ? cx(12) : 0,
  },
  title: {
    color: '#81828B',
    fontSize: cy(13),
    marginLeft: 16,
    marginTop: cy(18),
    marginBottom: cy(12),
  },
  mainContainer: {
    // flex: 1,
    backgroundColor: 'white',
  },
  itemContainer: {
    height: 60,
    flexDirection: 'row',
    marginLeft: 10,
    alignItems: 'center',
  },
  itemIcon: {
    width: 48,
    height: 48,
  },
  itemArrow: {
    width: 40,
    height: 60,
  },
  itemText: {
    fontSize: 16,
    color: '#303030',
  },

  noneText: {
    fontSize: 14,
    color: '#999999',
    lineHeight: 18,
    marginTop: 4,
    textAlign: 'center',
  },
  btnContainer: {
    height: cx(57),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    flexDirection: 'row',
  },
  btnText: {
    fontSize: 16,
    marginLeft: 4,
  },
  devInfoContainer: {
    marginLeft: 10,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addBtn: {
    width: cx(20),
    height: cx(20),
    marginRight: cx(4),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: cx(10),
  },
  alarmItemText: {
    fontSize: cx(17),
    color: '#333333',
    backgroundColor: 'transparent',
    marginTop: cy(8),
  },
  offlineText: {
    fontSize: cx(12),
    color: '#fff',
    backgroundColor: 'transparent',
  },
  offlineWrap: {
    backgroundColor: '#51525c',
    borderRadius: cx(4),
    paddingHorizontal: cx(2),
    paddingVertical: cx(1),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: cy(8),
  },
});

export default SubList;
