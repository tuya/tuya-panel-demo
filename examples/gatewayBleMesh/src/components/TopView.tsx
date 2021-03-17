/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { FC, useCallback } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { Utils, TopBar, TYSdk, TYText, DevInfo } from 'tuya-panel-kit';
import Strings from '../i18n';

interface subDevItem {
  isOnline: boolean;
}

interface MainProps {
  devInfo: DevInfo;
  devList: subDevItem[];
}

const { convertY: cy, width } = Utils.RatioUtils;
const isIos = Platform.OS === 'ios';
const backIcon = isIos ? 'backIos' : 'backAndroid';

const TopView: FC<MainProps> = ({ devInfo, devList }) => {
  const back = useCallback(() => TYSdk.native.back(), []);
  const showDeviceMenu = useCallback(() => TYSdk.native.showDeviceMenu(), []);
  const title = devInfo.name;
  const onlineDevNum = devList.filter(({ isOnline }) => isOnline);
  return (
    <View style={styles.container}>
      <TopBar
        style={{ backgroundColor: 'transparent' }}
        leftActions={[
          {
            name: backIcon,
            color: '#FFF',
            onPress: back,
          },
        ]}
        actions={[
          {
            // @ts-ignore
            name: 'pen',
            color: '#FFF',
            onPress: showDeviceMenu,
          },
        ]}
      />
      <View>
        <TYText style={[styles.title]} numberOfLines={1}>
          {title}
        </TYText>
        <TYText style={styles.subtitle}>
          {`${Strings.getLang('onlineDevNum')}: ${onlineDevNum.length}`}
        </TYText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width,
    height: cy(200),
    justifyContent: 'space-between',
  },

  title: {
    color: '#FFFFFF',
    fontSize: cy(22),
    marginLeft: 18,
    marginRight: 8,
    fontWeight: isIos ? '500' : 'bold',
    backgroundColor: 'transparent',
  },

  subtitle: {
    color: '#FFFFFF',
    fontSize: cy(12),
    marginTop: cy(12),
    marginBottom: cy(14),
    marginHorizontal: 20,
    fontWeight: isIos ? '500' : 'bold',
    backgroundColor: 'transparent',
  },
});

export default TopView;
