import React, { FC } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { TYText } from 'tuya-panel-kit';
import Strings from '@i18n';
import Res from '@res';

const Empty: FC = () => {
  return (
    <View style={styles.container}>
      <Image source={Res.empty} />
      <TYText text={Strings.getLang('empty')} style={styles.textEmpty} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textEmpty: {
    marginTop: 30,
    color: 'rgba(0,0,0,.25)',
  },
});
export default Empty;
