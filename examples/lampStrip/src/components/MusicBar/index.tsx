/* eslint-disable react/state-in-constructor */
/* eslint-disable react/prefer-stateless-function */
/* eslint-disable max-classes-per-file */
import React, { Component } from 'react';
import { Animated, View, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'tuya-panel-kit';
import { Rect } from 'react-native-svg';
import _ from 'lodash';

const bars = _.times(22);
interface BarProps {
  width: number;
  height: number;
  color: string[];
}
class Bar extends Component<BarProps> {
  render() {
    const { width, height, color } = this.props;
    const [color1, color2] = color;
    return (
      <View
        style={{
          width,
          height,
          overflow: 'hidden',
        }}
      >
        <LinearGradient
          gradientId="Gradient1"
          style={{
            width,
            height: 93,
          }}
          x1="0%"
          y1="0%"
          x2="0%"
          y2="100%"
          stops={{
            '0%': color1,
            '100%': color2,
          }}
        >
          <Rect width={width} height={93} />
        </LinearGradient>
      </View>
    );
  }
}
const AnimatedRectangle = Animated.createAnimatedComponent(Bar);

type BubblesProps = {
  style?: StyleProp<ViewStyle>;
  size: number;
  color: string[];
  musicIndex: number;
} & Readonly<typeof defaultProps>;
const defaultProps = { style: {} };
interface BubblesState {
  bars: Animated.Value[];
}

export default class Bubbles extends Component<BubblesProps, BubblesState> {
  unmounted: boolean;

  // eslint-disable-next-line react/static-property-placement
  static defaultProps = defaultProps;

  state = {
    bars: bars.map((i: number) => new Animated.Value(1)),
  };

  componentDidMount() {
    const { bars } = this.state;
    bars.forEach((val, index) => {
      const timer = setTimeout(() => this.animate(index), index * 50); // 控制起始间隔时间
      this.timers.push(timer);
    });
  }

  componentWillUnmount() {
    this.timers.forEach(timer => clearTimeout(timer));
    this.unmounted = true;
  }

  timers: any = [];

  animate(index: number) {
    const { musicIndex, size } = this.props;
    const { bars } = this.state;
    const durationMap = [510, 470, 430, 390, 350, 310, 270, 230, 190, 150];
    const duration = durationMap[musicIndex];
    Animated.sequence([
      Animated.timing(bars[index], {
        toValue: size * 2 * Math.random(), // 控制动画的条形上随机值高度
        duration,
      }),
      Animated.timing(bars[index], {
        toValue: (size / 10) * Math.random(), // 控制动画的条形下随机值高度
        duration,
      }),
    ]).start(() => {
      if (!this.unmounted) {
        this.animate(index);
      }
    });
  }

  renderBar(index) {
    const { color } = this.props;
    const { bars } = this.state;
    const width = 11;
    return <AnimatedRectangle key={index} color={color} width={width} height={bars[index]} />;
  }

  render() {
    const { style } = this.props;
    return (
      <View
        style={[
          {
            width: '100%',
            height: 94,
            flexDirection: 'row',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
          },
          style,
        ]}
      >
        {bars.map((i: number) => this.renderBar(i))}
      </View>
    );
  }
}
