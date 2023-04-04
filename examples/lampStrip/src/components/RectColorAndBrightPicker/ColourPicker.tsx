/* eslint-disable react/sort-comp */
import React, { Component } from 'react';
import _ from 'lodash';
import { View, ViewStyle } from 'react-native';
import { ColorUtils } from '@tuya/tuya-panel-lamp-sdk/lib/utils';
import RectPicker, { ValidBound, ILinear, Point, defaultProps as baseDefualt } from './RectPicker';
import Slider, { IBrightOption } from './Slider';

export interface IHsv {
  hue: number;
  saturation: number;
  value: number;
}

const defaultProps = {
  ...baseDefualt,
  /**
   * Value
   */
  value: { hue: 0, saturation: 1000, value: 1000 } as IHsv,
  /**
   * Hue offset
   */
  hueOffset: 1,
  /**
   * Brightness configuration
   */
  brightOption: {} as IBrightOption,
  /**
   * Hide brightness adjustment
   */
  hideBright: false,
  /**
   * Loss of focus slider color
   */
  lossSliderColor: 'rgba(255,255,255,0.4)',
  bgs: [
    {
      colors: [
        { offset: '0%', stopColor: '#FF0000', stopOpacity: 1 },
        { offset: '12%', stopColor: '#FEAD19', stopOpacity: 1 },
        { offset: '24%', stopColor: '#F1F80E', stopOpacity: 1 },
        { offset: '36%', stopColor: '#08FB2B', stopOpacity: 1 },
        { offset: '48%', stopColor: '#04FAFC', stopOpacity: 1 },
        { offset: '60%', stopColor: '#0243FC', stopOpacity: 1 },
        { offset: '72%', stopColor: '#8700F9', stopOpacity: 1 },
        { offset: '84%', stopColor: '#FC00EF', stopOpacity: 1 },
        { offset: '96%', stopColor: '#F00A5B', stopOpacity: 1 },
        { offset: '100%', stopColor: '#FF0000', stopOpacity: 1 },
      ],
    },
    {
      x2: '0%',
      y2: '100%',
      colors: [
        { offset: '0%', stopColor: '#fff', stopOpacity: 1 },
        { offset: '16%', stopColor: '#fff', stopOpacity: 0.9 },
        { offset: '100%', stopColor: '#fff', stopOpacity: 0 },
      ],
    },
  ] as ILinear[],
  /**
   * Slide start event
   * @param v
   * @param option
   */
  onGrant: (v: any, option?: { isChangeBright: boolean }) => null,
  /**
   * Slide process event
   * @param v
   * @param option
   */
  onMove: (v: any, option?: { isChangeBright: boolean }) => null,
  /**
   * Slide end event
   * @param v
   * @param option
   */
  onRelease: (v: any, option?: { isChangeBright: boolean }) => null,

  /**
   * Click event
   * @param v
   * @param option
   * @version ^0.3.0
   */
  onPress: (v: any, option?: { isChangeBright: boolean }) => null,
};
type DefaultProps = Readonly<typeof defaultProps>;

type ColourProps = {
  /**
   * Component's style
   */
  style?: ViewStyle;
  /**
   * Style of the color selection area
   */
  rectStyle?: ViewStyle;
} & DefaultProps;

type IState = IHsv;

export default class ColourPicker extends Component<ColourProps, IState> {
  // eslint-disable-next-line react/static-property-placement
  static defaultProps: DefaultProps = defaultProps;

  constructor(props: ColourProps) {
    super(props);
    const { value } = this.props;
    this.state = { ...value };
  }

  componentWillReceiveProps(nextProps: ColourProps) {
    const { value } = this.props;
    if (!_.isEqual(nextProps.value, value)) {
      this.setState({ ...nextProps.value });
    }
  }

  shouldComponentUpdate(nextProps: ColourProps, nextState: IState) {
    return !_.isEqual(nextProps, this.props) || !_.isEqual(nextState, this.state);
  }

  coorToValue = ({ x, y }: Point, validBound: ValidBound) => {
    const { hueOffset } = this.props;
    const { width, height, x: validStartX, y: validStartY } = validBound;
    const { value } = this.state;
    let hue = Math.round(((x - validStartX) / width) * 360 + hueOffset) % 360;
    const saturation = Math.round(((y - validStartY) / height) * 1000);

    // if hueOffset !== 0 , The leftmost value is the same as the rightmost value, to ensure that you don't slide to the left by jumping to the right，
    // When sliding to the far left, hue + 1;
    if (hueOffset !== 0) {
      if (Math.abs(x - validStartX) < 1) {
        hue += 1;
      }
    }

    return { hue, saturation, value };
  };

  valueToCoor = (hsv: IHsv, origin: Point, validBound: ValidBound): Point => {
    const { hueOffset } = this.props;
    const { width, height, x: validStartX, y: validStartY } = validBound;
    const { hue, saturation } = hsv;
    let x = ((hue - hueOffset) / 360) * width;
    if (x <= 0) {
      x = width + x;
    }
    const y = (saturation / 1000) * height;

    return { x: x + validStartX, y: y + validStartY };
  };

  valueToColor = (hsv: IHsv): string => {
    const { hue, saturation, value } = hsv;
    return ColorUtils.hsv2rgba(hue!, saturation, value) || '#fff';
  };

  // eslint-disable-next-line @typescript-eslint/ban-types
  firPropsEvent(cb: Function, ...args: any[]) {
    typeof cb === 'function' && cb(...args);
  }

  onBrightGrant = () => {
    const { hue, saturation, value } = this.state;
    const { onGrant } = this.props;
    this.firPropsEvent(onGrant, { hue, saturation, value }, { isChangeBright: true });
  };

  onBrightMove = (value: number) => {
    const { hue, saturation } = this.state;
    const { onMove } = this.props;
    this.firPropsEvent(onMove, { hue, saturation, value }, { isChangeBright: true });
  };

  onBrightRelease = (value: number) => {
    const { hue, saturation } = this.state;
    const { onRelease } = this.props;
    this.setState({ value });
    this.firPropsEvent(onRelease, { hue, saturation, value }, { isChangeBright: true });
  };

  onBrightPress = (value: number) => {
    const { hue, saturation } = this.state;
    const { onPress } = this.props;
    this.setState({ value });
    this.firPropsEvent(onPress, { hue, saturation, value }, { isChangeBright: true });
  };

  handlePickerGrant = () => {
    const { hue, saturation, value } = this.state;
    const { onGrant } = this.props;
    this.firPropsEvent(onGrant, { hue, saturation, value });
  };

  handlePickerMove = (hsv: IHsv) => {
    const { onMove } = this.props;
    this.firPropsEvent(onMove, hsv);
  };

  handlePickerRelease = (hsv: IHsv) => {
    this.setState({ ...hsv });
    const { onRelease } = this.props;
    this.firPropsEvent(onRelease, hsv);
  };

  handlePickerPress = (hsv: IHsv) => {
    this.setState({ ...hsv });
    const { onPress } = this.props;
    this.firPropsEvent(onPress, hsv);
  };

  initData = async () => null;

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
      opacityAnimationValue,
      disabled,
      ...pickerProps
    } = this.props;
    const { hue, saturation, value: bright } = this.state;
    const sliderProps: any = {};
    if (lossShow) {
      sliderProps.activeColor = lossSliderColor;
    }
    return (
      <View style={[{ flex: 1 }, style]}>
        <RectPicker
          opacityAnimationValue={opacityAnimationValue}
          coorToValue={this.coorToValue}
          valueToColor={this.valueToColor}
          valueToCoor={this.valueToCoor}
          value={{ hue, saturation, value: bright }}
          lossShow={lossShow}
          clickEnabled={clickEnabled}
          disabled={disabled}
          {...pickerProps}
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
            value={bright}
            clickEnabled={clickEnabled}
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
