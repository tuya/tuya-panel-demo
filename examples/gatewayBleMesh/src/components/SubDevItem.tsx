import React, { FC, useCallback } from 'react';
import { StyleSheet, Image, View, TouchableOpacity } from 'react-native';
import { Utils, TYText, TYSdk, Swipeout } from 'tuya-panel-kit';
import Strings from '../i18n';
import Res from '../res';
import { theme } from '../config';
import { SubDevInfo } from '../config/fetchDataInterface';
import { getOnlineState } from '../utils';

const { convertX: cx, convertY: cy } = Utils.RatioUtils;

interface MainProps {
  data: {
    item: SubDevInfo;
  };
  roomInfo: {
    [roomId: number]: string;
  };
  onPress?: () => void;
  id?: string;
  selected?: boolean;
  deleteHandle?: () => void;
}

const SubDevItem: FC<MainProps> = ({
  data,
  roomInfo,
  id: routerId = 'main',
  onPress = null,
  selected = false,
  deleteHandle = null,
}) => {
  const { iconUrl, roomId, isOnline, name = '', devId, pcc = '' } = data.item;
  const online = getOnlineState(pcc) || isOnline;

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
  const onPressHandle = () => {
    if (onPress) {
      onPress();
    } else {
      gotoSubDevDetail(devId);
    }
  };

  const renderCheckBox = () => (
    <View
      style={[
        styles.checkBox,
        {
          borderColor: selected ? theme.themeColor : '#ccc',
          backgroundColor: selected ? theme.themeColor : 'transparent',
        },
      ]}
    >
      {selected && <Image source={Res.selected} style={styles.selectIcon} />}
    </View>
  );

  const renderContent = () => (
    <TouchableOpacity activeOpacity={0.7} onPress={onPressHandle} style={styles.itemMain}>
      <View style={styles.itemContainer}>
        <Image source={{ uri: iconUrl }} style={styles.itemIcon} />
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
            {!online && (
              <View style={styles.offlineWrap}>
                <TYText style={styles.offlineText}>{Strings.getLang('deviceOffline')}</TYText>
              </View>
            )}
          </View>
        </View>
      </View>
      {routerId === 'addList' && renderCheckBox()}
      {routerId === 'main' && (
        <Image source={Res.arrow} resizeMode="center" style={styles.itemArrow} />
      )}
    </TouchableOpacity>
  );
  if (!deleteHandle) {
    return renderContent();
  }
  return (
    <Swipeout
      autoClose={true}
      backgroundColor="#FFF"
      right={[
        {
          text: Strings.getLang('delete'),
          onPress: deleteHandle,
          type: 'delete',
          textStyle: { color: '#fff', fontSize: cx(14) },
        },
      ]}
      buttonWidth={cx(80)}
    >
      {renderContent()}
    </Swipeout>
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
    height: cx(80),
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

  checkBox: {
    width: cx(22),
    height: cx(22),
    borderRadius: cx(11),
    borderWidth: 1,
    backgroundColor: theme.themeColor,
    justifyContent: 'center',
    alignItems: 'center',
  },

  selectIcon: {
    width: cx(11),
    height: cx(11),
    resizeMode: 'contain',
    tintColor: 'white',
  },
});

export default SubDevItem;
