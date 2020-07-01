/* eslint-disable no-unused-expressions */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, Animated, Easing, ViewPropTypes, AppState } from 'react-native';
import { Utils } from 'tuya-panel-kit';
import _after from 'lodash/after';
import _delay from 'lodash/delay';
import _forEach from 'lodash/forEach';
import _map from 'lodash/map';

const {
  RatioUtils: { viewWidth },
  ColorUtils: { color: Color },
} = Utils;

class CircleRipple extends PureComponent {
  static propTypes = {
    renderRipple: PropTypes.func,
  };

  static defaultProps = {
    renderRipple(props) {
      return <View {...props} />;
    },
  };

  render() {
    const { radius, color, alpha = 1, renderRipple } = this.props;
    const rgba = Color.hex2RgbString(color, alpha);
    const styl = {
      position: 'absolute',
      width: radius,
      height: radius,
      borderRadius: radius / 2,
      backgroundColor: rgba,
    };

    const rippleNode = renderRipple({ ...this.props, style: styl });
    let node = <View style={styl} />;
    if (renderRipple) {
      React.isValidElement(rippleNode) && (node = rippleNode);
    }
    return node;
  }
}

const AnimatedRipple = Animated.createAnimatedComponent(CircleRipple);

class WaterRipple extends PureComponent {
  static propTypes = {
    ...CircleRipple.propTypes,
    style: ViewPropTypes.style,
    children: PropTypes.element,
    innerRadius: PropTypes.number,
    outerRadius: PropTypes.number,
    color: PropTypes.string,
    duration: PropTypes.number,
    circleNums: PropTypes.number,
    animated: PropTypes.bool,
    onClose: PropTypes.func,
  };

  static defaultProps = {
    ...CircleRipple.defaultProps,
    style: null,
    children: null,
    innerRadius: 30,
    outerRadius: viewWidth / 2,
    color: '#00FF00',
    duration: 6000,
    circleNums: 3,
    animated: true,
    onClose() {},
  };

  constructor(props) {
    super(props);
    const { circleNums, duration } = props;
    this.data = {};
    this.state = {
      ...this._stateFromProps(props),
      appState: AppState.currentState,
    };
    for (let index = 0; index < circleNums; index++) {
      this.data[`radius${index}`] = new Animated.Value(0);
    }
    this.animates = {};
    const delay = duration / circleNums;
    Object.keys(this.data).forEach((radius, index) => {
      const curAnimate = this.createAnimated({
        duration,
        radius: this.data[radius],
      });
      this.animates[`animate_${index + 1}`] = {
        animate: curAnimate,
        delay: index * delay,
      };
    });
    this.shouldDelay = true;
  }

  componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);
    const { animated } = this.state;
    animated && this.startAnimation();
  }

  componentWillReceiveProps(nextProps) {
    this.setState(this._stateFromProps(nextProps));
    if (nextProps.animated !== this.props.animated) {
      nextProps.animated ? this.startAnimation() : this.stopAnimation();
    }
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  getAnimtedStyles = value => {
    const { innerRadius, outerRadius } = this.props;
    const radius = value.interpolate({
      inputRange: [0, 1],
      outputRange: [innerRadius * 2, outerRadius * 2 + innerRadius * 2],
    });
    const alpha = value.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0],
    });
    return { radius, alpha };
  };

  appStateAnimtedAction(currentAppState, nextAppState) {
    if (currentAppState === 'active' && nextAppState !== 'active') {
      this.stopAnimation(true);
    } else {
      this.startAnimation(true);
    }
  }

  _handleAppStateChange = nextAppState => {
    const { appState: currentAppState } = this.state;
    this.appStateAnimtedAction(currentAppState, nextAppState);
    this.setState({ appState: nextAppState });
  };

  shouldDelay = true;

  _stateFromProps(props) {
    const { animated } = props;
    return { animated };
  }

  createAnimated({ radius, duration, delay }) {
    if (radius._value === 1) {
      radius.setValue(0);
    }
    const animate = Animated.timing(radius, {
      toValue: 1,
      duration,
      easing: Easing.linear,
      delay,
    });
    return animate;
  }

  cycleStart(animate) {
    animate.start(({ finished }) => {
      if (finished && this.state.animated) {
        animate.reset();
        this.cycleStart(animate);
      }
      if (finished && !this.state.animated) {
        this.afterClosing();
      }
    });
  }

  startAnimation(reset = false) {
    this.setState({ animated: true });
    this.afterClosing = _after(this.props.circleNums, () => {
      this.props.onClose();
    });
    _forEach(this.animates, ({ animate, delay }) => {
      !!reset && animate.reset();
      _delay(this.cycleStart.bind(this, animate), delay);
    });
  }

  stopAnimation(reset = false) {
    this.shouldDelay = false;
    this.setState({ animated: false });
    _forEach(this.animates, ({ animate }) => {
      animate.stop();
      !!reset && animate.reset();
    });
  }

  resetAnimation() {
    _forEach(this.animates, ({ animate, delay }) => {
      animate.reset();
      // _delay(this.cycleStart.bind(this, animate), delay);
    });
  }

  render() {
    const { children, style, color, outerRadius, renderRipple } = this.props;
    const boxSize = { width: outerRadius * 2, height: outerRadius * 2 };
    return (
      <View style={[styles.root, boxSize, style]}>
        {_map(this.data, (radius, key) => (
          <AnimatedRipple
            key={key}
            color={color}
            renderRipple={renderRipple}
            {...this.getAnimtedStyles(radius)}
          />
        ))}
        <View style={{ position: 'absolute' }}>{children}</View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default WaterRipple;
