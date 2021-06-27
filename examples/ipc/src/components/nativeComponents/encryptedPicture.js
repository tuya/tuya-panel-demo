/* eslint-disable react/require-default-props */
import React, { Component } from 'react';
import { requireNativeComponent } from 'react-native';
import { Utils } from 'tuya-panel-kit';
import PropTypes from 'prop-types';

const { isIos } = Utils.RatioUtils;
const AESImageView = isIos
  ? requireNativeComponent('TYRCTAESImageView')
  : requireNativeComponent('TYRCTEncryptImageManager');

export class AesImage extends Component {
  static propTypes = {};

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { style, info, ...androidProps } = this.props;
    if (isIos) {
      return <AESImageView info={info} style={style} {...this.props} />;
    }
    return <AESImageView style={style} {...androidProps} />;
  }
}

AesImage.propTypes = {
  onLoadSuccess: PropTypes.func,
  onLoadFailure: PropTypes.func,
};

export default AesImage;
