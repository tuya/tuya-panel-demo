import React from 'react';
import PropTypes from 'prop-types';
import { Animated, ViewPropTypes, StyleSheet } from 'react-native';
import { Utils } from 'tuya-panel-kit';

const { isIphoneX } = Utils.RatioUtils;

export default class AnimateView extends React.Component {
  static propTypes = {
    hideValue: PropTypes.number,
    value: PropTypes.number,
    style: ViewPropTypes.style,
  };

  static defaultProps = {
    hideValue: 0,
    value: 0,
    style: null,
  };

  constructor(props) {
    super(props);

    const { value, hideValue } = this.props;
    this.needUpdate = hideValue !== value;
    this.isAnimating = false;
    this.state = {
      y: new Animated.Value(hideValue),
      opacity: new Animated.Value(0),
    };
  }

  componentDidMount() {
    this.playAnimation();
  }

  componentWillReceiveProps(nextProps) {
    const { value } = this.props;
    if (Math.abs(value - nextProps.value) > 0.1) {
      this.needUpdate = true;
    }
  }

  componentDidUpdate() {
    this.playAnimation();
  }

  playAnimation() {
    const { y, opacity } = this.state;
    if (this.needUpdate && !this.isAnimating) {
      const { value, hideValue } = this.props;
      this.isAnimating = true;
      Animated.parallel([
        Animated.timing(y, {
          toValue: value,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: hideValue === value ? 0 : 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        this.needUpdate = false;
        this.isAnimating = false;
        this.forceUpdate();
      });
    }
  }

  render() {
    // eslint-disable-next-line react/prop-types
    const { style, children, value } = this.props;
    const { y, opacity } = this.state;
    return (
      <Animated.View
        style={[
          styles.container,
          style,
          {
            transform: [
              {
                translateY: y,
              },
            ],
            opacity,
          },
          {
            bottom: this.needUpdate ? 0 : -value,
          },
        ]}
      >
        {children}
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: '100%',
    paddingBottom: isIphoneX ? 20 : 0,
  },
});
