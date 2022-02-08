import React from 'react';
import _ from 'lodash';
import { View, Image, Text, StyleSheet } from 'react-native';
import { Utils } from 'tuya-panel-kit';
import Strings from '@i18n';
import { useGetState } from '@hooks';
import Res from '@res';
import { dpCodes } from '@config';

const { convertX: cx, convertY: cy } = Utils.RatioUtils;
const { armingSwitch } = dpCodes;

const HomeTopView = () => {
  const { themeColor, dpState, existDps } = useGetState();
  const { dpArmingSwitch } = existDps;

  return (
    <View style={styles.container}>
      {dpArmingSwitch && dpState[armingSwitch] ? (
        <View style={[styles.centerWrap, { backgroundColor: themeColor }]}>
          <Image source={Res.save} style={styles.image} />
          <Text style={styles.centerText}>{Strings.getLang('home_alarmMode')}</Text>
        </View>
      ) : null}
    </View>
  );
};

export default HomeTopView;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  centerWrap: {
    maxWidth: cx(200),
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingLeft: cx(4),
    paddingRight: cx(8),
    borderRadius: 4,
    height: cx(28),
  },
  centerText: {
    color: '#fff',
    fontSize: cx(12),
    marginLeft: 2,
  },
  image: {
    width: cy(16),
    height: cy(16),
  },
});
