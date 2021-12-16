import React, { FC } from 'react';
import { View, StyleSheet } from 'react-native';
import { Utils, TYText } from 'tuya-panel-kit';
import Strings from '@i18n';

const { convertX: cx } = Utils.RatioUtils;

const shortcutList = [
  Strings.getLang('shortcutCommand1'),
  Strings.getLang('shortcutCommand2'),
  Strings.getLang('shortcutCommand3'),
  Strings.getLang('shortcutCommand4'),
];
const Shortcut: FC = () => {
  return (
    <View style={styles.container}>
      <View style={{ marginBottom: cx(12) }}>
        <TYText text={Strings.getLang('shortcutTip')} size={cx(20)} color="#000" />
      </View>
      <View style={{ marginBottom: cx(24) }}>
        <TYText text={Strings.getLang('shortcutTip1')} size={cx(12)} color="#666" />
      </View>
      <View style={styles.commandContainer}>
        {shortcutList.map(d => (
          <TYText text={d} key={d} style={styles.commandText} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: cx(24),
    paddingTop: cx(30),
  },
  commandContainer: {
    paddingHorizontal: cx(10),
  },
  commandText: {
    marginBottom: cx(20),
    fontSize: cx(16),
    color: '#333',
  },
});

export default Shortcut;
