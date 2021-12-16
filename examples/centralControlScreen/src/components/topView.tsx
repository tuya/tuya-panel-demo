import React, { FC } from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';
import { Utils, TYText, TYSdk } from 'tuya-panel-kit';
import _ from 'lodash';
import Strings from '@i18n';
import Res from '@res';

const { convertY: cy, width } = Utils.RatioUtils;

interface ITopViewProps {
  onlineDeviceNum: number;
}

const TopView: FC<ITopViewProps> = ({ onlineDeviceNum }) => {
  return (
    <ImageBackground source={Res.bg} style={styles.container}>
      <View>
        <TYText text={TYSdk.devInfo.name} style={styles.title} numberOfLines={1} />
        <TYText
          text={Strings.formatValue('subtitle', onlineDeviceNum.toString())}
          style={styles.subtitle}
        />
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    width,
    height: cy(250),
    justifyContent: 'flex-end',
  },
  title: {
    color: '#FFFFFF',
    fontSize: cy(28),
    marginLeft: 18,
    marginRight: 8,
    fontWeight: '500',
    backgroundColor: 'transparent',
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: cy(13),
    marginTop: cy(38),
    marginBottom: cy(14),
    marginHorizontal: 20,
    fontWeight: '500',
    backgroundColor: 'transparent',
  },
});

export default TopView;
