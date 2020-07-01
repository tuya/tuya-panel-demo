/* eslint-disable react/require-default-props */
/* eslint-disable camelcase */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { TYSdk, TYText } from 'tuya-panel-kit';
import { connect } from 'react-redux';
import ProgressBarCommon from '../../../publicComponents/progressBarCommon';
import DialogTitle from '../../../publicComponents/customDialog/dialogTitle';
import MusicControl from './musicControl';
import Config from '../../../../config';
import Res from '../../../../res';
import Strings from '../../../../i18n';

const { cx, isIphoneX } = Config;
const TYEvent = TYSdk.event;
const TYDevice = TYSdk.device;

class Lullaby extends React.Component {
  static propTypes = {
    ipc_lullaby_list: PropTypes.string,
    ipc_lullaby_control: PropTypes.string,
    basic_device_volume: PropTypes.number,
  };
  constructor(props) {
    super(props);
    this.state = {
      currentSongName: '',
      currentTitle: '',
      voiceBar: {
        iconImage: Res.lullaby.lullabyNormalVoice,
        dpValue: props.basic_device_volume || 1,
        min: 1,
        max: 10,
        stepValue: 1,
        hasUnit: false,
        noPercent: true,
        minColor: '#2778f6',
        maxColor: '#cccccc',
        disabled: false,
        thumbStyle: styles.thumbStyle,
        thumbTintColor: '#2778f6',
        key: 'basic_device_volume',
      },
    };
  }
  componentDidMount() {
    TYEvent.on('deviceDataChange', this.dpChange);
    const { ipc_lullaby_list, ipc_lullaby_control } = this.props;
    const currentSong = ipc_lullaby_list;
    const controlState = ipc_lullaby_control;

    this.setState({
      currentSongName: Strings.getLang(`ipc_lullaby_song_${currentSong}`),
      currentTitle:
        controlState === '1'
          ? Strings.getLang(`ipc_lullaby_song_playIng`)
          : Strings.getLang('ipc_lullaby_song_stop'),
    });
  }
  componentWillUnmount() {
    TYEvent.off('deviceDataChange', this.dpChange);
  }
  dpChange = data => {
    const changedp = data.payload;
    if (changedp.basic_device_volume !== undefined) {
      this.changeSendBarData(changedp.basic_device_volume, 'basic_device_volume');
    } else if (changedp.ipc_lullaby_list !== undefined) {
      this.setState({
        currentSongName: Strings.getLang(`ipc_lullaby_song_${changedp.ipc_lullaby_list}`),
      });
    } else if (changedp.ipc_lullaby_control !== undefined) {
      this.setState({
        currentTitle:
          changedp.ipc_lullaby_control === '1'
            ? Strings.getLang(`ipc_lullaby_song_playIng`)
            : Strings.getLang('ipc_lullaby_song_stop'),
      });
    }
  };
  upDateDpLightVaue = (value, dpCode) => {
    TYDevice.putDeviceData({
      [dpCode]: value,
    });
  };
  dragLightValue = _.throttle((value, dpCode) => {
    this.changeSendBarData(value, dpCode);
    TYDevice.putDeviceData({
      [dpCode]: value,
    });
  }, 350);
  changeSendBarData = (value, dpCode) => {
    const { voiceBar } = this.state;
    this.setState({
      voiceBar: {
        ...voiceBar,
        dpValue: value,
      },
    });
  };
  render() {
    const { voiceBar, currentSongName, currentTitle } = this.state;
    const { basic_device_volume } = this.props;
    const showDeviceVolumn = basic_device_volume;
    return (
      <View style={styles.lullabyPage}>
        <DialogTitle title={currentTitle} />
        <View style={styles.lullabyContainer}>
          <View style={styles.musicNameBox}>
            <TYText numberOfLines={1} style={styles.musicName}>
              {currentSongName}
            </TYText>
          </View>
          <View style={styles.barContainer}>
            {showDeviceVolumn !== undefined && (
              <ProgressBarCommon
                handleLightValue={this.upDateDpLightVaue}
                dragLightValue={this.dragLightValue}
                barData={voiceBar}
              />
            )}
          </View>
        </View>

        <MusicControl />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  lullabyPage: {
    paddingBottom: isIphoneX ? 20 : 0,
    backgroundColor: '#fff',
    overflow: 'hidden',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  lullabyContainer: {
    paddingHorizontal: cx(20),
    paddingTop: cx(15),
  },
  musicNameBox: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  musicName: {
    fontSize: cx(16),
    fontWeight: '300',
  },
  barContainer: {
    paddingTop: cx(10),
    paddingBottom: cx(30),
  },
  thumbStyle: {
    backgroundColor: '#2778f6',
    width: cx(16),
    height: cx(16),
    borderRadius: cx(8),
  },
});

const mapStateToProps = state => {
  const { ipc_lullaby_list, ipc_lullaby_control, basic_device_volume } = state.dpState;
  return {
    ipc_lullaby_list,
    ipc_lullaby_control,
    basic_device_volume,
  };
};

export default connect(mapStateToProps, null)(Lullaby);
