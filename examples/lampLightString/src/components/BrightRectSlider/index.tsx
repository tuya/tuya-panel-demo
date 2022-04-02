/* eslint-disable spaced-comment */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable react/static-property-placement */
import React, { Component } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { Utils } from 'tuya-panel-kit';
import { NumberSlider } from '@tuya/tuya-panel-lamp-sdk';
import {
  NumberSliderProps,
  numberSliderDefaultProps,
} from '@tuya/tuya-panel-lamp-sdk/lib/components/slider/number-slider';
import Percent from './Percent';

const { convertX: cx } = Utils.RatioUtils;

interface Props extends NumberSliderProps {
  formatPercent?: (v: number) => number;
  iconSize?: number;
  iconColor?: string;
  percentStyle?: any;
  percentTintStyle?: ViewStyle;
  outPercentColor?: string;
  customIcon?: string;
}

export default class BrightRect1Slider extends Component<Props> {
  static defaultProps = numberSliderDefaultProps;

  private percentRef: Percent;

  private percent = 0;

  private thumbPosition = 0;

  constructor(props: Props) {
    super(props);
    this.percent = this.formatPercent(this.props.value);
  }

  formatPercent(v: number) {
    const { formatPercent, min = 10, max = 1000, showMin = min, showMax = max } = this.props;
    if (typeof formatPercent === 'function') {
      return formatPercent(v);
    }
    return Math.round(((v - showMin) * 100) / (showMax - showMin));
  }

  handleThumbChange = (x: number, value: number) => {
    this.thumbPosition = x;
    this.percent = this.formatPercent(value);
    setTimeout(() => {
      if (this.percentRef) {
        //@ts-ignore
        this.percentRef.setNativeProps({ length: x, percent: this.percent });
      } else {
        this.forceUpdate();
      }
    }, 0);
    if (this.props.onThumbChange) {
      this.props.onThumbChange(x, value);
    }
  };

  render() {
    const {
      direction,
      iconSize,
      iconColor,
      percentStyle,
      value,
      style,
      thumbStyle,
      trackStyle,
      tintStyle,
      tintColor,
      outPercentColor,
      reverse,
      percentTintStyle,
      customIcon,
      ...sliderProps
    } = this.props;
    const isVertical = direction === 'vertical';
    return (
      <NumberSlider
        {...sliderProps}
        direction={direction}
        reverse={reverse}
        tintColor={tintColor}
        value={value}
        trackSlideEnabled={true}
        thumbLimitType="outer"
        style={[isVertical ? styles.sliderVertical : styles.slider, style]}
        trackStyle={[isVertical ? styles.trackVertical : styles.track, trackStyle]}
        thumbStyle={[styles.thumb, thumbStyle]}
        tintStyle={[styles.tint, tintStyle]}
        onThumbChange={this.handleThumbChange}
      >
        <Percent
          ref={(ref: Percent) => (this.percentRef = ref)}
          // percent={percent}
          // length={thumbPosition}
          customIcon={customIcon}
          layout={isVertical ? (reverse ? 'top' : 'bottom') : reverse ? 'right' : 'left'}
          colorOver={tintColor}
          style={[styles.percent, percentStyle]}
          tintStyle={percentTintStyle}
          outColor={outPercentColor || '#fff'}
          iconSize={iconSize || 24}
          iconColor={iconColor || '#000'}
        />
      </NumberSlider>
    );
  }
}

const styles = StyleSheet.create({
  thumb: {
    opacity: 0,
  },
  slider: {
    height: cx(52),
    width: '100%',
  },
  sliderVertical: {
    width: '100%',
    height: cx(335),
  },
  tint: {
    borderRadius: 0,
  },
  track: {
    borderRadius: 0,
    height: cx(52),
  },
  trackVertical: {
    borderRadius: 0,
    width: '100%',
    height: cx(335),
  },
  percent: {
    fontSize: 14,
    color: '#000',
  },
});
