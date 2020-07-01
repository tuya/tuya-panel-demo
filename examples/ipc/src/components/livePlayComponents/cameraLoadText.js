/* eslint-disable max-len */
/* eslint-disable react/require-default-props */
/* eslint-disable camelcase */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
  Platform,
  Easing,
} from 'react-native';
import { TYText, TYSdk } from 'tuya-panel-kit';
import CameraManager from '../../components/nativeComponents/cameraManager';
import {
  isFullScreen as isFullScreenAction,
  videoLoadText as videoLoadTextAction,
  reGetStream as reGetStreamAction,
  showTryAgain as showTryAgainAction,
} from '../../redux/modules/ipcCommon';
import Config from '../../config';
import Res from '../../res';
import Strings from '../../i18n';

const { cx, smallScreen } = Config;
const TYDevice = TYSdk.device;

class CameraLoadText extends React.Component {
  static propTypes = {
    reGetStreamAction: PropTypes.func.isRequired,
    showTryAgainAction: PropTypes.func.isRequired,
    showTryAgain: PropTypes.bool.isRequired,
    isFullScreen: PropTypes.bool.isRequired,
    isFullScreenAction: PropTypes.func.isRequired,
    // eslint-disable-next-line react/require-default-props
    basic_private: PropTypes.bool,
    videoLoadText: PropTypes.string.isRequired,
    videoLoadTextAction: PropTypes.func.isRequired,
    deviceOnline: PropTypes.bool,
    isShare: PropTypes.bool,
    playerWidth: PropTypes.number.isRequired,
    playerHeight: PropTypes.number.isRequired,
  };
  constructor(props) {
    super(props);
    this.state = {
      rotateValue: new Animated.Value(0),
    };
    this.rotateV = 0;
  }
  componentDidMount() {
    this.startAnimation();
  }
  componentWillReceiveProps() {
    this.startAnimation();
  }
  componentWillUnmount() {
    this.state.rotateValue.stopAnimation();
  }
  // 动画函数
  startAnimation = () => {
    this.state.rotateValue.stopAnimation();
    this.state.rotateValue.setValue(this.rotateV);
    Animated.timing(this.state.rotateValue, {
      toValue: 1,
      duration: 500,
      useNativeDriver: Platform.OS === 'ios',
      easing: Easing.linear,
      // easing: t => parseInt(t / 0.125) * 0.125,
    }).start(({ finished }) => {
      if (finished) {
        this.startAnimation();
      }
    });
  };
  stopAnimation = () => {
    this.state.rotateValue.stopAnimation(d => {
      this.rotateV = d;
    });
  };
  // 调取父组件，重新获取视频流
  reConnectVideo = () => {
    // 点击开启摄像头，只下发dp点私人模式，在player组件的willReceive检测到此dp点的变化，进行重新拉取
    const { basic_private } = this.props;
    if (basic_private) {
      // 下发隐私模式，在customplayer中监听隐私模式的改变,再获取视频流
      TYDevice.putDeviceData({ basic_private: false });
      this.props.showTryAgainAction({ showTryAgain: false });
      this.props.videoLoadTextAction({ videoLoadText: Strings.getLang('reOpenStream') });
    } else {
      // 其他直接通过变更自定义reGetStream的值,在customplayer中监听其值的改变,重新拉取视频流
      this.props.showTryAgainAction({ showTryAgain: false });
      this.props.videoLoadTextAction({ videoLoadText: Strings.getLang('reConenectStream') });
      this.props.reGetStreamAction({ reGetStream: true });
    }
  };
  exitFullScreen = () => {
    this.props.isFullScreenAction({ isFullScreen: false });
    CameraManager.setScreenOrientation(0);
  };
  render() {
    // loadingText,
    const {
      videoLoadText,
      showTryAgain,
      basic_private,
      isFullScreen,
      deviceOnline,
      isShare,
      playerWidth,
      playerHeight,
    } = this.props;
    const fullLoadContainer = {
      width: playerWidth,
      height: playerHeight,
    };
    const normalLoadContainer = {
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
    };
    return (
      <View
        style={[styles.cameraLoadTextPage, isFullScreen ? fullLoadContainer : normalLoadContainer]}
      >
        {isFullScreen && (
          <TouchableOpacity
            style={styles.backIconBox}
            onPress={this.exitFullScreen}
            activeOpacity={0.7}
          >
            <Image source={Res.publicImage.backArrow} style={styles.arrowIcon} />
          </TouchableOpacity>
        )}
        <View style={styles.loadingBox}>
          {!showTryAgain && deviceOnline && (
            <View style={styles.loadAnimBox}>
              <Image source={Res.loadingRes.loadingAnimImg} style={styles.loadingAnimImg} />
              <Animated.Image
                style={[
                  {
                    // resizeMode: 'contain',
                    transform: [
                      {
                        rotate: this.state.rotateValue.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg'],
                        }),
                      },
                    ],
                  },
                  styles.loadImage,
                ]}
                source={Res.loadingRes.loadAnim}
              />
            </View>
          )}
          <TYText numberOfLines={1} style={styles.loadingText}>
            {videoLoadText}
          </TYText>
        </View>
        <TouchableOpacity
          onPress={this.reConnectVideo}
          activeOpacity={0.7}
          accessibilityLabel="tuya_ipc_retry"
        >
          {showTryAgain && !basic_private && (
            <TYText numberOfLines={1} style={styles.retryText}>
              {Strings.getLang('tryAgain')}
            </TYText>
          )}
          {/* 这边还需判断私人模式 */}
          {showTryAgain && basic_private && !isShare && (
            <TYText numberOfLines={1} style={styles.retryText}>
              {Strings.getLang('reWakeCamera')}
            </TYText>
          )}
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  cameraLoadTextPage: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  backIconBox: {
    position: 'absolute',
    left: cx(10),
    top: Platform.OS === 'ios' ? cx(18) : cx(18),
  },
  arrowIcon: {
    width: cx(32),
    resizeMode: 'contain',
  },
  loadingBox: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadAnimBox: {
    width: cx(50),
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingAnimImg: {
    width: cx(32),
    resizeMode: 'contain',
  },
  loadImage: {
    backgroundColor: 'transparent',
    position: 'absolute',
    flex: 1,
    top: smallScreen ? (Platform.OS === 'ios' ? cx(9) : cx(8)) : cx(7),
  },
  loadingText: {
    marginTop: cx(8),
    color: '#fff',
    fontSize: cx(14),
  },
  retryText: {
    marginTop: cx(8),
    color: '#1F78E0',
    fontSize: cx(16),
    textDecorationLine: 'underline',
  },
});

const mapStateToProps = state => {
  const { basic_private } = state.dpState;
  const { isFullScreen, videoLoadText, showTryAgain } = state.ipcCommonState;
  const { deviceOnline, isShare } = state.devInfo;
  return {
    basic_private,
    isFullScreen,
    videoLoadText,
    showTryAgain,
    deviceOnline,
    isShare,
  };
};
const mapToDisPatch = dispatch => {
  return bindActionCreators(
    { isFullScreenAction, videoLoadTextAction, reGetStreamAction, showTryAgainAction },
    dispatch
  );
};

export default connect(mapStateToProps, mapToDisPatch)(CameraLoadText);
