/* eslint-disable react/no-unused-prop-types */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable react/default-props-match-prop-types */
/* eslint-disable max-classes-per-file */
import React from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  PanResponderInstance,
  LayoutChangeEvent,
  Animated,
  GestureResponderEvent,
  PanResponderGestureState,
  ViewStyle,
} from 'react-native';
import { Utils, IconFont, TYText } from 'tuya-panel-kit';
import icons from './icons';

const { convertX: cx } = Utils.RatioUtils;

const defaultProps = {
  opacityAnimationValue: 1,
  value: 0,
  min: 10,
  max: 1000,
  minPercent: 1,
  disabled: false,
  showPercent: true,
  fontColor: '#000',
  trackColor: '#313131',
  activeColor: '#fff',
  invalidSwipeDistance: 7,
  clickEnabled: false, // Whether to click to select
  style: {},
  onGrant: (v: number) => null,
  onMove: (v: number) => null,
  onRelease: (v: number) => null,
  onPress: (v: number) => null,
};

export interface IBrightOption {
  min?: number;
  max?: number;
  minPercent?: number;
  fontColor?: string;
  trackColor?: string;
  activeColor?: string;
  invalidSwipeDistance?: number;
  formatPercent?: (value: number) => number;
  style?: ViewStyle | ViewStyle[];
}

type DefaultProps = Readonly<typeof defaultProps>;

type IProps = {
  style?: ViewStyle | ViewStyle[];
  // eslint-disable-next-line react/require-default-props
  formatPercent?: (value: number) => number;
} & DefaultProps;

interface IState {
  value: number;
  opacityAnimationValue: any;
}

export default class Slider extends React.Component<IProps, IState> {
  // eslint-disable-next-line react/static-property-placement
  static defaultProps: DefaultProps = defaultProps;

  _panResponder: PanResponderInstance;

  percentRef: React.ReactNode;

  locked = false;

  sliderWidth = 0;

  brightWidth = 0;

  brightAnimate: Animated.Value = new Animated.Value(0);

  opacityAnimationValue: number;

  showPercent = false;

  moving = false;

  grantTime = 0;

  isTouchStart = false;

  constructor(props: IProps) {
    super(props);

    this._panResponder = PanResponder.create({
      // Request to become a responder:
      onStartShouldSetPanResponder: this.handleStartPanResponder,
      onMoveShouldSetPanResponder: this.handleSetPanResponder,
      onPanResponderTerminationRequest: () => !this.moving,
      onPanResponderMove: this.onMove,
      onPanResponderRelease: this.onRelease,
      // Currently something else becomes the responder and does not release it.
      onPanResponderReject: this.handleTerminate,
      onPanResponderTerminate: this.handleTerminate,
    });
    const { value } = this.props;
    this.state = {
      value,
      opacityAnimationValue: new Animated.Value(props.opacityAnimationValue),
    };
  }

  componentWillReceiveProps(nextProps: IProps) {
    const { opacityAnimationValue } = this.props;
    if (!this.locked) {
      this.brightWidth = this.valueToWidth(nextProps.value);
      this.brightAnimate.setValue(this.brightWidth);
      this.setState({ value: nextProps.value });
    }
    // Switch toggle changes opacity
    if (nextProps.opacityAnimationValue !== opacityAnimationValue) {
      this.fadeAnimation(nextProps.opacityAnimationValue);
    }
  }

  shouldComponentUpdate() {
    return !this.locked;
  }

  fadeAnimation = (value: number) => {
    const { opacityAnimationValue } = this.state;
    Animated.timing(opacityAnimationValue, {
      toValue: value,
      duration: 300,
    }).start();
  };

  handleStartPanResponder = (e: GestureResponderEvent) => {
    const { disabled, clickEnabled } = this.props;
    if (disabled) {
      return false;
    }
    this.grantTime = +new Date();
    return clickEnabled;
  };

  handleSetPanResponder = (e: GestureResponderEvent, gesture: PanResponderGestureState) => {
    const { disabled, invalidSwipeDistance, onGrant } = this.props;
    const { value } = this.state;
    if (disabled) {
      return false;
    }
    // After sliding a certain pixel, other gestures will not be allowed to grab power
    if (Math.abs(gesture.dx) >= invalidSwipeDistance) {
      // Do not slide if it is less than a certain pixel
      if (!this.moving) {
        onGrant(value);
        this.moving = true;
        this.locked = true;
      }
      return true;
    }
    if (this.moving) {
      return true;
    }
    return false;
  };

  handleTerminate = () => {
    // The responder has been withdrawn from this view
    this.moving = false;
    this.locked = false;
    this.isTouchStart = false;
  };

  onMove = (e: GestureResponderEvent, gesture: PanResponderGestureState) => {
    const { invalidSwipeDistance, onGrant, onMove } = this.props;
    const { value } = this.state;
    if (!this.moving) {
      // After sliding a certain pixel, other gestures will not be allowed to grab power
      if (Math.abs(gesture.dx) < invalidSwipeDistance) {
        // Do not slide if it is less than a certain pixel
        return;
      }
      // Start gesture
      onGrant(value);
      this.moving = true;
      this.locked = true;
    }
    this.handleMove(gesture, onMove, false);
  };

  onRelease = (e: GestureResponderEvent, gesture: PanResponderGestureState) => {
    this.isTouchStart = false;
    const { onRelease, clickEnabled, onPress } = this.props;
    if (this.moving) {
      this.moving = false;
      this.locked = false;
      this.handleMove(gesture, onRelease, true);
    } else if (clickEnabled) {
      const now = +new Date();
      if (Math.abs(gesture.dx) < 4 && Math.abs(gesture.dy) < 4 && now - this.grantTime < 300) {
        const { locationX } = e.nativeEvent;
        this.handleMove(
          { dx: locationX - this.brightWidth } as PanResponderGestureState,
          onPress,
          true
        );
      }
    }
  };

  handleMove(gesture: PanResponderGestureState, callback: (value: number) => void, isEnd = false) {
    const { dx } = gesture;
    let width: number = this.brightWidth + dx;
    // Boundary processing
    if (width < 0) {
      width = 0;
    } else if (width > this.sliderWidth) {
      width = this.sliderWidth;
    }

    const value = this.coorToValue(width);
    width = this.valueToWidth(value);
    this.brightAnimate.setValue(width);
    // @ts-ignore
    this.percentRef?.setNativeProps({ percent: this.formatPercent(value), brightWidth: width });

    if (isEnd) {
      this.brightWidth = width;
      this.setState({ value });
    }
    callback(value);
  }

  handleLayout = (e: LayoutChangeEvent) => {
    const { width } = e.nativeEvent.layout;
    const { value } = this.state;
    const { showPercent } = this.props;
    this.sliderWidth = width;
    this.brightWidth = this.valueToWidth(value);
    this.brightAnimate.setValue(this.brightWidth);
    this.showPercent = showPercent;
    this.forceUpdate();
  };

  formatPercent(value: number) {
    const { min, max, formatPercent, minPercent } = this.props;
    if (formatPercent) {
      return formatPercent(value);
    }
    return Math.round(((value - min) * (100 - minPercent)) / (max - min) + minPercent);
  }

  valueToWidth(value: number) {
    const { min, max } = this.props;
    const percent = Math.max(0, value - min) / (max - min);
    return percent * this.sliderWidth;
  }

  coorToValue(x: number) {
    const { min, max } = this.props;
    return Math.round((x / this.sliderWidth) * (max - min) + min);
  }

  render() {
    const { trackColor, activeColor, fontColor, style } = this.props;
    const { opacityAnimationValue, value } = this.state;
    const containerStyle = [styles.container, style, { opacity: opacityAnimationValue }];
    // @ts-ignore
    const { height = cx(40) } = StyleSheet.flatten(containerStyle);
    return (
      <Animated.View
        style={containerStyle}
        accessibilityLabel="ReactColorPicker_Slider"
        onLayout={this.handleLayout}
        pointerEvents="box-only"
        {...this._panResponder.panHandlers}
      >
        <View style={[styles.track, { backgroundColor: trackColor }]} />
        <Animated.View
          style={[
            styles.mark,
            {
              backgroundColor: activeColor,
              width: this.brightAnimate,
            },
          ]}
        />
        {this.showPercent && (
          <Percent
            ref={(ref: React.ReactNode) => (this.percentRef = ref)}
            percent={this.formatPercent(value)}
            colorOver={activeColor}
            colorInner={fontColor}
            width={this.sliderWidth}
            height={height}
            brightWidth={this.brightWidth}
          />
        )}
      </Animated.View>
    );
  }
}

interface IPercentProps {
  percent: number;
  colorOver: string;
  colorInner: string;
  width: number | string;
  height: number | string;
  brightWidth: number;
}

class Percent extends React.Component<IPercentProps, IPercentProps> {
  constructor(props: IPercentProps) {
    super(props);
    this.state = { ...this.props };
  }

  componentWillReceiveProps(nextProps: IPercentProps) {
    this.setState({ ...nextProps });
  }

  setNativeProps(nextProps: IPercentProps) {
    this.setState({ ...nextProps });
  }

  render() {
    const { percent, height, width, brightWidth, colorOver, colorInner } = this.state;
    let icon = icons.brightLevel1;
    if (percent > 20 && percent <= 60) {
      icon = icons.brightLevel2;
    } else if (percent > 60) {
      icon = icons.brightLevel3;
    }
    return (
      <View style={[styles.percent, { height, width }]}>
        <View style={{ flex: 1, alignItems: 'center', flexDirection: 'row' }}>
          <IconFont d={icon} size={32} color={colorOver} style={styles.percentIcon} />
          <TYText style={[styles.percentText, { color: colorOver }]} text={`${percent}%`} />
        </View>
        <View
          style={{
            position: 'absolute',
            overflow: 'hidden',
            opacity: 1,
            height: '100%',
            width: brightWidth,
            alignItems: 'center',
            flexDirection: 'row',
            backgroundColor: colorOver,
          }}
        >
          <IconFont style={styles.percentIcon} d={icon} size={32} color={colorInner} />
          <TYText style={[styles.percentText, { color: colorInner }]} text={`${percent}%`} />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: cx(40),
    width: '100%',
    marginTop: cx(2),
  },
  track: {
    width: '100%',
    height: '100%',
    backgroundColor: '#313131',
  },
  mark: {
    position: 'absolute',
    height: '100%',
    left: 0,
    backgroundColor: '#fff',
  },
  percent: {
    position: 'absolute',
    height: '100%',
    left: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  percentIcon: {
    marginLeft: 16,
  },
  percentText: {
    marginLeft: cx(6),
    fontSize: cx(16),
    fontWeight: 'bold',
  },
});
