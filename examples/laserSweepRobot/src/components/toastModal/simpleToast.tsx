import React from 'react';
import {
  Animated,
  Text,
  View,
  Image,
  StyleSheet,
  Easing,
  ViewStyle,
  TextStyle,
  ImageStyle,
  StyleProp,
} from 'react-native';

import { Utils } from 'tuya-panel-kit';

const { convertY: cy, width } = Utils.RatioUtils;

enum position {
  top = 'top',
  bottom = 'bottom',
  center = 'center',
}

interface IProps {
  style: StyleProp<ViewStyle>;
  contentStyle: StyleProp<ViewStyle>;
  textStyle: StyleProp<TextStyle>;
  imageStyle: StyleProp<ImageStyle>;
  text: string;
  showPosition: position;
  image: number;
  children: any;
  onHide: () => void;
}
interface IState {
  fadeValue: any;
}
export default class ToastView extends React.Component<IProps, IState> {
  // eslint-disable-next-line react/static-property-placement
  static defaultProps = {
    style: null,
    contentStyle: null,
    textStyle: null,
    imageStyle: null,
    text: '',
    showPosition: 'bottom',
    image: null,
    children: null,
    onHide: null,
  };

  _timerId: number;

  constructor(props: IProps) {
    super(props);
    this.state = {
      fadeValue: new Animated.Value(0),
    };
  }

  componentWillUnmount() {
    this._timerId && clearTimeout(this._timerId);
  }

  onTimer = () => {
    clearTimeout(this._timerId);
    this._timerId = setTimeout(() => {
      this.startHideAnimation();
    }, 2000);
  };

  onHide() {
    const { onHide } = this.props;
    onHide && onHide();
  }

  startShowAnimation = () => {
    const { fadeValue } = this.state;
    fadeValue.setValue(0);
    Animated.timing(fadeValue, {
      toValue: 1,
      duration: 100,
      easing: Easing.linear,
    }).start(() => this.onTimer());
  };

  startHideAnimation = () => {
    const { fadeValue } = this.state;
    fadeValue.setValue(1);
    Animated.timing(fadeValue, {
      toValue: 0,
      duration: 500,
      easing: Easing.linear,
    }).start(() => this.onHide());
  };

  render() {
    this.startShowAnimation();

    const {
      style,
      contentStyle,
      textStyle,
      imageStyle,
      showPosition = 'bottom',
      image,
      children,
      text,
    } = this.props;
    const { fadeValue } = this.state;
    let pos = { justifyContent: 'flex-end' };
    if (showPosition === 'top') {
      pos = { justifyContent: 'flex-start' };
    } else if (showPosition === 'center') {
      pos = { justifyContent: 'center' };
    }
    return (
      <View style={[styles.container, style, pos]} pointerEvents="none">
        <Animated.View
          style={[
            styles.textBg,
            contentStyle,
            {
              opacity: fadeValue,
            },
          ]}
        >
          {typeof image === 'number' && <Image style={[styles.image, imageStyle]} source={image} />}
          {children || <Text style={[styles.text, textStyle]}>{text}</Text>}
        </Animated.View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    justifyContent: 'center',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    width,
    top: 0,
  },

  textBg: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `rgba(0, 0, 0, 0.6)`,
    borderRadius: cy(20),
    paddingLeft: cy(10),
    paddingRight: cy(10),
    paddingTop: cy(10),
    paddingBottom: cy(10),
    bottom: cy(130),
  },

  image: {
    marginBottom: cy(6),
  },

  text: {
    fontSize: cy(12),
    color: '#FFFFFF',
  },
});
