import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, Image } from 'react-native';
import { TYText } from 'tuya-panel-kit';
import Strings from '../../../i18n';
import Res from '../../../res';
import Config from '../../../config';

const { cx, cy } = Config;

class NoMessage extends React.Component {
  static propTypes = {
    tabContentHeight: PropTypes.number.isRequired,
  };
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const { tabContentHeight } = this.props;
    return (
      <View style={[styles.noMessagePage, { height: tabContentHeight }]}>
        <Image source={Res.notify.noNewsImg} style={styles.noDataImg} />
        <View style={styles.tipBox}>
          <TYText numberOfLines={1} style={styles.tipText}>
            {Strings.getLang('ipc_message_none')}
          </TYText>
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  noMessagePage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataImg: {
    width: cx(55),
    resizeMode: 'contain',
    marginBottom: cy(15),
  },
  tipBox: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipText: {
    color: '#999999',
  },
});
export default NoMessage;
