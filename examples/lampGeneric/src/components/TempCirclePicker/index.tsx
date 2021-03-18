/* eslint-disable @typescript-eslint/no-empty-function */
import React from 'react';
import { Svg, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import {
  View,
  StyleSheet,
  PanResponder,
  ViewStyle,
  PanResponderInstance,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';
import { Utils } from 'tuya-panel-kit';

const { convertX: cx } = Utils.RatioUtils;
interface TempCirclePickerProps {
  value: number;
  min: number; // 值的最小值
  max: number; // 值的最大值
  minRangeValue: number;
  maxRangeValue: number;
  offsetAngle: number; // 缺少的角度， 以Y轴正方向为零度
  innerRadius: number; // 内半径
  outerRadius: number; // 外半径
  thumbSize: number; // 滑块大小
  touchThumbSize: number; // 滑块点击区大小
  showThumb: boolean;
  wrapperStyle: ViewStyle | ViewStyle[]; // 组件wrapper 样式
  thumbStyle: ViewStyle | ViewStyle[]; // 滑块样式
  stopColors: any[]; // 环底色
  disabled: boolean; // 是否可用
  onGrant: (value: number) => void; // 开发滑动
  onMove: (value: number) => void; // 滑动中
  onRelease: (value: number) => void; // 滑动结束
  renderThumb: () => React.ReactElement;
  renderTrack: () => React.ReactElement;
}

export default class TempCirclePicker extends React.Component<TempCirclePickerProps, any> {
  // eslint-disable-next-line react/static-property-placement
  static defaultProps = {
    value: 0,
    min: 0,
    max: 1000,
    minRangeValue: 0,
    maxRangeValue: 1000,
    thumbSize: cx(28),
    touchThumbSize: cx(40),
    offsetAngle: 45,
    innerRadius: cx(88),
    outerRadius: cx(120),
    wrapperStyle: null,
    stopColors: [],
    thumbStyle: null,
    disabled: false,
    showThumb: false,
    onGrant(value: number) {},
    onMove(value: number) {},
    onRelease(value: number) {},
    renderThumb: null,
    renderTrack: null,
  };

  constructor(props: TempCirclePickerProps) {
    super(props);
    this.dragEnable = false;
    this.initData(this.props);
    this.initRangeValue(this.props);
    this.handleValue(this.getRightValue(this.props));
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: this.handleSetPanResponder,
      onMoveShouldSetPanResponder: () => !this.props.disabled && this.dragEnable,
      onPanResponderTerminationRequest: () => !this.dragEnable,
      onPanResponderTerminate: this.handleTerminate,
      onPanResponderGrant: this.onGrant,
      onPanResponderMove: this.onMove,
      onPanResponderRelease: this.onRelease,
    });
  }

  // eslint-disable-next-line react/no-deprecated
  componentWillReceiveProps(nextProps: TempCirclePickerProps) {
    const {
      offsetAngle: newOffsetAngle,
      innerRadius: newInnerRadius,
      outerRadius: newOuterRadius,
      min: newMin,
      max: newMax,
      minRangeValue: newMinRangeValue,
      maxRangeValue: newMaxRangeValue,
    } = nextProps;
    const {
      offsetAngle,
      innerRadius,
      outerRadius,
      min,
      max,
      minRangeValue,
      maxRangeValue,
    } = this.props;

    if (
      offsetAngle !== newOffsetAngle ||
      innerRadius !== newInnerRadius ||
      outerRadius !== newOuterRadius
    ) {
      this.initData(nextProps);
    }
    if (
      min !== newMin ||
      max !== newMax ||
      minRangeValue !== newMinRangeValue ||
      maxRangeValue !== newMaxRangeValue
    ) {
      this.initRangeValue(nextProps);
    }

    this.handleValue(this.getRightValue(nextProps));
  }

  shouldComponentUpdate() {
    return !this.dragEnable;
  }

  onGrant = (e: GestureResponderEvent) => {
    // const { locationX, locationY } = e.nativeEvent;
    this.props.onGrant(this.getRightValue(this.props));
  };

  onMove = (e: GestureResponderEvent, gesture: PanResponderGestureState) => {
    this.handleValueChange(gesture, this.props.onMove);
  };

  onRelease = (e: GestureResponderEvent, gesture: PanResponderGestureState) => {
    this.dragEnable = false;
    const { x, y } = this.handleValueChange(gesture, this.props.onRelease);
    this.thumbX = x;
    this.thumbY = y;
  };

  getPoint(deg: number, radius: number) {
    return {
      x: -radius * Math.sin(deg) + this.centerX,
      y: radius * Math.cos(deg) + this.centerY,
    };
  }

  getPath(start: number, end: number) {
    const { innerRadius, outerRadius } = this.props;
    const pathRadius = (outerRadius - innerRadius) / 2;

    const { x: x1, y: y1 } = this.getPoint(start, innerRadius);
    const { x: x2, y: y2 } = this.getPoint(start, outerRadius);
    const { x: x3, y: y3 } = this.getPoint(end, outerRadius);
    const { x: x4, y: y4 } = this.getPoint(end, innerRadius);

    let isLargeCircle = 0;
    if (end - start > Math.PI) {
      isLargeCircle = 1;
    }
    // eslint-disable-next-line max-len
    return `M${x1} ${y1} A${pathRadius} ${pathRadius} 0 0 1 ${x2} ${y2} A${outerRadius} ${outerRadius} 0 ${isLargeCircle} 1 ${x3} ${y3} A${pathRadius} ${pathRadius} 0 0 1 ${x4} ${y4} A${innerRadius} ${innerRadius} 0 ${isLargeCircle} 0 ${x1} ${y1} Z`;
  }

  getRightValue(props: TempCirclePickerProps) {
    const { value, min, max, minRangeValue, maxRangeValue } = props;
    let newValue = value;
    if (maxRangeValue !== -1) {
      newValue = Math.min(value, max, maxRangeValue);
    } else {
      newValue = Math.min(value, max);
    }
    return Math.max(newValue, min, minRangeValue);
  }

  dragEnable: boolean;

  _panResponder: PanResponderInstance;

  thumbX: number;

  thumbY: number;

  centerX: number;

  centerY: number;

  offsetAngle: number;

  startDeg: number;

  endDeg: number;

  ringWidth: number;

  width: number;

  height: number;

  thumbDistance: number;

  minRangeDeg: number;

  maxRangeDeg: number;

  thumbRef: View;

  handleTerminate = () => {
    this.dragEnable = false;
  };

  handleSetPanResponder = (e: GestureResponderEvent) => {
    if (this.props.disabled) {
      return false;
    }
    const { locationX, locationY } = e.nativeEvent;
    // 是否在可点击范围内
    const { touchThumbSize, innerRadius, outerRadius, thumbSize } = this.props;
    const { thumbX, thumbY, centerX, centerY, minRangeDeg, maxRangeDeg } = this;
    // 点是否在thumb内
    const length = Math.sqrt((locationX - thumbX) ** 2 + (locationY - thumbY) ** 2);
    if (length * 2 < touchThumbSize) {
      this.dragEnable = true;
      return true;
    }
    const len = Math.sqrt((locationX - centerX) ** 2 + (locationY - centerY) ** 2);
    if (len >= innerRadius && len <= outerRadius) {
      this.thumbX = (locationX - centerX) / 2;
      let angle = this.coorToAngle(locationX, locationY);
      // 是否点击在环里
      if (angle <= minRangeDeg - this.offsetAngle || angle >= maxRangeDeg + this.offsetAngle) {
        return false;
      }
      if (angle < minRangeDeg) {
        angle = minRangeDeg;
      } else if (angle > maxRangeDeg) {
        angle = maxRangeDeg;
      }
      const newValue = this.degToValue(angle);
      const { x, y } = this.updateThumbPosition(newValue);
      this.thumbX = x;
      this.thumbY = y;
      this.dragEnable = true;
      return true;
    }
    return false;
  };

  coorToAngle(x: number, y: number) {
    const { centerX, centerY } = this;

    const length = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);

    let angle = Math.acos((y - centerY) / length);
    if (x > centerX) {
      angle = Math.PI * 2 - angle;
    }
    return angle;
  }

  handleValueChange = ({ dx, dy }: PanResponderGestureState, cb: (value: number) => void) => {
    const { thumbX, thumbY, minRangeDeg, maxRangeDeg } = this;
    const x = thumbX + dx;
    const y = thumbY + dy;
    let angle = this.coorToAngle(x, y);
    if (angle < minRangeDeg) {
      angle = minRangeDeg;
    } else if (angle > maxRangeDeg) {
      angle = maxRangeDeg;
    }
    const newValue = this.degToValue(angle);
    const thumbCoor = this.updateThumbPosition(newValue);
    cb && cb(newValue);
    return thumbCoor;
  };

  initData(props: TempCirclePickerProps) {
    if (this.dragEnable) {
      return;
    }
    const { offsetAngle, innerRadius, outerRadius } = props;
    this.startDeg = this.toDeg(offsetAngle);
    this.endDeg = this.toDeg(360 - offsetAngle);
    this.ringWidth = outerRadius - innerRadius;
    if (offsetAngle <= 90) {
      this.width = outerRadius * 2;
    } else {
      const halfWidth = outerRadius * Math.sin(this.startDeg);
      this.width = halfWidth * 2;
    }
    this.height = outerRadius + outerRadius * Math.cos(this.startDeg) + this.ringWidth / 2;
    this.thumbDistance = (innerRadius + outerRadius) / 2;
    this.centerX = this.width / 2;
    this.centerY = outerRadius;
    this.offsetAngle = Math.atan(this.ringWidth / 2 / this.thumbDistance);
  }

  initRangeValue(props: TempCirclePickerProps) {
    if (this.dragEnable) {
      return;
    }
    const { min, max, minRangeValue, maxRangeValue, offsetAngle } = props;
    const angleLength = 360 - offsetAngle * 2;
    const minRange = Math.max(min, minRangeValue);
    const maxRange = maxRangeValue !== -1 ? Math.min(max, maxRangeValue) : max;
    this.minRangeDeg = this.startDeg + this.toDeg((angleLength * (minRange - min)) / (max - min));
    this.maxRangeDeg = this.startDeg + this.toDeg((angleLength * (maxRange - min)) / (max - min));
  }

  handleValue(value: number) {
    if (this.dragEnable) {
      return;
    }
    const deg = this.valueToDeg(value);
    const { x, y } = this.getPoint(deg, this.thumbDistance);

    this.thumbX = x;
    this.thumbY = y;
  }

  toDeg(rad: number) {
    return (rad * Math.PI) / 180;
  }

  valueToDeg(value: number) {
    const { startDeg, endDeg } = this;
    const { min, max } = this.props;

    return startDeg + ((endDeg - startDeg) * (value - min)) / (max - min);
  }

  degToValue(deg: number) {
    const { startDeg, endDeg } = this;
    const { min, max } = this.props;

    return Math.round(min + ((deg - startDeg) * (max - min)) / (endDeg - startDeg));
  }

  updateThumbPosition(value: number) {
    const deg = this.valueToDeg(value);
    const { x, y } = this.getPoint(deg, this.thumbDistance);
    this.thumbRef &&
      this.thumbRef.setNativeProps({
        style: {
          transform: [{ translateX: x }, { translateY: y }],
        },
      });

    return { x, y };
  }

  render() {
    const {
      wrapperStyle,
      thumbSize,
      thumbStyle,
      stopColors,
      disabled,
      showThumb,
      renderThumb,
      renderTrack,
    } = this.props;
    const { startDeg, endDeg, width, height, thumbX, thumbY } = this;
    return (
      <View style={[styles.box, wrapperStyle]}>
        {typeof renderTrack === 'function' ? (
          renderTrack()
        ) : (
          <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            <Defs>
              <LinearGradient id="linear" x1="0%" x2="100%" y1="0%" y2="0%">
                {stopColors.map((item, index) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <Stop key={index} {...item} />
                ))}
              </LinearGradient>
            </Defs>
            <Path d={this.getPath(startDeg, endDeg)} fill="url(#linear)" />
          </Svg>
        )}

        {showThumb && (
          <View
            ref={(ref: View) => {
              this.thumbRef = ref;
            }}
            style={[
              styles.thumb,
              {
                left: -thumbSize / 2,
                top: -thumbSize / 2,
                width: thumbSize,
                height: thumbSize,
                borderRadius: thumbSize / 2,
                opacity: disabled ? 0.2 : 1,
              },
              thumbStyle,
              {
                transform: [{ translateX: thumbX }, { translateY: thumbY }],
              },
            ]}
          >
            {renderThumb && renderThumb()}
          </View>
        )}
        <View {...this._panResponder.panHandlers} style={[styles.eventPanel, { width, height }]} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  box: {
    alignSelf: 'center',
  },
  thumb: {
    position: 'absolute',
    backgroundColor: '#fff',
  },
  eventPanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
  },
});
