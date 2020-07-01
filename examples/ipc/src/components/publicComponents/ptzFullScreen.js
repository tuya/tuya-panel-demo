/* eslint-disable max-len */
/* eslint-disable camelcase */
import React from 'react';
import { View, StyleSheet, Image, ImageBackground, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { connect } from 'react-redux';
import CameraManager from '../../components/nativeComponents/cameraManager';
import Res from '../../res';
import { store } from '../../main';

class PtzFullScreen extends React.Component {
  static propTypes = {
    // eslint-disable-next-line react/require-default-props
    ptz_control: PropTypes.string,
    showfullScreen: PropTypes.func.isRequired,
  };
  constructor(props) {
    super(props);
    this.state = {
      upState: false,
      downState: false,
      leftState: false,
      rightState: false,
      showUp: false,
      showDown: false,
      showLeft: false,
      showRight: false,
    };
  }
  componentDidMount() {
    if (this.props.ptz_control !== undefined) {
      this.ptzControlRange();
    }
  }

  setUpState = state => {
    this.setState({
      upState: state,
    });
    this.props.showfullScreen();
    if (state) {
      CameraManager.startPtzUp();
    } else {
      CameraManager.stopPtz();
    }
  };

  setDownState = state => {
    this.setState({
      downState: state,
    });
    this.props.showfullScreen();
    if (state) {
      CameraManager.startPtzDown();
    } else {
      CameraManager.stopPtz();
    }
  };

  setLeftState = state => {
    this.setState({
      leftState: state,
    });
    this.props.showfullScreen();
    if (state) {
      CameraManager.startPtzLeft();
    } else {
      CameraManager.stopPtz();
    }
  };
  setRightState = state => {
    this.setState({
      rightState: state,
    });
    this.props.showfullScreen();
    if (state) {
      CameraManager.startPtzRight();
    } else {
      CameraManager.stopPtz();
    }
  };

  // 判定是否显示某方向的点
  ptzControlRange = () => {
    const state = store.getState();
    const { schema } = state.devInfo;
    const ptzSchema = schema.ptz_control;
    const ptz = ptzSchema.range;
    // 判定是否具有某方向的云台控制
    const hasTop = _.indexOf(ptz, '0');
    if (hasTop !== -1) {
      this.setState({
        showUp: true,
      });
    }
    const hasBottom = _.indexOf(ptz, '4');
    if (hasBottom !== -1) {
      this.setState({
        showDown: true,
      });
    }
    const hasLeft = _.indexOf(ptz, '6');
    if (hasLeft !== -1) {
      this.setState({
        showLeft: true,
      });
    }
    const hasRight = _.indexOf(ptz, '2');
    if (hasRight !== -1) {
      this.setState({
        showRight: true,
      });
    }
  };

  render() {
    const { ptz_control } = this.props;
    return (
      <View style={styles.container}>
        {ptz_control !== undefined && (
          <ImageBackground source={Res.ptzZoomFull.ptzBgcImg} style={[styles.bgcBox]}>
            {this.state.upState && (
              <Image style={styles.shadowImg} source={Res.ptzZoomFull.ptzClickTop} />
            )}
            {this.state.showUp && (
              <TouchableOpacity
                activeOpacity={1}
                style={styles.up_style}
                onPressIn={() => this.setUpState(true)}
                onPressOut={() => this.setUpState(false)}
                accessibilityLabel="tuya_ipc_direction_up"
              >
                <Image source={Res.ptzZoomFull.ptzDot} style={styles.ptzDot} />
              </TouchableOpacity>
            )}
            {this.state.downState && (
              <Image style={styles.shadowImg} source={Res.ptzZoomFull.ptzClickBottom} />
            )}
            {this.state.showDown && (
              <TouchableOpacity
                activeOpacity={1}
                style={styles.down_style}
                onPressIn={() => this.setDownState(true)}
                onPressOut={() => this.setDownState(false)}
                accessibilityLabel="tuya_ipc_direction_down"
              >
                <Image source={Res.ptzZoomFull.ptzDot} style={styles.ptzDot} />
              </TouchableOpacity>
            )}
            {this.state.leftState && (
              <Image style={styles.shadowImg} source={Res.ptzZoomFull.ptzClickLeft} />
            )}
            {this.state.showLeft && (
              <TouchableOpacity
                activeOpacity={1}
                style={styles.left_style}
                onPressIn={() => this.setLeftState(true)}
                onPressOut={() => this.setLeftState(false)}
                accessibilityLabel="tuya_ipc_direction_left"
              >
                <Image source={Res.ptzZoomFull.ptzDot} />
              </TouchableOpacity>
            )}

            {this.state.rightState && (
              <Image style={styles.shadowImg} source={Res.ptzZoomFull.ptzClickRight} />
            )}
            {this.state.showRight && (
              <TouchableOpacity
                activeOpacity={1}
                style={styles.right_style}
                onPressIn={() => this.setRightState(true)}
                onPressOut={() => this.setRightState(false)}
                accessibilityLabel="tuya_ipc_direction_right"
              >
                <Image source={Res.ptzZoomFull.ptzDot} />
              </TouchableOpacity>
            )}
          </ImageBackground>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  bgcBox: {
    width: 120,
    height: 120,
  },
  shadowImg: {
    width: 120,
    height: 120,
  },
  ptzDot: {
    width: 20,
    resizeMode: 'contain',
  },
  up_style: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    top: 0,
    borderTopLeftRadius: 70,
    borderTopRightRadius: 70,
    height: 40,
  },
  down_style: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    bottom: 0,
    borderBottomLeftRadius: 70,
    borderBottomRightRadius: 70,
    height: 40,
  },
  left_style: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    top: 10,
    left: 0,
    width: 40,
    height: 100,
    borderTopLeftRadius: 60,
    borderBottomLeftRadius: 60,
  },

  right_style: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    top: 10,
    right: 0,
    width: 40,
    height: 100,
    borderTopRightRadius: 60,
    borderBottomRightRadius: 60,
  },
});
const mapStateToProps = state => {
  // eslint-disable-next-line camelcase
  const { ptz_control } = state.dpState;
  return {
    ptz_control,
  };
};

export default connect(mapStateToProps, null)(PtzFullScreen);
