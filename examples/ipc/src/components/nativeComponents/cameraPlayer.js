import React from 'react';
import { requireNativeComponent, View } from 'react-native';
import PropTypes from 'prop-types';

const Player = requireNativeComponent('TYRCTCameraPlayer', CameraPlayer, {
  nativeOnly: { onChange: true },
});
class CameraPlayer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <Player
        {...this.props}
        onChange={event => {
          this.props.onChangePreview(event);
        }}
      />
    );
  }
}
// 老版本的RN使用propTypes来规范接口定义，这一做法已不再支持。 建议使用Flow和TypeScript来规范定义接口的具体结构

CameraPlayer.propTypes = {
  action: PropTypes.number.isRequired,
  onChangePreview: PropTypes.func.isRequired,
  ...View.propTypes,
};

module.exports = CameraPlayer;
