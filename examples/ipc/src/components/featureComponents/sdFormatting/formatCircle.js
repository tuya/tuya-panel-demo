/* eslint-disable react/no-unused-prop-types */
/* eslint-disable react/default-props-match-prop-types */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Svg, { Circle } from 'react-native-svg';
import { View, StyleSheet, ViewPropTypes, Animated } from 'react-native';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
/**
 * 云台控制Dialog对话
 */
class FormatCircle extends Component {
  static propTypes = {
    containerStyle: ViewPropTypes.style,
    svgSize: PropTypes.string,
    strokeWidth: PropTypes.string,
    strokeActiveColor: PropTypes.string,
    strokeColor: PropTypes.string,
    percentContain: ViewPropTypes.style,
    percentStyle: ViewPropTypes.style,
    percentTextStyle: ViewPropTypes.style,
    percentValue: PropTypes.string || PropTypes.number,
    progressValue: PropTypes.number.isRequired,
  };
  static defaultProps = {
    containerStyle: null,
    percentTextStyle: null,
    percentContain: null,
    percentStyle: null,
    percentValue: '0%',
    svgSize: '90',
    strokeWidth: '2',
    strokeActiveColor: '#ffffff',
    strokeColor: '#2f2f2f',
    progressValue: 100,
  };
  constructor(props) {
    super(props);
    this.state = {
      circleFillAnimation: new Animated.Value(0),
    };
    this.dasharray = [Math.PI * 2 * (Number(props.svgSize) / 3)];
    // 这里是动画的映射关系
    this.circleAnimation = this.state.circleFillAnimation.interpolate({
      inputRange: [0, 100],
      outputRange: [this.dasharray[0], 0],
    });
  }

  componentDidMount() {}
  componentWillReceiveProps(nextProps) {
    const oldProps = this.props;
    if (!_.isEqual(oldProps.progressValue, nextProps.progressValue)) {
      this.startAnimation(nextProps);
    }
  }

  startAnimation = props => {
    const { progressValue } = props;
    Animated.timing(this.state.circleFillAnimation, {
      toValue: progressValue, // 设置进度值，范围：0～100
      duration: 10,
    }).start(({ finished }) => {
      if (finished) {
        this.stopAnimation();
      }
    });
  };

  stopAnimation = () => {
    this.state.circleFillAnimation.stopAnimation(d => {
      this.state.circleFillAnimation.setValue(d);
    });
  };

  render() {
    const { containerStyle, svgSize, strokeWidth, strokeColor, strokeActiveColor } = this.props;
    const circleOrigin = String(svgSize / 2);
    const circleRa = String(svgSize / 3);
    return (
      <View style={[styles.formateCirclePage, containerStyle]}>
        <Svg height={svgSize} width={svgSize}>
          <Circle
            cx={circleOrigin}
            cy={circleOrigin}
            r={circleRa}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <AnimatedCircle
            cx={circleOrigin}
            cy={circleOrigin}
            r={circleRa}
            origin={`${circleOrigin},${circleOrigin}`}
            rotate="-90"
            stroke={strokeActiveColor}
            strokeWidth={strokeWidth}
            strokeLinecap="butt"
            fill="transparent"
            strokeDasharray={this.dasharray}
            strokeDashoffset={this.circleAnimation}
          />
        </Svg>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  formateCirclePage: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});

export default FormatCircle;
