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
   * 当前值
   */
  value: 0,
  /**
   * 允许滑动的最小值
   * 默认值 0
   */
  min: 0,
  /**
   * 允许滑动的最大值
   * 默认值 1000
   */
  max: 1000,
  /**
   * 滑动时的步长
   */
  step: 1,
  /**
   * 是否禁用
   * 默认 false
   */
  disabled: false,
  /**
   * 轨道颜色
   * 默认 rgba(0,0,0,.4)
   */
  trackColor: 'rgba(0,0,0,.4)',
  /**
   * 激活的轨道颜色
   * 默认 #fff
   */
  tintColor: '#fff',
  /**
   * 滑动生效的开始距离
   * 默认为 7 个像素距离
   */
  invalidSwipeDistance: 7,
  /**
   * 是否可以点击选择
   * 默认为 true
   */
  clickEnabled: true,

  /**
   * 是否可以能过轨道直接滑动
   */
  trackSlideEnabled: false,

  /**
   * 是否显示激活轨道
   * 默认为显示
   */
  showTint: true,

  /**
   * 滑动方向
   */
  direction: 'horizontal' as 'horizontal' | 'vertical',

  /**
   * 是否反向滑动
   * 当为水平滑动条时，默认滑条的最小值在左边，设置reverse = true后，最小值在右边
   * 当为垂直滑动条时，默认滑条的最小值在下边，设置reverse = true后，最小值在上边
   */
  reverse: false,
  /**
   * 使用动画显示
   */
  showAnimation: true,
  /**
   * 拖动时，滑动的有效触控区大小
   */
  thumbTouchSize: { width: 40, height: 40 },

  /**
   * 测试标位
   */
  accessibilityLabel: 'numberSlider',

  /**
   * 滑块的可滑动范围类型
   * inner 为滑动范围为滑块内，滑动不会超出轨道的范围
   * outer 为滑动范围可超出轨道范围，滑动时滑块中心位置可与轨道的边重叠
   */
  thumbLimitType: 'inner' as 'inner' | 'outer',

  /**
   * 滑动开始事件
   * @param v 当前值
   */
  onGrant(v: number) {},
  /**
   * 滑动中事件
   * @param v 当前值
   */
  onMove(v: number) {},
  /**
   * 滑动结束事件
   * @param v 当前值
   */
  onRelease(v: number) {},
  /**
   * 点击事件
   * 当 clickEnabled = true时，有效
   * @param v 当前值
   */
  onPress(v: number) {},

  /**
   * 用户主动交互时，如果滑动条的数据值有变化，会触发此事件
   * @param v 变化的数据值
   */
  onChange(v: number) {},

  /**
   * 滑块变动时触发事件
   * @param offset 滑块的相对轨道最小值一端的偏移量
   * @param value 滑块位置对应的数据值
   */
  onThumbChange(offset: number, value?: number) {},
};

type DefaultProps = Readonly<typeof numberSliderDefaultProps>;

export type NumberSliderProps = {
  /**
   * 组件最外层容器样式
   */
  style?: ViewStyle | ViewStyle[];
  /**
   * 轨道的样式
   */
  trackStyle?: ViewStyle | ViewStyle[];
  /**
   * 激活部分轨道样式
   */
  tintStyle?: ViewStyle | ViewStyle[];
  /**
   * 滑块的样式
   */
  thumbStyle?: ViewStyle | ViewStyle[];
  /**
   * 显示的最小值
   * 值此必须小于等于允许滑动的最小值 min 的值，如果不设置则默认等于允许滑动的最小值 min 的值
   *
   */
  showMin?: number;
  /**
   * 显示的最大值
   * 值此必须大于等于允许滑动的最大值 max 的值，如果不设置则默认等于允许滑动的最大值 max 的值
   */
  showMax?: number;

  /**
   * 渲染轨道
   */
  renderTrack?: () => React.ReactNode;
  /**
   * 渲染激活部分轨道
   */
  renderTint?: () => React.ReactNode;
  /**
   * 渲染滑块
   */
  renderThumb?: () => React.ReactNode;

  /**
   * 组件的layout事件
   */
  onLayout?: (e: LayoutChangeEvent) => void;
  /**
   * 组件的轨道layout事件
   */
  onTrackLayout?: (e: LayoutChangeEvent) => void;
} & DefaultProps;

interface IState {
  value: number;
  showTint: boolean;
}

/**
 * 基础滑动条 slider
 * 此滑动条仅保证整数值情况下完整的
 */
export default class NumberSlider extends React.Component<NumberSliderProps, IState> {
  // eslint-disable-next-line react/static-property-placement
  static defaultProps: DefaultProps = numberSliderDefaultProps;

  _panResponder: PanResponderInstance;

  locked = false;

  trackLength = 0; // 轨道长度

  trackSize: number[] = [0, 0];

  trackWidth = 0; // 轨道宽度

  valueLength = 0; // 激活的长度

  offsetMinLength = 0; // 相对最小显示位置可滑动的最小偏移距离

  offsetMaxLength = 0; // 相对最大显示位置可滑动的最大偏移距离

  maxLength = 0; // 可滑动的最大距离

  thumbWidth = 0; // 滑块的宽

  thumbHeight = 0; // 滑动的高

  animate: Animated.Value = new Animated.Value(0);

  moving = false;

  grantTime = 0;

  isTouchStart = false;

  needUpdate = false;

  trackX = 0;

  trackY = 0;

  tempValue = 0; // 数据临时值

  constructor(props: NumberSliderProps) {
    super(props);
    this._panResponder = PanResponder.create({
      // 要求成为响应者：
      onStartShouldSetPanResponder: this.handleStartPanResponder,
      onMoveShouldSetPanResponder: this.handleSetPanResponder,
      onPanResponderTerminationRequest: () => !this.moving,
      onPanResponderMove: this.onMove,
      onPanResponderRelease: this.onRelease,
      // 当前有其他的东西成为响应器并且没有释放它。
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
   * 返回滑动位置
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
      // 滑动一定象素后，将不允许其他手势抢权
      if (
        (isHorizontal && Math.abs(gesture.dx) < invalidSwipeDistance) ||
        (!isHorizontal && Math.abs(gesture.dy) < invalidSwipeDistance)
      ) {
        // 小于一定象素不做滑动
        return false;
      }
      // 是否需要点中滑块才能拖动
      if (!trackSlideEnabled) {
        const { locationX, locationY } = e.nativeEvent;
        const currentX = locationX - this.trackX;
        const currentY = locationY - this.trackY;
        const { x, y, width, height } = this.getThumbBound();
        if (currentX < x || currentX > width + x || currentY < y || currentY > height + y) {
          return false;
        }
      }
      // 开始手势
      onGrant(this.state.value);
      this.moving = true;
      this.locked = true;
    }
    return trackSlideEnabled;
  };

  handleTerminate = () => {
    // 响应器已经从该视图抽离
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
    // 边界处理
    if (currentLength < 0) {
      currentLength = 0;
    } else if (currentLength > maxLength) {
      currentLength = maxLength;
    }

    const value = this.coorToValue(currentLength);
    currentLength = this.valueToCoor(value);
    this.setAnimationValue(currentLength, !isEnd);

    // value 可以浮点数，此处使用差来判断是否不相等
    if (Math.abs(value - this.tempValue) >= 0.000001) {
      onChange(value);
    }

    this.tempValue = value; // 记录临时值
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
          {/* 轨道 */}
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
            {/* 激活部分轨道 */}
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
          {/* 滑块 */}
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
                ,
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
