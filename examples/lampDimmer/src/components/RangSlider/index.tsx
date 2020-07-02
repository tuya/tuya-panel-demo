import React from 'react';
import _ from 'lodash';
import {
  View,
  PanResponder,
  PanResponderInstance,
  PanResponderGestureState,
  GestureResponderEvent,
} from 'react-native';
import { Svg, Path, Defs, ClipPath, Rect } from 'react-native-svg';

enum DRAG_TYPE {
  MAX,
  MIN,
}

const defaultProps = {
  min: 0, // 最小值，最大值可取值的最小值
  max: 100, // 最小值，最大值可取值的最大值
  step: 1,
  value: [0, 0], // 当前值，数组下标0为最小值, 数据下标1为最大值
  minValueRange: [] as number[], // 最小值的取值范围，默认不限制
  maxValueRange: [] as number[], // 最大值的取值范围，默认不限制
  editMaxEnbled: true,
  editMinEnbled: true,
  trackColor: 'rgba(255,255,255, 0.2)',
  ActiveTrackColor: '#fff',
  style: null,
  linesNumber: 50,
  width: 300,
  height: 20,
  disabled: false,
  needFormatValue: true,
  onGrant(value?: number[]) {},
  onMove(value?: number[]) {},
  onEnd(value?: number[]) {},
  onChange(value?: number[]) {},
};

type DefaultProps = Readonly<typeof defaultProps>;
type IProps = DefaultProps;

interface IState {
  value: number[];
}

export default class RangeSlider extends React.Component<IProps, IState> {
  static defaultProps = defaultProps;
  private dragDoing: boolean = false;
  private _panResponder: PanResponderInstance;
  private dragType: DRAG_TYPE = DRAG_TYPE.MAX;
  private rangeRectRef: React.ReactNode;
  constructor(props: IProps) {
    super(props);
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: this.handleSetPanResponder,
      onMoveShouldSetPanResponder: () => {
        const { disabled, editMaxEnbled, editMinEnbled } = this.props;
        return !disabled && (editMaxEnbled || editMinEnbled);
      },
      onPanResponderGrant: this.onGrant,
      onPanResponderMove: this.onMove,
      onPanResponderRelease: this.onRelease,
    });

    this.state = { value: this.initValue(this.props) };
  }

  componentWillReceiveProps(nextProps: IProps) {
    if (!this.dragDoing && !_.isEqual(nextProps.value, this.props.value)) {
      this.setState({ value: this.initValue(nextProps) });
    }
  }

  shouldComponentUpdate() {
    return !this.dragDoing;
  }

  onGrant = () => {
    this.dragDoing = true;
    this.props.onGrant(this.state.value);
  };
  onMove = (e: GestureResponderEvent, { dx }: PanResponderGestureState) => {
    this.handleMove(dx, this.props.onMove);
  };
  onRelease = (e: GestureResponderEvent, { dx }: PanResponderGestureState) => {
    const result = this.handleMove(dx, this.props.onEnd);
    this.dragDoing = false;
    this.setState({ value: result });
  };
  getPath() {
    const { linesNumber, width: svgWidth, height: svgHeight } = this.props;
    const total = linesNumber * 2 - 1;
    const lineWidth = svgWidth / total;
    const result = [];
    const x = 0;
    const y = 0;
    for (let i = 0; i < linesNumber; i++) {
      const x1 = x + i * 2 * lineWidth;
      const y1 = y;
      const x2 = x1 + lineWidth;
      const y2 = y1 + svgHeight;
      result.push(`M${x1} ${y1} L${x2} ${y1} L${x2} ${y2} L${x1} ${y2}Z`);
    }

    return result.join(' ');
  }
  getRangeRect(value: number[]) {
    const { width, height, min, max } = this.props;
    if (!value || value.length === 0) {
      return { x: 0, y: 0, width: 0, height };
    }
    const minValue = value[0] || 0;
    const maxValue = value[1] || 0;
    const minX = (width * (minValue - min)) / (max - min);
    const maxX = (width * (maxValue - min)) / (max - min);
    return {
      x: minX,
      y: 0,
      width: Math.max(maxX - minX, 1), // 确保有显示效果
      height,
    };
  }
  coorToValue(x: number) {
    const { width, min, max, step } = this.props;
    const stepWidth = width / ((max - min) / step);
    return Math.round(x / stepWidth) * step + min;
  }
  initValue(props: IProps) {
    const { value, minValueRange, maxValueRange, needFormatValue } = props;
    const minValue = value ? value[0] : 0;
    const maxValue = value ? value[1] : 0;
    if (needFormatValue) {
      return [this.formatValue(minValue, minValueRange), this.formatValue(maxValue, maxValueRange)];
    } else {
      return [minValue, maxValue];
    }
  }
  formatValue(value: number, range: number[]) {
    if (range) {
      if (value < range[0]) {
        // eslint-disable-next-line
        value = range[0];
      } else if (value > range[1]) {
        // eslint-disable-next-line
        value = range[1];
      }
    }
    return value;
  }
  handleMove(dx: number, cb: Function) {
    const { minValueRange, maxValueRange } = this.props;
    const { value } = this.state;
    const bound = this.getRangeRect(value);
    let minX = bound.x;
    let maxX = bound.x + bound.width;
    switch (this.dragType) {
      case DRAG_TYPE.MAX:
        maxX += dx;
        if (maxX <= minX) {
          maxX = minX;
        }
        break;
      case DRAG_TYPE.MIN:
        minX += dx;
        if (minX >= maxX) {
          minX = maxX;
        }
        break;
      default:
    }
    const minValue = this.formatValue(this.coorToValue(minX), minValueRange);
    const maxValue = this.formatValue(this.coorToValue(maxX), maxValueRange);

    const newValue = [minValue, maxValue];
    const newRangeRect = this.getRangeRect(newValue);
    // rect 属性需要接收string值的
    // @ts-ignore
    this.rangeRectRef.setNativeProps({
      x: newRangeRect.x.toString(),
      y: newRangeRect.y.toString(),
      width: newRangeRect.width.toString(),
      height: newRangeRect.height.toString(),
    });

    if (!_.isEqual(value, newValue)) {
      this.props.onChange(newValue);
    }

    cb && cb(newValue);

    return newValue;
  }
  handleSetPanResponder = (e: GestureResponderEvent) => {
    const { editMinEnbled, editMaxEnbled, disabled } = this.props;
    if (disabled || (!editMaxEnbled && !editMinEnbled)) {
      return false;
    }
    const { locationX } = e.nativeEvent;
    const bound = this.getRangeRect(this.state.value);
    if (!editMaxEnbled && editMinEnbled) {
      this.dragType = DRAG_TYPE.MIN;
      return true;
    }

    if (editMaxEnbled && !editMinEnbled) {
      this.dragType = DRAG_TYPE.MAX;
      return true;
    }

    // 以最小值及最大值中间为分隔线，分隔线左边为滑动最小值，分隔线右边为滑动最大值
    // 是否点到最大值可点区间
    const lineX = bound.x + bound.width / 2;
    if (locationX > lineX) {
      this.dragType = DRAG_TYPE.MAX;
    } else {
      this.dragType = DRAG_TYPE.MIN;
    }
    return true;
  };
  render() {
    const { style, width, height, trackColor, ActiveTrackColor } = this.props;
    return (
      <View style={[{ width, height }, style]}>
        <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <Defs>
            <ClipPath id="clip">
              <Rect
                ref={(ref: React.ReactNode) => (this.rangeRectRef = ref)}
                {...this.getRangeRect(this.state.value)}
              />
            </ClipPath>
          </Defs>
          <Path d={this.getPath()} fill={trackColor} />
          <Path d={this.getPath()} fill={ActiveTrackColor} clipPath="url(#clip)" />
        </Svg>
        {/* 加入zindex=1 确保安卓下事件层在最上方 */}
        <View
          style={{ width, height, position: 'absolute', top: 0, left: 0, zIndex: 1 }}
          {...this._panResponder.panHandlers}
        />
      </View>
    );
  }
}
