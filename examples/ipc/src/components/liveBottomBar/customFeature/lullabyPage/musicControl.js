/* eslint-disable quote-props */
/* eslint-disable no-case-declarations */
/* eslint-disable camelcase */
import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Popup, TYSdk } from 'tuya-panel-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { showCustomDialog } from '../../../../redux/modules/ipcCommon';
import Config from '../../../../config';
import { isMicTalking, enterRnPage } from '../../../../config/click';
import Res from '../../../../res';

const { cx } = Config;

const TYDevice = TYSdk.device;

const modeImgSource = {
  '0': Res.lullaby.lullabyCircleMode,
  '1': Res.lullaby.lullabySingleMode,
  '2': Res.lullaby.lullabyRandomMode,
};
const controlImgSource = {
  '0': Res.lullaby.lullabyPlay,
  '1': Res.lullaby.lullabyPause,
};

class MusicControl extends React.Component {
  static propTypes = {
    showCustomDialog: PropTypes.func.isRequired,
    ipc_lullaby_control: PropTypes.string.isRequired,
    ipc_lullaby_mode: PropTypes.string.isRequired,
  };
  constructor(props) {
    super(props);
    this.state = {
      controlData: [
        {
          key: 'mode',
          imageSource: modeImgSource[props.ipc_lullaby_mode],
        },
        { key: 'prev', imageSource: Res.lullaby.lullabyPrev },
        {
          key: 'control',
          imageSource: controlImgSource[props.ipc_lullaby_control],
          dpValue: props.ipc_lullaby_control,
        },
        { key: 'next', imageSource: Res.lullaby.lullabyNext },
        { key: 'list', imageSource: Res.lullaby.lullabyList },
      ],
    };
  }
  componentWillReceiveProps(nextProps) {
    this.changControlArr(nextProps);
  }
  changControlArr = props => {
    const controlData = [
      {
        key: 'mode',
        imageSource: modeImgSource[props.ipc_lullaby_mode],
      },
      { key: 'prev', imageSource: Res.lullaby.lullabyPrev },
      {
        key: 'control',
        imageSource: controlImgSource[props.ipc_lullaby_control],
      },
      { key: 'next', imageSource: Res.lullaby.lullabyNext },
      { key: 'list', imageSource: Res.lullaby.lullabyList },
    ];
    this.setState({
      controlData,
    });
  };
  pressControlBtn = key => {
    const { ipc_lullaby_mode, ipc_lullaby_control } = this.props;
    switch (key) {
      case 'list':
        enterRnPage('lullabyMusicList');
        break;
      case 'control':
        if (isMicTalking()) {
          return false;
        }
        const dpValue = ipc_lullaby_control;
        TYDevice.putDeviceData({
          ipc_lullaby_control: dpValue === '0' ? '1' : '0',
        });
        break;
      case 'mode':
        const dpValues = ipc_lullaby_mode;
        let sendValue = '0';
        if (dpValues === '0') {
          sendValue = '1';
        } else if (dpValues === '1') {
          sendValue = '2';
        } else if (dpValues === '2') {
          sendValue = '0';
        }
        TYDevice.putDeviceData({
          ipc_lullaby_mode: sendValue,
        });
        break;
      case 'prev':
        if (isMicTalking()) {
          return false;
        }
        TYDevice.putDeviceData({
          ipc_lullaby_command: '1',
        });
        break;
      case 'next':
        if (isMicTalking()) {
          return false;
        }
        TYDevice.putDeviceData({
          ipc_lullaby_command: '0',
        });
        break;
      default:
        return false;
    }
  };
  render() {
    const { controlData } = this.state;
    return (
      <View style={styles.musicControlPage}>
        {controlData.map(item => (
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.controlItemBox}
            key={item.key}
            onPress={() => this.pressControlBtn(item.key)}
          >
            <Image source={item.imageSource} />
          </TouchableOpacity>
        ))}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  musicControlPage: {
    paddingBottom: cx(30),
    height: cx(70),
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  controlItemBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const mapStateToProps = state => {
  const { ipc_lullaby_control, ipc_lullaby_mode } = state.dpState;
  return {
    ipc_lullaby_control,
    ipc_lullaby_mode,
  };
};
const mapToDisPatch = dispatch => {
  return bindActionCreators({ showCustomDialog }, dispatch);
};
export default connect(mapStateToProps, mapToDisPatch)(MusicControl);
