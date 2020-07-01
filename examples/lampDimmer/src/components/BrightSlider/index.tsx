import React from 'react';
import { StyleSheet } from 'react-native';
import { Utils, Slider, LinearGradient } from 'tuya-panel-kit';
import { Rect } from 'react-native-svg';

const { convertX: cx } = Utils.RatioUtils;
const { withTheme } = Utils.ThemeUtils;
const defaultProps = {
  style: null as any,
  value: 0,
  width: cx(295),
  min: 10,
  max: 1000,
  disabled: false,
  onSlidingStart(v: number) {},
  onSlidingComplete(v: number) {},
  onValueChange(v: number) {},
};
type DefaultProps = {
  theme?: any;
} & Readonly<typeof defaultProps>;
type IProps = DefaultProps;

class BrightnessSlider extends React.Component<IProps> {
  static defaultProps: DefaultProps = defaultProps;
  renderMaximumTrack = () => (
    <LinearGradient
      style={{ opacity: 0.8 }}
      stops={{
        '0%': 'rgba(255, 255, 255, 0.1)',
        '15%': 'rgba(255, 255, 255, 0.2)',
        '85%': 'rgba(255, 255, 255, 0.8)',
        '100%': 'rgba(255, 255, 255, 1.0)',
      }}
      y2="0%"
      x2="100%"
    >
      <Rect width={cx(327)} height={cx(40)} />
    </LinearGradient>
  );
  render() {
    const {
      style,
      width,
      value,
      onSlidingComplete,
      onSlidingStart,
      onValueChange,
      min,
      max,
      disabled,
      theme,
    } = this.props;
    return (
      <Slider
        style={[styles.slider, { width }, style]}
        trackStyle={[styles.trackStyle, { width }]}
        thumbStyle={[styles.thumbStyle, { borderColor: theme.standard.fontColor }]}
        maximumTrackTintColor="transparent"
        value={value}
        disabled={disabled}
        minimumValue={min}
        maximumValue={max}
        stepValue={1}
        onlyMaximumTrack={true}
        canTouchTrack={true}
        renderMaximumTrack={this.renderMaximumTrack}
        thumbTouchSize={{ width: cx(32), height: cx(48) }}
        onSlidingStart={onSlidingStart}
        onSlidingComplete={onSlidingComplete}
        onValueChange={onValueChange}
      />
    );
  }
}

export default withTheme(BrightnessSlider);

const styles = StyleSheet.create({
  slider: {
    width: cx(295),
  },
  trackStyle: {
    width: cx(295),
    height: cx(32),
    borderRadius: cx(4),
  },
  thumbStyle: {
    width: cx(16),
    height: cx(40),
    borderWidth: 2,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: cx(2),
  },
});
