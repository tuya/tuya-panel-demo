import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { TYText, Utils } from 'tuya-panel-kit';
import _padStart from 'lodash/padStart';

const { convertX: cx } = Utils.RatioUtils;

export interface Props {
  style?: any;
  textColor?: string;
  label?: string;
  time: number; // 时间，单位分钟
}

interface IState {
  time: number;
}

export default class extends Component<Props, IState> {
  timer: number | null;
  constructor(props: Props) {
    super(props);
    this.state = { time: this.props.time };
  }
  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.time !== this.props.time) {
      this.setState({ time: nextProps.time });
      // this.stopAnimate();
      // this.startAnimate();
    }
  }
  componentDidMount() {
    // this.startAnimate();
  }
  componentWillUnmount() {
    // this.stopAnimate();
  }
  // stopAnimate() {
  //   this.timer && clearInterval(this.timer);
  //   this.timer = null;
  // }
  // startAnimate() {
  //   this.timer = setInterval(this.countdown, 60000);
  // }
  // countdown = () => {
  //   const { time } = this.state;
  //   if (time <= 1) {
  //     this.stopAnimate();
  //   }
  //   this.setState({ time: time - 1 });
  // };
  render() {
    const { label, style, textColor } = this.props;
    const { time } = this.state;
    const hour = Math.floor(time / 60);
    const minute = time % 60;
    return (
      <View style={[{ justifyContent: 'center', alignItems: 'center' }, style]}>
        <View style={styles.timeBox}>
          <TYText style={{ fontSize: cx(18), color: textColor, textAlign: 'center' }}>
            {_padStart(`${hour}`, 2, '0')}:{_padStart(`${minute}`, 2, '0')}
          </TYText>
        </View>
        <View style={styles.labelBox}>
          <TYText style={{ fontSize: 10, lineHeight: 14, color: textColor }}>{label}</TYText>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  timeBox: {
    height: cx(32),
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
});
