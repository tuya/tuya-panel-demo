import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Slider as SliderBase, IconFont, TYText, Utils } from 'tuya-panel-kit';

const { convertX, convertY } = Utils.RatioUtils;
const { withTheme } = Utils.ThemeUtils;
const defaultProps = {
  icon: '',
  min: 0,
  max: 1000,
  value: 500,
  style: null,
  disabled: false,
  onGrant(value: number) {},
  onMove(value: number) {},
  onRelease(value: number) {},
};
type DefaultProps = Readonly<typeof defaultProps>;
type IProps = {
  formatPercent?: (value: number) => number;
  theme: any;
} & DefaultProps;
interface IState {
  value: number;
  percent: number;
}
// @ts-ignore
@withTheme
export default class Slider extends React.Component<IProps, IState> {
  static defaultProps: DefaultProps = defaultProps;
  private percentRef: React.ReactNode;
  constructor(props: IProps) {
    super(props);

    const value = this.formatValue(this.props.value);
    this.state = {
      value,
      percent: this.countPercent(value),
    };
  }

  componentWillReceiveProps(nextProps: IProps) {
    if (this.props.value !== nextProps.value) {
      const value = this.formatValue(nextProps.value);
      this.setState({ value, percent: this.countPercent(value) });
    }
  }

  formatValue(value: number) {
    const { min, max } = this.props;
    if (value < min) {
      return min;
    } else if (value > max) {
      return max;
    }
    return value;
  }
  countPercent(value: number) {
    if (this.props.formatPercent) {
      return this.props.formatPercent(value);
    }
    const { min, max } = this.props;
    const rate = (value - min) / (max - min);

    return Math.round(rate * 100);
  }
  handleMove = (value: number) => {
    const newValue = this.formatValue(value);
    const percent = this.countPercent(newValue);
    // @ts-ignore
    this.percentRef.setText(`${percent}%`);
    this.props.onMove(newValue);
  };
  handleRelease = (value: number) => {
    const newValue = this.formatValue(value);
    const percent = this.countPercent(newValue);
    // @ts-ignore
    this.percentRef.setText(`${percent}%`);
    this.props.onRelease(newValue);
  };
  render() {
    const { icon, min, max, style, onGrant, disabled, theme } = this.props;
    const { value, percent } = this.state;
    const { fontColor, sliderMaxColor, themeColor } = theme.standard;
    return (
      <View style={[styles.container, style]}>
        <IconFont d={icon} size={convertX(18)} color={fontColor} />
        <SliderBase
          style={styles.slider}
          minimumValue={min}
          maximumValue={max}
          stepValue={1}
          value={value}
          disabled={disabled}
          maximumTrackTintColor={sliderMaxColor}
          minimumTrackTintColor={themeColor}
          thumbTintColor="#fff"
          thumbStyle={{ width: convertX(32), height: convertX(32), borderRadius: convertX(16) }}
          trackStyle={{ height: convertX(4), borderRadius: convertX(2) }}
          onSlidingStart={onGrant}
          onValueChange={this.handleMove}
          onSlidingComplete={this.handleRelease}
        />
        <TYText ref={ref => (this.percentRef = ref)} style={[styles.percent, { color: fontColor }]}>
          {percent}%
        </TYText>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: convertX(56),
  },
  slider: {
    width: convertX(239),
    marginLeft: convertX(16),
    marginRight: convertX(8),
  },
  percent: {
    fontSize: convertX(12),
    color: '#fff',
    backgroundColor: 'transparent',
    textAlign: 'center',
    width: convertX(40),
  },
});
