import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { Utils } from 'tuya-panel-kit';
import Strings from '../../i18n';
import dpCodes from '../../config/dpCodes';

const {
  convertX: cx,
  // convertY: cy,
} = Utils.RatioUtils;

const { switch: powerCode, speed: speedCode, countdownLeft: countdownLeftCode } = dpCodes;

class HomeTipView extends Component {
  static propTypes = {
    power: PropTypes.bool,
    speed: PropTypes.string,
    countdownLeft: PropTypes.number,
  };

  static defaultProps = {
    power: false,
    speed: '1',
    countdownLeft: 0,
  };

  componentDidMount() {
    // if (countdownLeftCode) {
    //   TYSdk.native.getDpDataFromDevice(countdownLeftCode);
    // }
  }

  formatCountdown(countdownLeft) {
    const [h, m] = Utils.TimeUtils.parseSecond(countdownLeft * 60 + 30).map(v => +v);
    return Strings.formatValue('countdownTip', h, m);
  }

  render() {
    const { power, speed, countdownLeft } = this.props;
    return (
      <View style={[styles.container, { opacity: power ? 1 : 0 }]}>
        <Text accessibilityLabel="HomeScene_TipView_Speed" style={styles.text}>
          {speedCode && Strings.formatValue('speedTip', Strings.getDpLang(speedCode, speed))}
        </Text>
        <Text
          accessibilityLabel="HomeScene_TipView_Countdown"
          style={[
            styles.text,
            styles.text__dimmed,
            { color: 'rgba(255,255,255,0.6)', opacity: countdownLeft ? 1 : 0 },
          ]}
        >
          {countdownLeftCode && this.formatCountdown(countdownLeft)}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },

  text: {
    fontSize: Math.max(12, cx(12)),
    color: '#fff',
  },

  text__dimmed: {
    fontSize: Math.round(Math.max(10, cx(10))),
    lineHeight: Math.round(Math.max(18, cx(18))),
  },
});

export default connect(({ dpState }) => ({
  power: dpState[powerCode],
  speed: dpState[speedCode],
  countdownLeft: dpState[countdownLeftCode],
}))(HomeTipView);
