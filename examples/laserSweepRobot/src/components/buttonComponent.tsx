import React, { Component } from 'react';
import {
  Image,
  TouchableOpacity,
  View,
  StyleSheet,
  ColorPropType,
  ActivityIndicator,
  ViewStyle,
  StyleProp,
  TextStyle,
  ImageStyle
} from 'react-native';
import { TYText, IconFont, Utils } from 'tuya-panel-kit';
const { convertX: cx } = Utils.RatioUtils;

const toString = Object.prototype.toString;
const isNumber = v => toString.call(v) === '[object Number]';
const isString = v => toString.call(v) === '[object String]';

interface IProps {
  children?: React.ReactNode;
  activeOpacity?: number;
  onPress?: () => void;
  onLongPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  style?: StyleProp<ViewStyle>;
  cStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  imageBoxStyle?: StyleProp<ViewStyle>;
  image?: number | string | { uri?: string };
  text?: string;
  textDirection?: 'left' | 'top' | 'right' | 'bottom';
  icon?: string;
  iconStyle?: StyleProp<ViewStyle>;
  iconColor?: typeof ColorPropType;
  iconSize?: number;
  disabled?: boolean;
  isView?: boolean;
  schedule?: number;
  loading?: boolean;
  loadingColor?: string;
}

export default class Button extends Component<IProps, any> {

  static defaultProps = {
    children: null,
    textDirection: 'bottom',
    activeOpacity: 0.6,
    style: null,
    cStyle: null,
    text: null,
    textStyle: null,
    imageStyle: null,
    imageBoxStyle: null,
    image: null,
    icon: null,
    iconStyle: null,
    iconSize: 18,
    iconColor: '#fff',
    onPress: null,
    onLongPress: null,
    onPressIn: null,
    onPressOut: null,
    // disabled: true,
    diabled: false,
    isView: false,
    schedule: 0
  };
  onLongPress: any;
  onPress: any;
  onPressIn: any;
  onPressOut: any;

  constructor(props) {
    super(props);
    this.onPress = this._onPress.bind(this);
    this.onLongPress = this._onLongPress.bind(this);
    this.onPressIn = this._onPressIn.bind(this);
    this.onPressOut = this._onPressOut.bind(this);
    this.state = {
      buttonWidth: 0,
      buttonHeight: 0
    }
  }

  _onPress() {
    const { disabled, onPress } = this.props
    if (disabled) return;
    if (onPress) {
      onPress();
    }
  }

  _onLongPress() {
    const { disabled, onLongPress } = this.props
    if (disabled) return;
    if (onLongPress) {
      onLongPress();
    }
  }

  _onPressOut() {
    const { disabled, onPressOut } = this.props
    if (disabled) return;
    if (onPressOut) {
      onPressOut();
    }
  }

  _onPressIn() {
    const { disabled, onPressIn } = this.props
    if (disabled) return;
    if (onPressIn) {
      onPressIn();
    }
  }

  filterLayoutAttrs = style => {
    const wrappedStyle = {};
    let flattenStyle;
    const needSaveLayoutAttrs = [
      'opacity',
      'width',
      'height',
      // 'flex',
      'justifyContent',
      'alignItems',
    ];
    if (style) {
      flattenStyle = { ...StyleSheet.flatten(style) };
      needSaveLayoutAttrs.forEach(curAttr => {
        flattenStyle[curAttr] &&
          (wrappedStyle[curAttr] = flattenStyle[curAttr]);
      });
      if (flattenStyle.opacity) {
        delete flattenStyle.opacity;
      }
    }

    return {
      wrapperStyle: flattenStyle,
      wrappedStyle,
    };
  };

  packageImage = image => {
    if (isNumber(image)) return image;
    if (isString(image)) return { uri: image };
    return image;
  };

  renderImage = () => {
    const { image, imageBoxStyle, imageStyle } = this.props;
    const imageNode = (
      <Image
        style={[styles.imgStyle, imageStyle]}
        source={this.packageImage(image)}
        resizeMode="center"
      />
    );
    if (imageBoxStyle) {
      return <View style={imageBoxStyle}>{imageNode}</View>;
    }
    return imageNode;
  };

  render() {
    const {
      cStyle,
      style,
      text,
      textStyle,
      textDirection,
      imageStyle,
      imageBoxStyle,
      image,
      disabled: _disabled,
      icon,
      iconStyle,
      iconSize,
      iconColor,
      children,
      isView,
      loading,
      loadingColor,
      schedule,
      activeOpacity,

    } = this.props;
    const { buttonWidth } = this.state;
    const disabled = _disabled || loading;
    const direction =
      text && (textDirection === 'left' || textDirection === 'right')
        ? 'row'
        : 'column';

    const { wrapperStyle, wrappedStyle } = this.filterLayoutAttrs(style);
    const WrapperElement = isView ? View : TouchableOpacity;

    return (
      <WrapperElement
        disabled={disabled}
        activeOpacity={activeOpacity}
        onLongPress={this.onLongPress}
        onPress={this.onPress}
        onPressIn={this.onPressIn}
        style={[wrapperStyle, { overflow: 'hidden' }]}
        onPressOut={this.onPressOut}
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          this.setState({
            buttonWidth: width,
            buttonHeight: height
          })
        }}
      >
        {
          schedule ? <View style={
            [
              style,
              {
                position: 'absolute',
                top: 0,
                left: 0,
                backgroundColor: 'rgba(52, 218,205, 0.4)',
                minWidth: 0,
                width: buttonWidth * schedule / 100,
                height: cx(29),
                borderWidth: StyleSheet.hairlineWidth,
              }
            ]
          } /> : null
        }

        <View
          style={[
            wrappedStyle,
            styles.container,
            { flexDirection: direction },
            disabled && { opacity: 0.4 },
          ]}
        >
          {loading && (
            <ActivityIndicator
              style={{ marginRight: 3 }}
              size="small"
              color={loadingColor}
            ></ActivityIndicator>
          )}
          {!!text && (textDirection === 'left' || textDirection === 'top') && (
            <TYText
              style={[styles.txtStyle, textStyle]}
            >
              {text}
            </TYText>
          )}
          {!!image && this.renderImage()}
          {!!icon && (
            <View style={[styles.iconWrapStyle, iconStyle]}>
              <IconFont d={icon} size={iconSize} color={iconColor} />
            </View>
          )}
          {!!children && children}
          {!!text && (textDirection === 'right' || textDirection === 'bottom') && (
            <TYText
              style={[styles.txtStyle, textStyle]}
            >
              {text}
            </TYText>
          )}
        </View>
      </WrapperElement>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },

  imgStyle: {
    backfaceVisibility: 'visible',
  },

  txtStyle: {
    textAlign: 'center',
    backgroundColor: 'transparent',
  },

  iconWrapStyle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
