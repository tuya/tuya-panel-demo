import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { StyleSheet, View } from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import CustomPlayer from '../../components/livePlayComponents/customPlayer';
import ClarityFullScreen from '../../components/publicComponents/clarityFullScreen';
import CutScreen from '../../components/publicComponents/cutScreen';
import TimerInterval from '../../components/publicComponents/timerInterVal';
import CameraMic from '../../components/livePlayComponents/cameraMic';
import TopPublicTip from '../../components/publicComponents/topPublicTip';
import MobileNetTip from '../../components/publicComponents/mobileNetTip';
import Config from '../../config';
import Strings from '../../i18n';

const { winWidth } = Config;

class LivePlayerView extends React.Component {
  static propTypes = {
    showVideoLoad: PropTypes.bool.isRequired,
    showSelfModal: PropTypes.bool.isRequired,
    isFullScreen: PropTypes.bool.isRequired,
    showCutScreen: PropTypes.bool.isRequired,
    isRecording: PropTypes.bool.isRequired,
    showMic: PropTypes.bool.isRequired,
    isInterCom: PropTypes.bool.isRequired,
    isMobileNetType: PropTypes.bool.isRequired,
    fullPlayerWidth: PropTypes.number.isRequired,
    fullPlayerHeight: PropTypes.number.isRequired,
    panelItemActiveColor: PropTypes.string.isRequired,
  };
  constructor(props) {
    super(props);
    this.state = {
      playerWidth: Math.round(winWidth),
      playerHeight: Math.round((winWidth * 9) / 16),
      showMobileNetTip: false,
    };
    this.timer = null;
    this.startShowshowMobileNetTip = null;
  }

  componentWillReceiveProps(nextProps) {
    const oldProps = this.props;
    const newProps = nextProps;
    if (!_.isEqual(oldProps.isMobileNetType, newProps.isMobileNetType)) {
      if (newProps.isMobileNetType) {
        clearTimeout(this.startShowshowMobileNetTip);
        this.setState({
          showMobileNetTip: true,
        });
        this.startShowshowMobileNetTip = setTimeout(() => {
          this.setState({
            showMobileNetTip: false,
          });
        }, 5000);
      }
    }
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.isFullScreen) {
      if (nextProps.fullPlayerWidth > nextProps.fullPlayerHeight) {
        return true;
      }
      return false;
    }
    if (nextProps.fullPlayerWidth < nextProps.fullPlayerHeight) {
      return true;
    }
    return false;
  }

  componentWillUnmount() {
    this.timer = null;
    this.startShowshowMobileNetTip = null;
  }
  closeMobileTip = () => {
    this.setState({
      showMobileNetTip: false,
    });
  };

  // 获取元素的大小和位置信息
  _onLayout = e => {
    const { width, height } = e.nativeEvent.layout;
    this.setState({
      playerWidth: Math.round(width),
      playerHeight: Math.round(height),
    });
  };
  render() {
    const { playerWidth, playerHeight, showMobileNetTip } = this.state;
    const {
      showVideoLoad,
      isFullScreen,
      showSelfModal,
      showCutScreen,
      isRecording,
      showMic,
      isInterCom,
      fullPlayerWidth,
      fullPlayerHeight,
      panelItemActiveColor,
    } = this.props;
    const realWidth = isFullScreen ? fullPlayerWidth : playerWidth;
    const realHeight = isFullScreen ? fullPlayerHeight : playerHeight;
    return (
      <View style={styles.livePlayerPage} onLayout={e => this._onLayout(e)}>
        <CustomPlayer playerWidth={realWidth} playerHeight={realHeight} />
        {/* 大中小屏截图 */}
        {showCutScreen && <CutScreen />}
        {/* 录像功能 */}
        {isRecording && (
          <TimerInterval isFullScreen={isFullScreen} panelItemActiveColor={panelItemActiveColor} />
        )}
        {/* 麦克风对讲功能 */}
        {showMic && isInterCom && <CameraMic />}
        {/* 双向通话提示 */}
        {showMic && !isInterCom && (
          <TopPublicTip
            isFullScreen={isFullScreen}
            tipText={Strings.getLang('callingTip')}
            playerWidth={realWidth}
          />
        )}
        {/* 全屏加载弹出框 */}
        {isFullScreen && showSelfModal && <ClarityFullScreen />}
        {/* 视频使用流量直播 */}
        {!showVideoLoad && showMobileNetTip && (
          <MobileNetTip
            isFullScreen={isFullScreen}
            playerWidth={realWidth}
            tipText={Strings.getLang('ipc_live_page_mobile_net_tip')}
            closeMobileTip={this.closeMobileTip}
          />
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  livePlayerPage: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const mapStateToProps = state => {
  const {
    showVideoLoad,
    showSelfModal,
    isMobileNetType,
    showCutScreen,
    showMic,
    isRecording,
    isInterCom,
    panelItemActiveColor,
  } = state.ipcCommonState;
  return {
    showVideoLoad,
    isMobileNetType,
    showSelfModal,
    showCutScreen,
    showMic,
    isRecording,
    isInterCom,
    panelItemActiveColor,
  };
};
const mapToDisPatch = dispatch => {
  return bindActionCreators({}, dispatch);
};

export default connect(mapStateToProps, mapToDisPatch)(LivePlayerView);
