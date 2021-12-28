import _ from 'lodash';
import React, { FC } from 'react';
import { useDispatch } from 'react-redux';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Utils, TYText, TYSdk, Dialog } from 'tuya-panel-kit';
import Strings from '@i18n';
import Res from '@res';
import { actions } from '@models';
import { alertDialog } from '@utils';

const { convertX: cx, convertY: cy } = Utils.RatioUtils;

interface ISwitchProps {
  code: string;
  value: boolean;
  name: string;
}

const SwitchItem: FC<ISwitchProps> = ({ code, value, name }) => {
  const dispatch = useDispatch();

  const handlePress = () => {
    TYSdk.device.putDeviceData({ [code]: !value });
  };

  const handleLongPress = () => {
    TYSdk.mobile.showEditDialog(
      Strings.getLang('edit'),
      name,
      async (val: string) => {
        const names = val.trim();
        const newName = val.trim().substr(0, 10);
        if (newName) {
          if (names.length > 10) {
            alertDialog(Strings.getLang('nameOverLong'));
          } else {
            await dispatch(actions.async.upDateSwitchName(code, newName));
            dispatch(actions.async.getSwitchList());
          }
          return;
        }
        alertDialog(Strings.getLang('emptyTip'));
      },
      () => ({})
    );
  };
  return (
    <View style={styles.itemContent}>
      <TouchableOpacity
        style={styles.switch}
        activeOpacity={0.8}
        onPress={() => handlePress()}
        onLongPress={handleLongPress}
      >
        <Image style={styles.image} source={value ? Res.switchOn : Res.switchOff} />
        <TYText text={name} style={[styles.text, { color: '#626982' }]} numberOfLines={1} />
      </TouchableOpacity>
    </View>
  );
};
const styles = StyleSheet.create({
  switch: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: cx(120),
    height: cx(220),
  },
  text: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: cy(40),
    backgroundColor: 'transparent',
    fontSize: cx(12),
    textAlign: 'center',
    color: '#fff',
  },
  itemContent: {
    alignItems: 'center',
  },
});

export default SwitchItem;
