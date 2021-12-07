/* eslint-disable */
import React, { Component } from 'react';
import { Animated, ART } from 'react-native';

const { Surface, Shape, Path } = ART;

interface CProps {
  radius: number;
}
interface LProps {
  size: number;
  color: string;
}
interface BProps {
  size: number;
  color: string;
  spaceBetween: number;
}


// 圆形loading 三种样式
class Circle extends Component<CProps> {  //eslint-disable-line

  render() {
    const { radius } = this.props;
    const path = Path()
      .moveTo(0, -radius)
      .arc(0, radius * 2, radius)
      .arc(0, radius * -2, radius)
      .close();

    return <Shape {...this.props} d={path} />;
  }
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export class LoadingDoubleBounce extends Component<LProps> {  //eslint-disable-line

  static defaultProps = {
    size: 14,
    color: '#000',
  };

  state = {
    bounces: [new Animated.Value(1), new Animated.Value(0)],
  };
  unmounted: boolean;

  componentDidMount() {
    this.animate(0);
    setTimeout(() => this.animate(1), 1000);
  }

  componentWillUnmount() {
    this.unmounted = true;
  }

  animate(index) {
    const { bounces } = this.state;
    Animated.sequence([
      Animated.timing(bounces[index], {
        toValue: 1,
        duration: 1500,
      }),
      Animated.timing(bounces[index], {
        toValue: 0,
        duration: 1500,
      }),
    ]).start(() => {
      if (!this.unmounted) {
        this.animate(index);
      }
    });
  }

  render() {
    const { size, color } = this.props;
    const {
      bounces: [scale1, scale2],
    } = this.state;
    const width = size * 2;
    const height = size * 2;

    return (
      <Surface width={width} height={height}>
        <AnimatedCircle radius={size} fill={color} scale={scale1} opacity={0.6} x={size} y={size} />
        <AnimatedCircle radius={size} fill={color} scale={scale2} opacity={0.6} x={size} y={size} />
      </Surface>
    );
  }
}

export class LoadingBubbles extends Component<BProps> { //eslint-disable-line

  timers: Array<number>
  static defaultProps = {
    spaceBetween: 6,
    size: 11,
    color: '#000',
  };

  state = {
    circles: [new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)],
  };
  unmounted: boolean;

  componentDidMount() {
    const { circles } = this.state;
    circles.forEach((val, index) => {
      const timer = setTimeout(() => this.animate(index), index * 300);
      this.timers.push(timer);
    });
  }

  componentWillUnmount() {
    this.timers.forEach(timer => {
      clearTimeout(timer);
    });

    this.unmounted = true;
  }

  animate(index) {
    const { circles } = this.state;
    Animated.sequence([
      Animated.timing(circles[index], {
        toValue: 1,
        duration: 600,
      }),
      Animated.timing(circles[index], {
        toValue: 0,
        duration: 600,
      }),
    ]).start(() => {
      if (!this.unmounted) {
        this.animate(index);
      }
    });
  }

  renderBubble(index) {
    const { size, spaceBetween, color } = this.props;
    const { circles } = this.state;
    const scale = circles[index];
    const offset = {
      x: size + index * (size * 2 + spaceBetween),
      y: size,
    };

    return <AnimatedCircle fill={color} radius={size} scale={scale} {...offset} />;
  }

  render() {
    const { size, spaceBetween } = this.props;
    const width = size * 6 + spaceBetween * 2;
    const height = size * 2;

    return (
      <Surface width={width} height={height}>
        {this.renderBubble(0)}
        {this.renderBubble(1)}
        {this.renderBubble(2)}
      </Surface>
    );
  }
}

export class LoadingPulse extends Component<LProps> { //eslint-disable-line

  static defaultProps = {
    size: 14,
    color: '#000',
  };

  state = {
    pulse: new Animated.ValueXY({
      x: 0.5,
      y: 1,
    }),
  };
  unmounted: boolean;

  componentDidMount() {
    this.animate();
  }

  componentWillUnmount() {
    this.unmounted = true;
  }

  animate() {
    const { pulse } = this.state;
    Animated.timing(pulse, {
      toValue: {
        x: 1,
        y: 0,
      },
      duration: 1000,
    }).start(() => {
      if (!this.unmounted) {
        pulse.setValue({
          x: 0,
          y: 1,
        });
        this.animate();
      }
    });
  }

  render() {
    const { size, color } = this.props;
    const { pulse } = this.state;
    const width = size * 2;
    const height = size * 2;

    return (
      <Surface width={width} height={height}>
        <AnimatedCircle
          radius={size}
          fill={color}
          scale={pulse.x}
          opacity={pulse.y}
          x={size}
          y={size}
        />
      </Surface>
    );
  }
}
