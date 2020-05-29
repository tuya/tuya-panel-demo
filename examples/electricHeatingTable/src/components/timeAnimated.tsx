import _ from 'lodash';
import React, { Component } from 'react';
import { View, Animated } from 'react-native';
import { TYText } from 'tuya-panel-kit';
import { cx, i18n, createAnimation } from '../utils';
import imgs from '../res';
import styles from '../config/styles';

interface ContentProps {
  showTimeAnimated: object;
}

export default class TimeAnimated extends Component<ContentProps> {
  spinValue = new Animated.Value(0);
  times: number = 0;
  state = {
    timeText: i18n('time'),
    rightImageOpacity: new Animated.Value(0),
    timeImageOpacity: new Animated.Value(1),
  };
  componentWillReceiveProps = (nextProps: ContentProps) => {
    if (nextProps.showTimeAnimated !== this.props.showTimeAnimated) {
      this.times = 0;
      this.spinValue.setValue(0);
      this._setTimeAnimated(0, 1);
    }
  };
  _setTimeAnimated = (setValue?: number, endValue?: number) => {
    const { rightImageOpacity, timeImageOpacity } = this.state;
    if (this.times < 1) {
      this.times = this.times + 1;
      this.spinValue.setValue(setValue!);
      Animated.parallel([createAnimation(this.spinValue, endValue!, 400)]).start(() =>
        this._setTimeAnimated()
      );
      this.setState({ timeText: i18n('calibration') });
    } else if (this.times === 1) {
      this.times = this.times + 1;
      Animated.parallel([
        createAnimation(rightImageOpacity, 1, 400),
        createAnimation(timeImageOpacity, 0, 400),
      ]).start(() => this._setTimeAnimated());
      this.setState({ timeText: i18n('cal_complete') });
    } else if (this.times === 2) {
      this.times = this.times + 1;
      Animated.parallel([
        createAnimation(rightImageOpacity, 0, 400, 800),
        createAnimation(timeImageOpacity, 1, 400, 800),
      ]).start(() => {
        this._setTimeAnimated();
      });
    } else if (this.times === 3) {
      this.setState({ timeText: i18n('time') });
    }
  };
  render() {
    const { timeImageOpacity, rightImageOpacity, timeText } = this.state;
    const spin = this.spinValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });
    return (
      <View style={[styles.contentBox, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
        <View style={styles.countdownTextBox}>
          <Animated.Image
            source={imgs.timeCenter}
            style={[styles.rightImg, { opacity: timeImageOpacity }]}
            resizeMode="stretch"
          />
        </View>
        <Animated.Image
          source={imgs.time}
          style={[
            styles.timeImg,
            {
              tintColor: '#fff',
              position: 'absolute',
              top: cx(22),
              opacity: timeImageOpacity,
            },
            { transform: [{ rotate: spin }] },
          ]}
          resizeMode="stretch"
        />
        <Animated.Image
          source={imgs.right}
          style={[
            {
              tintColor: '#fff',
              position: 'absolute',
              top: cx(22),
              opacity: rightImageOpacity,
            },
          ]}
          resizeMode="stretch"
        />
        <TYText style={styles.whiteText}>{timeText}</TYText>
      </View>
    );
  }
}
