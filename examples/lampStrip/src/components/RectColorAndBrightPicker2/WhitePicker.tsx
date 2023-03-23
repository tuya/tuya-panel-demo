/* eslint-disable react/destructuring-assignment */
/* eslint-disable default-case */
import React, { Component } from 'react';
import _ from 'lodash';
import { StorageUtils } from '@tuya/tuya-panel-lamp-sdk/lib/utils';
import { View, ViewStyle } from 'react-native';
import RectPicker, {
  ValidBound,
  ILinear,
  ILinearColors,
  Point,
  defaultProps as baseDefualt,
} from './RectPicker';
import Slider, { IBrightOption } from './Slider';

export interface IWhite {
  brightness: number;
  temperature: number;
}
const defaultProps = {
  ...baseDefualt,
  brightOption: {} as IBrightOption,
  value: { brightness: 500, temperature: 500 } as IWhite,
  lossSliderColor: 'rgba(255,255,255,0.4)',
  hideBright: false,
  /**
   * 排布方向
   * leftBottom 对角线， 0在左下角
   * leftTop 对角线, 0在左上角
   * rightBottom 反向对角线, 0在右下角
   * rightTop 反向对角线, 0在右上角
   * left 从左往右，0在左边
   * right 从右往左，0在右边
   * top 从上往下，0在上边
   * bottom 从下往上，0在下边
   * @version ^0.3.0
   */
  direction: 'leftBottom' as
    | 'leftBottom'
    | 'leftTop'
    | 'rightBottom'
    | 'rightTop'
    | 'left'
    | 'right'
    | 'top'
    | 'bottom',

  bgs: [
    { offset: '0%', stopColor: '#FFCA5C', stopOpacity: 1 },
    { offset: '60%', stopColor: '#FFFFFF', stopOpacity: 1 },
    { offset: '100%', stopColor: '#CDECFE', stopOpacity: 1 },
  ] as ILinearColors[],
  onGrant(v: any, option?: { isChangeBright: boolean }) {},
  onMove(v: any, option?: { isChangeBright: boolean }) {},
  onRelease(v: any, option?: { isChangeBright: boolean }) {},
  onPress(v: any, option?: { isChangeBright: boolean }) {},
};
interface TempStorageData {
  temperature: number;
  position: Point;
}
type DefaultProps = {
  style?: ViewStyle;
  rectStyle?: ViewStyle;
  storageKey?: string;
} & Readonly<typeof defaultProps>;

type WhiteProps = DefaultProps;

let storageKeyIndex = 0;

export default class WhitePicker extends Component<WhiteProps, IWhite> {
  static defaultProps = defaultProps;

  thumbPosition: Point;

  currentTemperature: number;

  pickerRef: RectPicker;

  storageKey: string;

  pickerBound: ValidBound;

  constructor(props: WhiteProps) {
    super(props);
    // 是否定义了storageKey
    const {
      storageKey,
      value: { brightness, temperature },
    } = this.props;
    this.state = { brightness, temperature };
    if (!storageKey) {
      this.storageKey = `temperature_key_${storageKeyIndex++}`;
    } else {
      this.storageKey = storageKey;
    }
  }

  componentWillReceiveProps(nextProps: WhiteProps) {
    const {
      value: { temperature, brightness },
      thumbSize,
    } = nextProps;
    if (temperature !== this.props.value.temperature) {
      this.setState({ temperature });
      this.thumbPosition = this.autoTemperaturePosition(temperature);
      this.currentTemperature = temperature;
    }
    if (brightness !== this.props.value.brightness && brightness !== this.state.brightness) {
      this.setState({ brightness });
    }
  }

  shouldComponentUpdate(nextProps: WhiteProps, nextState: IWhite) {
    return !_.isEqual(nextProps, this.props) || !_.isEqual(nextState, this.state);
  }

  getBgs() {
    const { direction, bgs } = this.props;
    // left bottom
    let x1 = '0%';
    let y1 = '100%';
    let x2 = '100%';
    let y2 = '0%';
    switch (direction) {
      case 'leftTop':
        x1 = '0%';
        y1 = '0%';
        x2 = '100%';
        y2 = '100%';
        break;
      case 'rightBottom':
        x1 = '100%';
        y1 = '100%';
        x2 = '0%';
        y2 = '0%';
        break;
      case 'rightTop':
        x1 = '100%';
        y1 = '0%';
        x2 = '0%';
        y2 = '100%';
        break;
      case 'left':
        x1 = '0%';
        y1 = '0%';
        x2 = '100%';
        y2 = '0%';
        break;
      case 'right':
        x1 = '100%';
        y1 = '0%';
        x2 = '0%';
        y2 = '0%';
        break;
      case 'top':
        x1 = '0%';
        y1 = '0%';
        x2 = '0%';
        y2 = '100%';
        break;
      case 'bottom':
        x1 = '0%';
        y1 = '100%';
        x2 = '0%';
        y2 = '0%';
        break;
    }

    return [{ x1, y1, x2, y2, colors: bgs }] as ILinear[];
  }

  setValue({ temperature, brightness }: IWhite) {
    this.thumbPosition = this.autoTemperaturePosition(temperature);
    this.currentTemperature = temperature;
    this.setState({ temperature, brightness });
  }

  initData = async (validBound: ValidBound) => {
    let cacheEnabled = true;
    // 尺寸有变化时，不使用缓存
    if (!_.isEqual(validBound, this.pickerBound)) {
      cacheEnabled = false;
    }
    const { temperature } = this.state;
    // 获取当前positon的值
    const data = (await StorageUtils.getDevItem(this.storageKey)) as TempStorageData;
    // 是否相同色温，相同使用缓存坐标展示
    if (data && data.temperature === temperature && cacheEnabled) {
      this.thumbPosition = data.position;
      this.currentTemperature = temperature;
    } else {
      // 根据色温计算位置
      this.thumbPosition = this.autoTemperaturePosition(temperature, validBound);
      this.currentTemperature = temperature;
    }
    this.pickerBound = validBound;
  };

  autoTemperaturePosition(temperature: number, validBound?: any) {
    let position;
    if (this.pickerRef) {
      position = this.pickerRef.valueToCoor({ temperature });
    } else {
      position = this.valueToCoor(
        { temperature, brightness: this.state.brightness },
        null,
        validBound
      );
    }
    StorageUtils.setDevItem(this.storageKey, { temperature, position });
    return position;
  }

  getNormalVector({ width, height, x, y }: ValidBound) {
    switch (this.props.direction) {
      case 'leftTop':
        return { x: width, y: height, originX: x, originY: y };
      case 'rightBottom':
        return { x: -width, y: -height, originX: width + x, originY: height + y };
      case 'rightTop':
        return { x: -width, y: height, originX: width + x, originY: y };
      case 'left':
        return { x: width, y: 0, originX: x, originY: height / 2 + y };
      case 'right':
        return { x: -width, y: 0, originX: width + x, originY: height / 2 + y };
      case 'top':
        return { x: 0, y: height, originX: width / 2 + x, originY: y };
      case 'bottom':
        return { x: 0, y: -height, originX: width / 2 + x, originY: height + y };
      default:
        return { x: width, y: -height, originX: x, originY: height + y };
    }
  }

  coorToValue = ({ x, y }: Point, bound: ValidBound) => {
    const { brightness } = this.state;
    // 获取基准向量
    const normalVector = this.getNormalVector(bound);
    const vector1 = { x: x - normalVector.originX, y: y - normalVector.originY };
    // 对角线的长度
    const total = Math.sqrt(normalVector.x ** 2 + normalVector.y ** 2);
    const diff = (vector1.x * normalVector.x + vector1.y * normalVector.y) / total;
    const temperature = Math.round((diff / total) * 1000);
    return { temperature, brightness };
  };

  handleTemperaturePosition(temperature: number, bound: ValidBound) {
    //  获取基准向量
    const normalVector = this.getNormalVector(bound);
    const total = Math.sqrt(normalVector.x ** 2 + normalVector.y ** 2);
    const normal = { x: normalVector.x / total, y: normalVector.y / total };
    const length = total * (temperature / 1000);
    const position = {
      x: normal.x * length + normalVector.originX,
      y: normal.y * length + normalVector.originY,
    };
    StorageUtils.setDevItem(this.storageKey, { temperature, position });
    return position;
  }

  valueToCoor = ({ temperature }: IWhite, origin: Point, validBound: ValidBound): Point => {
    // origin 不存在时，不在滑动时候
    if (!origin) {
      let cacheEnabled = true;
      if (!_.isEqual(validBound, this.pickerBound)) {
        cacheEnabled = false;
      }
      if (this.currentTemperature === temperature && cacheEnabled) {
        if (
          this.thumbPosition &&
          typeof this.thumbPosition.x === 'number' &&
          this.thumbPosition.x >= 0
        ) {
          return this.thumbPosition;
        }
      }
      return this.handleTemperaturePosition(temperature, validBound);
    }
    StorageUtils.setDevItem(this.storageKey, {
      temperature,
      position: origin,
    });
    this.currentTemperature = temperature;
    this.thumbPosition = origin;
    return origin;
  };

  valueToColor = (value: IWhite): string => {
    // const { temperature } = value;
    // return ColorUtils.temp2rgb(temperature);
    return 'transparent';
  };

  firPropsEvent(cb: Function, ...args: any[]) {
    typeof cb === 'function' && cb(...args);
  }

  onBrightGrant = () => {
    const { brightness, temperature } = this.state;
    this.firPropsEvent(this.props.onGrant, { brightness, temperature }, { isChangeBright: true });
  };

  onBrightMove = (brightness: number) => {
    const { temperature } = this.state;
    this.firPropsEvent(this.props.onMove, { temperature, brightness }, { isChangeBright: true });
  };

  onBrightRelease = (brightness: number) => {
    const { temperature } = this.state;
    this.setState({ temperature, brightness });
    this.firPropsEvent(this.props.onRelease, { temperature, brightness }, { isChangeBright: true });
  };

  onBrightPress = (brightness: number) => {
    const { temperature } = this.state;
    this.setState({ temperature, brightness });
    this.firPropsEvent(this.props.onPress, { temperature, brightness }, { isChangeBright: true });
  };

  handlePickerGrant = () => {
    const { temperature, brightness } = this.state;
    this.firPropsEvent(this.props.onGrant, { temperature, brightness });
  };

  handlePickerMove = (white: IWhite) => {
    this.firPropsEvent(this.props.onMove, white);
  };

  handlePickerRelease = (white: IWhite) => {
    this.setState({ ...white });
    this.firPropsEvent(this.props.onRelease, white);
  };

  handlePickerPress = (white: IWhite) => {
    this.setState({ ...white });
    this.firPropsEvent(this.props.onPress, white);
  };

  render() {
    const {
      value,
      style,
      rectStyle,
      brightOption,
      lossShow,
      lossSliderColor,
      clickEnabled,
      hideBright,
      bgs,
      opacityAnimationValue,
      disabled,
      ...pickerProps
    } = this.props;
    const { temperature, brightness } = this.state;
    const sliderProps: any = {};
    if (lossShow) {
      sliderProps.activeColor = lossSliderColor;
    }
    return (
      <View style={[{ flex: 1 }, style]}>
        <RectPicker
          opacityAnimationValue={opacityAnimationValue}
          ref={(ref: RectPicker) => {
            this.pickerRef = ref;
          }}
          coorToValue={this.coorToValue}
          valueToColor={this.valueToColor}
          valueToCoor={this.valueToCoor}
          value={{ temperature, brightness }}
          lossShow={lossShow}
          clickEnabled={clickEnabled}
          disabled={disabled}
          {...pickerProps}
          bgs={this.getBgs()}
          style={rectStyle}
          onGrant={this.handlePickerGrant}
          onMove={this.handlePickerMove}
          onRelease={this.handlePickerRelease}
          onPress={this.handlePickerPress}
          initData={this.initData}
        />
        {!hideBright && (
          <Slider
            {...brightOption}
            {...sliderProps}
            opacityAnimationValue={opacityAnimationValue}
            disabled={disabled}
            clickEnabled={clickEnabled}
            value={brightness}
            onGrant={this.onBrightGrant}
            onMove={this.onBrightMove}
            onRelease={this.onBrightRelease}
            onPress={this.onBrightPress}
          />
        )}
      </View>
    );
  }
}
