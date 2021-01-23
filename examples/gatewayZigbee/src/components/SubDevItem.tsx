import React, { FC, useCallback } from 'react';
import { StyleSheet, Image, View, TouchableOpacity } from 'react-native';
import { Utils, TYText, TYSdk } from 'tuya-panel-kit';
import Strings from '../i18n';
import Res from '../res';

const { convertX: cx, convertY: cy } = Utils.RatioUtils;

interface DevInfo {
  iconUrl: string;
  icon: string;
  isOnline: boolean;
  name: string;
  roomId: number;
  devId: string;
}

interface MainProps {
  devInfo: {
    item: DevInfo;
  };
  roomInfo: {
    [roomId: number]: string;
  };
}

const SubDevItem: FC<MainProps> = ({ devInfo, roomInfo }) => {
  const { iconUrl, icon, roomId, isOnline, name = '', devId } = devInfo.item;

  const gotoSubDevDetail = useCallback(
    id => {
      TYSdk.native.pushToNextPageWithDeviceId(id);
    },
    [devId]
  );
  const getRoomName = (id: number) => {
    if (id === 0) {
      return '';
    }
    return roomInfo[id];
  };
  const roomName = getRoomName(roomId);
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => gotoSubDevDetail(devId)}
      style={styles.itemMain}
    >
      <View style={styles.itemContainer}>
        <Image source={{ uri: iconUrl || icon }} style={styles.itemIcon} />
        <View style={styles.devInfoContainer}>
          <TYText style={styles.itemText} numberOfLines={1}>
            {name}
          </TYText>
          <View style={styles.statusContainer}>
            {!!roomName && (
              <TYText
                style={[
                  styles.alarmItemText,
                  { fontSize: cx(12), color: '#ccc', marginRight: cx(8) },
                ]}
              >
                {roomName}
              </TYText>
            )}
            {!isOnline && (
              <View style={styles.offlineWrap}>
                <TYText style={styles.offlineText}>{Strings.getLang('deviceOffline')}</TYText>
              </View>
            )}
          </View>
        </View>
      </View>
      <Image source={Res.arrow} resizeMode="center" style={styles.itemArrow} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  itemMain: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: cx(10),
    alignItems: 'center',
  },
  itemContainer: {
    height: cx(60),
    flexDirection: 'row',
    alignItems: 'center',
  },

  itemIcon: {
    width: cx(48),
    height: cx(48),
    resizeMode: 'contain',
  },

  itemArrow: {
    width: cx(20),
    height: cx(40),
  },

  itemText: {
    fontSize: cx(15),
    color: '#303030',
  },

  devInfoContainer: {
    marginLeft: cx(10),
  },

  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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

export default SubDevItem;
