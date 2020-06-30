/* eslint-disable max-len */
/* eslint-disable react/no-unused-prop-types */
/* eslint-disable react/require-default-props */
/* eslint-disable import/extensions */
/* eslint-disable import/no-unresolved */
/* eslint-disable camelcase */
/* eslint-disable react/prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, BackHandler } from 'react-native';
import _ from 'lodash';
import { TYSdk } from 'tuya-panel-kit';
import { bindActionCreators } from 'redux';
import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter';
import { connect } from 'react-redux';
import CameraPlayer from '../../components/nativeComponents/cameraPlayer';
import CameraManager from '../../components/nativeComponents/cameraManager';
import CameraLoadText from './cameraLoadText';
import NormalPlayFeature from './normalPlayFeature';
import FullFeatureTopLeft from './fullFeatureTopLeft';
import FullFeatureTopRight from './fullFeatureTopRight';
import FullFeatureBottomLeft from './fullFeatureBottomLeft';
import FullFeatureBottomRight from './fullFeatureBottomRight';
import {
  showVideoLoad as showVideoLoadAction,
  isFullScreen as isFullScreenAction,
  getClarityStatus,
  getVoiceStatus,
  videoLoadText,
  p2pIsConnected,
  showSelfModal as showSelfModalAction,
  showTryAgain,
  reGetStream as reGetStreamAction,
  isRecording as isRecordingAction,
  hideFullMenu as hideFullMenuAction,
  stopFullAnimation as stopFullAnimationAction,
  zoomState as zoomStateAction,
  prevZoomState as prevZoomStateAction,
  cameraAction as cameraActionAction,
  enterPlayNativePage as enterPlayNativePageAction,
  isOnLivePage as isOnLivePageAction,
} from '../../redux/modules/ipcCommon';
import { decodeClarityDic } from '../../config/cameraData';
import Strings from '../../i18n';
import {
  operatMute,
  enterBackground,
  backRnSystem,
  getAuduioType,
  enableHd,
  isMobileDataNetworkType,
  isWirlesDevice,
  wakeupWirless,
} from '../../config/click';

import Config from '../../config';

const { cx } = Config;

const TYEvent = TYSdk.event;
const TYDevice = TYSdk.device;

class CustomPlayer extends React.Component {
  static propTypes = {
    p2pIsConnected: PropTypes.func.isRequired,
    showVideoLoadAction: PropTypes.func.isRequired,
    showSelfModalAction: PropTypes.func.isRequired,
    isFullScreenAction: PropTypes.func.isRequired,
    hideFullMenuAction: PropTypes.func.isRequired,
    stopFullAnimationAction: PropTypes.func.isRequired,
    videoLoadText: PropTypes.func.isRequired,
    playerWidth: PropTypes.number.isRequired,
    playerHeight: PropTypes.number.isRequired,
    voiceStatus: PropTypes.string.isRequired,
    clarityStatus: PropTypes.string.isRequired,
    isFullScreen: PropTypes.bool.isRequired,
    deviceOnline: PropTypes.bool,
    showTryAgain: PropTypes.func.isRequired,
    reGetStream: PropTypes.bool.isRequired,
    reGetStreamAction: PropTypes.func.isRequired,
    isRecordingAction: PropTypes.func.isRequired,
    hideFullMenu: PropTypes.bool.isRequired,
    showCutScreen: PropTypes.bool.isRequired,
    stopFullAnimation: PropTypes.bool.isRequired,
    showSelfModal: PropTypes.bool.isRequired,
    zoomState: PropTypes.number.isRequired,
    prevZoomStateAction: PropTypes.func.isRequired,
    cameraActionAction: PropTypes.func.isRequired,
    enterPlayNativePageAction: PropTypes.func.isRequired,
    cameraAction: PropTypes.number.isRequired,
    isOnLivePageAction: PropTypes.func.isRequired,
    isOnLivePage: PropTypes.bool.isRequired,
  };
  constructor(props) {
    super(props);
    this.goToBack = false;
    this.state = {
      absoluteValue: Math.round(cx(5)),
    };
  }
  componentWillMount() {
    // 首次加载
    this.connecP2PAndStartPreview();
    this.foregroundListener = RCTDeviceEventEmitter.addListener('enterForegroundEvent', value => {
      /*
       获取对讲方式
      */
      const { isFullScreen } = this.props;
      if (isFullScreen) {
        CameraManager.setScreenOrientation(1);
      } else {
        CameraManager.setScreenOrientation(0);
      }
      // 进入前台设备离线
      if (!this.deviceOffLine()) {
        return false;
      }

      if (this.goToBack) {
        this.props.isOnLivePageAction({ isOnLivePage: true });
        this.props.showTryAgain({ showTryAgain: false });
        this.props.videoLoadText({ videoLoadText: Strings.getLang('reConenectStream') });
        // 这里再次获取对讲方式
        getAuduioType();
        const { enterPlayNativePage } = this.props;
        if (enterPlayNativePage === 1) {
          this.props.enterPlayNativePageAction({ enterPlayNativePage: 0 });
          this.props.cameraActionAction({ cameraAction: 2 });
        } else if (enterPlayNativePage === 2) {
          this.props.enterPlayNativePageAction({ enterPlayNativePage: 0 });
          this.props.cameraActionAction({ cameraAction: 0 });
        } else if (enterPlayNativePage === 4) {
          this.props.enterPlayNativePageAction({ enterPlayNativePage: 0 });
          this.props.cameraActionAction({ cameraAction: 5 });
        }
        this.connecP2PAndStartPreview();
      }
      this.goToBack = false;
      console.log('直播进入前台监听');
    });
    this.backgroundListener = RCTDeviceEventEmitter.addListener('enterBackgroundEvent', value => {
      console.log('直播进入后台监听,断开P2P连接');
      this.props.showSelfModalAction({ showSelfModal: false });
      this.goToBack = true;
      enterBackground();
    });
    // p2p流
    this.p2pListener = RCTDeviceEventEmitter.addListener('p2pConnect', value => {
      console.log('P2p断开');
      this.props.videoLoadText({ videoLoadText: Strings.getLang('bridgeConnectFalse') });
      this.props.showVideoLoadAction({ showVideoLoad: true });
      this.props.showTryAgain({ showTryAgain: true });
      enterBackground();
    });

    // session断开，提示网络错误
    this.sessionDidDisconnectedListener = RCTDeviceEventEmitter.addListener(
      'sessionDidDisconnected',
      () => {
        console.log('session断开');
        // 对于隐私模式为false或undefined时对session处理, 隐私模式为true时不做处理
        const { basic_private } = this.props;
        // const basicPrivate = TYNative.getState('basic_private');
        if (!basic_private) {
          this.props.videoLoadText({ videoLoadText: Strings.getLang('netErr') });
          this.props.showVideoLoadAction({ showVideoLoad: true });
          this.props.showTryAgain({ showTryAgain: true });
          this.props.reGetStreamAction({ reGetStream: false });
        }
        // session断开和进入后台调用同样的逻辑
        enterBackground();
      }
    );
    // Android 返回键退出全屏
    this.backPressListener = BackHandler.addEventListener('hardwareBackPress', () => {
      const { isFullScreen } = this.props;
      if (isFullScreen) {
        this.backFullScreen();
        return true;
      }
      return false;
    });
    // 监听全屏时屏幕点击事件
    this.fullScreenPlayerClickListener = RCTDeviceEventEmitter.addListener(
      'didTapVideoView',
      value => {
        const { isFullScreen, hideFullMenu } = this.props;
        if (isFullScreen) {
          this.props.hideFullMenuAction({ hideFullMenu: !hideFullMenu });
          this.props.stopFullAnimationAction({ stopFullAnimation: false });
        }
      }
    );
    // 监听全屏时屏幕点击事件
    this.zoomFreeListener = RCTDeviceEventEmitter.addListener('zoomFree', value => {
      const { zoomStatus } = value;
      const { isFullScreen } = this.props;
      if (isFullScreen) {
        return false;
      }
      this.props.zoomStateAction({ zoomState: zoomStatus });
      // 记录点击完是否为自由状态
      this.props.prevZoomStateAction({ prevZoomState: zoomStatus });
    });
  }
  componentDidMount() {
    // 获取云端保存的视频清晰度
    // this.props.getClarityStatus();
    // 获取云端保存的喇叭
    // this.props.getVoiceStatus();
    // this.connecP2PAndStartPreview();
    TYEvent.on('deviceDataChange', this.dpChange);
    TYEvent.on('backLivePreview', () => {
      this.connecP2PAndStartPreview();
    });
    TYEvent.on('firstChangeClarity', () => {
      const { clarityStatus } = this.props;
      // 这里传入第二个参数，如果为configInfo,则将切换视频的load变成正在获取视频流
      enableHd(clarityStatus, 'configInfo');
    });
  }

  componentWillReceiveProps(nextProps) {
    const oldProps = this.props;
    const newProps = nextProps;
    const { reGetStream, isFullScreen, isOnLivePage } = newProps;
    if (!_.isEqual(oldProps.reGetStream, reGetStream)) {
      if (reGetStream) {
        this.connecP2PAndStartPreview(newProps);
      }
    }
    // 这里作为判定去取云台配置的默认信息，如果默认清晰度不是默认的高清流，则会调用此方法,改变提示文字
    if (!_.isEqual(oldProps.clarityStatus, newProps.clarityStatus)) {
      enableHd(newProps.clarityStatus, 'configInfo');
    }
    // 判定设备上线变化,设定默认值deviceOnline 为false
    if (!_.isEqual(oldProps.deviceOnline, newProps.deviceOnline)) {
      if (!isWirlesDevice()) {
        if (newProps.deviceOnline && isOnLivePage) {
          this.props.showTryAgain({ showTryAgain: false });
          this.props.videoLoadText({ videoLoadText: Strings.getLang('bridgeConnect') });
          this.props.showVideoLoadAction({ showVideoLoad: true });
          this.connecP2PAndStartPreview(newProps);
        } else {
          this.props.showTryAgain({ showTryAgain: false });
          this.props.videoLoadText({ videoLoadText: Strings.getLang('deviceOffline') });
          this.props.showVideoLoadAction({ showVideoLoad: true });
        }
      }
    }
    // 如果非全屏,展示
    if (isFullScreen) {
      const { playerWidth, playerHeight } = newProps;
      if (playerWidth > playerHeight) {
        const isSixteen = playerWidth / playerHeight >= 16 / 9;
        const fullLiveWidth = (playerHeight * 16) / 9;
        let absoluteValue = Math.round(cx(5));
        if (isSixteen) {
          absoluteValue = Math.round((playerWidth - fullLiveWidth) / 2 + cx(2));
        }
        this.setState({
          absoluteValue,
        });
      }
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.isFullScreen) {
      if (nextProps.playerWidth > nextProps.playerHeight && nextProps.playerWidth > 550) {
        return true;
      }
      return false;
    }
    return true;
  }
  componentWillUnmount() {
    this.backgroundListener.remove();
    this.foregroundListener.remove();
    this.p2pListener.remove();
    this.sessionDidDisconnectedListener.remove();
    this.backPressListener.remove();
    this.fullScreenPlayerClickListener.remove();
    this.zoomFreeListener.remove();
    TYEvent.off('deviceDataChange', this.dpChange);
    TYEvent.off('backLivePreview');
    TYEvent.off('firstChangeClarity');
  }

  onChangePreview = () => {};

  backFullScreen = () => {
    this.props.isFullScreenAction({ isFullScreen: false });
    CameraManager.setScreenOrientation(0);
  };
  // 设备离线公用
  deviceOffLine = () => {
    const { deviceOnline } = this.props;
    if (!deviceOnline) {
      this.props.videoLoadText({ videoLoadText: Strings.getLang('deviceOffline') });
      this.props.showVideoLoadAction({ showVideoLoad: true });
      this.props.showTryAgain({ showTryAgain: false });
      this.props.isRecordingAction({ isRecording: false });
      return false;
    }
    return true;
  };
  dpChange = data => {
    const changedp = data.payload;
    const { isOnLivePage } = this.props;
    if (changedp.basic_private !== undefined) {
      if (changedp.basic_private) {
        backRnSystem();
        this.props.videoLoadText({ videoLoadText: Strings.getLang('deviceSleep') });
        this.props.showVideoLoadAction({ showVideoLoad: true });
        this.props.showTryAgain({ showTryAgain: true });
        this.props.reGetStreamAction({ rreGetStream: false });
        this.props.isRecordingAction({ isRecording: false });
        return false;
      }
      if (isOnLivePage) {
        this.props.showTryAgain({ showTryAgain: false });
        this.connecP2PAndStartPreview();
      }
    }
  };
  /*
   * 从设置回来都需要判断有没有重连再去链接，从云存储回来直接去链接, seesion断开就自动重连就显示的字不一样，其他操作都一样
   */
  // 开启预览
  startPreview = () => {
    const { clarityStatus } = this.props;
    // 还原父组件reconnnect属性值
    this.props.reGetStreamAction({ reGetStream: false });
    // this.props.resetReconnect(false);
    // 根据存储喇叭值调取喇叭
    CameraManager.startPreviewWithDefinition(
      decodeClarityDic[clarityStatus],
      // clarityStatus === 'HD' ? 4 : 2,
      () => {
        // 声音状态必须放在这里,在成功回调后拿取声音的状态值是最准确的
        const { voiceStatus } = this.props;
        operatMute(voiceStatus);
        this.props.showVideoLoadAction({ showVideoLoad: false });
        this.props.reGetStreamAction({ reGetStreamAction: false });
        // 获取当前为流量还是wifi
        isMobileDataNetworkType();
      },
      () => {
        this.props.videoLoadText({ videoLoadText: Strings.getLang('streamFalse') });
        this.props.showVideoLoadAction({ showVideoLoad: true });
        this.props.showTryAgain({ showTryAgain: true });
        this.props.reGetStreamAction({ reGetStreamAction: false });
      }
    );
  };
  /**
   * 判断P2P连接。是否connect 再去connect
   */
  connecP2PAndStartPreview = newProps => {
    const { deviceOnline, basic_private } = newProps || this.props;
    // 实时获取隐私模式的状态
    this.props.showVideoLoadAction({ showVideoLoad: true });
    // 为判断第一次连接时，设备是否离线
    if (!deviceOnline) {
      this.props.videoLoadText({ videoLoadText: Strings.getLang('deviceOffline') });
      this.props.showTryAgain({ showTryAgain: false });
      this.props.reGetStreamAction({ reGetStream: false });
      this.props.isRecordingAction({ isRecording: false });
      return false;
    }
    if (basic_private) {
      this.props.videoLoadText({ videoLoadText: Strings.getLang('deviceSleep') });
      this.props.showTryAgain({ showTryAgain: true });
      this.props.reGetStreamAction({ reGetStream: false });
      return false;
    }

    this.props.videoLoadText({ videoLoadText: Strings.getLang('bridgeConnect') });
    CameraManager.isConnected(msg => {
      console.log('p2p是否连接', msg);
      if (!msg) {
        this.props.p2pIsConnected({ p2pIsConnected: false });
        this.connectAndstartPreView();
      } else {
        this.props.p2pIsConnected({ p2pIsConnected: true });
        this.props.videoLoadText({ videoLoadText: Strings.getLang('getStream') });
        console.log('二次');
        this.startPreview();
      }
    });
  };
  /*
   * connect接受两个参数,成功回调函数和失败回调函数
   */
  connectAndstartPreView = () => {
    this.props.videoLoadText({ videoLoadText: Strings.getLang('bridgeConnect') });
    this.props.showVideoLoadAction({ showVideoLoad: true });
    if (isWirlesDevice()) {
      wakeupWirless();
    }
    CameraManager.connect(
      () => {
        // P2P建立成功
        this.props.p2pIsConnected({ p2pIsConnected: true });
        this.props.videoLoadText({ videoLoadText: Strings.getLang('getStream') });
        this.props.showTryAgain({ showTryAgain: false });
        this.startPreview();
      },
      () => {
        // P2P建立失败
        this.props.p2pIsConnected({ p2pIsConnected: false });
        this.props.videoLoadText({ videoLoadText: Strings.getLang('bridgeConnectFalse') });
        this.props.showTryAgain({ showTryAgain: true });
        this.props.reGetStreamAction({ reGetStream: false });
      }
    );
  };

  changeHideFullMenuState = value => {
    if (value === true) {
      this.props.hideFullMenuAction({ hideFullMenu: true });
    } else {
      this.props.hideFullMenuAction({ hideFullMenu: false });
    }
  };

  // stopAnimated,永久显示动画
  changeStopAnimateState = () => {
    this.props.stopFullAnimationAction({ stopFullAnimation: true });
  };

  render() {
    const {
      playerWidth,
      playerHeight,
      showVideoLoad,
      isFullScreen,
      hideFullMenu,
      stopFullAnimation,
      showSelfModal,
      zoomState,
      cameraAction,
    } = this.props;
    const { absoluteValue } = this.state;
    return (
      <View style={styles.playerPage}>
        <CameraPlayer
          onChangePreview={this.onChangePreview}
          action={cameraAction}
          scaleMode={zoomState}
          style={{
            width: playerWidth,
            height: playerHeight,
          }}
        />
        {!isFullScreen && !showVideoLoad && (
          <NormalPlayFeature playerHeight={playerHeight} playerWidth={playerWidth} />
        )}
        {isFullScreen && !showVideoLoad && (
          <FullFeatureTopLeft
            showSelfModal={showSelfModal}
            absoluteValue={absoluteValue}
            hideFullMenu={hideFullMenu}
            stopFullAnimation={stopFullAnimation}
            changeHideFullMenuState={this.changeHideFullMenuState}
          />
        )}
        {isFullScreen && !showVideoLoad && (
          <FullFeatureTopRight
            showSelfModal={showSelfModal}
            absoluteValue={absoluteValue}
            hideFullMenu={hideFullMenu}
            stopFullAnimation={stopFullAnimation}
            changeHideFullMenuState={this.changeHideFullMenuState}
            changeStopAnimateState={this.changeStopAnimateState}
          />
        )}
        {isFullScreen && !showVideoLoad && (
          <FullFeatureBottomLeft
            showSelfModal={showSelfModal}
            absoluteValue={absoluteValue}
            hideFullMenu={hideFullMenu}
            stopFullAnimation={stopFullAnimation}
            changeHideFullMenuState={this.changeHideFullMenuState}
            changeStopAnimateState={this.changeStopAnimateState}
          />
        )}
        {isFullScreen && (
          <FullFeatureBottomRight
            showSelfModal={showSelfModal}
            absoluteValue={absoluteValue}
            hideFullMenu={hideFullMenu}
            stopFullAnimation={stopFullAnimation}
            changeHideFullMenuState={this.changeHideFullMenuState}
            changeStopAnimateState={this.changeStopAnimateState}
          />
        )}
        {showVideoLoad && <CameraLoadText playerWidth={playerWidth} playerHeight={playerHeight} />}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  playerPage: {
    flex: 1,
  },
});

const mapStateToProps = state => {
  const { basic_private } = state.dpState;
  const { deviceOnline } = state.devInfo;
  const {
    showVideoLoad,
    clarityStatus,
    voiceStatus,
    isFullScreen,
    reGetStream,
    hideFullMenu,
    stopFullAnimation,
    showCutScreen,
    showSelfModal,
    zoomState,
    enterPlayNativePage,
    cameraAction,
    isOnLivePage,
  } = state.ipcCommonState;
  return {
    showVideoLoad,
    clarityStatus,
    voiceStatus,
    basic_private,
    isFullScreen,
    deviceOnline,
    reGetStream,
    hideFullMenu,
    stopFullAnimation,
    showCutScreen,
    showSelfModal,
    zoomState,
    enterPlayNativePage,
    cameraAction,
    isOnLivePage,
  };
};
const mapToDisPatch = dispatch => {
  return bindActionCreators(
    {
      p2pIsConnected,
      showVideoLoadAction,
      getVoiceStatus,
      getClarityStatus,
      videoLoadText,
      showSelfModalAction,
      showTryAgain,
      reGetStreamAction,
      isRecordingAction,
      hideFullMenuAction,
      stopFullAnimationAction,
      isFullScreenAction,
      prevZoomStateAction,
      zoomStateAction,
      enterPlayNativePageAction,
      cameraActionAction,
      isOnLivePageAction,
    },
    dispatch
  );
};

export default connect(mapStateToProps, mapToDisPatch)(CustomPlayer);
