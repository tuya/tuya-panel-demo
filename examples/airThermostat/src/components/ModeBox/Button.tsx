import { Utils, TYText, IconFont } from 'tuya-panel-kit';
import React, { PureComponent } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  PanResponderInstance,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
  Image,
} from 'react-native';

const { convertY: cy, convertX: cx } = Utils.RatioUtils;
const { withTheme } = Utils.ThemeUtils;

interface Props {
  onPress: () => void;
  icon: string;
  image?: any;
  text: string;
  style?: any;
  theme?: any;
}

@withTheme
export default class Button extends PureComponent<Props> {
  panResponder: PanResponderInstance;
  startTime: number = 0;
  animation: Animated.Value = new Animated.Value(1);
  constructor(props: Props) {
    super(props);

    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: this.handleGrant,
      onPanResponderRelease: this.handleRelease,
    });
  }

  handleGrant = () => {
    this.startTime = +new Date();
  };
  handleRelease = (e: GestureResponderEvent, { dx, dy }: PanResponderGestureState) => {
    const now = +new Date();
    if (now - this.startTime < 300 && Math.abs(dx) < 4 && Math.abs(dy) < 4) {
      this.props.onPress();
    }
  };

  render() {
    const { icon, text, style, theme, image } = this.props;
    const {
      global: { brand: themeColor },
    } = theme;
    return (
      <View style={[styles.btn, style]} {...this.panResponder.panHandlers}>
        <View style={styles.iconBox}>
          {image ? (
            <Image source={image} style={styles.image} />
          ) : (
            <IconFont d={icon} color={themeColor} size={cx(40)} />
          )}
        </View>
        <TYText style={styles.label}>{text}</TYText>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  btn: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: cx(76),
    height: cx(76),
  },
  iconBox: {
    width: cx(76),
    height: cx(76),
    backgroundColor: '#fff',
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: '#fff',
    marginTop: 12,
    textAlign: 'center',
  },
});
