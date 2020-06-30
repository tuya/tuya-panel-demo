import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, Animated, TouchableOpacity, Image } from 'react-native';
import { TYText } from 'tuya-panel-kit';
import _ from 'lodash';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { showSelfModal as showSelfModalAction } from '../../redux/modules/ipcCommon';
import Config from '../../config';
import {
  operatMute,
  isRecordingNow,
  isRecordingChangeMute,
  isWirlesDevice,
} from '../../config/click';
import BatteryCommon from '../publicComponents/batteryCommon';
import Res from '../../res';
import Strings from '../../i18n';

const { cx, isIOS } = Config;

class FullFeatureTopRight extends React.Component {
  static propTypes = {
    hideFullMenu: PropTypes.bool.isRequired,
    changeHideFullMenuState: PropTypes.func.isRequired,
    showSelfModalAction: PropTypes.func.isRequired,
    showSelfModal: PropTypes.bool.isRequired,
    isRecording: PropTypes.bool.isRequired,
    voiceStatus: PropTypes.string.isRequired,
    clarityStatus: PropTypes.string.isRequired,
    isSupportedSound: PropTypes.bool.isRequired,
    absoluteValue: PropTypes.number.isRequired,
    stopFullAnimation: PropTypes.bool.isRequired,
    changeStopAnimateState: PropTypes.func.isRequired,
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
  /**
   * 隐藏全屏按钮定时器
   */
  hideButtonTimer = () => {
    this.timerId = setTimeout(() => {
      this.hideFullScreenBtn();
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
  stopAnimateFullScreen = () => {
    clearTimeout(this.timerId);
    this.showFullScreenBtn();
  };
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
  // 静音的方法
  enableMute = () => {
    this.props.changeStopAnimateState();
    if (isRecordingChangeMute()) {
      return false;
    }
    const { voiceStatus } = this.props;
    let sendMute = 'off';
    if (voiceStatus === 'off') {
      sendMute = 'on';
    }
    operatMute(sendMute);
  };

  // 切换清晰度
  switchClarity = () => {
    this.props.changeStopAnimateState();
    if (isRecordingNow()) {
      return false;
    }
    this.props.showSelfModalAction({
      showSelfModal: true,
    });
  };
  render() {
    const { btnAnim } = this.state;
    const {
      showSelfModal,
      isSupportedSound,
      voiceStatus,
      clarityStatus,
      absoluteValue,
    } = this.props;
    return (
      <Animated.View
        style={[styles.fullFeatureTopRightPage, { top: btnAnim, right: absoluteValue }]}
      >
        {!showSelfModal && (
          <View style={styles.topRightBox}>
            {isSupportedSound && (
              <TouchableOpacity
                accessibilityLabel={
                  voiceStatus === 'off' ? 'tuya_ipc_full_speaker_on' : 'tuya_ipc_full_speaker_off'
                }
                activeOpacity={0.7}
                style={styles.topMuteBox}
                onPress={this.enableMute}
              >
                <Image
                  source={
                    voiceStatus === 'off' ? Res.publicImage.basicMute : Res.publicImage.basicNotMute
                  }
                  style={styles.topMuteImg}
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.topResolutionBox}
              onPress={this.switchClarity}
              accessibilityLabel={
                clarityStatus === 'SD'
                  ? 'tuya_ipc_resolution_full_sd'
                  : 'tuya_ipc_resolution_full_hd'
              }
            >
              <TYText style={styles.topResolutionText} numberOfLines={1}>
                {clarityStatus === 'SD'
                  ? Strings.getLang('resolutionStandard')
                  : Strings.getLang('resolutionHigh')}
              </TYText>
            </TouchableOpacity>
            {isWirlesDevice() ? (
              <View style={{ marginLeft: Math.ceil(cx(4)) }}>
                <BatteryCommon />
              </View>
            ) : null}
          </View>
        )}
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  fullFeatureTopRightPage: {
    position: 'absolute',
    padding: cx(5),
  },
  topRightBox: {
    flexDirection: 'row',
    top: cx(3),
  },
  topMuteBox: {},
  topMuteImg: {
    width: cx(40),
    resizeMode: 'contain',
  },
  topResolutionBox: {},
  topResolutionText: {
    marginLeft: Math.ceil(cx(9)),
    fontSize: Math.ceil(cx(12)),
    color: '#fff',
    textAlign: 'center',
    textAlignVertical: 'center',
    paddingHorizontal: Math.ceil(cx(4)),
    paddingVertical: isIOS ? Math.ceil(cx(2)) : Math.ceil(0),
    borderWidth: 2,
    borderColor: '#fff',
    fontWeight: '600',
    borderRadius: 4,
    overflow: 'hidden',
  },
});

const mapStateToProps = state => {
  const {
    isRecording,
    voiceStatus,
    clarityStatus,
    hasAudio,
    showSelfModal,
    isSupportedSound,
  } = state.ipcCommonState;
  return {
    isRecording,
    voiceStatus,
    clarityStatus,
    hasAudio,
    showSelfModal,
    isSupportedSound,
  };
};
const mapToDisPatch = dispatch => {
  return bindActionCreators({ showSelfModalAction }, dispatch);
};

export default connect(mapStateToProps, mapToDisPatch)(FullFeatureTopRight);
