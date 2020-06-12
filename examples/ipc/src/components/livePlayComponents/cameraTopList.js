/* eslint-disable max-len */
import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { TYText } from 'tuya-panel-kit';
import { popData, showPopCommon, zoomState as zoomStateAction, } from '../../redux/modules/ipcCommon';
import { operatMute, isRecordingNow, isRecordingChangeMute } from '../../config/click';
import Config from '../../config';
import Res from '../../res';
import Strings from '../../i18n';

const { smallScreen, middlleScreen, cx, cy } = Config;
let listHeight = cy(55);
if (smallScreen) {
  listHeight = cy(29);
} else if (middlleScreen) {
  listHeight = cy(38);
}

class CameraTopList extends React.Component {
  static propTypes = {
    popData: PropTypes.func.isRequired,
    showPopCommon: PropTypes.func.isRequired,
    voiceStatus: PropTypes.string.isRequired,
    clarityStatus: PropTypes.string.isRequired,
    isSupportedSound: PropTypes.bool.isRequired,
    isRecording: PropTypes.bool.isRequired,
    zoomStateAction: PropTypes.func.isRequired,
    zoomState: PropTypes.number.isRequired,
    prevZoomState: PropTypes.number.isRequired,
  };
  constructor(props) {
    super(props);
    this.state = {
      rightMenuData: [
        {
          show: props.isSupportedSound,
          test: props.voiceStatus === 'on' ? 'tuya_ipc_speaker_on' : 'tuya_ipc_speaker_off',
          key: 'mute',
          imgSource: props.voiceStatus === 'off' ? Res.publicImage.basicMute : Res.publicImage.basicNotMute,
        },
        {
          show: true,
          test:
            props.zoomState === 1 ? 'tuya_ipc_size_adjust_height' : 'tuya_ipc_size_adjust_width',
          key: 'size',
          imgSource: props.zoomState === 1 ? Res.publicImage.basicPlayerSizeHeight : Res.publicImage.basicPlayerSizeWidth,
        },
      ],
    };
  }

  componentWillReceiveProps(nextProps) {
    const oldProps = this.props;
    const newProps = nextProps;
    const oldArr = this.state.rightMenuData;
    if (newProps.isSupportedSound !== oldProps.isSupportedSound) {
      for (let i = 0; i < oldArr.length; i++) {
        if (oldArr[i].key === 'mute') {
          if (newProps.isSupportedSound) {
            oldArr[i].show = true;
          } else {
            oldArr[i].show = false;
          }
          break;
        }
      }
    }
    if (oldProps.voiceStatus !== newProps.voiceStatus) {
      for (let i = 0; i < oldArr.length; i++) {
        if (oldArr[i].key === 'mute') {
          if (newProps.voiceStatus === 'off') {
            oldArr[i].imgSource = Res.publicImage.basicMute;
            oldArr[i].test = 'tuya_ipc_speaker_on';
          } else {
            oldArr[i].imgSource = Res.publicImage.basicNotMute;
            oldArr[i].test = 'tuya_ipc_speaker_off';
          }
        }
      }
    }
    // 根据点击按钮变更按宽还是按高,通过使用props来进行控制
    if (oldProps.zoomState !== newProps.zoomState) {
      for (let i = 0; i < oldArr.length; i++) {
        if (oldArr[i].key === 'size') {
          if (newProps.zoomState === 1) {
            oldArr[i].imgSource = Res.publicImage.basicPlayerSizeHeight;
            oldArr[i].test = 'tuya_ipc_size_adjust_height';
          } else {
            oldArr[i].imgSource = Res.publicImage.basicPlayerSizeWidth;
            oldArr[i].test = 'tuya_ipc_size_adjust_width';
          }
        }
      }
    }
    this.setState({
      rightMenuData: oldArr,
    });
  }
  popResolution = () => {
    const { clarityStatus } = this.props;
    if (isRecordingNow()) {
      return false;
    }
    this.props.showPopCommon({
      showPopCommon: true,
    });
    this.props.popData({
      popData: {
        title: '',
        dpValue: clarityStatus,
        mode: 'videoResolution',
        showData: [
          { value: 'HD', text: Strings.getLang('resolutionHigh'), checked: clarityStatus === 'HD', test: 'tuya_ipc_resolution_choose_hd', },
          {
            value: 'SD',
            text: Strings.getLang('resolutionStandard'),
            checked: clarityStatus === 'SD',
            test: 'tuya_ipc_resolution_choose_sd',
          },
        ],
      },
    });
  };

  menuClick = key => {
    switch (key) {
      case 'mute':
        this.enableMute();
        break;
      case 'size':
        this.adjustSize();
        break;
      default:
        return false;
    }
  };
  enableMute = () => {
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
  adjustSize = () => {
    const { prevZoomState } = this.props;
    let sendZommState = 0;
    if (prevZoomState === 1 || prevZoomState === 2) {
      sendZommState = 0;
    } else if (prevZoomState === 0) {
      sendZommState = 1;
    }
    this.props.zoomStateAction({ zoomState: sendZommState });
  };
  render() {
    const { rightMenuData } = this.state;
    const { clarityStatus } = this.props;
    return (
      <View style={styles.cameraTopListPage}>
        <View style={styles.leftMenu}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.menuItem}
            onPress={this.popResolution}
            accessibilityLabel={
              clarityStatus === 'SD' ? 'tuya_ipc_resolution_sd' : 'tuya_ipc_resolution_hd'
            }
          >
            <TYText numberOfLines={1} style={styles.videoClass}>
              {clarityStatus === 'SD'
                ? Strings.getLang('resolutionStandard')
                : Strings.getLang('resolutionHigh')}
            </TYText>
          </TouchableOpacity>
        </View>
        <View style={styles.rightMenu}>
          {rightMenuData.map(item => (
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.menuItem}
              key={item.key}
              onPress={() => this.menuClick(item.key)}
              accessibilityLabel={item.test || ''}
            >
              {item.show && <Image source={item.imgSource} style={styles.menuItemImg} />}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  cameraTopListPage: {
    paddingLeft: cx(20),
    height: listHeight,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  leftMenu: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightMenu: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemImg: {
    width: cx(24),
    resizeMode: 'contain',
  },
  menuItem: {
    marginRight: cx(20),
  },
  videoClass: {
    fontSize: Platform.OS === 'ios' ? Math.ceil(cx(12)) : Math.ceil(cx(12)),
    color: '#fff',
    textAlign: 'center',
    textAlignVertical: 'center',
    paddingHorizontal: Math.ceil(cx(7)),
    paddingVertical: Platform.OS === 'ios' ? cy(2) : cx(0),
    borderWidth: 2,
    borderColor: '#fff',
    fontWeight: '600',
    borderRadius: 4,
    overflow: 'hidden',
  },
});
const mapStateToProps = state => {
  const {
    voiceStatus,
    clarityStatus,
    isSupportedSound,
    isRecording,
    zoomState,
    prevZoomState,
  } = state.ipcCommonState;
  return {
    voiceStatus,
    clarityStatus,
    isSupportedSound,
    isRecording,
    zoomState,
    prevZoomState,
  };
};

const mapToDisPatch = dispatch => {
  return bindActionCreators({ popData, showPopCommon, zoomStateAction }, dispatch);
};

export default connect(
  mapStateToProps,
  mapToDisPatch
)(CameraTopList);
