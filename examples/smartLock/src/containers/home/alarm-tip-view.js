import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { View, Image, Text, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { Utils, TYSdk } from 'tuya-panel-kit';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { getAlarmText } from '../../utils';
import Strings from '../../i18n';
import Res from '../../res';

const { withTheme } = Utils.ThemeUtils;

// const {
// switch: switchCode,
// } = Config.codes;

class AlarmTipView extends PureComponent {
  static propTypes = {
    theme: PropTypes.object.isRequired,
    recentAlarm: PropTypes.object,
    alarmUnReadCount: PropTypes.number,
  };

  static defaultProps = {
    recentAlarm: {},
    alarmUnReadCount: 0,
  };
  goToAlarmPage = () => {
    TYSdk.Navigator.push({
      id: 'alarm',
      title: Strings.getLang('tabAlarm'),
    });
  };
  render() {
    const { alarmUnReadCount, recentAlarm } = this.props;
    const { gmtCreate, dps } = recentAlarm;
    let recentRecord;
    if (Object.keys(recentAlarm).length > 0) {
      const alarmText = Object.keys(dps).length > 0 && getAlarmText(dps);
      const _time = Utils.TimeUtils.dateFormat('hh:mm', new Date(Number(gmtCreate)));
      const _date = Utils.TimeUtils.dateFormat('yyyy-MM-dd hh:mm', new Date(Number(gmtCreate)));
      const date = Utils.TimeUtils.dateFormat('yyyy-MM-dd', new Date(Number(gmtCreate)));
      const today = Utils.TimeUtils.dateFormat('yyyy-MM-dd', new Date());
      const isToday = date === today;
      const time = isToday ? _time : _date;
      recentRecord = `${alarmText} ${time}`;
    } else {
      recentRecord = Strings.getLang('noAlarmRecords');
    }
    const _alarmUnReadCount = alarmUnReadCount > 99 ? '99+' : alarmUnReadCount;
    return (
      <TouchableWithoutFeedback onPress={this.goToAlarmPage}>
        <View style={styles.container}>
          <View style={styles.left}>
            <View style={styles.alarmIcon}>
              <Image source={Res.alarm} />
            </View>
            <Text style={styles.leftText}>{recentRecord}</Text>
          </View>
          {alarmUnReadCount > 1 && (
            <View style={styles.right}>
              <Text style={styles.rightText}>{_alarmUnReadCount}</Text>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginHorizontal: 8,
    height: 56,
    justifyContent: 'center',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  alarmIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#F4F4F4',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftText: {
    color: '#333333',
    fontSize: 14,
    marginLeft: 16,
  },
  right: {
    right: 14,
    position: 'absolute',
    minWidth: 20,
    minHeight: 20,
    borderRadius: 10,
    backgroundColor: '#FC4747',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 1,
  },
  rightText: {
    fontSize: 10,
    color: '#fff',
    backgroundColor: 'transparent',
  },
});

export default compose(
  connect(state => ({
    alarmUnReadCount: state.alarmUnReadCount,
    recentAlarm: state.lastAlarm,
  })),
  withTheme
)(AlarmTipView);
