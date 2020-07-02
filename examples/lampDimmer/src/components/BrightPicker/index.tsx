import React from 'react';
import Color from 'color';
import { Svg, Path } from 'react-native-svg';
import {
  View,
  StyleSheet,
  PanResponder,
  PanResponderInstance,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';
import { Utils, TYText } from 'tuya-panel-kit';

const { convertX: cx } = Utils.RatioUtils;

const defaultProps = {
  value: 0,
  min: 0,
  max: 1000,
  minRangeValue: -1,
  maxRangeValue: -1,
  thumbSize: cx(28),
  touchThumbSize: cx(40),
  offsetAngle: 45,
  label: '',
  innerRadius: cx(88),
  outerRadius: cx(120),
  wrapperStyle: null,
  ringBgColor: '#505A6B',
  activeBgColor: '#FFDB6B',
  labelStyle: null,
  thumbStyle: null,
  percentStyle: null,
  disabled: false,
  onGrant(value: number) {},
  onMove(value: number) {},
  onRelease(value: number) {},
};

type DefaultProps = Readonly<typeof defaultProps>;
type IProps = {
  formatPercent?: (value: number) => number;
  renderInner?: (value: number) => React.ReactNode;
} & DefaultProps;

export default class BrightPicker extends React.Component<IProps, any> {
  static defaultProps: DefaultProps = defaultProps;
  private dragEnable: boolean = false;
  private _panResponder: PanResponderInstance;
  private thumbX: number = 0;
  private thumbY: number = 0;
  private centerX: number = 0;
  private centerY: number = 0;
  private minRangeDeg: number = 0;
  private maxRangeDeg: number = 0;
  private startDeg: number = 0;
  private endDeg: number = 0;
  private width: number = 0;
  private height: number = 0;
  private thumbDistance: number = 0;
  private ringWidth: number = 0;
  private thumbRef: React.ReactNode;
  private pathRef: React.ReactNode;
  private percentRef: React.ReactNode;
  constructor(props: IProps) {
    super(props);
    this.initData(this.props);
    this.initRangeValue(this.props);
    this.handleValue(this.getRightValue(this.props));
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: this.handleSetPanResponder,
      onMoveShouldSetPanResponder: () => !this.props.disabled && this.dragEnable,
      onPanResponderGrant: this.onGrant,
      onPanResponderMove: this.onMove,
      onPanResponderRelease: this.onRelease,
    });
  }

  componentWillReceiveProps(nextProps: IProps) {
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
  onGrant = () => {
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
    return `M${x1} ${y1} A${pathRadius} ${pathRadius} 0 0 1 ${x2} ${y2} A${outerRadius} ${outerRadius} 0 ${isLargeCircle} 1 ${x3} ${y3} A${pathRadius} ${pathRadius} 0 0 1 ${x4} ${y4} A${innerRadius} ${innerRadius} 0 ${isLargeCircle} 0 ${x1} ${y1} Z`;
  }
  getRightValue(props: IProps) {
    const { value, min, max, minRangeValue, maxRangeValue } = props;
    let newValue = value;
    if (maxRangeValue !== -1) {
      newValue = Math.min(value, max, maxRangeValue);
    } else {
      newValue = Math.min(value, max);
    }
    return Math.max(newValue, min, minRangeValue);
  }
  formatPercent(value: number) {
    if (this.props.formatPercent) {
      return this.props.formatPercent(value);
    }
    const { min, max } = this.props;
    return Math.round((100 * (value - min)) / (max - min));
  }
  handleSetPanResponder = (e: GestureResponderEvent) => {
    if (this.props.disabled) {
      return false;
    }
    const { locationX, locationY } = e.nativeEvent;
    // 是否在可点击范围内
    const { touchThumbSize } = this.props;
    const { thumbX, thumbY } = this;
    // 点是否在thumb内
    const length = Math.sqrt((locationX - thumbX) ** 2 + (locationY - thumbY) ** 2);
    if (length * 2 < touchThumbSize) {
      this.dragEnable = true;
      return true;
    }
    return false;
  };
  handleValueChange = ({ dx, dy }: PanResponderGestureState, cb: Function) => {
    const { thumbX, thumbY, centerX, centerY, minRangeDeg, maxRangeDeg } = this;
    const x = thumbX + dx;
    const y = thumbY + dy;

    const length = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);

    let angle = Math.acos((y - centerY) / length);
    if (x > centerX) {
      angle = Math.PI * 2 - angle;
    }

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
  initData(props: IProps) {
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
      const halfWidth = outerRadius * Math.sin(offsetAngle);
      this.width = halfWidth * 2;
    }
    this.height = outerRadius + outerRadius * Math.cos(offsetAngle) + this.ringWidth;
    this.thumbDistance = (innerRadius + outerRadius) / 2;
    this.centerX = this.width / 2;
    this.centerY = outerRadius;
  }
  initRangeValue(props: IProps) {
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
    // @ts-ignore
    this.thumbRef.setNativeProps({
      style: {
        transform: [{ translateX: x }, { translateY: y }],
      },
    });
    // @ts-ignore
    this.pathRef.setNativeProps({
      d: this.getPath(this.minRangeDeg, deg),
    });

    if (this.percentRef) {
      // @ts-ignore
      this.percentRef.setText(`${this.formatPercent(value)}%`);
    }

    return { x, y };
  }
  render() {
    const {
      wrapperStyle,
      label,
      thumbSize,
      thumbStyle,
      labelStyle,
      percentStyle,
      renderInner,
      ringBgColor,
      activeBgColor,
      disabled,
    } = this.props;
    const { startDeg, endDeg, width, height, minRangeDeg, thumbX, thumbY } = this;
    const value = this.getRightValue(this.props);
    const valueDeg = this.valueToDeg(value);
    return (
      <View style={[styles.box, wrapperStyle]}>
        <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <Path d={this.getPath(startDeg, endDeg)} fill={ringBgColor} />
          <Path
            ref={(ref: React.ReactNode) => (this.pathRef = ref)}
            d={this.getPath(minRangeDeg, valueDeg)}
            fill={Color(activeBgColor)
              .alpha(disabled ? 0.2 : 1)
              .rgbString()}
          />
        </Svg>
        <View
          ref={ref => (this.thumbRef = ref)}
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
        />
        <View
          style={[
            styles.textBox,
            {
              width,
              height,
              justifyContent: 'center',
              alignItems: 'center',
              opacity: disabled ? 0.2 : 1,
            },
          ]}
        >
          {renderInner ? (
            renderInner(value)
          ) : (
            <TYText ref={ref => (this.percentRef = ref)} style={[styles.percent, percentStyle]}>
              {this.formatPercent(value)}%
            </TYText>
          )}
        </View>
        <View
          style={[
            styles.textBox,
            {
              width,
              height,
              justifyContent: 'flex-end',
              alignItems: 'center',
              opacity: disabled ? 0.2 : 1,
            },
          ]}
        >
          <TYText style={[styles.label, labelStyle]}>{label}</TYText>
        </View>
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
  },
  label: {
    fontSize: 14,
    marginBottom: 15,
  },
  textBox: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  percent: {
    fontSize: 40,
  },
});
