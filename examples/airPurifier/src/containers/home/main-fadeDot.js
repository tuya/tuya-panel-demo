import _random from 'lodash/random';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { Utils } from 'tuya-panel-kit';

const { width: DEVICE_WIDTH } = Utils.RatioUtils;

export default class FadeDot extends Component {
  static propTypes = {
    active: PropTypes.bool,
    duration: PropTypes.number,
  };

  static defaultProps = {
    active: false,
    duration: 5000,
  };

  constructor(props) {
    super(props);
    this.reload = false;
    this.state = {
      valueXY: new Animated.Value(0),
      fadeInOpacity: new Animated.Value(1),
      valueXY1: new Animated.Value(0),
      fadeInOpacity1: new Animated.Value(1),
    };
  }

  componentDidMount() {
    this.startAllAnimations();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { active } = this.props;
    if (active !== nextProps.active) {
      this.reload = true;
    }
  }

  componentDidUpdate() {
    if (this.reload) {
      this.startAllAnimations();
      this.reload = false;
    }
  }

  componentWillUnmount() {
    this.stopAllAnimations();
  }

  startAllAnimations() {
    const { active } = this.props;
    if (active) {
      this.startAnimation();
      this.startAnimation1();
    } else {
      this.stopAllAnimations();
    }
  }

  startAnimation() {
    const { active, duration } = this.props;
    const { fadeInOpacity, valueXY } = this.state;
    if (active) {
      fadeInOpacity.setValue(1);
      valueXY.setValue(0);

      Animated.parallel([
        Animated.timing(valueXY, {
          toValue: 1,
          duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fadeInOpacity, {
          toValue: 0,
          duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        finished && this.startAnimation();
      });
    }
  }

  startAnimation1() {
    const { active, duration } = this.props;
    const { fadeInOpacity1, valueXY1 } = this.state;
    if (active) {
      fadeInOpacity1.setValue(1);
      valueXY1.setValue(0);

      Animated.parallel([
        Animated.timing(valueXY1, {
          toValue: 1,
          duration,
          easing: Easing.out(Easing.cubic),
          delay: 1370,
          useNativeDriver: true,
        }),
        Animated.timing(fadeInOpacity1, {
          toValue: 0,
          duration,
          easing: Easing.out(Easing.cubic),
          delay: 1370,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        finished && this.startAnimation1();
      });
    }
  }

  stopAllAnimations() {
    const { fadeInOpacity, fadeInOpacity1, valueXY, valueXY1 } = this.state;
    valueXY.stopAnimation();
    fadeInOpacity.stopAnimation();
    valueXY1.stopAnimation();
    fadeInOpacity1.stopAnimation();
  }

  render() {
    const randomSize = _random(2, 4);
    const randomSize2 = _random(4, 6);
    const randomSize3 = _random(2, 3);
    const { fadeInOpacity, fadeInOpacity1, valueXY, valueXY1 } = this.state;
    return (
      <View style={styles.container}>
        <Animated.View
          style={{
            opacity: fadeInOpacity,
            transform: [
              {
                translateX: valueXY.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 100],
                }),
              },
              {
                translateY: valueXY.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-45, 100],
                }),
              },
            ],
          }}
        >
          <View
            style={[
              styles.circleView,
              {
                width: randomSize,
                height: randomSize,
                borderRadius: randomSize,
              },
            ]}
          />
        </Animated.View>

        <Animated.View
          style={{
            opacity: fadeInOpacity1,
            transform: [
              {
                translateX: valueXY1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-10, 100],
                }),
              },
              {
                translateY: valueXY1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-10, 100],
                }),
              },
            ],
          }}
        >
          <View
            style={[
              styles.circleView,
              {
                width: randomSize2,
                height: randomSize2,
                borderRadius: randomSize2,
              },
            ]}
          />
        </Animated.View>

        <Animated.View
          style={{
            opacity: fadeInOpacity,
            transform: [
              {
                translateX: valueXY.interpolate({
                  inputRange: [0, 1],
                  outputRange: [DEVICE_WIDTH / 2.0 + 50, DEVICE_WIDTH / 2.0],
                }),
              },
              {
                translateY: valueXY.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-45, 100],
                }),
              },
            ],
          }}
        >
          <View
            style={[
              styles.circleView,
              {
                width: randomSize3,
                height: randomSize3,
                borderRadius: randomSize3,
              },
            ]}
          />
        </Animated.View>

        <Animated.View
          style={{
            opacity: fadeInOpacity,
            transform: [
              {
                translateX: valueXY.interpolate({
                  inputRange: [0, 1],
                  outputRange: [DEVICE_WIDTH / 2.0 - 50, DEVICE_WIDTH / 2.0],
                }),
              },
              {
                translateY: valueXY.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-45, 100],
                }),
              },
            ],
          }}
        >
          <View
            style={[
              styles.circleView,
              {
                width: randomSize2,
                height: randomSize2,
                borderRadius: randomSize2,
              },
            ]}
          />
        </Animated.View>

        <Animated.View
          style={{
            opacity: fadeInOpacity1,
            transform: [
              {
                translateX: valueXY1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [DEVICE_WIDTH + 10, DEVICE_WIDTH - 100],
                }),
              },
              {
                translateY: valueXY1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-10, 100],
                }),
              },
            ],
          }}
        >
          <View
            style={[
              styles.circleView,
              {
                width: randomSize,
                height: randomSize,
                borderRadius: randomSize,
              },
            ]}
          />
        </Animated.View>

        <Animated.View
          style={{
            opacity: fadeInOpacity,
            transform: [
              {
                translateX: valueXY.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-5, 100],
                }),
              },
              {
                translateY: valueXY.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 150],
                }),
              },
            ],
          }}
        >
          <View
            style={[
              styles.circleView,
              {
                width: randomSize2,
                height: randomSize2,
                borderRadius: randomSize2,
              },
            ]}
          />
        </Animated.View>

        <Animated.View
          style={{
            opacity: fadeInOpacity1,
            transform: [
              {
                translateX: valueXY1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-10, 100],
                }),
              },
              {
                translateY: valueXY1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [120, 150],
                }),
              },
            ],
          }}
        >
          <View
            style={[
              styles.circleView,
              {
                width: randomSize3,
                height: randomSize3,
                borderRadius: randomSize3,
              },
            ]}
          />
        </Animated.View>

        <Animated.View
          style={{
            opacity: fadeInOpacity,
            transform: [
              {
                translateX: valueXY.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 100],
                }),
              },
              {
                translateY: valueXY.interpolate({
                  inputRange: [0, 1],
                  outputRange: [310, 210],
                }),
              },
            ],
          }}
        >
          <View
            style={[
              styles.circleView,
              {
                width: randomSize2,
                height: randomSize2,
                borderRadius: randomSize2,
              },
            ]}
          />
        </Animated.View>

        <Animated.View
          style={{
            opacity: fadeInOpacity1,
            transform: [
              {
                translateX: valueXY1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-10, 100],
                }),
              },
              {
                translateY: valueXY1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [310, 210],
                }),
              },
            ],
          }}
        >
          <View
            style={[
              styles.circleView,
              {
                width: randomSize,
                height: randomSize,
                borderRadius: randomSize,
              },
            ]}
          />
        </Animated.View>

        <Animated.View
          style={{
            opacity: fadeInOpacity,
            transform: [
              {
                translateX: valueXY.interpolate({
                  inputRange: [0, 1],
                  outputRange: [40, 140],
                }),
              },
              {
                translateY: valueXY.interpolate({
                  inputRange: [0, 1],
                  outputRange: [310, 210],
                }),
              },
            ],
          }}
        >
          <View
            style={[
              styles.circleView,
              {
                width: randomSize2,
                height: randomSize2,
                borderRadius: randomSize2,
              },
            ]}
          />
        </Animated.View>

        <Animated.View
          style={{
            opacity: fadeInOpacity,
            transform: [
              {
                translateX: valueXY.interpolate({
                  inputRange: [0, 1],
                  outputRange: [DEVICE_WIDTH / 2.0, DEVICE_WIDTH / 2.0],
                }),
              },
              {
                translateY: valueXY.interpolate({
                  inputRange: [0, 1],
                  outputRange: [340, 240],
                }),
              },
            ],
          }}
        >
          <View
            style={[
              styles.circleView,
              {
                width: randomSize,
                height: randomSize,
                borderRadius: randomSize,
              },
            ]}
          />
        </Animated.View>

        <Animated.View
          style={{
            opacity: fadeInOpacity,
            transform: [
              {
                translateX: valueXY.interpolate({
                  inputRange: [0, 1],
                  outputRange: [DEVICE_WIDTH / 2.0 + 20, DEVICE_WIDTH / 2.0],
                }),
              },
              {
                translateY: valueXY.interpolate({
                  inputRange: [0, 1],
                  outputRange: [340, 240],
                }),
              },
            ],
          }}
        >
          <View
            style={[
              styles.circleView,
              {
                width: randomSize3,
                height: randomSize3,
                borderRadius: randomSize3,
              },
            ]}
          />
        </Animated.View>

        <Animated.View
          style={{
            opacity: fadeInOpacity,
            transform: [
              {
                translateX: valueXY.interpolate({
                  inputRange: [0, 1],
                  outputRange: [DEVICE_WIDTH, DEVICE_WIDTH - 100],
                }),
              },
              {
                translateY: valueXY.interpolate({
                  inputRange: [0, 1],
                  outputRange: [280, 180],
                }),
              },
            ],
          }}
        >
          <View
            style={[
              styles.circleView,
              {
                width: randomSize,
                height: randomSize,
                borderRadius: randomSize,
              },
            ]}
          />
        </Animated.View>

        <Animated.View
          style={{
            opacity: fadeInOpacity1,
            transform: [
              {
                translateX: valueXY1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [DEVICE_WIDTH + 10, DEVICE_WIDTH - 100],
                }),
              },
              {
                translateY: valueXY1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [310, 210],
                }),
              },
            ],
          }}
        >
          <View
            style={[
              styles.circleView,
              {
                width: randomSize2,
                height: randomSize2,
                borderRadius: randomSize2,
              },
            ]}
          />
        </Animated.View>

        <Animated.View
          style={{
            opacity: fadeInOpacity,
            transform: [
              {
                translateX: valueXY.interpolate({
                  inputRange: [0, 1],
                  outputRange: [DEVICE_WIDTH, DEVICE_WIDTH - 100],
                }),
              },
              {
                translateY: valueXY.interpolate({
                  inputRange: [0, 1],
                  outputRange: [90, 140],
                }),
              },
            ],
          }}
        >
          <View
            style={[
              styles.circleView,
              {
                width: randomSize,
                height: randomSize,
                borderRadius: randomSize,
              },
            ]}
          />
        </Animated.View>

        <Animated.View
          style={{
            opacity: fadeInOpacity1,
            transform: [
              {
                translateX: valueXY1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [DEVICE_WIDTH + 10, DEVICE_WIDTH - 100],
                }),
              },
              {
                translateY: valueXY1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [120, 150],
                }),
              },
            ],
          }}
        >
          <View
            style={[
              styles.circleView,
              {
                width: randomSize2,
                height: randomSize2,
                borderRadius: randomSize2,
              },
            ]}
          />
        </Animated.View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },

  circleView: {
    backgroundColor: '#fff',
    height: 4,
    width: 4,
    borderRadius: 2,
  },
});
