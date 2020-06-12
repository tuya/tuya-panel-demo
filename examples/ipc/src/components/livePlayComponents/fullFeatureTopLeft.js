/* eslint-disable max-len */
import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Animated, TouchableOpacity, Image } from 'react-native';
import _ from 'lodash';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { isFullScreen as isFullScreenAction } from '../../redux/modules/ipcCommon';
import CameraManager from '../nativeComponents/cameraManager';
import Config from '../../config';
import Res from '../../res';

const { cx } = Config;

class FullFeatureTopLeft extends React.Component {
  static propTypes = {
    isFullScreenAction: PropTypes.func.isRequired,
    hideFullMenu: PropTypes.bool.isRequired,
    changeHideFullMenuState: PropTypes.func.isRequired,
    absoluteValue: PropTypes.number.isRequired,
    stopFullAnimation: PropTypes.bool.isRequired,
    showSelfModal: PropTypes.bool.isRequired,
  };
  constructor(props) {
    super(props);
    this.state = {
      btnAnim: new Animated.Value(10),
    };
    this.timerId = null;
  }
  componentWillReceiveProps(nextProps) {
    const oldProps = this.props;
    if (!_.isEqual(oldProps.hideFullMenu, nextProps.hideFullMenu)) {
      this.animatePlayerFeature(nextProps.hideFullMenu);
    }
    if (!_.isEqual(oldProps.stopFullAnimation, nextProps.stopFullAnimation)) {
      if (nextProps.stopFullAnimation) {
        this.stopAnimateFullScreen();
      }
    }
  }
  componentWillUnmount() {
    clearTimeout(this.timerId);
  }
  stopAnimateFullScreen = () => {
    clearTimeout(this.timerId);
    this.showFullScreenBtn();
  };
  /**
   * 隐藏全屏按钮定时器
   */
  hideButtonTimer = () => {
    this.timerId = setTimeout(() => {
      this.hideFullScreenBtn();
      this.props.changeHideFullMenuState(true);
    }, 5000);
  };
  hideFullScreenBtn = () => {
    //  const { offsetDistance } = this.state;
    Animated.timing(this.state.btnAnim, {
      toValue: -65,
    }).start();
  };

  showFullScreenBtn() {
    Animated.timing(this.state.btnAnim, {
      toValue: 10,
    }).start();
  }
  animatePlayerFeature = showAnimate => {
    clearTimeout(this.timerId);
    if (showAnimate) {
      this.hideFullScreenBtn();
    } else {
      this.showFullScreenBtn();
      this.hideButtonTimer();
      this.props.changeHideFullMenuState(false);
    }
  };

  backFullScreen = () => {
    // clearTimeout(this.timerId);
    this.props.isFullScreenAction({ isFullScreen: false });
    CameraManager.setScreenOrientation(0);
  };
  render() {
    const { btnAnim } = this.state;
    const { absoluteValue, showSelfModal } = this.props;
    return (
      <Animated.View style={[styles.fullFeatureTopLeftPage, { top: btnAnim, left: absoluteValue }]}>
        {!showSelfModal && (
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.backArrow}
            onPress={this.backFullScreen}
            accessibilityLabel="tuya_ipc_fullscreen_back"
          >
            <Image source={Res.publicImage.backArrow} style={styles.backArrowImg} />
          </TouchableOpacity>
        )}
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  fullFeatureTopLeftPage: {
    position: 'absolute',
    padding: cx(5),
  },
  backArrow: {
    width: cx(30),
    height: cx(30),
    borderRadius: Math.ceil(cx(15)),
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrowImg: {
    width: cx(30),
    resizeMode: 'contain',
  },
});

const mapToDisPatch = dispatch => {
  return bindActionCreators({ isFullScreenAction }, dispatch);
};

export default connect(null, mapToDisPatch)(FullFeatureTopLeft);
