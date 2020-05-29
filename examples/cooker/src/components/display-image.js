/* eslint-disable */
import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  ColorPropType,
  ViewPropTypes,
  Platform,
  TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';
import { Utils, TYText } from 'tuya-panel-kit';

const { convertX: cx } = Utils.RatioUtils;
const WRAP_WIDTH = cx(84);
const CIRCLE_WIDTH = WRAP_WIDTH - cx(20);
const RECIPE_IMAGE_WIDTH = cx(51);
const Res = {
  wrap: require('../res/wrap_mode.png'),
  wrap_select: require('../res/wrap_mode_select.png'),
  wrapCircle: require('../res/wrap-circle.png'),
};

const DisplayImage = props => {
  const {
    style,
    image,
    containerStyle,
    imageStyle,
    imageWrapStyle,
    isSelected,
    themeColor,
    textStyle,
    text,
    onPress,
  } = props;
  const Component = onPress ? TouchableOpacity : View;
  return (
    <Component style={[styles.container, style]}>
      <View style={[styles.ImageWrap, containerStyle]}>
        <Image style={[styles.iconWrap, imageWrapStyle]} source={Res.wrap} />
        <View style={styles.icon}>
          <Image style={[styles.icon, imageStyle]} resizeMode="stretch" source={image} />
        </View>
        {isSelected && (
          <Image source={Res.wrapCircle} style={[styles.circle, { tintColor: themeColor }]} />
        )}
      </View>
      <TYText text={text} style={[styles.text, { color: '#333' }, textStyle]} />
    </Component>
  );
};

DisplayImage.propTypes = {
  containerStyle: ViewPropTypes.style,
  image: PropTypes.any,
  imageStyle: Image.propTypes.style,
  themeColor: ColorPropType,
  style: ViewPropTypes.style,
  onPress: PropTypes.func,
};

DisplayImage.defaultProps = {
  image: null,
  containerStyle: {},
  imageStyle: {},
  themeColor: '#fff',
  style: {},
  onPress: null,
};

const styles = StyleSheet.create({
  container: {
    width: WRAP_WIDTH,
    height: cx(120),
    alignItems: 'center',
  },

  ImageWrap: {
    width: WRAP_WIDTH,
    height: WRAP_WIDTH,
    borderRadius: WRAP_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconWrap: {
    width: WRAP_WIDTH,
    height: WRAP_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },

  icon: {
    width: RECIPE_IMAGE_WIDTH,
    height: RECIPE_IMAGE_WIDTH,
    borderRadius: Platform.OS === 'android' ? RECIPE_IMAGE_WIDTH : RECIPE_IMAGE_WIDTH / 2,
    overflow: 'hidden',
  },

  circle: {
    width: CIRCLE_WIDTH,
    height: CIRCLE_WIDTH,
    resizeMode: 'stretch',
    position: 'absolute',
  },

  text: {
    fontSize: cx(12),
    fontWeight: '500',
    backgroundColor: 'transparent',
  },
});

export default DisplayImage;
