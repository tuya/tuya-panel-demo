/* eslint-disable import/no-unresolved */
/* eslint-disable max-len */
/* eslint-disable react/require-default-props */
import React from 'react';
import PropTypes from 'prop-types';
import { TYSdk } from 'tuya-panel-kit';
import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter';
// 原生向RN发送消息通知进行监听
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { View, StyleSheet, StatusBar, AppState } from 'react-native';
import { isAndriodFullScreenNavMode as isAndriodFullScreenNavModeAction } from '../../redux/modules/ipcCommon';
import {
  cameraPanelSettings,
  backRnSystem,
  isRecordingNow,
  isMicTalking,
  showSdFormatDialog,
  showFormattingDialog,
  showSdFormatConfigDialog,
  getInitLiveConig,
  judgeP2pISConnectedOperate,
} from '../../config/click';
import { enterBackTimeOut, cancelEnterBackTimeOut } from '../../utils';
import TopHeader from '../../components/publicComponents/topHeader';
import LoadingToast from '../../components/publicComponents/loadingToast';
import SdCardConfig from '../../components/featureComponents/sdCardConfig';
import SdFormatting from '../../components/featureComponents/sdFormatting';
import LivePlayerView from './Live-player-view';
import LiveControlView from './Live-control-view';
import Config from '../../config';

const { statusBarHeight, isIOS, winWidth, winHeight } = Config;

const TYNative = TYSdk.native;
const TYEvent = TYSdk.event;

class LivePage extends React.Component {
  static propTypes = {
    isFullScreen: PropTypes.bool.isRequired,
    isAndriodFullScreenNavModeAction: PropTypes.func.isRequired,
    isAndriodFullScreenNavMode: PropTypes.bool.isRequired,
    deviceName: PropTypes.string,
    showSelfSdDialog: PropTypes.bool.isRequired,
    showSdFormatting: PropTypes.bool.isRequired,
    sdIsFormatting: PropTypes.bool.isRequired,
    isOnLivePage: PropTypes.bool.isRequired,
    showLoadingToast: PropTypes.bool.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      modalDeviceEdit: false,
      fullPlayerWidth: winWidth,
      fullPlayerHeight: winHeight,
    };
    this.firstLoadpage = true;
  }

  componentDidMount() {
    // 初始获取功能点配置及Sd卡状态
    getInitLiveConig();
    TYEvent.on('deviceDataChange', this.dpChange);
    AppState.addEventListener('change', this.handleAppStateChange);
    this.enterPhoneBackgroundListener = RCTDeviceEventEmitter.addListener(
      'enterPhoneBackground',
      value => {
        // 这个事件安卓和ios都有提供，但安卓和ios 实现逻辑不一样,针对安卓，App3.18及以上生效
        const { isForeground } = value;
        const { isOnLivePage } = this.props;
        // 判定安卓进入后台, 5秒后断开P2p
        !isForeground && !isIOS && enterBackTimeOut();
        // 进入前台, 清除定时
        if (isForeground && !isIOS) {
          cancelEnterBackTimeOut();
        }
        // 针对安卓从原生界面返回，判定P2p有没有连接，低功耗进行唤醒
        if (isForeground && !isOnLivePage && !isIOS) {
          judgeP2pISConnectedOperate();
        }
      }
    );
  }
  shouldComponentUpdate(nextProps, nextState) {
    return true;
  }
  componentWillUnmount() {
    // 退出RN面板需要调用
    backRnSystem();
    AppState.removeEventListener('change', this.handleAppStateChange);
    this.enterPhoneBackgroundListener.remove();
  }
  handleAppStateChange = nextAppState => {
    console.log('进入前台', nextAppState);
    const { isOnLivePage } = this.props;
    // 表示手机应用滑到后台,统一断开disconenct,目前都不断，安卓有bug
    if (nextAppState === 'background') {
      // 进入后台5秒后断开P2P,无论低功耗还是非低功耗设备
      isIOS && enterBackTimeOut();
    } else if (nextAppState === 'active') {
      // 清除定时
      isIOS && cancelEnterBackTimeOut();
      // 进入前台，判定是否处于预览页面,如果处于预览页面，不做处理, 如果不处于预览页面,判定P2P是否连接，如若未连接，进行连接P2P,如若已连接，则忽略，目的是返回预览界面,可以快速出流
      if (!isOnLivePage && isIOS) {
        judgeP2pISConnectedOperate();
      }
    }
  };
  dpChange = data => {
    const { sdIsFormatting } = this.props;
    const changedp = data.payload;
    if (changedp.sd_status !== undefined) {
      changedp.sd_status === 6 && showSdFormatConfigDialog();
      changedp.sd_status === 2 && !sdIsFormatting && showSdFormatDialog();
      changedp.sd_status === 4 && showFormattingDialog();
    }
  };
  // 打开topBar右上角设置,信息等弹窗
  openDeviceEdit = () => {
    cameraPanelSettings();
  };

  backConnect = () => {
    if (isRecordingNow() || isMicTalking()) {
      return false;
    }
    TYNative.back();
  };

  _onLayout = e => {
    clearTimeout(this.timer);
    const { width, height } = e.nativeEvent.layout;
    const { isFullScreen } = this.props;
    // 这里只判断第一次加载页面时页面的大小为准,例如在收藏点编辑页面,如果进行编辑，输入框弹出会导致winheight获取变小
    if (!isFullScreen && !isIOS && this.firstLoadpage) {
      // 对安卓区分是全面屏还是经典屏
      if (Math.abs(winHeight - height) > 2 && winHeight < 800) {
        // 不相等表示安卓经典导航模式,默认给全屏
        this.props.isAndriodFullScreenNavModeAction({
          isAndriodFullScreenNavMode: false,
        });
      }
    }
    this.firstLoadpage = false;
    this.setState({
      fullPlayerWidth: Math.round(width),
      fullPlayerHeight: Math.round(height),
    });
  };

  render() {
    const { modalDeviceEdit, fullPlayerWidth, fullPlayerHeight } = this.state;
    const {
      isFullScreen,
      deviceName,
      isAndriodFullScreenNavMode,
      showSelfSdDialog,
      showSdFormatting,
      sdIsFormatting,
      showLoadingToast,
    } = this.props;
    return (
      <View style={styles.livePage} onLayout={e => this._onLayout(e)}>
        <StatusBar
          barStyle={isIOS ? 'dark-content' : 'light-content'}
          translucent={true}
          backgroundColor="transparent"
          hidden={isFullScreen}
        />
        {!isFullScreen && (
          <View
            style={{
              paddingTop: isIOS ? 0 : statusBarHeight,
              backgroundColor: '#000000',
            }}
          >
            <TopHeader
              hasRight={!modalDeviceEdit}
              rightPress={this.openDeviceEdit}
              contentTitle={deviceName}
              leftPress={this.backConnect}
              accessibilityLabelLeft="tuya_ipc_dev_back"
              accessibilityLabelRight="tuya_ipc_dev_edit"
            />
          </View>
        )}
        <LivePlayerView
          isFullScreen={isFullScreen}
          fullPlayerWidth={fullPlayerWidth}
          fullPlayerHeight={fullPlayerHeight}
        />
        <LiveControlView
          isFullScreen={isFullScreen}
          isAndriodFullScreenNavMode={isAndriodFullScreenNavMode}
        />
        {/* 显示sd卡弹框，这里自己写，组件库在部分安卓机上底部不能全覆盖, 只在非全屏时展示 */}
        {showSelfSdDialog && !isFullScreen && <SdCardConfig />}
        {(showSdFormatting || sdIsFormatting) && !isFullScreen && <SdFormatting />}
        {showLoadingToast && <LoadingToast />}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  livePage: {
    flex: 1,
  },
});

const mapStateToProps = state => {
  const {
    isFullScreen,
    isAndriodFullScreenNavMode,
    showSelfSdDialog,
    showSdFormatting,
    sdIsFormatting,
    isOnLivePage,
    showLoadingToast,
  } = state.ipcCommonState;
  const { name: deviceName } = state.devInfo;
  return {
    isFullScreen,
    isAndriodFullScreenNavMode,
    deviceName,
    showSelfSdDialog,
    showSdFormatting,
    sdIsFormatting,
    isOnLivePage,
    showLoadingToast,
  };
};

const mapToDisPatch = dispatch => {
  return bindActionCreators(
    {
      isAndriodFullScreenNavModeAction,
    },
    dispatch
  );
};

export default connect(mapStateToProps, mapToDisPatch)(LivePage);
