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
  // eslint-disable-next-line react/static-property-placement
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
    aimValue: PropTypes.any.isRequired,
    animateStart: PropTypes.func,
    curValue: PropTypes.any.isRequired,
    moving: PropTypes.bool,
    onEnd: PropTypes.func,
    moveType: PropTypes.func,
    onMove: PropTypes.func,
  };

  // eslint-disable-next-line react/static-property-placement
  static defaultProps = {
    style: null,
    onStart: () => {},
    onValueChange: () => {},
    onComplete: () => {},
    animateStart() {},
    onEnd() {},
    moveType() {},
    onMove() {},
    circleColor: '#fff',
    showPoint: true,
    min: 0,
    max: 100,
    disabled: false,
    curPower: 'STOP',
    totalTime: 5000,
    lineColor: 'rgba(255,255,255,.1)',
    moving: false,
  };

  constructor(props) {
    super(props);
    const { value } = this.props;

    this._curDeltaX = this.calcDeltaX(value);
    this._cirDeltaX = this.calcDeltaX(value);
    this._oldX = this.calcDeltaX(value);
    this.from = value;
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
    const { min, max, aimValue, curValue, curPower, animateStart } = this.props;
    const { circleValue, value } = this.state;
    const preValue = Math.round(circleValue._value);
    const sliderEvents = ['open', 'close'];

    if (aimValue !== nextProps.aimValue && !nextProps.disabled) {
      this._curDeltaX = this.calcDeltaX(nextProps.aimValue);
      this._cirDeltaX = this.calcDeltaX(nextProps.aimValue);
      await this.setState({
        isQuick: false,
        moveVal: nextProps.aimValue,
      });
      this.getAnimateStartWithValue(nextProps.aimValue);
    }

    if (curValue !== nextProps.curValue && !nextProps.disabled) {
      if (nextProps.moving) {
      } else {
        this.getAnimateStartWithValue(nextProps.curValue);
      }
      await this.setState({ moveVal: nextProps.curValue });
    }

    if (nextProps.curPower === sliderEvents[0] && curPower !== nextProps.curPower) {
      this.startAnimation(min, preValue);
      this.startCircleAnimation(min, preValue);
      this.from = preValue;
      this.to = min;
      animateStart && animateStart();
    }
    if (nextProps.curPower === sliderEvents[1] && curPower !== nextProps.curPower) {
      this.startAnimation(max, preValue);
      this.startCircleAnimation(max, preValue);
      this.from = preValue;
      this.to = max;
      animateStart && animateStart();
    }
    if (curPower !== nextProps.curPower && nextProps.curPower === 'stop') {
      value.stopAnimation();
      circleValue.stopAnimation();
    }
  }

  getAnimateStartWithValue = (target, next) => {
    this.startAnimation(target, next);
    this.startCircleAnimation(target, next);
    const { value } = this.state;
    const { animateStart } = this.props;
    if (value._value !== target) {
      animateStart && animateStart();
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
    const { value } = this.state;
    Animated.timing(value, {
      toValue: v,
      duration: curtainDuration,
      easing: Easing.linear,
    }).start(() => {});
  };

  startCircleAnimation = (v, next) => {
    const _this = this;
    const circleDuration = this.getDurationPercent(v, next, 'circleDuration');
    const { circleValue } = this.state;
    Animated.timing(circleValue, {
      toValue: v,
      duration: circleDuration,
      easing: Easing.linear,
    }).start(async () => {
      const { onEnd } = this.props;
      onEnd && onEnd(Math.round(circleValue._value));
      await _this.setState({
        moveVal: Math.round(circleValue._value),
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
    const { min, max, onValueChange } = this.props;
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
    onValueChange && onValueChange(value);
  }

  _circleMoveTo(dx, type, action) {
    const { min, max, moveType, onMove, onValueChange } = this.props;
    let value = type
      ? ((this._cirDeltaX - dx) / (RAIL_HEIGHT / 2)) * (max - min)
      : ((this._cirDeltaX + dx) / (RAIL_HEIGHT / 2)) * (max - min);

    if (value < min) {
      value = min;
    } else if (value > max) {
      value = max;
    }

    moveType && moveType(this._cirDeltaX <= dx);
    onMove && onMove(value);
    this.setState({
      moveVal: Math.round(value),
      newValue: value,
    });
    const { circleValue } = this.state;
    circleValue.setValue(value);
    action && action === 'release' && this.startAnimation(value);
    onValueChange && onValueChange(value);
  }

  _handleCircleResponderGrant = () => {
    clearTimeout(this.timer);
    const { disabled, onStart } = this.props;
    if (disabled) {
      return;
    }
    onStart && onStart();

    const { moveVal } = this.state;
    this.from = moveVal;
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
    const { disabled, onComplete } = this.props;
    const { dy } = gestureState;

    if (disabled || dy === 0) {
      return;
    }

    const { moveVal, newValue } = this.state;
    this.to = moveVal;
    this._circleMoveTo(dy, type, 'release');
    this._cirDeltaX = this.calcDeltaX(newValue);
    onComplete && onComplete(newValue);
  };

  _handleResponderGrant = () => {
    clearTimeout(this.timer);
    const { disabled, onStart } = this.props;
    if (disabled) {
      return;
    }
    onStart && onStart();
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
    const { disabled, onComplete } = this.props;
    const { dy } = gestureState;

    if (disabled || dy === 0) {
      return;
    }
    const { newValue } = this.state;
    this._moveTo(dy, type);
    this._curDeltaX = this.calcDeltaX(newValue);
    onComplete && onComplete(newValue);
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
    const { value, circleValue } = this.state;

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
                  top: value.interpolate({
                    inputRange: [0, max - min],
                    outputRange: [cx(17), cx(10)],
                  }),
                  width: cx(240),
                  height: value.interpolate({
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
                    height: circleValue.interpolate({
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
                        translateY: circleValue.interpolate({
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
