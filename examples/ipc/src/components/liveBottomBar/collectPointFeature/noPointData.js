import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { TYText, TYSdk } from 'tuya-panel-kit';
import Strings from '../../../i18n';
import Config from '../../../config';

const { cx, isIphoneX } = Config;

class NoPointData extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  setCollectPoint = () => {
    const TYNavigator = TYSdk.Navigator;
    TYNavigator.pop();
  };
  render() {
    return (
      <View style={styles.noPointPage}>
        <TYText style={styles.tipText} numberOfLines={1}>
          {Strings.getLang('ipc_live_pag_memory_point_no_data')}
        </TYText>
        <TouchableOpacity onPress={this.setCollectPoint} activeOpacity={0.8}>
          <TYText style={styles.goLink} numberOfLines={1}>
            {Strings.getLang('ipc_live_pag_memory_point_no_gonow')}
          </TYText>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  noPointPage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: isIphoneX ? 20 : 0,
  },
  tipText: {
    fontWeight: '500',
    fontSize: cx(14),
    marginBottom: 12,
  },
  goLink: {
    fontSize: cx(14),
    textDecorationLine: 'underline',
    fontWeight: '500',
    color: '#428df0',
  },
});

export default NoPointData;
