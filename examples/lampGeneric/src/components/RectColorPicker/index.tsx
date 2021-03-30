/* eslint-disable no-continue */
/* eslint-disable no-prototype-builtins */
/* eslint-disable max-len */
/* eslint-disable react/static-property-placement */
import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  ViewStyle,
  GestureResponderEvent,
  PanResponderGestureState,
  LayoutChangeEvent,
  StyleProp,
} from 'react-native';
import styleEqual from 'style-equal';
import { Utils } from 'tuya-panel-kit';
import _ from 'lodash';
import Hue from './hue';
import Gesture, { GestureProps } from './gesture';
import Res from '../../res';

export interface PickerData {
  x: number;
  y: number;
  k: number;
  percentX: number;
  percentY: number;
  hsb: number[];
  hex: string;
  rgb: number[];
}

const { color: Color } = Utils.ColorUtils;
const { convert } = Utils.RatioUtils;

const noop = () => null;

const _thumbWidth = convert(32);
const _thumbHeight = convert(32);
const isEqual = (x: any, y: any) => {
  if (x === y) return true;
  if (!(x instanceof Object) || !(y instanceof Object)) return false;
  if (x.constructor !== y.constructor) return false;
  // eslint-disable-next-line no-restricted-syntax
  for (const p in x) {
    if (!x.hasOwnProperty(p)) continue;
    if (!y.hasOwnProperty(p)) return false;
    if (x[p] === y[p]) continue;
    if (typeof x[p] !== 'object') return false;
    if (!_.isEqual(x[p], y[p])) return false;
  }
  // eslint-disable-next-line no-restricted-syntax
  for (const q in y) {
    if (y.hasOwnProperty(q) && !x.hasOwnProperty(q)) return false;
  }
  return true;
};

function getReactInstanceProps(inst) {
  let style = {};
  if (inst.props) {
    style = inst.props.style;
  } else if (inst._currentElement && inst._currentElement.props) {
    style = inst._currentElement.props.style;
  }
  return style;
  // return inst.props ? inst.props.style : inst._currentElement.props.style;
}

/* istanbul ignore next */
function satPropType(values) {
  return (props, propName, componentName) => {
    const value = props[propName];
    if (value === undefined || value === 'none') {
      return;
    }

    let index = values.indexOf(value);
    if (index === -1) {
      return new Error(
        `Invalid prop \`${propName}\` supplied to \`${componentName}\`. Validation failed.`
      );
    }

    if (props.axis === 'x') {
      index = ['2t', '2b'].indexOf(value);
      if (index === -1) {
        return new Error(
          `Invalid prop \`${propName}\` supplied to \`${componentName}\` when prop axis set \`x\`. Validation failed.`
        );
      }
    }

    if (props.axis === 'y') {
      index = ['2l', '2r'].indexOf(value);
      if (index === -1) {
        return new Error(
          `Invalid prop \`${propName}:${value}\` supplied to \`${componentName}\` when prop axis set \`y\`. Validation failed.`
        );
      }
    }
  };
}

interface RectColorPickerProps {
  accessibilityLabel?: string;
  style: ViewStyle | ViewStyle[];
  hueStyle: ViewStyle | ViewStyle[];
  thumbStyle: ViewStyle | ViewStyle[];
  minK?: number;
  maxK?: number;
  disabled?: boolean;
  kelvin?: boolean;
  overstep?: boolean;
  withFollowColor?: boolean;
  axis?: 'x' | 'y';
  direction?: 'horizontal' | 'all' | 'vertical';
  saturation?: string;
  hsb?: number[];
  stops?: any[]; // 自定义滚动条颜色
  // 归一化坐标
  position?: { x: number; y: number };
  onStart?: (data: PickerData) => void;
  onValueChange?: (data: PickerData) => void;
  onComplete?: (data: PickerData) => void;
  onChange?: (data: PickerData) => void;
  renderThumb?: (param?: any) => void;
  hueColorHeight?: number;
  hueColorWidth?: number;
  hueBorderRadius?: number;
  formatKelvin?: (x: number, y: number, hueWidth: number, hueHeight: number) => number;
  children?: any;
}

interface RectColorPickerState {
  hueWidth: number;
  hueHeight: number;
  paddingHorizontal: number;
  paddingVertical: number;
  thumbWidth: number;
  thumbHeight: number;
}

export default class RectColorPicker extends Gesture<
  RectColorPickerProps & GestureProps,
  RectColorPickerState
> {
  static defaultProps = {
    ...Gesture.defaultProps,
    minK: 2500,
    maxK: 9000,
    disabled: false,
    kelvin: false,
    withFollowColor: false, // thumb背景色是否跟着底色
    overstep: false, // thumb 是否可以超出边界
    axis: 'x', // 色相的方向
    direction: 'horizontal', // thumb 滑动的方向
    saturation: 'none', // 饱和度方向
    hsb: [120, 100, 100],
    stops: null,
    onChange: null,
    renderThumb: props => <Image source={Res.thumbBg} {...props} />,
    hueColorHeight: null,
    hueColorWidth: null,
    hueBorderRadius: 0,
  };

  __root: View;

  totalHueLen: number;

  totalSatLen: number;

  _thumbInst: View;

  constructor(props: RectColorPickerProps & GestureProps) {
    super(props);
    const { width, height, paddingHorizontal, paddingVertical } = this.getMeasureFromStyle(
      props.style
    );

    let { width: thumbWidth, height: thumbHeight } = this.getMeasureFromStyle(props.thumbStyle);

    if (!thumbHeight) thumbHeight = _thumbHeight;
    if (!thumbWidth) thumbWidth = _thumbWidth;

    this.state = {
      hueWidth: width,
      hueHeight: height,
      paddingHorizontal,
      paddingVertical,
      thumbWidth,
      thumbHeight,
    };
  }

  eventHandle({ locationX, locationY }: any, fn: (data: PickerData) => void) {
    const { thumbWidth, thumbHeight } = this.state;
    const { withFollowColor } = this.props;
    const pos = { x: locationX, y: locationY };
    const { x, y } = this.getThumbPosition(pos);
    const colorK = this.getColorKelvinByPosition({
      x: x + thumbWidth / 2,
      y: y + thumbHeight / 2,
    });
    const normalizedPos = this.getNormalizedPosition(pos);
    const _thumbStyle: ViewStyle = { left: x, top: y };
    if (withFollowColor) {
      _thumbStyle.backgroundColor = colorK.hex;
    }
    this.setThumbStyle(_thumbStyle);
    const data = { ...colorK, ...normalizedPos };
    typeof fn === 'function' && fn(data);
    typeof this.props.onChange === 'function' && this.props.onChange(data);
  }

  onGrant(e: GestureResponderEvent, gesture: PanResponderGestureState) {
    const fn = this.props.onStart;
    this.eventHandle(gesture, fn!);
  }

  onMove(e: GestureResponderEvent, gesture: PanResponderGestureState) {
    const fn = this.props.onValueChange;
    this.eventHandle(gesture, fn!);
  }

  onRelease(e: GestureResponderEvent, gesture: PanResponderGestureState) {
    const fn = this.props.onComplete;
    this.eventHandle(gesture, fn!);
  }

  setInstance = (ref: View) => {
    this.__root = ref;
  };

  // 归一化坐标
  getNormalizedPosition({ x, y }: { x: number; y: number }) {
    const { hueWidth, hueHeight } = this.state;
    let _x = x / hueWidth;
    let _y = y / hueHeight;

    _x = _x < 0 ? 0 : _x > 1 ? 1 : _x;
    _y = _y < 0 ? 0 : _y > 1 ? 1 : _y;

    return {
      x: _x,
      y: _y,
    };
  }

  // 获取实际坐标
  getRealPosition({ x, y }: { x: number; y: number }) {
    const { hueWidth, hueHeight } = this.state;

    return {
      x: x * hueWidth,
      y: y * hueHeight,
    };
  }

  getColorKelvinByPosition({ x, y }: { x: number; y: number }) {
    const { hueWidth, hueHeight, thumbWidth, thumbHeight } = this.state;
    const {
      axis,
      saturation,
      kelvin,
      minK = 2500,
      maxK = 9000,
      formatKelvin,
      overstep,
    } = this.props;

    const isHorizontal = axis === 'x';
    let h = 0;
    let s = 100;
    let b = 100;
    let maxSat = 100;
    let k = 2500;

    let hueLen = isHorizontal ? x : y;
    if (!overstep) {
      hueLen -= isHorizontal ? thumbWidth / 2 : thumbHeight / 2;
    }

    if (kelvin) {
      if (typeof formatKelvin === 'function') {
        k = formatKelvin(x, y, hueWidth, hueHeight);
      } else {
        k = minK + (hueLen * (maxK - minK)) / this.totalHueLen;
      }
      const rgb = Color.kelvin2rgb(k);
      const hsb = Color.rgb2hsb(...rgb);
      [h, s, b] = hsb;
      maxSat = s;
    } else {
      h = (hueLen * 360) / this.totalHueLen;
    }

    let satLen = y;
    if (!overstep) satLen -= thumbHeight / 2;
    if (saturation === '2b') satLen = this.totalSatLen - satLen;

    if (!isHorizontal) {
      satLen = x;
      if (!overstep) satLen -= thumbWidth / 2;
      if (saturation === '2r') satLen = this.totalSatLen - satLen;
    }

    if (saturation !== 'none') {
      s = (satLen * maxSat) / this.totalSatLen;
    }

    return {
      k,
      percentX: hueLen / this.totalHueLen,
      percentY: satLen / this.totalSatLen,
      hsb: [h, s, b],
      hex: Color.hsb2hex(h, s, b),
      rgb: Color.hsb2rgb(h, s, b, 100),
    };
  }

  getPositionByHsb([h, s, v]: [number, number, number]) {
    const { thumbHeight, thumbWidth } = this.state;
    const { axis, saturation, overstep } = this.props;
    const isHorizontal = axis === 'x';
    const pos = (h * this.totalHueLen) / 360;
    const thumbInst = this.getThumbInstance();
    const thumbStyle: ViewStyle = getReactInstanceProps(thumbInst);
    let { top: y = 0, left: x = 0 } = StyleSheet.flatten(thumbStyle);

    if (isHorizontal) {
      x = pos;
      if (saturation === '2t') {
        y = (s * this.totalSatLen) / 100;
      } else {
        y = ((100 - s) * this.totalSatLen) / 100;
      }
    } else {
      y = pos;
      if (saturation === '2l') {
        x = (s * this.totalSatLen) / 100;
      } else {
        x = ((100 - s) * this.totalSatLen) / 100;
      }
    }
    if (!overstep) {
      x += thumbWidth / 2;
      y += thumbHeight / 2;
    }
    return { x, y };
  }

  shouldComponentUpdate(nextProps: RectColorPickerProps, nextState: RectColorPickerState) {
    const { props } = this;
    if (this.notHandleReceivePropsWhenTouching) {
      return false;
    }
    if (props.disabled !== nextProps.disabled) {
      return true;
    }
    const {
      hueWidth: oldWidth,
      hueHeight: oldHeight,
      paddingHorizontal: oldPaddingHorizontal,
      paddingVertical: oldPaddingVertical,
      thumbWidth: oldThumbWidth,
      thumbHeight: oldThumbHeight,
    } = this.state;
    const {
      hueWidth: newWidth,
      hueHeight: newHeight,
      paddingHorizontal: newPaddingHorizontal,
      paddingVertical: newPaddingVertical,
      thumbWidth: newThumbWidth,
      thumbHeight: newThumbHeight,
    } = nextState;

    return (
      oldWidth !== newWidth ||
      oldHeight !== newHeight ||
      newPaddingHorizontal !== oldPaddingHorizontal ||
      newPaddingVertical !== oldPaddingVertical ||
      oldThumbWidth !== newThumbWidth ||
      oldThumbHeight !== newThumbHeight ||
      props.kelvin !== nextProps.kelvin ||
      !isEqual(props.hsb, nextProps.hsb) ||
      !isEqual(props.position, nextProps.position) ||
      !styleEqual(this.props.style, nextProps.style)
    );
  }

  onHueLayoutHandle = ({ nativeEvent }: LayoutChangeEvent) => {
    const { width, height } = nativeEvent.layout;

    this.setState(
      {
        hueWidth: width,
        hueHeight: height,
      },
      this.initialize
    );
  };

  componentDidMount() {
    const { hueWidth, hueHeight } = this.state;
    if (hueWidth && hueHeight) {
      this.initialize();
    }
  }

  componentDidUpdate(prevProps: RectColorPickerProps) {
    const { props } = this;
    if (
      !isEqual(props.hsb, prevProps.hsb) ||
      !isEqual(props.position, prevProps.position) ||
      props.kelvin !== prevProps.kelvin
    ) {
      this.initialize();
    }
  }

  initialize() {
    const { withFollowColor, direction, overstep, axis } = this.props;
    const { hueWidth, hueHeight, thumbWidth, thumbHeight } = this.state;
    const isHorizontal = axis === 'x';
    if (overstep) {
      this.totalHueLen = isHorizontal ? hueWidth : hueHeight;
      this.totalSatLen = isHorizontal ? hueHeight : hueWidth;
    } else {
      this.totalHueLen = isHorizontal ? hueWidth - thumbWidth : hueHeight - thumbHeight;
      this.totalSatLen = isHorizontal ? hueHeight - thumbHeight : hueWidth - thumbWidth;
    }
    let { hsb, position } = this.props;
    if (position) {
      position = this.getRealPosition(position);
      hsb = this.getColorKelvinByPosition(position).hsb;
    } else {
      position = this.getPositionByHsb(hsb as [number, number, number]);
    }
    const { x, y } = this.getThumbPosition(position);
    const _thumbStyle: ViewStyle = { left: x, top: y };
    if (withFollowColor) {
      hsb = direction === 'all' ? hsb : [hsb![0], 100, 100];
      const hex = Color.hsb2hex(...(hsb as [number, number, number]));
      _thumbStyle.backgroundColor = hex;
    }
    this.setThumbStyle(_thumbStyle);
  }

  getMeasureFromStyle(style: StyleProp<ViewStyle>) {
    const {
      width,
      height,
      padding = 0,
      paddingTop = 0,
      paddingRight = 0,
      paddingBottom = 0,
      paddingLeft = 0,
      paddingHorizontal = 0,
      paddingVertical = 0,
    } = StyleSheet.flatten(style || {});

    return {
      width,
      height,
      paddingHorizontal: padding || paddingHorizontal || Math.min(+paddingLeft, +paddingRight),
      paddingVertical: padding || paddingVertical || Math.min(+paddingTop, +paddingBottom),
    };
  }

  // eslint-disable-next-line react/no-deprecated
  componentWillReceiveProps(nextProps: RectColorPickerProps) {
    const { width, height, paddingHorizontal, paddingVertical } = this.getMeasureFromStyle(
      nextProps.style
    );

    let { width: thumbWidth, height: thumbHeight } = this.getMeasureFromStyle(nextProps.thumbStyle);

    const { direction } = this.props;

    if (!thumbHeight) thumbHeight = _thumbHeight;
    if (!thumbWidth) thumbWidth = _thumbWidth;

    if (direction === 'vertical') {
      thumbWidth = _thumbHeight;
      thumbHeight = _thumbWidth;
    }

    const { state } = this;
    const s: any = {};

    if (state.hueWidth !== width && width !== undefined) {
      s.hueWidth = width;
    }
    if (state.hueHeight !== height && height !== undefined) {
      s.hueHeight = height;
    }
    if (state.paddingHorizontal !== paddingHorizontal && paddingHorizontal !== undefined) {
      s.paddingHorizontal = paddingHorizontal;
    }
    if (state.paddingVertical !== paddingVertical && paddingVertical !== undefined) {
      s.paddingVertical = paddingVertical;
    }
    if (state.thumbWidth !== thumbWidth && thumbWidth !== undefined) {
      s.thumbWidth = thumbWidth;
    }
    if (state.thumbHeight !== thumbHeight && thumbHeight !== undefined) {
      s.thumbHeight = thumbHeight;
    }
    if (Object.keys(s).length) {
      this.setState(s);
    }
  }

  getThumbPosition({ x, y }: { x: number; y: number }) {
    const { hueWidth, hueHeight, thumbWidth, thumbHeight } = this.state;
    const { overstep, direction } = this.props;
    let _x: number, _y: number;
    if (direction === 'horizontal') {
      _y = (hueHeight - thumbHeight) / 2;
      _x = x - thumbWidth / 2;
      if (overstep) {
        if (_x < -thumbWidth / 2) _x = -thumbWidth / 2;
        if (_x > hueWidth - thumbWidth / 2) _x = hueWidth - thumbWidth / 2;
      } else {
        if (_x < 0) _x = 0;
        if (_x > hueWidth - thumbWidth) _x = hueWidth - thumbWidth;
      }
    } else if (direction === 'vertical') {
      _x = (hueWidth - thumbWidth) / 2;
      _y = y - thumbHeight / 2;
      if (overstep) {
        if (_y < -thumbHeight / 2) _y = -thumbHeight / 2;
        if (_y > hueHeight - thumbHeight / 2) _y = hueHeight - thumbHeight / 2;
      } else {
        if (_y < 0) _y = 0;
        if (_y > hueHeight - thumbHeight) _y = hueHeight - thumbHeight;
      }
    } else {
      _y = y - thumbHeight / 2;
      _x = x - thumbWidth / 2;
      if (overstep) {
        if (_x < -thumbWidth / 2) _x = -thumbWidth / 2;
        if (_x > hueWidth - thumbWidth / 2) _x = hueWidth - thumbWidth / 2;
        if (_y < -thumbHeight / 2) _y = -thumbHeight / 2;
        if (_y > hueHeight - thumbHeight / 2) _y = hueHeight - thumbHeight / 2;
      } else {
        if (_x < 0) _x = 0;
        if (_x > hueWidth - thumbWidth) _x = hueWidth - thumbWidth;
        if (_y < 0) _y = 0;
        if (_y > hueHeight - thumbHeight) _y = hueHeight - thumbHeight;
      }
    }
    return {
      x: _x,
      y: _y,
    };
  }

  setThumbInstance = (inst: View) => {
    this._thumbInst = inst;
  };

  getThumbInstance() {
    return this._thumbInst;
  }

  setThumbStyle(style: StyleProp<ViewStyle>) {
    const inst = this.getThumbInstance();
    inst.setNativeProps({
      style,
    });
  }

  render() {
    const responder = this.getResponder();
    const {
      children,
      style,
      thumbStyle,
      disabled,
      hueStyle,
      saturation,
      axis,
      renderThumb,
      kelvin,
      overstep,
      hueColorWidth,
      hueColorHeight,
      stops,
      hueBorderRadius,
      ...props
    } = this.props;
    const { hueWidth, hueHeight, thumbHeight, thumbWidth } = this.state;
    let hueProps;
    const extraProps: any = {};

    if (hueWidth && hueHeight) {
      hueProps = {
        width: hueWidth,
        height: hueHeight,
      };
    }
    if (hueColorHeight && hueColorWidth) {
      extraProps.width = hueColorWidth;
      extraProps.height = hueColorHeight;
    }
    const newProps: any = _.cloneDeep(props);
    delete newProps.position;
    delete newProps.direction;

    return (
      <View
        ref={this.setInstance}
        style={[{ overflow: 'hidden', justifyContent: 'center' }, style]}
        {...newProps}
        {...responder}
        onLayout={hueWidth && hueHeight ? noop : this.onHueLayoutHandle}
      >
        {hueProps ? (
          <View style={[{ overflow: 'hidden' }, hueStyle]}>
            <Hue
              overstep={overstep}
              kelvin={kelvin}
              saturation={saturation}
              axis={axis}
              stops={stops}
              hueBorderRadius={hueBorderRadius}
              {...hueProps}
              {...extraProps}
            />
            {disabled ? (
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  bottom: 0,
                  left: 0,
                  backgroundColor: '#666',
                  opacity: 0.6,
                }}
              />
            ) : null}
          </View>
        ) : null}
        {renderThumb &&
          renderThumb({
            ref: this.setThumbInstance,
            style: [
              {
                position: 'absolute',
                width: thumbWidth,
                height: thumbHeight,
              },
              thumbStyle,
              disabled ? { backgroundColor: 'transparent' } : null,
            ],
          })}
        {children}
      </View>
    );
  }
}
