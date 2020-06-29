import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Animated,
  PanResponder,
  StyleSheet,
  Easing,
  Image,
  ViewPropTypes,
  Platform,
  ColorPropType,
} from 'react-native';
import { Utils } from 'tuya-panel-kit';

const { convertX: cx, convertY: cy } = Utils.RatioUtils;
// 轨道宽度
const RAIL_HEIGHT = cx(250);
const RAIL_WIDTH = cx(267);
const POINT_DIMENSION = cx(20);
export default class CurtainSlider extends Component {
  static propTypes = {
    style: ViewPropTypes.style,
    value: PropTypes.number.isRequired,
    min: PropTypes.number,
    max: PropTypes.number,
    disabled: PropTypes.bool,
    onStart: PropTypes.func,
    onValueChange: PropTypes.func,
    onComplete: PropTypes.func,
    curPower: PropTypes.string,
    totalTime: PropTypes.number,
    circleColor: ColorPropType,
    lineColor: ColorPropType,
    showPoint: PropTypes.bool,
    curtainImg: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    curtainBg: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  };

  static defaultProps = {
    style: null,
    onStart: () => {},
    onValueChange: () => {},
    onComplete: () => {},
    circleColor: '#fff',
    showPoint: true,
    min: 0,
    max: 100,
    disabled: false,
    curPower: 'STOP',
    totalTime: 5000,
    lineColor: 'rgba(255,255,255,.1)',
  };

  constructor(props) {
    super(props);

    this._curDeltaX = this.calcDeltaX(props.value);
    this._cirDeltaX = this.calcDeltaX(props.value);
    this._oldX = this.calcDeltaX(props.value);
    this.from = this.props.value;
    this.to = 0;
    this._leftPanResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: this._handleResponderGrant,
      onPanResponderMove: (e, gestureState) => this._handleResponderMove(e, gestureState, 0),
      onPanResponderRelease: (e, gestureState) => this._handleResponderRelease(e, gestureState, 0),
    });

    this._rightPanResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: this._handleResponderGrant,
      onPanResponderMove: (e, gestureState) => this._handleResponderMove(e, gestureState, 1),
      onPanResponderRelease: (e, gestureState) => this._handleResponderRelease(e, gestureState, 1),
    });

    this._leftCircleResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: this._handleCircleResponderGrant,
      onPanResponderMove: (e, gestureState) => this._handleCircleResponderMove(e, gestureState, 0),
      onPanResponderRelease: (e, gestureState) =>
        this._handleCircleResponderRelease(e, gestureState, 0),
    });

    this._rightCircleResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: this._handleCircleResponderGrant,
      onPanResponderMove: (e, gestureState) => this._handleCircleResponderMove(e, gestureState, 1),
      onPanResponderRelease: (e, gestureState) =>
        this._handleCircleResponderRelease(e, gestureState, 1),
    });

    this.state = {
      value: new Animated.Value(props.value),
      circleValue: new Animated.Value(props.value),
      moveVal: 0,
      isQuick: false,
    };

    this.timer = null;
  }

  async componentWillReceiveProps(nextProps) {
    const { min, max } = this.props;
    const preValue = Math.round(this.state.circleValue._value);
    const sliderEvents = ['open', 'close'];

    if (this.props.aimValue !== nextProps.aimValue && !nextProps.disabled) {
      this._curDeltaX = this.calcDeltaX(nextProps.aimValue);
      this._cirDeltaX = this.calcDeltaX(nextProps.aimValue);
      await this.setState({
        isQuick: false,
        moveVal: nextProps.aimValue,
      });
      this.getAnimateStartWithValue(nextProps.aimValue);
    }

    if (this.props.curValue !== nextProps.curValue && !nextProps.disabled) {
      if (nextProps.moving) {
      } else {
        this.getAnimateStartWithValue(nextProps.curValue);
      }
      await this.setState({ moveVal: nextProps.curValue });
    }

    if (nextProps.curPower === sliderEvents[0] && this.props.curPower !== nextProps.curPower) {
      this.startAnimation(min, preValue);
      this.startCircleAnimation(min, preValue);
      this.from = preValue;
      this.to = min;
      this.props.animateStart && this.props.animateStart();
    }
    if (nextProps.curPower === sliderEvents[1] && this.props.curPower !== nextProps.curPower) {
      this.startAnimation(max, preValue);
      this.startCircleAnimation(max, preValue);
      this.from = preValue;
      this.to = max;
      this.props.animateStart && this.props.animateStart();
    }
    if (this.props.curPower !== nextProps.curPower && nextProps.curPower === 'stop') {
      this.state.value.stopAnimation();
      this.state.circleValue.stopAnimation();
    }
  }

  getAnimateStartWithValue = (value, next) => {
    this.startAnimation(value, next);
    this.startCircleAnimation(value, next);
    if (this.state.value._value !== value) {
      this.props.animateStart && this.props.animateStart();
    }
  };

  getUndefinedToNumber = (u, number) => (typeof u === 'undefined' || Number.isNaN(u) ? number : u);

  getValueDiffToAbsPercent = (val, diff) => {
    return Math.abs(val - diff) / 100;
  };

  getDurationPercent = (v, next) => {
    const { totalTime } = this.props;
    const { isQuick } = this.state;
    const durationTime = totalTime || 5000;
    let percent = this.getValueDiffToAbsPercent(this.from, v);
    percent = typeof next !== 'undefined' ? this.getValueDiffToAbsPercent(v, next) : percent;
    if (percent === 0) return;

    return percent * durationTime * (isQuick ? 0.5 : 1);
  };

  startAnimation = (v, next) => {
    const curtainDuration = this.getDurationPercent(v, next, 'curtainDuration');
    Animated.timing(this.state.value, {
      toValue: v,
      duration: curtainDuration,
      easing: Easing.linear,
    }).start(() => {});
  };

  startCircleAnimation = (v, next) => {
    const _this = this;
    const circleDuration = this.getDurationPercent(v, next, 'circleDuration');
    Animated.timing(this.state.circleValue, {
      toValue: v,
      duration: circleDuration,
      easing: Easing.linear,
    }).start(async () => {
      this.props.onEnd && this.props.onEnd(Math.round(this.state.circleValue._value));
      await _this.setState({
        moveVal: Math.round(this.state.circleValue._value),
      });
    });
  };

  calcDeltaX(value) {
    const { min, max } = this.props;
    if (value < min || value > max) {
      return;
    }
    const deltaX = (value / (max - min)) * (RAIL_HEIGHT / 2);
    return deltaX;
  }

  _moveTo(dx, type) {
    const { min, max } = this.props;
    let value = type
      ? ((this._curDeltaX - dx) / (RAIL_HEIGHT / 2)) * (max - min)
      : ((this._curDeltaX + dx) / (RAIL_HEIGHT / 2)) * (max - min);

    if (value < min) {
      value = min;
    } else if (value > max) {
      value = max;
    }

    this.setState({
      moveVal: Math.round(value),
      newValue: value,
    });
    this.startAnimation(value);
    this.startCircleAnimation(value);
    this.props.onValueChange && this.props.onValueChange(value);
  }

  _circleMoveTo(dx, type, action) {
    const { min, max } = this.props;
    let value = type
      ? ((this._cirDeltaX - dx) / (RAIL_HEIGHT / 2)) * (max - min)
      : ((this._cirDeltaX + dx) / (RAIL_HEIGHT / 2)) * (max - min);

    if (value < min) {
      value = min;
    } else if (value > max) {
      value = max;
    }

    this.props.moveType && this.props.moveType(this._cirDeltaX <= dx);
    this.props.onMove && this.props.onMove(value);
    this.setState({
      moveVal: Math.round(value),
      newValue: value,
    });
    this.state.circleValue.setValue(value);
    action && action === 'release' && this.startAnimation(value);
    this.props.onValueChange && this.props.onValueChange(value);
  }

  _handleCircleResponderGrant = () => {
    clearTimeout(this.timer);
    const { disabled } = this.props;
    if (disabled) {
      return;
    }
    this.props.onStart && this.props.onStart();

    this.from = this.state.moveVal;
    this.setState({
      isQuick: false,
    });
  };

  _handleCircleResponderMove = (__, gestureState, type) => {
    const { disabled } = this.props;
    const { dy } = gestureState;

    if (disabled || dy === 0) {
      return;
    }

    this._circleMoveTo(dy, type, 'move');
  };

  _handleCircleResponderRelease = (__, gestureState, type) => {
    const { disabled } = this.props;
    const { dy } = gestureState;

    if (disabled || dy === 0) {
      return;
    }

    this.to = this.state.moveVal;
    this._circleMoveTo(dy, type, 'release');
    this._cirDeltaX = this.calcDeltaX(this.state.newValue);
    this.props.onComplete && this.props.onComplete(this.state.newValue);
  };

  _handleResponderGrant = () => {
    clearTimeout(this.timer);
    const { disabled } = this.props;
    if (disabled) {
      return;
    }
    this.props.onStart && this.props.onStart();
    this.setState({
      isQuick: false,
    });
  };

  _handleResponderMove = (__, gestureState, type) => {
    const { disabled } = this.props;
    const { dy } = gestureState;

    if (disabled || dy === 0) {
      return;
    }
    this._moveTo(dy, type);
  };

  _handleResponderRelease = (__, gestureState, type) => {
    const { disabled } = this.props;
    const { dy } = gestureState;

    if (disabled || dy === 0) {
      return;
    }

    this._moveTo(dy, type);
    this._curDeltaX = this.calcDeltaX(this.state.newValue);
    this.props.onComplete && this.props.onComplete(this.state.newValue);
  };

  render() {
    const {
      style,
      min,
      max,
      circleColor,
      curtainBg,
      curtainImg,
      showPoint,
      lineColor,
    } = this.props;

    return (
      <View style={[styles.container, style]}>
        <View style={{ alignItems: 'center' }}>
          <Image
            style={[
              styles.image_curtainBg,
              {
                position: 'absolute',
                top: cy(8),
                resizeMode: 'contain',
              },
            ]}
            source={curtainBg}
          />
          <View style={[styles.curtain, Platform.OS === 'ios' && { zIndex: 99 }]}>
            <Animated.Image
              style={[
                styles.image__curtain,
                {
                  top: this.state.value.interpolate({
                    inputRange: [0, max - min],
                    outputRange: [cx(17), cx(10)],
                  }),
                  width: cx(240),
                  height: this.state.value.interpolate({
                    inputRange: [0, max - min],
                    outputRange: [cx(12), RAIL_HEIGHT],
                  }),
                },
              ]}
              source={curtainImg}
              resizeMode="stretch"
              {...this._leftPanResponder.panHandlers}
            />
          </View>
          {showPoint && (
            <View
              style={[
                styles.image__rail,
                { position: 'absolute' },
                Platform.OS === 'ios' && { zIndex: 999 },
              ]}
            >
              <Animated.View
                style={[
                  styles.image__line,
                  {
                    backgroundColor: lineColor,
                  },
                  {
                    height: this.state.circleValue.interpolate({
                      inputRange: [0, max - min],
                      outputRange: [cx(12), cx(229)],
                    }),
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.image__point,
                  styles.image__right,
                  {
                    right: cx(63),
                    backgroundColor: circleColor,
                  },
                  {
                    transform: [
                      {
                        translateY: this.state.circleValue.interpolate({
                          inputRange: [0, max - min],
                          outputRange: [cx(18), cx(242) - POINT_DIMENSION / 2],
                        }),
                      },
                    ],
                  },
                ]}
                {...this._leftCircleResponder.panHandlers}
              />
            </View>
          )}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    width: cx(375),
    justifyContent: 'center',
    alignItems: 'center',
  },

  image_curtainBg: {
    width: cx(375),
    height: cx(263),
    alignSelf: 'center',
    alignItems: 'center',
  },

  image__rail: {
    width: cx(375),
  },

  image__point: {
    position: 'absolute',
    width: cx(20),
    height: cx(20),
    borderRadius: cx(15),
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 2,
  },

  image__line: {
    position: 'absolute',
    top: cx(18),
    right: cx(73),
    width: cx(2),
    height: cx(242),
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 2,
  },

  image__curtain: {
    position: 'absolute',
    width: RAIL_WIDTH - cx(8),
    height: cx(221),
    alignSelf: 'center',
  },

  image__right: {
    right: 0,
  },

  curtain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: cx(375),
    height: RAIL_HEIGHT,
    alignSelf: 'center',
  },
});
