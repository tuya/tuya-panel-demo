/* eslint-disable react/no-array-index-key */
/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable react/require-default-props */
/* eslint-disable react/default-props-match-prop-types */
import React, { Component } from 'react';
import {
  View,
  PanResponder,
  GestureResponderEvent,
  LayoutChangeEvent,
  PanResponderGestureState,
  PanResponderInstance,
  Animated,
} from 'react-native';
import _ from 'lodash';
import { Svg, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import Thumb from './Thumb';

export interface Point {
  x: number;
  y: number;
}

/**
 * Effective region of thumb
 */
export interface ValidBound {
  width: number;
  height: number;
  x: number;
  y: number;
}

export interface ILinearColors {
  offset: string;
  stopColor: string;
  stopOpacity: number;
}

export interface ILinear {
  x1?: string | number;
  x2?: string | number;
  y1?: string | number;
  y2?: string | number;
  colors: ILinearColors[];
}

export const defaultProps = {
  bgs: [] as ILinear[],
  thumbComponent: Thumb,
  disabled: false,
  opacityAnimationValue: 1,
  thumbSize: 40,
  touchThumbSize: 60,
  showThumbWhenDisabled: true,
  clickEnabled: true, // Whether it can be clicked to select
  lossShow: false, // Data not effective on the device, if true, then lossColor takes effect, and thumb and brightness adjustment will change to the specified color
  lossColor: 'rgba(0,0,0,0.2)',
  // eslint-disable-next-line react/default-props-match-prop-types
  thumbImg: {
    uri: 'data:image/png;base64,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',
  },
  onGrant(v: any) {},
  onMove(v: any) {},
  onRelease(v: any) {},
  onPress(v: any) {},
};

type DefaultProps = Readonly<typeof defaultProps>;

interface IProps extends DefaultProps {
  value: any;
  style?: any;
  coorToValue: (coor: Point, validBound: ValidBound) => any;
  valueToCoor: (value: any, originCoor?: Point | null, validBound?: ValidBound) => Point;
  valueToColor: (value: any) => string;
  initData: (validBound?: ValidBound) => void;
  opacityAnimationValue: number;
}

interface IState {
  value: any;
  fadeAnim: any;
}

let idIndex = 0;

export default class RectPicker extends Component<IProps, IState> {
  // eslint-disable-next-line react/static-property-placement
  static defaultProps = defaultProps;

  _panResponder: PanResponderInstance;

  thumbPosition: Point = { x: 0, y: 0 };

  color = 'red';

  showPicker = false;

  pickerWidth = 200;

  pickerHeight = 200;

  validBound: ValidBound = { x: 0, y: 0, width: 0, height: 0 };

  locked = false; // Whether to lock the component, after locking, the component accepts normal react updates

  thumbRef: React.ReactNode;

  isThumbFocus = false;

  grantTime = 0;

  linearGradientId = `rectPicker_${idIndex++}`;

  constructor(props: IProps) {
    super(props);
    this.state = {
      value: this.props.value,
      fadeAnim: new Animated.Value(props.opacityAnimationValue),
    };

    // A pit of rn, you need to assign a value here to take effect
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: this.handleSetResponder,
      onPanResponderTerminationRequest: () => !this.locked,
      onPanResponderGrant: this.handleGrant,
      onPanResponderMove: this.handleMove,
      onPanResponderRelease: this.handleRelease,
    });
  }

  componentWillReceiveProps(nextProps: IProps) {
    if (!_.isEqual(nextProps.value, this.props.value)) {
      this.setState({ value: nextProps.value });
      const position = this.valueToCoor(nextProps.value);
      const color = this.valueToColor(nextProps.value);
      this.updateThumbPosition(position, color, true);
    }
    if (nextProps.lossShow !== this.props.lossShow) {
      const color = this.valueToColor(nextProps.value);
      this.updateThumbPosition(
        this.thumbPosition,
        nextProps.lossShow ? nextProps.lossColor : color,
        true
      );
    }
    if (nextProps.thumbSize !== this.props.thumbSize) {
      this.handleViewBoxChange(nextProps.thumbSize);
    }
    // Switch toggle changes opacity
    if (nextProps.opacityAnimationValue !== this.props.opacityAnimationValue) {
      this.fadeAnimation(nextProps.opacityAnimationValue);
    }
  }

  fadeAnimation = (value: number) => {
    const { fadeAnim } = this.state;
    Animated.timing(fadeAnim, {
      toValue: value,
      duration: 300,
    }).start();
  };

  shouldComponentUpdate() {
    return !this.locked;
  }

  coorToValue(point: Point) {
    const { coorToValue } = this.props;
    if (typeof coorToValue === 'function') {
      return coorToValue(point, this.validBound);
    }
    return point;
  }

  valueToCoor(value: any, originCoor?: Point): Point {
    const { valueToCoor } = this.props;

    // Whether there is a display area, no display area directly returns the origin coordinates
    const { width, height } = this.validBound;
    if (width === 0 || height === 0) {
      return { x: 0, y: 0 };
    }
    if (typeof valueToCoor === 'function') {
      return valueToCoor(value, originCoor, this.validBound);
    }
    return originCoor || { x: 0, y: 0 };
  }

  valueToColor(value: any): string {
    const { valueToColor } = this.props;
    if (typeof valueToColor === 'function') {
      return valueToColor(value);
    }
    return 'transparent';
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  firPropsEvent(cb: Function, ...args: any[]) {
    cb && cb(...args);
  }

  handleSetResponder = (e: GestureResponderEvent) => {
    if (this.props.disabled) {
      return false;
    }
    // Whether the mark is clicked
    const { locationX, locationY } = e.nativeEvent;
    const { thumbSize, touchThumbSize, clickEnabled } = this.props;
    let validRadius = thumbSize / 2;
    if (touchThumbSize) {
      validRadius = touchThumbSize / 2;
    }
    const { x, y } = this.thumbPosition;
    const length = Math.sqrt((locationX - x) ** 2 + (locationY - y) ** 2);
    if (length <= validRadius) {
      this.isThumbFocus = true;
      return true;
    }
    this.isThumbFocus = false;
    this.grantTime = +new Date();
    return clickEnabled;
  };

  handleGrant = (e: GestureResponderEvent, gesture: PanResponderGestureState) => {
    if (this.isThumbFocus) {
      this.locked = true;
      this.firPropsEvent(this.props.onGrant, this.state.value);
    }
  };

  handleMove = (e: GestureResponderEvent, gesture: PanResponderGestureState) => {
    if (this.isThumbFocus) {
      const value = this.handleGestureMove(gesture);
      this.firPropsEvent(this.props.onMove, value);
    }
  };

  handleRelease = (e: GestureResponderEvent, gesture: PanResponderGestureState) => {
    if (this.isThumbFocus) {
      this.locked = false;
      const value = this.handleGestureMove(gesture, true);
      this.setState({ value });
      this.firPropsEvent(this.props.onRelease, value);
    } else if (this.props.clickEnabled) {
      // Click to select color
      const now = +new Date();
      if (Math.abs(gesture.dx) < 4 && Math.abs(gesture.dy) < 4 && now - this.grantTime < 300) {
        // Click position
        const { locationX, locationY } = e.nativeEvent;
        const { x: newX, y: newY } = this.formatCoor(locationX, locationY);
        const value = this.coorToValue({ x: newX, y: newY });
        const coor = this.valueToCoor(value, { x: newX, y: newY });
        const color = this.valueToColor(value);
        this.updateThumbPosition(coor, color, true);

        this.firPropsEvent(this.props.onPress, value);
      }
    }
  };

  handleGestureMove(e: PanResponderGestureState, isEnd = false) {
    const { dx, dy } = e;
    const { x, y } = this.thumbPosition;
    // Boundary processing
    const { x: newX, y: newY } = this.formatCoor(x + dx, y + dy);

    // Convert to actual value, then convert back to coordinates
    const value = this.coorToValue({ x: newX, y: newY });
    const coor = this.valueToCoor(value, { x: newX, y: newY });
    const color = this.valueToColor(value);
    this.updateThumbPosition(coor, color, isEnd);
    return value;
  }

  formatCoor(x: any, y: number) {
    const {
      width: validWidth,
      height: validHeight,
      x: validStartX,
      y: validStartY,
    } = this.validBound;
    // Boundary processing
    if (x < validStartX) {
      x = validStartX;
    } else if (x > validWidth + validStartX) {
      x = validWidth + validStartX;
    }
    if (y < validStartY) {
      y = validStartY;
    } else if (y > validHeight + validStartY) {
      y = validHeight + validStartY;
    }

    return { x, y };
  }

  updateThumbPosition(coor: Point, color: string, isEnd: boolean) {
    // @ts-ignore
    this.thumbRef && this.thumbRef.setNativeProps({ color, ...coor });
    if (isEnd) {
      this.color = color;
      this.thumbPosition = coor;
    }
  }

  handleViewBoxChange = async (thumbSize: number) => {
    this.validBound = {
      width: this.pickerWidth - thumbSize,
      height: this.pickerHeight - thumbSize,
      x: thumbSize / 2,
      y: thumbSize / 2,
    };
    await this.props.initData(this.validBound);
    this.thumbPosition = this.valueToCoor(this.props.value);
    this.forceUpdate();
  };

  handlePickerLayout = async (e: LayoutChangeEvent) => {
    const { thumbSize, lossColor, lossShow } = this.props;
    const { width, height } = e.nativeEvent.layout;
    if (width !== this.pickerWidth || height !== this.pickerHeight) {
      this.pickerWidth = width || 10; // svg size cannot be 0, ensure value is greater than 0 here
      this.pickerHeight = height || 10; // svg size cannot be 0, ensure value is greater than 0 here
      if (!this.showPicker) {
        this.showPicker = true;
        this.color = lossShow ? lossColor : this.valueToColor(this.props.value);
      }
      await this.handleViewBoxChange(thumbSize);
    }
  };

  render() {
    const {
      style,
      bgs,
      thumbComponent: ThumbView,
      disabled,
      thumbSize,
      thumbImg,
      opacityAnimationValue,
    } = this.props;
    const { showPicker, pickerHeight, pickerWidth, thumbPosition } = this;
    return (
      <View style={{ flex: 1 }}>
        <View
          style={[{ flex: 1 }, style]}
          {...this._panResponder.panHandlers}
          pointerEvents="box-only"
          onLayout={this.handlePickerLayout}
        >
          {showPicker && (
            <Animated.View style={{ flex: 1, opacity: this.state.fadeAnim }}>
              <Svg
                height={pickerHeight}
                width={pickerWidth}
                viewBox={`0 0 ${pickerWidth} ${pickerHeight}`}
              >
                <Defs>
                  {bgs.map(({ x1 = '0%', x2 = '100%', y1 = '0%', y2 = '0%', colors }, index) => (
                    <LinearGradient
                      key={index}
                      id={`${this.linearGradientId}_${index}`}
                      x1={x1}
                      x2={x2}
                      y1={y1}
                      y2={y2}
                    >
                      {colors.map((color, i) => (
                        <Stop key={i} {...color} />
                      ))}
                    </LinearGradient>
                  ))}
                </Defs>
                {bgs.map((bg, index) => (
                  <Rect
                    key={index}
                    fill={`url(#${this.linearGradientId}_${index})`}
                    x="0"
                    y="0"
                    width={pickerWidth}
                    height={pickerHeight}
                  />
                ))}
              </Svg>
            </Animated.View>
          )}
          {/* render thumb */}
          {showPicker && (
            <ThumbView
              ref={(ref: React.ReactNode) => {
                this.thumbRef = ref;
              }}
              {...thumbPosition}
              img={thumbImg}
              size={thumbSize}
              color={this.color}
              isBlackColor={opacityAnimationValue < 1} // Turn off the light color black
              // disabled={disabled}
            />
          )}
        </View>
      </View>
    );
  }
}
