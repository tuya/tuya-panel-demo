import _ from 'lodash';
import React, { Component } from 'react';
import { View, Animated } from 'react-native';
import { TYText, UnitText } from 'tuya-panel-kit';
import imgs from '../res';
import styles from '../config/styles';
import { cx, i18n, createAnimation } from '../utils';

interface ContentProps {
  ifHavecountdownLeft: boolean;
  countdownLeft?: number;
  countDownShow: boolean;
  duration?: number;
  countdownSet?: string;
}

export default class CountDownAnimated extends Component<ContentProps, any> {
  constructor(props: ContentProps) {
    super(props);
    this.state = {
      countdownText: new Animated.Value(
        props.countDownShow && props.ifHavecountdownLeft ? 0 : cx(68)
      ),
      countdownImage: new Animated.Value(
        props.countDownShow && props.ifHavecountdownLeft ? cx(-30) : 0
      ),
      countdownTextOpacity: new Animated.Value(
        props.countDownShow && props.ifHavecountdownLeft ? 1 : 0
      ),
      countdownImageOpacity: new Animated.Value(
        props.countDownShow && props.ifHavecountdownLeft ? 0 : 1
      ),
    };
  }
  componentWillReceiveProps = (nextProps: ContentProps) => {
    if (nextProps.countDownShow !== this.props.countDownShow) {
      nextProps.countDownShow && this._countdownShow(nextProps.countDownShow);
    }
  };
  _countdownShow = (ifShow: boolean) => {
    const {
      countdownText,
      countdownImage,
      countdownTextOpacity,
      countdownImageOpacity,
    } = this.state;
    const { duration } = this.props;
    Animated.parallel([
      createAnimation(countdownText, ifShow ? 0 : cx(68), duration),
      createAnimation(countdownImage, ifShow ? cx(-30) : 0, duration),
      createAnimation(countdownTextOpacity, ifShow ? 1 : 0, duration),
      createAnimation(countdownImageOpacity, ifShow ? 0 : 1, duration),
    ]).start();
  };

  render() {
    if (!Object.keys(this.state).includes('countdownImage')) return null;
    const { countdownLeft, ifHavecountdownLeft, countdownSet } = this.props;
    const {
      countdownImage,
      countdownText,
      countdownTextOpacity,
      countdownImageOpacity,
    } = this.state;
    return (
      <View
        style={[
          styles.contentBox,
          {
            backgroundColor:
              !!countdownLeft || countdownSet !== 'cancel'
                ? 'rgba(255,255,255,0.4)'
                : 'rgba(255,255,255,0.2)',
          },
        ]}
      >
        <View style={styles.countdownTextBox}>
          <Animated.Image
            source={imgs.countdown}
            resizeMode="stretch"
            style={[
              styles.countdownImg,
              {
                tintColor: '#fff',
                position: 'absolute',
                top: countdownImage,
                opacity: countdownImageOpacity,
              },
            ]}
          />
          {ifHavecountdownLeft && (
            <Animated.View
              style={[
                styles.countdownText,
                {
                  position: 'absolute',
                  top: countdownText,
                  opacity: countdownTextOpacity,
                },
              ]}
            >
              <UnitText
                value={`${parseInt(`${(countdownLeft as number) / 60}`, 10)}`.padStart(2, '0')}
                size={cx(17)}
                style={{ width: cx(20) }}
              />
              <TYText style={styles.textinCenter}>:</TYText>
              <UnitText
                value={`${(countdownLeft as number) % 60}`.padStart(2, '0')}
                size={cx(16)}
                style={{ width: cx(20) }}
              />
            </Animated.View>
          )}
        </View>
        <TYText style={styles.whiteText}>
          {ifHavecountdownLeft && countdownLeft !== 0 ? i18n('clickEnd') : i18n('countdown')}
        </TYText>
      </View>
    );
  }
}
