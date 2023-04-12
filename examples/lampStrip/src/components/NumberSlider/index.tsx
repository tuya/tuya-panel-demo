/* eslint-disable no-sparse-arrays */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable indent */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/require-default-props */
/* eslint-disable react/default-props-match-prop-types */
import React from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  PanResponderInstance,
  LayoutChangeEvent,
  Animated,
  GestureResponderEvent,
  PanResponderGestureState,
  ViewStyle,
  Easing,
} from 'react-native';

export const numberSliderDefaultProps = {
  /**
   * Current value
   */
  value: 0,
  /**
   * Minimum value allowed to slide
   * Default value 0
   */
  min: 0,
  /**
   * Maximum value allowed to slide
   * Default value 1000
   */
  max: 1000,
  /**
   * Step size when sliding
   */
  step: 1,
  /**
   * Whether it is disabled
   * Default false
   */
  disabled: false,
  /**
   * Track color
   * Default rgba(0,0,0,.4)
   */
  trackColor: 'rgba(0,0,0,.4)',
  /**
   * Active track color
   * Default #fff
   */
  tintColor: '#fff',
  /**
   * The starting distance for the slide to take effect
   * Default is 7 pixels distance
   */
  invalidSwipeDistance: 7,
  /**
   * Whether it can be clicked to select
   * Default is true
   */
  clickEnabled: true,

  /**
   * Whether it can slide directly through the track
   */
  trackSlideEnabled: false,

  /**
   * Whether to show the active track
   * Default is to show
   */
  showTint: true,

  /**
   * Sliding direction
   */
  direction: 'horizontal' as 'horizontal' | 'vertical',

  /**
   * Whether to slide in reverse
   * When it is a horizontal slider, the default minimum value is on the left, and the minimum value is on the right after setting reverse = true
   * When it is a vertical slider, the default minimum value is at the bottom, and the minimum value is at the top after setting reverse = true
   */
  reverse: false,
  /**
   * Show with animation
   */
  showAnimation: true,
  /**
   * When dragging, the effective touch area size of the slider
   */
  thumbTouchSize: { width: 40, height: 40 },

  /**
   * Test position
   */
  accessibilityLabel: 'numberSlider',

  /**
   * The range of the slider's sliding range
   * inner means that the sliding range is within the slider, and the sliding will not exceed the range of the track
   * outer means that the sliding range can exceed the track range, and the center position of the slider can overlap with the edge of the track when sliding
   */
  thumbLimitType: 'inner' as 'inner' | 'outer',

  /**
   * Sliding start event
   * @param v Current value
   */
  onGrant(v: number) {},
  /**
   * Sliding event
   * @param v Current value
   */
  onMove(v: number) {},
  /**
   * Sliding end event
   * @param v Current value
   */
  onRelease(v: number) {},
  /**
   * Click event
   * When clickEnabled = true, it is valid
   * @param v Current value
   */
  onPress(v: number) {},

  /**
   * When the user actively interacts, if the data value of the slider changes, this event will be triggered
   * @param v Changed data value
   */
  onChange(v: number) {},

  /**
   * Event triggered when the slider changes
   * @param offset The offset of the slider relative to the minimum value of the track
   * @param value The data value corresponding to the slider position
   */
  onThumbChange(offset: number, value?: number) {},
};

type DefaultProps = Readonly<typeof numberSliderDefaultProps>;

export type NumberSliderProps = {
  /**
   * Component outermost container style
   */
  style?: ViewStyle | ViewStyle[];
  /**
   * Track style
   */
  trackStyle?: ViewStyle | ViewStyle[];
  /**
   * Active part of the track style
   */
  tintStyle?: ViewStyle | ViewStyle[];
  /**
   * Slider style
   */
  thumbStyle?: ViewStyle | ViewStyle[];
  /**
   * Minimum value displayed
   * The value must be less than or equal to the minimum value min allowed to slide. If not set, the default is equal to the minimum value min allowed to slide
   *
   */
  showMin?: number;
  /**
   * Maximum value displayed
   * The value must be greater than or equal to the maximum value max allowed to slide. If not set, the default is equal to the maximum value max allowed to slide
   */
  showMax?: number;

  /**
   * Render track
   */
  renderTrack?: () => React.ReactNode;
  /**
   * Render active part of the track
   */
  renderTint?: () => React.ReactNode;
  /**
   * Render slider
   */
  renderThumb?: () => React.ReactNode;

  /**
   * Component layout event
   */
  onLayout?: (e: LayoutChangeEvent) => void;
  /**
   * Component track layout event
   */
  onTrackLayout?: (e: LayoutChangeEvent) => void;
} & DefaultProps;

interface IState {
  value: number;
  showTint: boolean;
}

/**
 * Basic slider
 * This slider only guarantees the complete integer value
 */
export default class NumberSlider extends React.Component<NumberSliderProps, IState> {
  // eslint-disable-next-line react/static-property-placement
  static defaultProps: DefaultProps = numberSliderDefaultProps;

  _panResponder: PanResponderInstance;

  locked = false;

  trackLength = 0; // Track length

  trackSize: number[] = [0, 0];

  trackWidth = 0; // Track width

  valueLength = 0; // Active length

  offsetMinLength = 0; // Minimum offset distance that can be slid relative to the minimum display position

  offsetMaxLength = 0; // Maximum offset distance that can be slid relative to the maximum display position

  maxLength = 0; // Maximum sliding distance

  thumbWidth = 0; // Slider width

  thumbHeight = 0; // Slider height

  animate: Animated.Value = new Animated.Value(0);

  moving = false;

  grantTime = 0;

  isTouchStart = false;

  needUpdate = false;

  trackX = 0;

  trackY = 0;

  tempValue = 0; // Temporary data value

  constructor(props: NumberSliderProps) {
    super(props);
    this._panResponder = PanResponder.create({
      // Request to become a responder:
      onStartShouldSetPanResponder: this.handleStartPanResponder,
      onMoveShouldSetPanResponder: this.handleSetPanResponder,
      onPanResponderTerminationRequest: () => !this.moving,
      onPanResponderMove: this.onMove,
      onPanResponderRelease: this.onRelease,
      // Currently, something else has become a responder and has not released it.
      onPanResponderReject: this.handleTerminate,
      onPanResponderTerminate: this.handleTerminate,
    });
    this.animate.addListener(this.fireThumbChange);

    this.state = { value: this.props.value, showTint: false };
    this.tempValue = this.props.value;
  }

  componentDidMount() {}

  componentWillUnmount() {
    this.animate.removeAllListeners();
  }

  componentWillReceiveProps(nextProps: NumberSliderProps) {
    if (!this.locked) {
      this.handleLength(nextProps);
      if (nextProps.value !== this.props.value || nextProps.direction !== this.props.direction) {
        const valueLength = this.valueToCoor(nextProps.value);
        this.setAnimationValue(valueLength);
        this.valueLength = valueLength;
        this.setState({ value: nextProps.value });
        this.tempValue = nextProps.value;
      }
    }
  }

  shouldComponentUpdate() {
    return !this.locked;
  }

  setAnimationValue(value: number, isSliding = false, noAnimation = false) {
    if (!noAnimation && this.props.showAnimation) {
      this.animate.stopAnimation();
      Animated.timing(this.animate, {
        toValue: value,
        duration: isSliding
          ? 32
          : Math.round((300 * Math.abs(value - this.valueLength)) / this.maxLength),
        easing: Easing.linear,
      }).start(() => {});
    } else {
      this.animate.setValue(value);
    }
  }

  /**
   * Returns the sliding position
   */
  getThumbBound() {
    const {
      direction,
      reverse,
      thumbTouchSize: { width, height },
    } = this.props;
    const isHorizontal = direction === 'horizontal';
    let x = 0;
    let y = 0;
    if (isHorizontal) {
      y = this.trackWidth / 2;
      if (reverse) {
        x = this.maxLength + this.offsetMaxLength - this.valueLength;
      } else {
        x = this.offsetMinLength + this.valueLength;
      }
    } else {
      x = this.trackWidth / 2;
      if (reverse) {
        y = this.offsetMinLength + this.valueLength;
      } else {
        y = this.maxLength + this.offsetMaxLength - this.valueLength;
      }
    }

    return { x: x - width / 2, y: y - height / 2, width, height, centerX: x, centerY: y };
  }

  fireThumbChange = ({ value }: { value: number }) => {
    this.props.onThumbChange(value + this.offsetMinLength, this.coorToValue(value));
  };

  handleStartPanResponder = (e: GestureResponderEvent) => {
    if (this.props.disabled) {
      return false;
    }
    this.grantTime = +new Date();
    return this.props.clickEnabled;
  };

  handleSetPanResponder = (e: GestureResponderEvent, gesture: PanResponderGestureState) => {
    const { direction, invalidSwipeDistance, onGrant, disabled, trackSlideEnabled } = this.props;
    if (disabled) {
      return false;
    }
    const isHorizontal = direction === 'horizontal';

    if (!this.moving) {
      // After sliding a certain number of pixels, other gestures will not be allowed to grab power
      if (
        (isHorizontal && Math.abs(gesture.dx) < invalidSwipeDistance) ||
        (!isHorizontal && Math.abs(gesture.dy) < invalidSwipeDistance)
      ) {
        // Do not slide if it is less than a certain number of pixels
        return false;
      }
      // Do you need to click on the slider to drag
      if (!trackSlideEnabled) {
        const { locationX, locationY } = e.nativeEvent;
        const currentX = locationX - this.trackX;
        const currentY = locationY - this.trackY;
        const { x, y, width, height } = this.getThumbBound();
        if (currentX < x || currentX > width + x || currentY < y || currentY > height + y) {
          return false;
        }
      }
      // Start gesture
      onGrant(this.state.value);
      this.moving = true;
      this.locked = true;
    }
    return trackSlideEnabled;
  };

  handleTerminate = () => {
    // The responder has been withdrawn from this view
    this.moving = false;
    this.locked = false;
    this.isTouchStart = false;
  };

  onMove = (e: GestureResponderEvent, gesture: PanResponderGestureState) => {
    if (this.moving || this.handleSetPanResponder(e, gesture)) {
      this.handleMove(gesture, this.props.onMove, false);
    }
  };

  onRelease = (e: GestureResponderEvent, gesture: PanResponderGestureState) => {
    this.isTouchStart = false;
    if (this.moving) {
      this.moving = false;
      this.locked = false;
      this.handleMove(gesture, this.props.onRelease, true);
    } else if (this.props.clickEnabled) {
      const { direction } = this.props;
      const { centerX, centerY } = this.getThumbBound();
      const now = +new Date();
      if (Math.abs(gesture.dx) < 4 && Math.abs(gesture.dy) < 4 && now - this.grantTime < 300) {
        const { locationX, locationY } = e.nativeEvent;
        let diff = 0;
        if (direction === 'horizontal') {
          diff = locationX - centerX;
        } else {
          diff = locationY - centerY;
        }

        this.handleMove(
          { dx: diff, dy: diff } as PanResponderGestureState,
          this.props.onPress,
          true
        );
      }
    }
  };

  handleMove(gesture: PanResponderGestureState, callback: (value: number) => void, isEnd = false) {
    const { valueLength, maxLength } = this;
    const { direction, reverse, onChange } = this.props;
    const isHorizontal = direction === 'horizontal';
    const { dx, dy } = gesture;
    let diff = 0;
    if (isHorizontal) {
      diff = dx * (reverse ? -1 : 1);
    } else {
      diff = dy * (reverse ? 1 : -1);
    }
    let currentLength = valueLength + diff;
    // Boundary processing
    if (currentLength < 0) {
      currentLength = 0;
    } else if (currentLength > maxLength) {
      currentLength = maxLength;
    }

    const value = this.coorToValue(currentLength);
    currentLength = this.valueToCoor(value);
    this.setAnimationValue(currentLength, !isEnd);

    // value can be a floating point number, here we use the difference to determine whether they are not equal
    if (Math.abs(value - this.tempValue) >= 0.000001) {
      onChange(value);
    }

    this.tempValue = value; // Record temporary value
    if (isEnd) {
      this.valueLength = currentLength;
      this.setState({ value });
    }
    callback(value);
  }

  handleLength(props: NumberSliderProps) {
    const { showMax, showMin, min, max, thumbStyle, thumbLimitType, direction } = props;
    const { trackSize } = this;
    const trackLength = direction === 'horizontal' ? trackSize[0] : trackSize[1];
    this.trackLength = trackLength;
    this.trackWidth = direction === 'horizontal' ? trackSize[1] : trackSize[0];
    const thumbStyles = [styles.thumb, thumbStyle];
    // @ts-ignore
    const { height: thumbHeight = 24, width: thumbWidth = 24 } = StyleSheet.flatten(thumbStyles);
    this.thumbWidth = thumbWidth as number;
    this.thumbHeight = thumbHeight as number;
    const isThumbInner = thumbLimitType === 'inner';
    const isHorizontal = direction === 'horizontal';
    let offset = 0;
    if (isThumbInner) {
      offset = isHorizontal ? this.thumbWidth / 2 : this.thumbHeight / 2;
    }

    const realMax = showMax === undefined ? max : showMax;
    const realMin = showMin === undefined ? min : showMin;
    this.offsetMinLength = (trackLength * (min - realMin)) / (realMax - realMin) + offset;
    this.offsetMaxLength = (trackLength * (realMax - max)) / (realMax - realMin) + offset;
    this.maxLength = Math.max(1, trackLength - this.offsetMaxLength - this.offsetMinLength);
  }

  handleLayout = (e: LayoutChangeEvent) => {
    const { width, height, x, y } = e.nativeEvent.layout;
    const { trackLength, trackWidth } = this;
    this.trackSize = [width, height];
    this.trackX = x;
    this.trackY = y;
    this.handleLength(this.props);
    if (!this.locked && (trackLength !== this.trackLength || trackWidth !== this.trackWidth)) {
      const valueLength = this.valueToCoor(this.state.value);
      this.setAnimationValue(valueLength, false, true);
      this.valueLength = valueLength;
    }

    if (!this.state.showTint) {
      this.setState({ showTint: true });
    }

    this.props.onTrackLayout && this.props.onTrackLayout(e);
  };

  valueToCoor(value: number) {
    const { min, max } = this.props;
    const percent = (Math.min(max, Math.max(min, value)) - min) / (max - min);
    return percent * this.maxLength;
  }

  coorToValue(length: number) {
    const { min, max, step } = this.props;
    let value = (length / this.maxLength) * (max - min) + min;
    if (step) {
      value = Math.round((value - min) / step) * step + min;
    }
    return Math.min(max, Math.max(min, value));
  }

  render() {
    const {
      trackColor,
      tintColor,
      trackStyle,
      tintStyle,
      thumbStyle,
      style,
      direction,
      reverse,
      accessibilityLabel,
      thumbLimitType,
      showTint: visibleTint,
      renderTrack,
      renderTint,
      renderThumb,
      onLayout,
      children,
    } = this.props;
    const { showTint } = this.state;
    const isHorizontal = direction === 'horizontal';
    const containerStyle = [isHorizontal ? styles.container : styles.containerVertical, style];
    const thumbStyles = [styles.thumb, thumbStyle];
    const isThumbInner = thumbLimitType === 'inner';
    const trackStyles = [isHorizontal ? styles.track : styles.trackVertical, trackStyle];
    const { height: thumbHeight = 24, width: thumbWidth = 24 } = StyleSheet.flatten(thumbStyles);
    const halfThumbWidth = (thumbWidth as number) / 2;
    const halfThumbHeight = (thumbHeight as number) / 2;
    const { height: trackHeight = 6, width: trackWidth = 6 } = StyleSheet.flatten(trackStyles);
    return (
      <View style={containerStyle} accessibilityLabel={accessibilityLabel} onLayout={onLayout}>
        <View
          style={[styles.body, { flexDirection: isHorizontal ? 'row' : 'column' }]}
          pointerEvents="box-only"
          {...this._panResponder.panHandlers}
        >
          {/* track */}
          <View
            onLayout={this.handleLayout}
            style={[
              isHorizontal ? styles.track : styles.trackVertical,
              {
                backgroundColor: trackColor,
                borderRadius: isHorizontal
                  ? (trackHeight as number) / 2
                  : (trackWidth as number) / 2,
              },
              trackStyle,
            ]}
          >
            <View style={{ flex: 1 }}>{!!renderTrack && renderTrack()}</View>
            {/* Activated partial orbit */}
            {showTint && visibleTint && (
              <Animated.View
                style={[
                  styles.tintTrack,
                  isHorizontal
                    ? {
                        backgroundColor: tintColor,
                        height: trackHeight,
                        borderRadius: Number(trackHeight) / 2,
                        width: isThumbInner
                          ? this.animate.interpolate({
                              inputRange: [
                                0,
                                halfThumbWidth,
                                Math.max(halfThumbWidth, this.maxLength - halfThumbWidth),
                                Math.max(halfThumbWidth, this.maxLength),
                              ],
                              outputRange: [
                                0,
                                thumbWidth as number,
                                this.maxLength,

                                this.maxLength + (thumbWidth as number),
                              ],
                            })
                          : this.animate,
                        [reverse ? 'right' : 'left']:
                          this.offsetMinLength - (isThumbInner ? halfThumbWidth : 0),
                      }
                    : {
                        backgroundColor: tintColor,
                        width: trackWidth,
                        // @ts-ignore
                        borderRadius: trackWidth / 2,
                        height: isThumbInner
                          ? this.animate.interpolate({
                              inputRange: [
                                0,
                                halfThumbHeight,
                                Math.max(halfThumbHeight, this.maxLength - halfThumbHeight),
                                Math.max(halfThumbHeight, this.maxLength),
                              ],
                              outputRange: [
                                0,
                                thumbHeight as number,
                                this.maxLength,
                                // @ts-ignore
                                this.maxLength + (thumbHeight as number),
                              ],
                            })
                          : this.animate,
                        [reverse ? 'top' : 'bottom']:
                          this.offsetMinLength - (isThumbInner ? halfThumbHeight : 0),
                      },
                  tintStyle,
                ]}
              >
                {!!renderTint && renderTint()}
              </Animated.View>
            )}
          </View>
          <View style={{ ...StyleSheet.absoluteFillObject }} pointerEvents="none">
            {children}
          </View>
          {/* sliding block */}
          {showTint && (
            <Animated.View
              style={[
                thumbStyles,
                isHorizontal
                  ? {
                      [reverse ? 'right' : 'left']: Animated.add(
                        this.animate,
                        this.offsetMinLength - halfThumbWidth
                      ),
                    }
                  : {
                      [reverse ? 'top' : 'bottom']: Animated.add(
                        this.animate,
                        this.offsetMinLength - halfThumbHeight
                      ),
                    },
              ]}
            >
              {!!renderThumb && renderThumb()}
            </Animated.View>
          )}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: 48,
    width: '100%',
  },
  containerVertical: {
    width: 48,
    height: '100%',
    minHeight: 50,
  },
  body: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  track: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  trackVertical: {
    width: 6,
    height: '100%',
    borderRadius: 3,
    overflow: 'hidden',
  },
  tintTrack: {
    position: 'absolute',
  },
  thumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
});
