/* eslint-disable max-len */
import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, Animated, TouchableOpacity, Image } from 'react-native';
import _ from 'lodash';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { isFullScreen as isFullScreenAction } from '../../redux/modules/ipcCommon';
import CameraManager from '../nativeComponents/cameraManager';
import Config from '../../config';
import {
  snapShoot,
  enableRecord,
  enableStartTalk,
  enableStopTalk,
  operatMute,
} from '../../config/click';
import Res from '../../res';
import Strings from '../../i18n';

const { cx } = Config;

class FullFeatureBottomRight extends React.Component {
  static propTypes = {
    hideFullMenu: PropTypes.bool.isRequired,
    changeHideFullMenuState: PropTypes.func.isRequired,
    isInterCom: PropTypes.bool.isRequired,
    isRecording: PropTypes.bool.isRequired,
    showMic: PropTypes.bool.isRequired,
    hasAudio: PropTypes.bool.isRequired,
    absoluteValue: PropTypes.number.isRequired,
    stopFullAnimation: PropTypes.bool.isRequired,
    changeStopAnimateState: PropTypes.func.isRequired,
    showSelfModal: PropTypes.bool.isRequired,
    isRecordingDisabled: PropTypes.bool.isRequired,
  };
  constructor(props) {
    super(props);
    this.state = {
      btnAnim: new Animated.Value(props.absoluteValue),
      featureMenu: [
        { test: 'tuya_ipc_record_full_on', key: 'video', imageSource: Res.publicImage.fullVideo },
        { test: 'tuya_ipc_full_snap', key: 'photo', imageSource: Res.publicImage.fullCutScreen },
      ],
    };
    this.timerId = null;
  }
  componentDidMount() {
    const { hasAudio, isInterCom } = this.props;
    const { featureMenu } = this.state;
    const newFeatureMenu = featureMenu;
    const adObjMic = {
      test: 'tuya_ipc_talk_on',
      key: 'mic',
      imageSource: isInterCom ? Res.publicImage.fullOneWayTalk : Res.publicImage.fullTwoWayTalk,
    };
    if (hasAudio) {
      newFeatureMenu.splice(1, 0, adObjMic);
      this.setState({
        featureMenu: newFeatureMenu,
      });
    }
  }
  componentWillReceiveProps(nextProps) {
    const oldProps = this.props;
    const oldArr = this.state.featureMenu;
    if (!_.isEqual(oldProps.hideFullMenu, nextProps.hideFullMenu)) {
      this.animatePlayerFeature(nextProps.hideFullMenu);
    }
    if (!_.isEqual(oldProps.stopFullAnimation, nextProps.stopFullAnimation)) {
      if (nextProps.stopFullAnimation) {
        this.stopAnimateFullScreen();
      }
    }
    if (oldProps.showMic !== nextProps.showMic || oldProps.isInterCom !== nextProps.isInterCom) {
      for (let i = 0; i < oldArr.length; i++) {
        if (oldArr[i].key === 'mic') {
          if (nextProps.showMic) {
            if (nextProps.isInterCom) {
              oldArr[i].imgSource = Res.publicImage.fullOneWayTalk;
              oldArr[i].test = 'tuya_ipc_full_talk_off';
            } else {
              oldArr[i].imgSource = Res.publicImage.fullTwoWayTalk;
              oldArr[i].test = 'tuya_ipc_full_talk_off';
            }
          } else if (nextProps.isInterCom) {
            oldArr[i].imgSource = Res.publicImage.fullOneWayTalk;
            oldArr[i].test = 'tuya_ipc_full_talk_on';
          } else {
            oldArr[i].imgSource = Res.publicImage.fullTwoWayTalk;
            oldArr[i].test = 'tuya_ipc_full_talk_on';
          }
        }
      }
    }

    // 对全屏的进行判断
    // 这个判断针对是否有对讲，在P2P建立连接之后，进行判断，这部分与ComponentDidMount周期内进行数据的改变是一样的,它们当中也只有一个会执行。
    if (oldProps.hasAudio !== nextProps.hasAudio) {
      if (nextProps.hasAudio) {
        const { hasAudio, isInterCom } = nextProps;
        const { featureMenu } = this.state;
        const newFeatureMenu = featureMenu;
        const adObjMic = {
          test: 'tuya_ipc_full_talk_on',
          key: 'mic',
          imageSource: isInterCom ? Res.publicImage.fullOneWayTalk : Res.publicImage.fullTwoWayTalk,
        };
        if (hasAudio) {
          newFeatureMenu.splice(1, 0, adObjMic);
          this.setState({
            featureMenu: newFeatureMenu,
          });
        }
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
      toValue: -Math.ceil(cx(120)),
    }).start();
  };

  showFullScreenBtn() {
    Animated.timing(this.state.btnAnim, {
      toValue: this.props.absoluteValue,
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
  captureCamera = () => {
    snapShoot();
  };
  videoCamera = () => {
    enableRecord();
  };
  // 单向对讲，关闭声音，双向对讲开启声音
  micCamera = () => {
    const { isInterCom, showMic } = this.props;
    // 单向对讲
    if (isInterCom) {
      CameraManager.showTip(Strings.getLang('holdToTalk'));
    } else if (showMic) {
      enableStopTalk();
    } else {
      // 开启声音
      operatMute('on');
      enableStartTalk();
    }
  };

  clickBottom = key => {
    //  this.stopAnimateFullScreen();
    this.props.changeStopAnimateState();
    switch (key) {
      case 'video':
        this.videoCamera();
        break;
      case 'mic':
        this.micCamera();
        break;
      case 'photo':
        this.captureCamera();
        break;
      default:
        return false;
    }
  };

  clickLongSingleMic = key => {
    const { isInterCom } = this.props;
    if (key === 'mic') {
      // 单向对讲
      if (isInterCom) {
        operatMute('off');
        enableStartTalk();
      }
    }
  };

  clickInSingleMic = key => {
    this.clickBottom(key);
  };
  clickOutSingleMic = key => {
    const { isInterCom } = this.props;
    // 单向对讲
    if (key === 'mic') {
      // 单向对讲
      if (isInterCom) {
        enableStopTalk();
      }
    }
  };
  renderMicBtn = item => {
    const { showMic } = this.props;
    return (
      <TouchableOpacity
        accessibilityLabel={item.test || ''}
        activeOpacity={0.7}
        key={item.key}
        onLongPress={() => this.clickLongSingleMic(item.key)}
        onPressIn={_.throttle(() => this.clickInSingleMic(item.key), 800)}
        onPressOut={() => this.clickOutSingleMic(item.key)}
      >
        <View style={styles.itemImgBox}>
          <Image
            source={item.imageSource}
            style={[
              styles.itemMenuImg,
              {
                tintColor: showMic ? 'red' : '#fff',
              },
            ]}
          />
        </View>
      </TouchableOpacity>
    );
  };
  renderNotMicBtn = item => {
    const { isRecordingDisabled, isRecording } = this.props;
    return (
      <TouchableOpacity
        accessibilityLabel={item.test || ''}
        activeOpacity={0.7}
        disabled={item.key === 'video' && isRecordingDisabled}
        key={item.key}
        onPress={_.throttle(() => this.clickInSingleMic(item.key), 800)}
      >
        <View
          style={[
            styles.itemImgBox,
            { opacity: item.key === 'video' && isRecordingDisabled ? 0.2 : 1 },
          ]}
        >
          <Image
            source={item.imageSource}
            style={[
              styles.itemMenuImg,
              {
                tintColor:
                  isRecording && item.key === 'video'
                    ? item.key === 'video' && isRecordingDisabled
                      ? 'brown'
                      : 'red'
                    : '#fff',
              },
            ]}
          />
        </View>
      </TouchableOpacity>
    );
  };

  render() {
    const { btnAnim, featureMenu } = this.state;
    const { showSelfModal } = this.props;
    return (
      <Animated.View style={[styles.fullFeatureBottomRightPage, { right: btnAnim }]}>
        {!showSelfModal &&
          featureMenu.map(item => (
            <View key={item.key}>
              {item.key === 'mic' && this.renderMicBtn(item)}
              {item.key !== 'mic' && this.renderNotMicBtn(item)}
            </View>
          ))}
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  fullFeatureBottomRightPage: {
    position: 'absolute',
    bottom: cx(20),
  },
  itemImgBox: {
    width: cx(50),
    height: cx(50),
    marginBottom: cx(30),
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: Math.ceil(cx(25)),
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemMenuImg: {
    tintColor: '#fff',
    width: cx(32),
    resizeMode: 'contain',
  },
});

const mapStateToProps = state => {
  const { isInterCom, showMic, hasAudio, isRecording, isRecordingDisabled } = state.ipcCommonState;
  return {
    isInterCom,
    showMic,
    hasAudio,
    isRecording,
    isRecordingDisabled,
  };
};

const mapToDisPatch = dispatch => {
  return bindActionCreators({ isFullScreenAction }, dispatch);
};

export default connect(mapStateToProps, mapToDisPatch)(FullFeatureBottomRight);
