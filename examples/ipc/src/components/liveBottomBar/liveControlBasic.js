/* eslint-disable max-len */
import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { TYSdk } from 'tuya-panel-kit';
import _ from 'lodash';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import DpConfigUtils from '../../utils/dpConfigUtils';
import { liveBottomBasicMenuArr } from '../../config/panelBasicFeatureInitData';
import { showToast, showCutScreen } from '../../redux/modules/ipcCommon';
import CameraManager from '../../components/nativeComponents/cameraManager';
import {
  snapShoot,
  enableRecord,
  enableStartTalk,
  enableStopTalk,
  operatMute,
  enterFullScreen,
  getSupportedSound,
  getConfigCameraInfo,
} from '../../config/click';
import Strings from '../../i18n';
import Config from '../../config';
import Res from '../../res';

const { isIphoneX, cx } = Config;
const TYEvent = TYSdk.event;
const { basicArr, needFilterDp, needFilterCloudConfig } = liveBottomBasicMenuArr;

class LiveControlBasic extends React.Component {
  static propTypes = {
    isRecording: PropTypes.bool.isRequired,
    isInterCom: PropTypes.bool.isRequired,
    showMic: PropTypes.bool.isRequired,
    showVideoLoad: PropTypes.bool.isRequired,
    openAnimateHeight: PropTypes.func.isRequired,
    p2pIsConnected: PropTypes.bool.isRequired,
    isRecordingDisabled: PropTypes.bool.isRequired,
    defaultShowTabs: PropTypes.bool,
    panelItemActiveColor: PropTypes.string.isRequired,
  };
  static defaultProps = {
    defaultShowTabs: false,
  };
  constructor(props) {
    super(props);
    this.state = {
      openMoreControl: Boolean(props.defaultShowTabs),
      // 默认配置,以免刚开始为空
      bottomData: [
        {
          hasMic: true, // 是否有mic配置
          key: 'fullScreen',
          test: 'tuya_ipc_fullscreen',
          imgSource: Res.publicImage.basicFullScreen,
          imgTitle: Strings.getLang('bottom_fullScreen'),
        },
        {
          test: 'tuya_ipc_snap',
          key: 'capture',
          imgSource: Res.publicImage.basicCutScreen,
          imgTitle: Strings.getLang('bottom_capture'),
        },
        {
          test: 'tuya_ipc_record_on',
          key: 'video',
          imgSource: Res.publicImage.basicVideo,
          imgTitle: Strings.getLang('bottom_video'),
        },
        {
          test: 'tuya_ipc_basic_expand',
          key: 'more',
          imgSource: props.defaultShowTabs
            ? Res.publicImage.basicFeatureOpen
            : Res.publicImage.basicFeatureClose,
          imgTitle: props.defaultShowTabs
            ? Strings.getLang('bottom_more_open')
            : Strings.getLang('bottom_more_close'),
        },
      ],
    };
    this.originBasicArr = basicArr;
  }
  componentDidMount() {
    const { defaultShowTabs } = this.props;
    if (defaultShowTabs) {
      this.originBasicArr.forEach((item, index) => {
        if (item.key === 'more') {
          this.originBasicArr[index].imgSource = Res.publicImage.basicFeatureOpen;
        }
      });
    }
    TYEvent.on('autoMode', data => {
      const baseArr = Array.prototype.slice.call(this.originBasicArr);
      // 根据是否打开table，显示more图标
      const { openMoreControl } = this.state;
      baseArr.forEach((item, index) => {
        if (item.key === 'more') {
          baseArr[index].imgSource = openMoreControl
            ? Res.publicImage.basicFeatureOpen
            : Res.publicImage.basicFeatureClose;
        }
      });
      baseArr.splice(2, 0, data);
      this.setState({ bottomData: baseArr });
    });
  }
  componentWillReceiveProps(nextProps) {
    const oldProps = this.props;
    const newProps = nextProps;
    const newBottomData = this.state.bottomData;
    // 确认P2p连接之后,获取对讲方式以及拾音器
    if (oldProps.p2pIsConnected !== newProps.p2pIsConnected && newProps.p2pIsConnected) {
      // 获取是否有拾音器
      getSupportedSound();
      // 获取摄像头配置信息
      getConfigCameraInfo();
      const initBottomData = DpConfigUtils.publicAddFilterMenuDp(
        this.originBasicArr,
        needFilterDp,
        needFilterCloudConfig
      );
      this.setState({
        bottomData: initBottomData,
      });
    }
    if (oldProps.isRecording !== newProps.isRecording) {
      for (let i = 0; i < newBottomData.length; i++) {
        if (newBottomData[i].key === 'video') {
          newBottomData[i].imgTitle = Strings.getLang(
            newProps.isRecording ? 'bottom_videoing' : 'bottom_video'
          );
          newBottomData[i].test = newProps.isRecording
            ? 'tuya_ipc_record_off'
            : 'tuya_ipc_record_on';
        }
      }
    }
    if (oldProps.showMic !== newProps.showMic || oldProps.isInterCom !== newProps.isInterCom) {
      for (let i = 0; i < newBottomData.length; i++) {
        if (newBottomData[i].key === 'mic') {
          if (nextProps.showMic) {
            if (newProps.isInterCom) {
              newBottomData[i].imgSource = Res.publicImage.basicOneWayTalk;
              newBottomData[i].imgTitle = Strings.getLang('bottom_oneway_talking');
              newBottomData[i].test = 'tuya_ipc_talk_off';
            } else {
              newBottomData[i].imgSource = Res.publicImage.basicTwoWayTalk;
              newBottomData[i].imgTitle = Strings.getLang('bottom_twoway_talking');
              newBottomData[i].test = 'tuya_ipc_talk_off';
            }
          } else if (newProps.isInterCom) {
            newBottomData[i].imgSource = Res.publicImage.basicOneWayTalk;
            newBottomData[i].imgTitle = Strings.getLang('bottom_oneway_talk');
            newBottomData[i].test = 'tuya_ipc_talk_on';
          } else {
            newBottomData[i].imgSource = Res.publicImage.basicTwoWayTalk;
            newBottomData[i].imgTitle = Strings.getLang('bottom_twoway_talk');
            newBottomData[i].test = 'tuya_ipc_talk_on';
          }
          break;
        }
      }
    }
    this.setState({
      bottomData: newBottomData,
    });
  }

  componentWillUnmount() {
    TYEvent.off('autoMode');
  }
  captureCamera = () => {
    snapShoot();
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
      CameraManager.showTip(Strings.getLang('clickToCall'));
      operatMute('on');
      enableStartTalk();
    }
  };
  videoCamera = () => {
    enableRecord();
  };
  clickBottomBtn = key => {
    switch (key) {
      case 'fullScreen':
        enterFullScreen();
        break;
      case 'capture':
        this.captureCamera();
        break;
      case 'mic':
        this.micCamera();
        break;
      case 'video':
        this.videoCamera();
        break;
      case 'more':
        this.controlBottomDialog();
        break;
      default:
        return false;
    }
  };
  // 是否完全展现底部BottomBar
  controlBottomDialog = () => {
    const { openMoreControl } = this.state;
    this.setState(
      {
        openMoreControl: !openMoreControl,
      },
      () => {
        this.props.openAnimateHeight(this.state.openMoreControl);
        this.changeBottomMoreText();
      }
    );
  };

  clickLongSingleMic = key => {
    const { isInterCom } = this.props;
    if (key === 'mic') {
      // 单向对讲
      if (isInterCom) {
        // 关闭声音
        operatMute('off');
        enableStartTalk();
      }
    }
  };
  clickInSingleMic = key => {
    this.clickBottomBtn(key);
  };
  clickOutSingleMic = key => {
    const { isInterCom } = this.props;
    if (key === 'mic') {
      // 单向对讲
      if (isInterCom) {
        enableStopTalk();
      } else {
      }
    }
  };

  changeBottomMoreText = () => {
    const oldArr = this.state.bottomData;
    const { openMoreControl } = this.state;
    for (let i = 0; i < oldArr.length; i++) {
      if (oldArr[i].key === 'more') {
        if (openMoreControl) {
          oldArr[i].imgTitle = Strings.getLang('bottom_more_close');
          oldArr[i].imgSource = Res.publicImage.basicFeatureOpen;
          oldArr[i].test = 'tuya_ipc_basic_close';
        } else {
          oldArr[i].imgTitle = Strings.getLang('bottom_more_open');
          oldArr[i].imgSource = Res.publicImage.basicFeatureClose;
          oldArr[i].test = 'tuya_ipc_basic_expand';
        }
        break;
      }
    }
    this.setState({
      bottomData: oldArr,
    });
  };
  renderMicBtn = item => {
    const { showVideoLoad, showMic, panelItemActiveColor } = this.props;
    return (
      <TouchableOpacity
        accessibilityLabel={item.test || ''}
        style={[styles.bottomBarItem]}
        activeOpacity={0.5}
        disabled={showVideoLoad}
        onLongPress={() => this.clickLongSingleMic(item.key)}
        onPressIn={_.debounce(() => this.clickInSingleMic(item.key), 100)}
        onPressOut={() => this.clickOutSingleMic(item.key)}
      >
        <Image
          source={item.imgSource}
          style={[
            styles.bottomBarImage,
            {
              tintColor: showMic ? panelItemActiveColor : '#333333',
            },
          ]}
        />
      </TouchableOpacity>
    );
  };
  renderNotMicBtn = item => {
    const { showVideoLoad, isRecordingDisabled, isRecording, panelItemActiveColor } = this.props;
    return (
      <TouchableOpacity
        accessibilityLabel={item.test || ''}
        style={[styles.bottomBarItem]}
        activeOpacity={item.key !== 'more' ? 0.5 : 1}
        disabled={
          (showVideoLoad && item.key !== 'more' && item.key !== 'fullScreen') ||
          (item.key === 'video' && isRecordingDisabled)
        }
        onPress={_.debounce(() => this.clickInSingleMic(item.key), 100)}
      >
        <Image
          source={item.imgSource}
          style={[
            styles.bottomBarImage,
            {
              tintColor: isRecording && item.key === 'video' ? panelItemActiveColor : '#333333',
            },
          ]}
        />
      </TouchableOpacity>
    );
  };
  render() {
    const { showVideoLoad, isRecordingDisabled, defaultShowTabs } = this.props;
    const { openMoreControl } = this.state;
    let basicHeight = 72;
    !openMoreControl && isIphoneX && (basicHeight = 92);
    return (
      <View
        style={[
          styles.liveControlBasic,
          {
            paddingBottom: !openMoreControl && isIphoneX ? (defaultShowTabs ? 0 : 20) : 0,
            height: basicHeight,
          },
        ]}
      >
        {this.state.bottomData.map(item => {
          return (
            <View
              style={{
                flex: 1,
                opacity:
                  (showVideoLoad && item.key !== 'more' && item.key !== 'fullScreen') ||
                  (item.key === 'video' && isRecordingDisabled)
                    ? 0.2
                    : 1,
              }}
              key={item.key}
            >
              {item.key === 'mic' && this.renderMicBtn(item)}
              {item.key !== 'mic' && this.renderNotMicBtn(item)}
            </View>
          );
        })}
      </View>
    );
  }
}
const styles = StyleSheet.create({
  liveControlBasic: {
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  bottomBarItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomBarImage: {
    width: cx(36),
    resizeMode: 'contain',
  },
});

const mapStateToProps = state => {
  const {
    isRecording,
    isInterCom,
    showMic,
    showVideoLoad,
    isFullScreen,
    p2pIsConnected,
    isRecordingDisabled,
    panelItemActiveColor,
  } = state.ipcCommonState;
  return {
    isRecording,
    isInterCom,
    showMic,
    showVideoLoad,
    isFullScreen,
    p2pIsConnected,
    isRecordingDisabled,
    panelItemActiveColor,
  };
};
const mapToDisPatch = dispatch => {
  return bindActionCreators({ showToast, showCutScreen }, dispatch);
};

export default connect(mapStateToProps, mapToDisPatch)(LiveControlBasic);
