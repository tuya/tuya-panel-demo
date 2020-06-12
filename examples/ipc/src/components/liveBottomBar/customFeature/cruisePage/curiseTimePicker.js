import React from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { TYText, TimerPicker, TYSdk, Popup } from 'tuya-panel-kit';
import PickerFooter from './pickerFooter';
import Strings from '../../../../i18n';
import { getHourMinute } from '../../../../utils';
import Config from '../../../../config';
import { showCustomDialog } from '../../../../redux/modules/ipcCommon';

const { cx, isIOS } = Config;

const TYEvent = TYSdk.event;
const TYNative = TYSdk.native;
const TYDevice = TYSdk.device;

class CuriseTimePicker extends React.Component {
  static propTypes = {
    showNextDay: PropTypes.bool.isRequired,
    timerPickerValue: PropTypes.array.isRequired,
    showCustomDialog: PropTypes.func.isRequired,
  };
  constructor(props) {
    super(props);
    this.state = {
      showNextDay: props.showNextDay,
      timerPickerValue: props.timerPickerValue,
    };
  }
  componentDidMount() {
    TYEvent.on('deviceDataChange', this.addListenDpChange);
  }
  componentWillUnmount() {
    TYEvent.off('deviceDataChange', this.addListenDpChange);
  }
  onConfirm = () => {
    const { timerPickerValue } = this.state;
    TYNative.showLoading({ title: '' });
    TYDevice.putDeviceData({
      cruise_time: JSON.stringify({
        t_start: getHourMinute(timerPickerValue[0]),
        t_end: getHourMinute(timerPickerValue[1]),
      }),
      cruise_time_mode: '1',
    });
  };

  onCancel = () => {
    Popup.close();
    this.props.showCustomDialog({
      showCustomDialog: false,
    });
  };
  addListenDpChange = data => {
    const changedp = data.payload;
    if (changedp.cruise_time !== undefined) {
      TYNative.hideLoading();
      Popup.close();
      this.props.showCustomDialog({
        showCustomDialog: false,
      });
    }
  };

  renderTimeHeader = () => {
    const { showNextDay, timerPickerValue } = this.state;
    return (
      <View style={styles.timeHeaderBox}>
        <View style={styles.startBox}>
          <TYText numberOfLines={1} style={styles.startTimeContent}>
            {getHourMinute(timerPickerValue[0])}
          </TYText>
          <TYText numberOfLines={1} style={styles.startTimeTip}>
            {Strings.getLang('startTime')}
          </TYText>
        </View>
        <View style={styles.middleBox}>
          <TYText numberOfLines={1} style={styles.middleText}>
            一
          </TYText>
        </View>
        <View style={styles.endBox}>
          <View style={styles.endContain}>
            <View style={styles.endTimeContent}>
              <TYText numberOfLines={1} style={styles.endRealTime}>
                {getHourMinute(timerPickerValue[1])}
              </TYText>
              <TYText numberOfLines={1} style={styles.endRealDay} numberOfLines={1}>
                {showNextDay ? Strings.getLang('nextDay') : ''}
              </TYText>
            </View>
            <TYText numberOfLines={1} style={styles.endTimeTip}>
              {Strings.getLang('endTime')}
            </TYText>
          </View>
        </View>
      </View>
    );
  };
  render() {
    const { timerPickerValue } = this.state;
    return (
      <View style={styles.curiseTimePickerPage}>
        {this.renderTimeHeader()}
        <TimerPicker
          startTime={timerPickerValue[0]}
          endTime={timerPickerValue[1]}
          itemStyle={styles.pickItemStyle}
          style={styles.pickerStyle}
          visibleItemCount={3}
          is12Hours={false}
          onTimerChange={(startTime, endTime) => {
            let showNextDay = false;
            if (endTime <= startTime) {
              showNextDay = true;
            } else {
              showNextDay = false;
            }
            this.setState({
              showNextDay,
              timerPickerValue: [startTime, endTime],
            });
          }}
        />
        <PickerFooter
          accessibilityLabel=""
          onCancel={this.onCancel}
          onConfirm={this.onConfirm}
          cancelText={Strings.getLang('cancel_btn')}
          confirmText={Strings.getLang('confirm_btn')}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  curiseTimePickerPage: {
    backgroundColor: '#ffffff',
  },
  timeHeaderBox: {
    paddingHorizontal: cx(20),
    paddingTop: cx(20),
    paddingBottom: cx(40),
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  startBox: {
    flex: 1,
    justifyContent: 'center',
  },
  startTimeContent: {
    fontSize: cx(24),
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: cx(6),
  },
  startTimeTip: {
    fontSize: cx(14),
    color: '#999999',
    textAlign: 'center',
    marginLeft: cx(4),
  },
  middleBox: {
    width: cx(60),
  },
  middleText: {
    fontSize: cx(24),
    color: '#999999',
    width: '100%',
    textAlign: 'center',
    left: !isIOS ? -cx(10) : 0,
  },
  endBox: {
    flex: 1,
    alignItems: 'center',
  },
  endContain: {},
  endTimeContent: {
    marginBottom: cx(6),
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  endRealTime: {
    fontSize: cx(24),
    color: '#333',
    fontWeight: '500',
  },
  endRealDay: {
    marginLeft: cx(3),
    fontSize: cx(12),
    color: '#333',
    fontWeight: '500',
  },
  endTimeTip: {
    fontSize: cx(14),
    color: '#999999',
    textAlign: 'left',
    marginLeft: cx(4),
  },
  pickItemStyle: {
    fontSize: Math.ceil(cx(20)),
    flex: 1,
    backgroundColor: '#ffffff',
  },
  pickerStyle: {
    height: Math.ceil(cx(120)),
    backgroundColor: '#fff',
    marginBottom: Math.ceil(cx(40)),
  },
});

const mapStateToProps = state => {
  const { showNextDay, timerPickerValue } = state.ipcCommonState;
  return {
    showNextDay,
    timerPickerValue,
  };
};

const mapToDisPatch = dispatch => {
  return bindActionCreators({ showCustomDialog }, dispatch);
};

export default connect(mapStateToProps, mapToDisPatch)(CuriseTimePicker);
