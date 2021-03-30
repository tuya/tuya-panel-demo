import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Utils, TYText, TYSdk } from 'tuya-panel-kit';
import Res from '../../res';
import codes from '../../config/dpCodes';
import { getTxt, GetTxt } from '../../utils';
import { useSelector, DpState } from '../../models';

const { convertX: cx } = Utils.RatioUtils;
const { batteryPercentage } = codes;

const ElePart: React.FC = () => {
  const { dpState }: DpState = useSelector(state => state);
  const batteryExist = TYSdk.device.checkDpExist(batteryPercentage);
  const battery = dpState[batteryPercentage];
  const { max = 100, min = 0 } = batteryExist
    ? TYSdk.device.getDpSchema('battery_percentage')
    : { max: 100, min: 0 };
  const WIDTH = (cx(18) * battery) / (max - min);
  const { eleTxt, color }: GetTxt = getTxt(battery);
  return batteryExist ? (
    <View style={styles.root}>
      <View style={styles.eleBgContent}>
        <Image source={Res.eleBg} style={[styles.eleBg, { tintColor: color }]} />
        <View
          style={[
            styles.viewContent,
            {
              width: WIDTH > 0 && WIDTH < 1 ? 1 : WIDTH,
              backgroundColor: color,
            },
          ]}
        />
      </View>
      <TYText style={styles.eleTxt}>{eleTxt}</TYText>
    </View>
  ) : (
    <View style={styles.empty} />
  );
};

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: cx(65),
  },
  empty: {
    width: cx(120),
    height: cx(13),
    marginBottom: cx(70),
  },
  eleBgContent: {
    width: cx(24),
    height: cx(13),
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: cx(2),
    marginRight: cx(6),
  },
  eleBg: {
    width: cx(24),
    height: cx(13),
    position: 'absolute',
  },
  viewContent: {
    height: cx(9),
  },
  eleTxt: {
    backgroundColor: 'transparent',
    color: '#737373',
    fontSize: cx(12),
    fontWeight: 'bold',
  },
});

export default ElePart;
