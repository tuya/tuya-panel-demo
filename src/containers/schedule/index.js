import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, StyleSheet } from 'react-native';
import { TYFlatList, TYSdk } from 'tuya-panel-kit';
import Strings from '../../i18n';

const TYNative = TYSdk.native;
const TYDevice = TYSdk.device;

class ScheduleScene extends Component {
  static propTypes = {
    switches: PropTypes.object.isRequired,
    timers: PropTypes.object.isRequired,
  };

  get datas() {
    const { switches, timers } = this.props;
    return _.map(switches, (dp, key) => {
      const curTimer = timers[dp.code];
      const time = _.get(curTimer, 'time');
      const loops = _.get(curTimer, 'loops');
      const status = _.get(curTimer, 'status');
      const value = this.getTime(time, loops, status);
      return {
        key,
        title: dp.name || Strings.getDpLang(dp.code),
        value,
        arrow: true,
        onPress: () => {
          TYNative.gotoDpAlarm({
            category: `category_${dp.code}`,
            repeat: 0,
            data: [
              {
                dpId: TYDevice.getDpIdByCode(dp.code),
                dpName: dp.name,
                selected: 0,
                rangeKeys: [true, false],
                rangeValues: [true, false].map(v => Strings.getDpLang(dp.code, v)),
              },
            ],
          });
        },
      };
    });
  }

  /**
   * @desc
   * 检查最近的定时时间是否为`今天`且`晚于此刻`，否则返回空字符串
   * @param {String} time - xx:xx
   * @param {String} loops - 0000000
   * @param {Boolean} status - 开启还是关闭
   */
  getTime(time, loops, status) {
    if (!time) {
      return '';
    }
    const weekday = new Date().getDay();
    if (loops !== '0000000' && loops[weekday] !== '1') {
      return '';
    }
    const [hour, min] = time.split(':');
    const now = Date.now();
    const timerDate = new Date();
    timerDate.setHours(hour);
    timerDate.setMinutes(min);
    if (+timerDate < now) {
      return '';
    }
    return Strings.formatValue(status ? 'timerOnTip' : 'timerOffTip', time);
  }

  render() {
    return (
      <View style={styles.container}>
        <TYFlatList style={{ paddingTop: 16 }} data={this.datas} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
});

export default connect(({ switchState }) => ({
  switches: switchState.switches,
  timers: switchState.timers,
}))(ScheduleScene);
