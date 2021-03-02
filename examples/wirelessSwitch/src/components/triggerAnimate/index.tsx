import colors from 'color';
import React, { Component } from 'react';
import Svg, { Path, G } from 'react-native-svg';
import { Animated, Easing, View, StyleSheet } from 'react-native';
import { Utils, TYText } from 'tuya-panel-kit';
import Strings from '../../i18n';
import ElePart from './elePart';

const AnimatePath = Animated.createAnimatedComponent(Path);

const { convertX: cx } = Utils.RatioUtils;
interface TriggerAnimateProps {
  pathColor: string;
  animateTime: number;
  trigger: boolean;
  stop: () => void;
  isDefaultTheme: boolean;
  devName: string;
}
interface TriggerAnimateStates {
  strokeDashOffset: Animated.Value;
  strokeDashOffset2: Animated.Value;
  press: Animated.Value;
}

export default class TriggerAnimate extends Component<TriggerAnimateProps, TriggerAnimateStates> {
  constructor(props: TriggerAnimateProps) {
    super(props);
    this.state = {
      strokeDashOffset: new Animated.Value(71),
      strokeDashOffset2: new Animated.Value(45),
      press: new Animated.Value(0),
    };
  }

  componentWillReceiveProps(nextProps: TriggerAnimateProps) {
    const { trigger } = this.props;
    if (trigger !== nextProps.trigger) {
      nextProps.trigger && this.animate();
    }
  }

  animate = () => {
    const { animateTime, stop } = this.props;
    const { strokeDashOffset, strokeDashOffset2, press } = this.state;
    Animated.timing(strokeDashOffset, {
      toValue: -171,
      easing: Easing.linear,
      duration: animateTime,
    }).start(() => {
      strokeDashOffset.setValue(71);
      stop();
    });
    Animated.timing(strokeDashOffset2, {
      toValue: -85,
      easing: Easing.linear,
      duration: animateTime,
    }).start(() => {
      strokeDashOffset2.setValue(45);
      stop();
    });
    Animated.timing(press, {
      toValue: 1,
      easing: Easing.linear,
      duration: 1000,
    }).start(() => {
      press.setValue(0);
    });
  };

  _getAnimateValue = (maxValue: number) => {
    const { press } = this.state;
    return press.interpolate({
      inputRange: [0, 1],
      outputRange: [0, maxValue],
    });
  };

  renderLines = (trigger: boolean) => {
    const { pathColor } = this.props;
    const { strokeDashOffset2 } = this.state;
    return (
      <Animated.View style={styles.vertical}>
        <Svg height="45" width="20" viewBox="0 0 20 45">
          <G fill="none">
            <AnimatePath
              d="M0 45 V0"
              stroke={pathColor}
              strokeWidth="1"
              strokeDasharray="45,100"
              strokeDashoffset={trigger ? strokeDashOffset2 : 0}
            />
          </G>
        </Svg>
      </Animated.View>
    );
  };

  render() {
    const { trigger, pathColor, devName } = this.props;
    const { strokeDashOffset } = this.state;
    const w1 = this._getAnimateValue(cx(28));
    const w2 = this._getAnimateValue(cx(16));
    const r1 = this._getAnimateValue(cx(14));
    const r2 = this._getAnimateValue(cx(8));
    const op = this._getAnimateValue(1);
    return (
      <View style={styles.nameEle}>
        <TYText style={styles.devName} numberOfLines={1}>
          {devName}
        </TYText>
        <View style={styles.describeContent}>
          <TYText style={styles.describe} numberOfLines={3}>
            {Strings.getLang('describe')}
          </TYText>
        </View>
        <ElePart />
        <View style={styles.animate}>
          <View style={{ flex: 1 }}>
            <View style={styles.line1}>{this.renderLines(trigger)}</View>
            <View style={styles.line2}>{this.renderLines(trigger)}</View>
            <Animated.View style={styles.brokenLine}>
              <Svg height="31" width="71" viewBox="0 0 71 31">
                <G fill="none">
                  {trigger ? (
                    <AnimatePath
                      d="M71 31 H55 V0 H0"
                      stroke={pathColor}
                      strokeWidth="1"
                      strokeDasharray="71, 200"
                      strokeDashoffset={strokeDashOffset}
                    />
                  ) : (
                    <Path d="M71 31 H55 V0 H0" stroke={pathColor} strokeWidth="1" />
                  )}
                </G>
              </Svg>
            </Animated.View>
            <View style={styles.pressContent}>
              {trigger && (
                <Animated.View
                  style={[
                    styles.cicleContent,
                    {
                      width: w1,
                      height: w1,
                      borderRadius: r1,
                      backgroundColor: colors(pathColor).alpha(0.1).rgbString(),
                      opacity: op,
                    },
                  ]}
                >
                  <Animated.View
                    style={{
                      width: w2,
                      height: w2,
                      borderRadius: r2,
                      backgroundColor: pathColor,
                      opacity: op,
                    }}
                  />
                </Animated.View>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  vertical: {
    width: 20,
    height: 45,
  },
  brokenLine: {
    width: 71,
    height: 31,
    position: 'absolute',
    top: 12,
    right: cx(60),
  },
  line1: {
    position: 'absolute',
    top: 0,
    right: cx(18),
  },
  line2: {
    transform: [
      {
        rotate: '270deg',
      },
    ],
    position: 'absolute',
    top: 45,
    right: cx(71),
  },
  cicleContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressContent: {
    width: cx(28),
    height: cx(28),
    position: 'absolute',
    top: cx(47),
    right: cx(23),
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameEle: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginTop: cx(30),
    marginLeft: cx(15),
  },
  devName: {
    backgroundColor: 'transparent',
    color: '#063747',
    fontSize: cx(24),
    fontWeight: 'bold',
    maxWidth: cx(168),
    lineHeight: cx(33),
    marginBottom: cx(4),
  },
  describeContent: {
    width: cx(134),
    height: cx(65),
  },
  describe: {
    backgroundColor: 'transparent',
    color: 'rgba(0,0,0,.5)',
    fontSize: cx(12),
    maxWidth: cx(134),
    lineHeight: cx(17),
  },
  animate: {
    position: 'absolute',
    right: 0,
    top: cx(84),
    width: cx(200),
    height: cx(200),
  },
});
