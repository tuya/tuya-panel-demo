/* eslint-disable @typescript-eslint/no-empty-function */
import color from 'color';

import React, { Component } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Slider, IconFont, Utils, TYText } from 'tuya-panel-kit';

const { convertX: cx } = Utils.RatioUtils;

interface SliderViewProps {
  accessibilityLabel: string;
  min: number;
  max: number;
  /**
   * 0 - 99 (百分比起始显示值)
   */
  percentStartPoint: number;
  icon: any;
  value: number;
  onValueChange: (value: number) => void;
  onSlidingComplete: (value: number) => void;
  theme: any;
  id: string;
  sliderStyle: StyleProp<ViewStyle>;
}

export default class SliderView extends Component<SliderViewProps> {
  // eslint-disable-next-line react/static-property-placement
  static defaultProps = {
    accessibilityLabel: 'Slider',
    min: 0,
    max: 100,
    percentStartPoint: 0,
    onValueChange: (v: number) => {},
    onSlidingComplete: (v: number) => {},
    theme: {
      fontColor: '#fff',
    },
    id: '',
    sliderStyle: null,
  };

  setInstance = (name: string) => (ref: TYText) => {
    this[`_ref_${name}`] = ref;
  };

  getInstance = (name: string) => this[`_ref_${name}`];

  setPercent(v: number) {
    const instance = this.getInstance('percent');
    if (instance) {
      const percetStr = this.calcPercent(v);
      instance.setText(percetStr);
    }
  }

  calcPercent(value: number) {
    const { min, max, percentStartPoint } = this.props;
    const distance = max - min;
    const diff = value - min;
    const ratio = (diff / distance) * (100 - percentStartPoint) + percentStartPoint;
    const percent = Math.round(ratio);
    return `${percent}%`;
  }

  handleValueChange = (v: number) => {
    const { onValueChange } = this.props;
    onValueChange(v);
    this.setPercent(v);
  };

  handleComplete = (v: number) => {
    const { onSlidingComplete } = this.props;
    onSlidingComplete(v);
    this.setPercent(v);
  };

  render() {
    const {
      accessibilityLabel,
      theme: { fontColor },
      min,
      max,
      icon,
      value,
      id,
      sliderStyle,
    } = this.props;
    const dimColor = color(fontColor).alpha(0.3).rgbString();
    return (
      <View style={styles.container}>
        <View style={styles.iconfont}>
          <IconFont d={icon} size={cx(24)} fill={fontColor} stroke={fontColor} />
        </View>
        <Slider
          // id={id}
          accessibilityLabel={accessibilityLabel}
          style={[styles.slider, sliderStyle]}
          canTouchTrack={true}
          minimumValue={min}
          maximumValue={max}
          stepValue={1}
          maximumTrackTintColor={dimColor}
          minimumTrackTintColor={fontColor}
          thumbTintColor={fontColor}
          thumbStyle={styles.sliderThumb}
          trackStyle={styles.sliderTrack}
          onlyMaximumTrack={false}
          value={value}
          onValueChange={this.handleValueChange}
          onSlidingComplete={this.handleComplete}
        />
        <TYText
          ref={this.setInstance('percent')}
          style={[styles.text, { color: fontColor }]}
          numberOfLines={1}
        >
          {this.calcPercent(value)}
        </TYText>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 20,
  },

  iconfont: {
    flex: 1,
    alignItems: 'flex-end',
  },

  slider: {
    width: cx(236),
    marginHorizontal: cx(8),
  },

  sliderTrack: {
    height: cx(6),
    borderRadius: cx(3),
  },

  sliderThumb: {
    width: cx(24),
    height: cx(24),
    borderRadius: cx(12),
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
  },

  text: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'left',
    fontSize: Math.max(10, cx(10)),
    color: '#fff',
    backgroundColor: 'transparent',
  },
});
