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
} from 'react-native';
import { Utils } from 'tuya-panel-kit';

const { convert, convertX: cx, convertY: cy } = Utils.RatioUtils;
// 轨道宽度
const RAIL_WIDTH = cx(303);
const POINT_DIMENSION = convert(40);
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
    circleColor: PropTypes.string,
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
    const { animateStart } = this.props;
    const { value } = this.state;
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
    const deltaX = (value / (max - min)) * (RAIL_WIDTH / 2);
    return deltaX;
  }

  _moveTo(dx, type) {
    const { min, max, onValueChange } = this.props;
    let value = type
      ? ((this._curDeltaX - dx) / (RAIL_WIDTH / 2)) * (max - min)
      : ((this._curDeltaX + dx) / (RAIL_WIDTH / 2)) * (max - min);

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
      ? ((this._cirDeltaX - dx) / (RAIL_WIDTH / 2)) * (max - min)
      : ((this._cirDeltaX + dx) / (RAIL_WIDTH / 2)) * (max - min);

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
    // eslint-disable-next-line react/destructuring-assignment
    this.state.circleValue.setValue(value);
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
    const { dx } = gestureState;

    if (disabled || dx === 0) {
      return;
    }

    this._circleMoveTo(dx, type, 'move');
  };

  _handleCircleResponderRelease = (__, gestureState, type) => {
    const { disabled, onComplete } = this.props;
    const { dx } = gestureState;

    if (disabled || dx === 0) {
      return;
    }

    const { moveVal, newValue } = this.state;
    this.to = moveVal;
    this._circleMoveTo(dx, type, 'release');
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
    const { dx } = gestureState;

    if (disabled || dx === 0) {
      return;
    }
    this._moveTo(dx, type);
  };

  _handleResponderRelease = (__, gestureState, type) => {
    const { disabled, onComplete } = this.props;
    const { dx } = gestureState;

    if (disabled || dx === 0) {
      return;
    }

    this._moveTo(dx, type);
    const { newValue } = this.state;
    this._curDeltaX = this.calcDeltaX(newValue);
    onComplete && onComplete(newValue);
  };

  render() {
    const { style, min, max, circleColor, curtainBg, curtainImg, showPoint } = this.props;
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
                resizeMode: 'stretch',
              },
            ]}
            source={curtainBg}
          />
          <View style={[styles.curtain, Platform.OS === 'ios' && { zIndex: 99 }]}>
            <Animated.Image
              style={[
                styles.image__curtain,
                styles.image__left,
                {
                  top: cy(17),
                  left: cx(6),
                  width: value.interpolate({
                    inputRange: [0, max - min],
                    outputRange: [cx(30), RAIL_WIDTH - cx(14)],
                  }),
                },
              ]}
              source={curtainImg}
              resizeMode="stretch"
              {...this._leftPanResponder.panHandlers}
            />
          </View>
          {showPoint && (
            <View style={[styles.image__rail, Platform.OS === 'ios' && { zIndex: 999 }]}>
              <Animated.View
                style={[
                  styles.image__point,
                  styles.image__left,
                  {
                    left: cx(8),
                    backgroundColor: circleColor,
                  },
                  {
                    transform: [
                      {
                        translateX: circleValue.interpolate({
                          inputRange: [0, max - min],
                          outputRange: [0, RAIL_WIDTH - POINT_DIMENSION - 4],
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
    height: cy(232),
  },

  image__rail: {
    width: RAIL_WIDTH,
  },

  image__point: {
    position: 'absolute',
    width: convert(25),
    height: convert(25),
    borderRadius: convert(15),
    borderWidth: convert(5),
    borderColor: '#fff',
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
    width: RAIL_WIDTH / 2 - cx(8),
    height: cy(240),
  },

  image__left: {
    left: 0,
  },

  curtain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: RAIL_WIDTH,
  },
});
