/* eslint-disable max-len */
import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { TYText, IconFont } from 'tuya-panel-kit';
import Config from '../../config';
import icon from '../../res/iconfont.json';

const { cx, cy } = Config;

class MobileNetTip extends React.Component {
  static propTypes = {
    tipText: PropTypes.string.isRequired,
    isFullScreen: PropTypes.bool.isRequired,
    playerWidth: PropTypes.number.isRequired,
    closeMobileTip: PropTypes.func.isRequired,
  };
  constructor(props) {
    super(props);
    this.state = {};
  }
  closeTip = () => {
    this.props.closeMobileTip();
  };
  render() {
    const { tipText, isFullScreen, playerWidth } = this.props;
    return (
      <View
        style={[
          isFullScreen ? styles.tipFullPage : styles.tipNormalPage,
          { width: isFullScreen ? 460 : playerWidth },
        ]}
      >
        <View style={styles.tipBox}>
          <TYText style={styles.textTip}>{tipText}</TYText>
          <TouchableOpacity style={styles.closeTipBox} activeOpacity={0.7} onPress={this.closeTip}>
            <IconFont d={icon.close} size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  tipFullPage: {
    height: cy(30),
    position: 'absolute',
    bottom: cy(15),
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  tipNormalPage: {
    position: 'absolute',
    bottom: cy(5),
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  closeTipBox: {
    position: 'absolute',
    right: cx(8),
    top: 3,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipBox: {
    borderRadius: Math.ceil(cx(6)),
    paddingHorizontal: cx(8),
    paddingVertical: cx(4),
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  textTip: {
    color: '#fff',
    fontSize: 14,
  },
});

export default MobileNetTip;
