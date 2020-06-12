/* eslint-disable camelcase */
import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { TYText, TYSdk } from 'tuya-panel-kit';
import {
  showSdFormatting,
  sdIsFormatting as sdIsFormattingAction,
} from '../../../redux/modules/ipcCommon';
import FormatCircle from './formatCircle';
import Strings from '../../../i18n';
import Res from '../../../res';
import Config from '../../../config';

const { topBarHeight, statusBarHeight } = Config;
const TYNative = TYSdk.native;
const TYDevice = TYSdk.device;
const TYEvent = TYSdk.event;

const sdForamtStatus = {
  '-2001': Strings.getLang('sd_abnormal_format_fail'),
  '-2002': Strings.getLang('sd_abnormal_format_none'),
  '-2003': Strings.getLang('sd_abnormal_format_err'),
};

class SdFormatting extends React.Component {
  static propTypes = {
    showSdFormatting: PropTypes.func.isRequired,
    sdIsFormatting: PropTypes.bool.isRequired,
    sdIsFormattingAction: PropTypes.func.isRequired,
  };
  static defaultProps = {};
  constructor(props) {
    super(props);
    this.state = {
      percentValue: 0,
      formateIsFinish: false,
    };
    this.timer = null;
  }

  componentDidMount() {
    const { sdIsFormatting } = this.props;
    if (!sdIsFormatting) {
      TYDevice.putDeviceData({
        sd_storge: null,
        sd_status: null,
      });
    }
    TYEvent.on('deviceDataChange', this.dpChange);
  }
  componentWillReceiveProps(props) {}

  componentWillUnmount() {
    TYEvent.off('deviceDataChange', this.dpChange);
    clearTimeout(this.timer);
  }
  dpChange = data => {
    const changedp = data.payload;
    const sdState = changedp.sd_format_state;
    let isFinish = false;
    if (sdState !== undefined) {
      this.props.sdIsFormattingAction({ sdIsFormatting: true });
      if (sdState === -2001 || sdState === -2002 || sdState === -2003) {
        const stringState = String(sdState);
        this.props.showSdFormatting({ showSdFormatting: false });
        TYNative.simpleTipDialog(sdForamtStatus[stringState], () => {});
        // 这里添加是为了处理在存储卡格式化的过程中，会出现上报2的情况
        this.props.sdIsFormattingAction({ sdIsFormatting: false });
      } else if (sdState === -2000) {
        //  const stringState = String(sdState);
        //  CameraManager.showTip(sdForamtStatus[stringState]);
        this.props.showSdFormatting({ showSdFormatting: true });
        // 这里添加是为了处理在存储卡格式化的过程中，会出现上报2(存储卡异常)的情况
        // 新Sdk已经换成上报4(正在格式化中)
        this.props.sdIsFormattingAction({ sdIsFormatting: true });
      } else {
        if (sdState === 100) {
          this.timer = setTimeout(() => {
            this.props.showSdFormatting({ showSdFormatting: false });
            this.props.sdIsFormattingAction({ sdIsFormatting: false });
          }, 3000);
          isFinish = true;
        }
        this.setState({
          percentValue: sdState,
          formateIsFinish: isFinish,
        });
      }
    }
  };
  render() {
    const { percentValue, formateIsFinish } = this.state;
    return (
      <View style={styles.sdFormattingPage}>
        <View style={styles.formatBox}>
          {formateIsFinish ? (
            <View style={styles.formatFinishBox}>
              <Image source={Res.sdCard.sdFormateComplete} style={styles.formatImg} />
            </View>
          ) : (
            <FormatCircle progressValue={percentValue} />
          )}
          <TYText style={[styles.formatText, { top: formateIsFinish ? -12 : -6 }]}>
            {formateIsFinish
              ? Strings.getLang('sd_abnormal_format_done')
              : Strings.formatValue('sd_abnormal_formatting', percentValue)}
          </TYText>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  sdFormattingPage: {
    position: 'absolute',
    top: -(topBarHeight + statusBarHeight),
    left: 0,
    right: 0,
    bottom: -(topBarHeight + statusBarHeight),
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formatBox: {
    width: 130,
    height: 130,
    backgroundColor: 'rgba(0,0,0,0.95)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formatFinishBox: {
    width: 90,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formatImg: {
    width: 90,
    resizeMode: 'contain',
  },
  formatText: {
    top: -6,
    color: '#fff',
    fontSize: 14,
  },
});

const mapStateToProps = state => {
  const { sdIsFormatting } = state.ipcCommonState;
  return {
    sdIsFormatting,
  };
};

const mapToDisPatch = dispatch => {
  return bindActionCreators({ showSdFormatting, sdIsFormattingAction }, dispatch);
};

export default connect(mapStateToProps, mapToDisPatch)(SdFormatting);
