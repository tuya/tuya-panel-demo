/* eslint-disable spaced-comment */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { Component } from 'react';
import { StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Utils } from 'tuya-panel-kit';
import {
  NumberSliderProps,
  numberSliderDefaultProps,
} from '@tuya/tuya-panel-lamp-sdk/lib/components/slider/number-slider';
import Percent from './Percent';
import NumberSlider from '../NumberSlider';

const { convertX: cx } = Utils.RatioUtils;
interface IProps extends NumberSliderProps {
  formatPercent?: (v: number) => number;
  iconSize?: number;
  iconColor?: string;
  percentStyle?: any;
  percentTintStyle?: StyleProp<ViewStyle>;
  outPercentColor?: string;
  customIcon?: string;
  showPercent?: boolean;
}

export default class BrightRect1Slider extends Component<IProps> {
  // eslint-disable-next-line
  static defaultProps = {
    ...numberSliderDefaultProps,
    min: 10,
    max: 1000,
    showMin: 1,
    showAnimation: false,
  };

  private percentRef: Percent;

  private percent = 0;

  constructor(props: IProps) {
    super(props);
    const { value } = this.props;
    this.percent = this.formatPercent(value);
  }

  formatPercent(v: any) {
    const { formatPercent, min = 10, max = 1000, showMin = 1, showMax = max } = this.props;
    if (typeof formatPercent === 'function') {
      return formatPercent(v);
    }
    return Math.round(((v - showMin) * 100) / (showMax - showMin));
  }

  handleThumbChange = (x: number, value: number) => {
    const { onThumbChange } = this.props;
    this.percent = this.formatPercent(value);
    setTimeout(() => {
      if (this.percentRef) {
        // @ts-ignore
        this.percentRef.setNativeProps({ length: x, percent: this.percent });
      } else {
        this.forceUpdate();
      }
    }, 0);
    if (onThumbChange) {
      onThumbChange(x, value);
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
      tintColor = '#fff',
      outPercentColor,
      reverse,
      percentTintStyle,
      customIcon,
      min,
      max,
      showMin,
      showAnimation,
      showPercent,
      ...sliderProps
    } = this.props;
    const isVertical = direction === 'vertical';

    return (
      <NumberSlider
        {...sliderProps}
        min={min}
        max={max}
        showAnimation={showAnimation}
        showMin={showMin}
        direction={direction}
        reverse={reverse}
        tintColor={tintColor}
        value={value}
        trackSlideEnabled={true}
        thumbLimitType="outer"
        // @ts-ignore
        style={[isVertical ? styles.sliderVertical : styles.slider, style]}
        // @ts-ignore
        trackStyle={[isVertical ? styles.trackVertical : styles.track, trackStyle]}
        // @ts-ignore
        thumbStyle={[styles.thumb, thumbStyle]}
        // @ts-ignore
        tintStyle={[styles.tint, tintStyle]}
        onThumbChange={this.handleThumbChange}
      >
        {showPercent && (
          <Percent
            ref={(ref: Percent) => (this.percentRef = ref)}
            customIcon={customIcon}
            layout={isVertical ? (reverse ? 'top' : 'bottom') : reverse ? 'right' : 'left'}
            colorOver={tintColor}
            style={[styles.percent, percentStyle]}
            tintStyle={percentTintStyle}
            outColor={outPercentColor || '#fff'}
            iconSize={iconSize || 24}
            iconColor={iconColor || '#000'}
          />
        )}
      </NumberSlider>
    );
  }
}

const styles = StyleSheet.create({
  thumb: {
    opacity: 0,
  },
  slider: {
    width: '100%',
    height: cx(40),
    borderRadius: 14,
    overflow: 'hidden',
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
    height: cx(60),
    backgroundColor: 'rgba(255,255,255,0.1)',
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
