import React from 'react';
import PropTypes from 'prop-types';
import { View, Image, ViewPropTypes } from 'react-native';
import { Rect } from 'react-native-svg';
import { LinearGradient } from 'tuya-panel-kit';
import _pickBy from 'lodash/pickBy';

const ShadowImage = props => {
  const { width, height, source, containerStyle, imageStyle } = props;
  const baseKeys = ['width', 'height', 'containerStyle', 'source', 'imageStyle'];
  const linearGradientKeys = _pickBy(this.props, key => !baseKeys.includes(key));
  return (
    <View style={containerStyle}>
      <Image source={source} style={imageStyle} />
      <LinearGradient
        stops={{
          '0%': 'rgba(0,0,0,0.8)',
          '40%': 'rgba(31,29,28,0.3)',
        }}
        {...linearGradientKeys}
      >
        <Rect x="0" y="0" height={height} width={width} />
      </LinearGradient>
    </View>
  );
};

ShadowImage.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  containerStyle: ViewPropTypes.style,
  source: PropTypes.any,
  imageStyle: Image.propTypes.style,
  ...LinearGradient.propTypes,
};

ShadowImage.defaultProps = {
  source: null,
  containerStyle: {},
  imageStyle: {},
};

export default ShadowImage;
