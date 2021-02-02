import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, Text, ViewPropTypes } from 'react-native';
import { Utils, IconFont } from 'tuya-panel-kit';
import icons from '../res/iconfont.json';

const { convertX: cx } = Utils.RatioUtils;

const ArrowText = props => {
  const { text, containerStyle, textStyle, tintColor } = props;

  const iconProps = {
    fill: tintColor,
    stroke: tintColor,
    style: styles.iconStyle,
    ...props,
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[styles.textStyle, textStyle, { color: tintColor }]}>{text}</Text>
      <IconFont d={icons.arrow} {...iconProps} />
    </View>
  );
};

ArrowText.propTypes = {
  text: PropTypes.string,
  tintColor: PropTypes.string,
  style: ViewPropTypes.style,
  containerStyle: ViewPropTypes.style,
  textStyle: ViewPropTypes.style,
};

ArrowText.defaultProps = {
  text: '',
  tintColor: '#000',
  style: {},
  containerStyle: {},
  textStyle: {},
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  textStyle: {
    fontSize: Math.max(16, cx(16)),
    marginLeft: cx(8),
    marginRight: cx(3),
  },
});

export default ArrowText;
