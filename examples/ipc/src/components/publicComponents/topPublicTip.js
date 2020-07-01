/* eslint-disable max-len */
import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet } from 'react-native';
import { TYText } from 'tuya-panel-kit';
import Config from '../../config';

const { cx, cy } = Config;

class TopPublicTip extends React.Component {
  static propTypes = {
    tipText: PropTypes.string.isRequired,
    isFullScreen: PropTypes.bool.isRequired,
    playerWidth: PropTypes.number.isRequired,
  };
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const { tipText, isFullScreen, playerWidth } = this.props;
    return (
      <View
        style={[isFullScreen ? styles.topFullPage : styles.topNormalPage, { width: playerWidth }]}
      >
        <View style={styles.tipBox}>
          <TYText numberOfLines={1} style={styles.textTip}>
            {tipText}
          </TYText>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  topFullPage: {
    height: cy(30),
    position: 'absolute',
    top: cy(40),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  topNormalPage: {
    height: cy(30),
    position: 'absolute',
    top: cy(40),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  tipBox: {
    borderRadius: Math.ceil(cx(14)),
    paddingHorizontal: cx(10),
    paddingVertical: cx(4),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  textTip: {
    color: '#fff',
    fontSize: cx(14),
  },
});

export default TopPublicTip;
