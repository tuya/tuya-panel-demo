import React, { FC, useState, useEffect } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Utils, TYSdk, TopBar, IconFont, TYText, DeprecatedNavigatorRoute } from 'tuya-panel-kit';
import { getDeviceLists, getSceneLists } from '@api';
import { jumpToPage, back } from '@utils';
import { IDevItemFromApp } from '@interface';
import Strings from '@i18n';

const { convertX: cx } = Utils.RatioUtils;
const background = '#FFF';
interface IControlDevProps extends DeprecatedNavigatorRoute {
  type?: string;
}

const ChooseDevice: FC<IControlDevProps> = ({ type }) => {
  const [deviceInfo, setDeviceInfo] = useState<Array<IDevItemFromApp>>([]);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      // TYSdk.mobile.showLoading();
      const [newDeviceInfo, sceneList] = await Promise.all([getDeviceLists(), getSceneLists()]);
      // TYSdk.mobile.hideLoading();
      const needKey = Object.keys(sceneList.exts);
      needKey.forEach(item => {
        const index = newDeviceInfo.findIndex(element => element.devId === item);
        if (index !== -1) {
          newDeviceInfo.splice(index, 1);
        }
      });
      setDeviceInfo(newDeviceInfo.filter(res => res.category !== 'dgnzk'));
    } catch (err) {
      console.log(err);
      // TYSdk.mobile.hideLoading();
    }
  };

  const renderItem = data => {
    return data.map(item => (
      <TouchableOpacity
        key={item.devId}
        onPress={() => {
          jumpToPage('chooseDeviceDp', {
            devId: item.devId,
            devName: item.name,
          });
        }}
      >
        <View style={styles.timeItem}>
          <Image source={{ uri: item.iconUrl || '' }} style={styles.timeItemImage} />
          <TYText style={styles.timeText}>{item.name}</TYText>
          <IconFont color="#C2C4CA" size={cx(10)} name="arrow" />
        </View>
      </TouchableOpacity>
    ));
  };

  const renderTopBar = () => {
    return (
      <TopBar title={Strings.getLang('action_device')} background="transparent" onBack={back} />
    );
  };

  return (
    <View style={styles.container}>
      {renderTopBar()}
      <ScrollView style={{ backgroundColor: background }}>
        <TYText text={Strings.getLang('useDevice')} style={[styles.timeText, styles.pageTitle]} />
        <View style={styles.center}>{renderItem(deviceInfo)}</View>
      </ScrollView>
    </View>
  );
};

ChooseDevice.defaultProps = {
  type: 'act',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pageTitle: {
    fontWeight: 'bold',
    marginBottom: cx(5),
    marginTop: cx(18),
    marginLeft: cx(16),
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: cx(17),
    marginHorizontal: cx(16),
  },
  timeItemImage: {
    width: cx(32),
    height: cx(32),
    resizeMode: 'contain',
    marginRight: cx(20),
  },
  timeText: {
    flex: 1,
    color: '#22242C',
    fontSize: cx(16),
    lineHeight: cx(22),
  },
  center: {
    flex: 1,
    backgroundColor: background,
  },
});

export default ChooseDevice;
