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
    if (Math.abs(this.props.value - nextProps.value) > 0.1) {
      this.needUpdate = true;
    }
  }

  componentDidUpdate() {
    this.playAnimation();
  }
  playAnimation() {
    if (this.needUpdate && !this.isAnimating) {
      const { value, hideValue } = this.props;
      this.isAnimating = true;
      Animated.parallel([
        Animated.timing(this.state.y, {
          toValue: value,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(this.state.opacity, {
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
    const { style, children, hideValue, value } = this.props;
    return (
      <Animated.View
        style={[
          styles.container,
          style,
          {
            transform: [
              {
                translateY: this.state.y,
              },
            ],
            opacity: this.state.opacity,
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
