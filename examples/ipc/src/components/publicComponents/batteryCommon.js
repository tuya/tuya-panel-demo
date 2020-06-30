/* eslint-disable react/require-default-props */
/* eslint-disable react/no-unused-prop-types */
/* eslint-disable camelcase */
import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { TYText } from 'tuya-panel-kit';
import Battery from './batteryFeature';
import Config from '../../config';
import strings from '../../i18n';

const { cx } = Config;

class BatteryCommon extends React.Component {
  static propTypes = {
    wireless_electricity: PropTypes.number,
    wireless_powermode: PropTypes.string,
    battery_report_cap: PropTypes.number,
  };
  constructor(props) {
    super(props);
    this.state = {
      electricity: this.getInitElectricityValue(props),
    };
  }
  componentWillReceiveProps(nextProps) {
    this.getChangeElectricityValue(nextProps);
  }
  getInitElectricityValue = props => {
    let eleText = strings.getLang('ipc_electric_power_charging');
    const { wireless_electricity, wireless_powermode, battery_report_cap } = props;
    // 是否为精确上报
    let reportAccurately = false;
    if (typeof battery_report_cap !== 'undefined') {
      const reportValue = battery_report_cap.toString(2);
      const convertValue = this.addZero(reportValue, 4);
      if (convertValue[3] === '1') {
        reportAccurately = true;
      }
    }
    // 当不在充电而且上报能力集为精准上报时取上报的值即可,
    // 插电时无法准确上报电量的设备，DP145上报0，禁止非插电时上报DP145为0
    if (wireless_powermode !== '1') {
      if (reportAccurately && wireless_electricity !== 0) {
        eleText = `${wireless_electricity}%`;
      } else if (wireless_electricity === 0) {
        // 其他情况取电池的范围上报
        eleText = strings.getLang('ipc_electric_power_charging');
      } else {
        // 其他情况取电池的范围上报
        eleText = this.getRealEleValue(wireless_electricity);
      }
    }
    return {
      eleText,
    };
  };
  getRealEleValue = ele => {
    if (ele <= 5) {
      return '5%';
    }
    const _ele = ele % 10 === 5 ? Math.floor(ele / 10) : Math.round(ele / 10);
    return `${_ele * 10}%`;
  };

  getChangeElectricityValue = props => {
    let eleText = strings.getLang('ipc_electric_power_charging');
    const { wireless_electricity, wireless_powermode, battery_report_cap } = props;
    // 是否为精确上报
    let reportAccurately = false;
    if (typeof battery_report_cap !== 'undefined') {
      const reportValue = battery_report_cap.toString(2);
      const convertValue = this.addZero(reportValue, 4);
      if (convertValue[3] === '1') {
        reportAccurately = true;
      }
    }
    // 当不在充电而且上报能力集为精准上报时取上报的值即可,
    // 插电时无法准确上报电量的设备，DP145上报0，禁止非插电时上报DP145为0
    if (wireless_powermode !== '1') {
      if (reportAccurately && wireless_electricity !== 0) {
        eleText = `${wireless_electricity}%`;
      } else if (wireless_electricity === 0) {
        // 其他情况取电池的范围上报
        eleText = strings.getLang('ipc_electric_power_charging');
      } else {
        // 其他情况取电池的范围上报
        eleText = this.getRealEleValue(wireless_electricity);
      }
    }
    this.setState({
      electricity: {
        eleText,
      },
    });
  };
  addZero = (num, length) => {
    if (`${num}`.length >= length) {
      return num;
    }
    return this.addZero(`0${num}`, length);
  };

  render() {
    const { electricity } = this.state;
    const { wireless_electricity, wireless_powermode } = this.props;
    const isCharging = Boolean(wireless_powermode === '1');
    return (
      <View style={styles.batteryPage}>
        <View style={styles.batteryBox}>
          <Battery
            value={isCharging ? 100 : wireless_electricity}
            size={13}
            batteryColor="#fff"
            isCharging={isCharging}
          />
        </View>
        {!isCharging && <TYText style={styles.batteryText}>{electricity.eleText}</TYText>}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  batteryPage: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  batteryBox: {
    width: 20,
  },
  batteryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});

const mapStateToProps = state => {
  const { wireless_electricity, wireless_powermode, battery_report_cap } = state.dpState;
  return {
    wireless_electricity,
    wireless_powermode,
    battery_report_cap,
  };
};

export default connect(mapStateToProps, null)(BatteryCommon);
