import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, Text, Animated, Easing } from 'react-native';

class TextInputForAnimated extends Component {
  render() {
    const { index, displayValues, ...others } = this.props;
    return <Text {...others}>{displayValues[~~index]}</Text>;
  }
}

const AnimatedText = Animated.createAnimatedComponent(TextInputForAnimated);

export default class AnimateNumber extends Component {
  static propTypes = {
    loop: PropTypes.bool,
    duration: PropTypes.number,
    speed: PropTypes.number,
    values: PropTypes.array,
    end: PropTypes.any,
    onStart: PropTypes.func,
    onEnd: PropTypes.func,
    onLoop: PropTypes.func,
  };

  static defaultProps = {
    loop: false,
    end: 9,
    duration: 1000,
    speed: 100,
    values: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    onStart: () => {},
    onEnd: () => {},
    onLoop: () => {},
  };

  constructor(props) {
    super(props);

    this._canAnimation = true;
    this._animationValue = 0;

    this.state = {
      displayIndex: new Animated.Value(0),
      displayValues: this.calculateValues(props),
    };
  }

  componentDidMount() {
    this._canAnimation = true;
    this.startAnimation(() => {
      this.props.onStart();
    });
  }

  componentWillUnmount() {
    this.stopAnimation(() => {
      this.props.onEnd();
    });
  }

  calculateValues(props) {
    const { end, values, duration, speed } = props;
    const num = ~~(duration / speed);
    const len = values.length;
    const index = values.findIndex(x => x === end);
    return Array(num)
      .fill(1)
      .map((_, idx) => {
        const i = (index + num * len - idx) % len;
        return values[i];
      })
      .reverse();
  }

  stopAnimation(fn) {
    this._canAnimation = false;
    fn && fn(this);
    this.state.displayIndex.stopAnimation();
  }

  startAnimation(fn) {
    if (!this._canAnimation) return;
    fn && fn(this);
    this.state.displayIndex.setValue(0);
    const len = this.state.displayValues.length;

    Animated.timing(this.state.displayIndex, {
      toValue: len - 1,
      duration: this.props.duration,
      easing: Easing.linear,
    }).start(() => {
      this.props.onLoop();
      if (this.props.loop) {
        this.startAnimation();
      }
    });
  }

  render() {
    const { displayValues } = this.state;

    return (
      <AnimatedText
        style={this.props.style}
        index={this.state.displayIndex}
        displayValues={this.state.displayValues}
      />
    );
  }
}
