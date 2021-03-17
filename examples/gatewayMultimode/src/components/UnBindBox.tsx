import React, { FC } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button, Utils } from 'tuya-panel-kit';
import Strings from '@i18n';

interface MainProps {
  onConfirm: () => void;
  onCancel: () => void;
}
const { convertX: cx } = Utils.RatioUtils;

const UnBindBox: FC<MainProps> = props => {
  const { onConfirm, onCancel } = props;
  return (
    <View style={styles.container}>
      <View style={{ paddingTop: cx(12) }}>
        <Text style={styles.title}>{Strings.getLang('doConfirm')}</Text>
        <Text style={styles.text}>{Strings.getLang('unbindDesc')}</Text>
      </View>
      <View>
        <Button
          text={Strings.getLang('unBind')}
          style={[styles.btn, { backgroundColor: '#3566FF' }]}
          onPress={onConfirm}
          textStyle={[styles.btnText, { color: '#FFF' }]}
        />
        <Button
          text={Strings.getLang('cancel')}
          style={styles.btn}
          onPress={onCancel}
          textStyle={styles.btnText}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: cx(327),
    height: cx(330),
    alignSelf: 'center',
    paddingHorizontal: cx(18),
    paddingVertical: cx(20),
    justifyContent: 'space-between',
    borderRadius: cx(16),
    backgroundColor: '#FFF',
  },
  title: {
    fontSize: 21,
    marginBottom: cx(4),
    fontWeight: 'bold',
    color: '#22242C',
    lineHeight: cx(29),
  },
  text: {
    fontSize: 14,
    color: '#A2A3AA',
    lineHeight: cx(20),
  },
  btn: {
    width: cx(290),
    height: cx(47),
    borderRadius: cx(23.5),
    borderWidth: 1,
    marginTop: cx(10),
    borderColor: '#3566FF',
  },
  btnText: {
    fontSize: 16,
    lineHeight: cx(22),
    color: '#3566FF',
  },
});

export default UnBindBox;
