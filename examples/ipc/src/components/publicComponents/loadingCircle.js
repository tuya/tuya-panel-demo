/* eslint-disable max-len */
import color from 'color';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, ColorPropType, ViewPropTypes, View, Animated, Easing } from 'react-native';
import { IconFont } from 'tuya-panel-kit';
import Config from '../../config';

const { cx } = Config;
const okSvg =
  'M257.91057 533.966436c-2.227974-2.289408-2.633433-6.035804-0.545731-8.855584l25.62273-34.604253c1.926952-2.601693 5.758331-2.984626 8.120435-1.187707l151.289296 115.091878c2.558689 1.946406 7.037164 1.534804 9.394147-0.414674l367.152991-303.591213c2.630361-2.174732 6.902011-1.84197 9.294831 0.504775l23.534004 23.06916c2.5034 2.454253 2.708177 6.226247-0.06348 8.9334L451.613291 723.736414c-2.538212 2.47985-6.765834 2.261763-8.630329 0.346073L257.91057 533.966436z';

// 三点loading动画;
class LoadingCirle extends Component {
  static propTypes = {
    value: PropTypes.bool,
    showComplete: PropTypes.bool,
    itemNum: PropTypes.number,
    loadSpeed: PropTypes.number,
    onComplete: PropTypes.func,
    sequenceColor: ColorPropType,
    completeColor: ColorPropType,
    dotSize: PropTypes.number,
    style: ViewPropTypes.style,
  };

  static defaultProps = {
    value: true,
    showComplete: true,
    itemNum: 3,
    loadSpeed: 200,
    onComplete: null,
    sequenceColor: '#7087FF',
    completeColor: '#7087FF',
    dotSize: cx(6),
    style: {},
  };

  constructor(props) {
    super(props);

    this.animatedValue = [];
    this.animatedValue1 = [];
    this.timeOut = null;

    this.state = {
      completeAnimate: new Animated.Value(0),
      value: props.value,
      complete: false,
    };

    this.arr = Array(props.itemNum)
      .fill(0)
      .map((__, i) => i);
  }

  componentDidMount() {
    this.startAnimate();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.value !== nextProps.value) {
      nextProps.value && this.startAnimate();
      !nextProps.value && this.clearLoading();
      this.setState(
        {
          value: nextProps.value,
        },
        () => {
          !nextProps.value && nextProps.showComplete && this._showCompleteAnimate();
        }
      );
    }
  }

  componentWillUnmount() {
    this._clearAllTimer();
    this.clearAllAnimation();
  }

  getAnimateValueReset = () => {
    this.arr.forEach(value => {
      this.animatedValue[value] = new Animated.Value(0);
    });
    this.forceUpdate();
  };

  clearAllAnimation = () => {
    this.clearLoading();
    !!this.state.completeAnimate && this.state.completeAnimate.stopAnimation();
  };

  clearLoading = () => {
    this.arr.forEach(value => {
      !!this.animatedValue[value] && this.animatedValue[value].stopAnimation();
    });
  };

  startAnimate = async () => {
    await this.getAnimateValueReset();
    await this.animateSequence();
  };

  animateSequence = () => {
    if (this.state.complete || this.animatedValue.length === 0) return;
    const animations = this.arr.map(item =>
      Animated.timing(this.animatedValue[item], {
        toValue: this.animatedValue[item]._value === 0 ? 1 : 0,
        duration: this.props.loadSpeed,
        easing: Easing.in,
      })
    );
    Animated.sequence(animations).start(({ finished }) => {
      finished && this.animateSequence();
    });
  };

  _clearAllTimer = () => {
    clearTimeout(this.timeOut);
  };

  _showCompleteAnimate = () => {
    const { showComplete } = this.props;
    !showComplete && this.clearAllAnimation();
    this._clearAllTimer();
    Animated.spring(this.state.completeAnimate, {
      toValue: 1,
    }).start();

    this.setState(
      {
        complete: true,
      },
      () => {
        setTimeout(() => {
          Animated.spring(this.state.completeAnimate, {
            toValue: 0,
          }).start();
          this.setState({ complete: false });
          this.clearAllAnimation();
          !!this.props.onComplete && this.props.onComplete();
        }, 1000);
      }
    );
  };

  _getOpacityColor = (itemNum, themeColor) =>
    Array(itemNum)
      .fill(1)
      .map((__, index) =>
        color(themeColor)
          .alpha((index + 1) / itemNum)
          .rgbString()
      );

  renderAnimateItems = () => {
    const { itemNum, sequenceColor, dotSize } = this.props;
    const colors = this._getOpacityColor(itemNum, sequenceColor);
    const inputRange = Array(itemNum)
      .fill(1)
      .map((__, i) => i / (itemNum - 1));
    const animations = this.arr.map((a, i) => {
      const isMid = i !== 0;
      const backgroundColor =
        !!this.animatedValue[a] && this.animatedValue.length > 0
          ? this.animatedValue[a].interpolate({
              inputRange,
              outputRange: [...colors],
            })
          : 'transparent';
      return (
        <Animated.View
          key={`view${i + 1}`}
          style={{
            height: dotSize,
            width: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor,
            marginLeft: isMid ? dotSize : 0,
          }}
        />
      );
    });

    return animations;
  };

  renderCompleteAnimateView = () => (
    <Animated.View style={{ opacity: this.state.completeAnimate }}>
      <IconFont
        d={okSvg}
        vFlip={true}
        size={cx(28)}
        fill={this.props.completeColor || this.props.sequenceColor}
        stroke={this.props.completeColor || this.props.sequenceColor}
      />
    </Animated.View>
  );

  render() {
    const { showComplete, style } = this.props;
    const { value, complete } = this.state;
    return (
      <View style={[styles.container, style]}>
        {value && this.animatedValue.length !== 0 && this.renderAnimateItems()}
        {complete && showComplete && this.renderCompleteAnimateView()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: 'transparent',
  },
});

export default LoadingCirle;
