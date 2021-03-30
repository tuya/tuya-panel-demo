/* eslint-disable @typescript-eslint/no-empty-function */
import React, { Component } from 'react';
import {
  View,
  Image,
  PanResponder,
  StyleSheet,
  ViewStyle,
  PanResponderInstance,
  GestureResponderEvent,
  LayoutChangeEvent,
  PanResponderGestureState,
  StyleProp,
} from 'react-native';
import { Utils } from 'tuya-panel-kit';

interface HueColorData {
  r: number;
  g: number;
  b: number;
  rgbString: string;
}

interface HuePickerProps {
  accessibilityLabel: string;
  style: StyleProp<ViewStyle>;
  disabled: boolean;
  radius: number;
  innerRadius: number;
  thumbRadius: number;
  thumbInnerRadius: number;
  RingBackground: number | string | React.ReactElement;
  hue: number;
  onValueChange: (hue: number, color: HueColorData) => void;
  onComplete: (hue: number, color: HueColorData) => void;
}

export default class HuePicker extends Component<HuePickerProps> {
  // eslint-disable-next-line react/static-property-placement
  static defaultProps = {
    accessibilityLabel: 'HuePicker',
    style: null,
    disabled: false,
    radius: 132,
    innerRadius: 92,
    thumbRadius: 19,
    thumbInnerRadius: 15,
    // eslint-disable-next-line global-require
    RingBackground: require('./colorBg.png'),
    hue: 0,
    onValueChange: (hue: number, color: HueColorData) => {},
    onComplete: (hue: number, color: HueColorData) => {},
  };

  constructor(props: HuePickerProps) {
    super(props);
    const { radius, thumbRadius } = props;
    this.cx = radius - thumbRadius;
    this.cy = radius - thumbRadius;
    // 可拖动圆球至原点的固定距离（令圆球始终在在色环中居中）
    this.fixedLength = radius - this.ringSize * 0.5;
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: this.shouldSetResponder,
      onMoveShouldSetPanResponder: this.shouldSetResponder,
      onPanResponderGrant: this._handleResponderGrant,
      onPanResponderMove: this._handleResponderMove,
      onPanResponderRelease: this._handleResponderRelease,
      onPanResponderTerminationRequest: () => false,
      onPanResponderTerminate: this._handleResponderRelease,
      // onStartShouldSetResponderCapture: () => false,
      onMoveShouldSetPanResponderCapture: () => false,
    });
  }

  // eslint-disable-next-line react/no-deprecated
  componentWillReceiveProps(nextProps: HuePickerProps) {
    const { radius, innerRadius, thumbRadius } = nextProps;
    if (
      this.props.radius !== radius ||
      this.props.innerRadius !== innerRadius ||
      this.props.thumbRadius !== thumbRadius
    ) {
      this.cx = radius - thumbRadius;
      this.cy = radius - thumbRadius;
      this.fixedLength = radius - this.ringSize * 0.5;
    }
  }

  // 圆环尺寸
  get ringSize() {
    return this.props.radius - this.props.innerRadius;
  }

  getRadianByCoord(xRelativeOrigin: number, yRelativeOrigin: number) {
    const { thumbRadius } = this.props;
    const xRelativeCenter = xRelativeOrigin - this.cx - thumbRadius;
    const yRelativeCenter = yRelativeOrigin - this.cy - thumbRadius;
    let rad = Math.atan2(yRelativeCenter, xRelativeCenter);
    if (xRelativeCenter > 0 && yRelativeCenter > 0) rad = Math.PI * 2 - rad;
    if (xRelativeCenter < 0 && yRelativeCenter > 0) rad = Math.PI * 2 - rad;
    if (xRelativeCenter < 0 && yRelativeCenter < 0) rad = Math.abs(rad);
    if (xRelativeCenter > 0 && yRelativeCenter < 0) rad = Math.abs(rad);
    if (xRelativeCenter === 0 && yRelativeCenter > 0) rad = (Math.PI * 3) / 2;
    if (xRelativeCenter === 0 && yRelativeCenter < 0) rad = Math.PI / 2;
    return rad;
  }

  getHueByCoord(xRelativeOrigin: number, yRelativeOrigin: number) {
    // 0 ~ 2π
    const rad = this.getRadianByCoord(xRelativeOrigin, yRelativeOrigin);
    return (rad * 180) / Math.PI;
  }

  getCoordByHue(hue: number) {
    const rad = ((360 - hue) * Math.PI) / 180;
    const x = this.cx + this.fixedLength * Math.cos(rad);
    const y = this.cy + this.fixedLength * Math.sin(rad);
    return { x, y };
  }

  getColorInfoByHue(hue: number) {
    const { r, g, b } = Utils.ColorUtils.hsvToRgb(hue, 1, 1);
    return {
      r,
      g,
      b,
      rgbString: `rgb(${r}, ${g}, ${b})`,
    };
  }

  thumbRef: View;

  thumbInnerRef: View;

  cx: number;

  cy: number;

  fixedLength: number;

  _panResponder: PanResponderInstance;

  xRelativeOriginStart: number;

  yRelativeOriginStart: number;

  shouldSetResponder = (e: GestureResponderEvent) => {
    if (this.props.disabled) {
      return false;
    }
    const { locationX, locationY } = e.nativeEvent;
    // 是否在可点击范围内
    const { innerRadius, radius, thumbRadius } = this.props;
    const xRelativeCenter = locationX - this.cx - thumbRadius;
    const yRelativeCenter = locationY - this.cy - thumbRadius;
    const len = Math.sqrt(xRelativeCenter ** 2 + yRelativeCenter ** 2);
    if (len >= innerRadius && len <= radius) {
      return true;
    }
    return false;
  };

  _moveTo(
    xRelativeOrigin: number,
    yRelativeOrigin: number,
    callback: (hue: number, color: HueColorData) => void
  ) {
    const hue = Math.round(this.getHueByCoord(xRelativeOrigin, yRelativeOrigin));
    const { x = 0, y = 0 } = this.getCoordByHue(hue);
    const color = this.getColorInfoByHue(hue);
    this.updateThumbStyle({
      transform: [
        {
          translateX: x,
        },
        {
          translateY: y,
        },
      ],
    });
    this.updateThumbInnerStyle({
      backgroundColor: color.rgbString,
    });
    typeof callback === 'function' && callback(hue, color);
  }

  _handleResponderGrant = (e: GestureResponderEvent) => {
    const { locationX, locationY } = e.nativeEvent;
    this.xRelativeOriginStart = locationX;
    this.yRelativeOriginStart = locationY;
  };

  _handleResponderMove = (e: GestureResponderEvent, gestureState: PanResponderGestureState) => {
    const { dx, dy } = gestureState;
    const xRelativeOrigin = this.xRelativeOriginStart + dx;
    const yRelativeOrigin = this.yRelativeOriginStart + dy;
    this._moveTo(xRelativeOrigin, yRelativeOrigin, this.props.onValueChange);
  };

  _handleResponderRelease = (e: GestureResponderEvent, gestureState: PanResponderGestureState) => {
    const { dx, dy } = gestureState;
    const xRelativeOrigin = this.xRelativeOriginStart + dx;
    const yRelativeOrigin = this.yRelativeOriginStart + dy;
    this._moveTo(xRelativeOrigin, yRelativeOrigin, this.props.onComplete);
    this.xRelativeOriginStart = 0;
    this.yRelativeOriginStart = 0;
  };

  updateThumbStyle(style: StyleProp<ViewStyle>) {
    if (this.thumbRef) {
      this.thumbRef.setNativeProps({ style });
    }
  }

  updateThumbInnerStyle(style: StyleProp<ViewStyle>) {
    if (this.thumbInnerRef) {
      this.thumbInnerRef.setNativeProps({ style });
    }
  }

  renderRingBackground() {
    const { radius, RingBackground } = this.props;
    if (typeof RingBackground === 'number') {
      return (
        <Image
          style={{
            width: radius * 2,
            height: radius * 2,
            borderRadius: radius,
          }}
          source={RingBackground}
        />
      );
    }
    if (React.isValidElement(RingBackground)) {
      return React.cloneElement(RingBackground, {
        style: {
          width: radius * 2,
          height: radius * 2,
          borderRadius: radius,
          ...RingBackground.props.style,
        },
      });
    }
  }

  render() {
    const {
      accessibilityLabel,
      style,
      disabled,
      radius,
      thumbRadius,
      thumbInnerRadius,
      hue,
    } = this.props;
    const { x = 0, y = 0 } = this.getCoordByHue(hue);
    const { rgbString } = this.getColorInfoByHue(hue);
    return (
      <View
        accessibilityLabel={accessibilityLabel}
        style={style}
        pointerEvents="box-only"
        {...this._panResponder.panHandlers}
      >
        {/* 圆环 */}
        <View style={[styles.sectionRing, { width: radius * 2, height: radius * 2 }]}>
          {this.renderRingBackground()}
        </View>

        {/* 圆球 */}
        <View
          ref={(ref: View) => {
            this.thumbRef = ref;
          }}
          style={[
            styles.sectionThumb,
            {
              width: thumbRadius * 2,
              height: thumbRadius * 2,
              borderRadius: thumbRadius,
              opacity: disabled ? 0 : 1,
              transform: [
                {
                  translateX: x,
                },
                {
                  translateY: y,
                },
              ],
            },
          ]}
        >
          <View
            ref={(ref: View) => {
              this.thumbInnerRef = ref;
            }}
            style={{
              width: thumbInnerRadius * 2,
              height: thumbInnerRadius * 2,
              borderRadius: thumbInnerRadius,
              backgroundColor: rgbString,
            }}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  sectionRing: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionThumb: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    backgroundColor: '#fff',
    shadowOffset: { width: 2, height: 2 },
    shadowColor: '#000',
    shadowOpacity: 0.5,
    elevation: 2,
    transform: [
      {
        translateX: 0,
      },
      {
        translateY: 0,
      },
    ],
  },
});
