import React, { FC } from 'react';
import { View, StyleSheet } from 'react-native';
import { Utils, Button } from 'tuya-panel-kit';
import _ from 'lodash';
import Strings from '@i18n';
import Res from '@res';
import { jumpToPage } from '@utils';

const { convertX: cx } = Utils.RatioUtils;

const data = [
  {
    icon: Res.setNickname,
    text: 'setNickname',
    route: 'setNickname',
  },
  {
    icon: Res.shortcut,
    text: 'shortcut',
    route: 'shortcut',
  },
];

const MoreFunction: FC = () => {
  const onPress = item => {
    jumpToPage(item.route);
  };

  const renderContent = () => {
    return (
      <View style={styles.container}>
        <View style={styles.row}>
          {data.map(d => (
            <Button
              image={d.icon}
              wrapperStyle={{ width: '33.3%' }}
              text={Strings.getLang(d.text as any)}
              size={cx(52)}
              textStyle={styles.btnText}
              key={d.text}
              onPress={() => onPress(d)}
            />
          ))}
        </View>
      </View>
    );
  };

  return <View style={styles.container}>{renderContent()}</View>;
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    marginTop: cx(20),
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  btnText: {
    fontSize: cx(12),
    color: '#333',
    lineHeight: cx(17),
  },
});
export default MoreFunction;
