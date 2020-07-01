import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { TYText } from 'tuya-panel-kit';
import Config from '../../../config';
import Strings from '../../../i18n';
import Res from '../../../res';
import { gotoCameraMessageAll } from '../../../config/click';

const { cx, cy } = Config;

class NotifyTitle extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  enterNativeMessage = () => {
    gotoCameraMessageAll();
  };

  render() {
    return (
      <View style={styles.notifyTitlePage}>
        <TYText numberOfLines={1} style={styles.titleText}>
          {Strings.getLang('ipc_message_recent')}
        </TYText>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={this.enterNativeMessage}
          style={styles.allMesBox}
        >
          <Image source={Res.notify.notifyTitle} style={styles.titleImg} />
          <TYText numberOfLines={1} style={[styles.titleText, styles.titleMargin]}>
            {Strings.getLang('ipc_message_all')}
          </TYText>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  notifyTitlePage: {
    height: cy(30),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: cx(12),
  },
  allMesBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleImg: {
    width: cx(24),
    resizeMode: 'contain',
  },
  titleText: {
    fontSize: cx(15),
    fontWeight: '400',
  },
  titleMargin: {
    marginLeft: cx(3),
  },
});

export default NotifyTitle;
