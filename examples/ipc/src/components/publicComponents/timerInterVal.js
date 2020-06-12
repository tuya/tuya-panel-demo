/* eslint-disable radix */
import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet } from 'react-native';
import { TYText } from 'tuya-panel-kit';
import Config from '../../config';

const { cx, cy, is7Plus } = Config;

let recordTime = 0;
/*
 *录像时间状态组件
 */
class TimerInterval extends React.Component {
  static propTypes = {
    isFullScreen: PropTypes.bool.isRequired,
    panelItemActiveColor: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      number: '00:00',
    };
  }
  componentDidMount() {
    this.timer = setInterval(() => {
      recordTime++;
      this.setState({ number: this.getTime() });
    }, 1000);
  }
  componentWillUnmount() {
    this.timer && clearTimeout(this.timer);
    recordTime = 0;
  }

  getTime = () => {
    let recordNumber;
    const hour = parseInt(recordTime / 3600);
    const min = parseInt((recordTime % 3600) / 60);
    const sec = parseInt((recordTime % 3600) % 60);
    if (hour === 0) {
      recordNumber = '';
    } else if (hour < 10) {
      recordNumber = '0';
      recordNumber += `${hour}:`;
    } else {
      recordNumber += `${hour}:`;
    }
    if (min < 10) {
      recordNumber += '0';
    }
    recordNumber += `${min}:`;
    if (sec < 10) {
      recordNumber += '0';
    }
    recordNumber += sec;
    return recordNumber;
  };
  render() {
    const { isFullScreen, panelItemActiveColor } = this.props;
    return (
      <View style={isFullScreen ? styles.timerPageFull : styles.timerPageNormal}>
        <View style={styles.timerContain}>
          <View style={[styles.dot, { backgroundColor: panelItemActiveColor }]} />
          <TYText numberOfLines={1} style={styles.text}>
            {this.state.number}
          </TYText>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  timerPageFull: {
    position: 'absolute',
    top: 0,
    height: cy(50),
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerPageNormal: {
    position: 'absolute',
    top: 0,
    height: is7Plus ? cy(45) : cy(60),
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerContain: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: cy(24),
    borderRadius: Math.ceil(cx(12)),
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingRight: cx(10),
  },
  dot: {
    width: cx(6),
    height: cy(6),
    borderRadius: Math.ceil(cx(3)),
    marginLeft: cx(10),
    marginRight: cx(5),
  },
  text: {
    fontSize: cx(14),
    color: 'rgb(255,255,255)',
  },
});

export default TimerInterval;
