import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { StyleSheet, View } from 'react-native';
import { Utils, TYFlatList, Popup, TYSdk } from 'tuya-panel-kit';
import Strings from '../../i18n';

const { parseSecond } = Utils.TimeUtils;
const TYDevice = TYSdk.device;

interface CountdownViewProps {
  dpState: {
    switch_1: boolean;
    switch_2: boolean;
  };
  switchName: {
    switch_1: string;
    switch_2: string;
  };
  data: any;
}

class CountdownView extends Component<CountdownViewProps> {
  static propTypes = {
    dpState: PropTypes.object,
    switchName: PropTypes.object,
    data: PropTypes.array,
  };
  static defaultProps = {
    dpState: {},
    switchName: {},
    data: [],
  };

  get datas() {
    const { data, switchName, dpState } = this.props;
    return _.map(data, (dp, key) => {
      const { code } = dp;
      const countdownValue = dpState[code];
      const switchCode = `switch_${this.switchCode(code)}`;
      const names = switchName[switchCode] || Strings.getDpLang(switchCode);
      const hour = parseSecond(countdownValue)[0];
      const minute = parseSecond(countdownValue)[1];
      const power = dpState[switchCode];
      const valueTxt = power
        ? Strings.formatValue('countdownValueOff', hour, minute)
        : Strings.formatValue('countdownValue', hour, minute);
      return {
        key,
        title: names,
        value: countdownValue > 0 ? valueTxt : '',
        arrow: true,
        onPress: () => this._handleToSetCountdown(code, countdownValue),
      };
    });
  }

  _handleToSetCountdown = (code: string, dpValue: number) => {
    Popup.countdown({
      title: Strings.getLang('countdown'),
      cancelText: Strings.getLang('cancel'),
      confirmText: Strings.getLang('sure'),
      hourText: Strings.getLang('hour'),
      minuteText: Strings.getLang('minute'),
      value: dpValue / 60,
      switchValue: true,
      onConfirm: (data: any) => {
        TYDevice.putDeviceData({ [code]: data.hour * 60 * 60 + data.minute * 60 });
        Popup.close();
      },
    });
  };

  switchCode(code: string) {
    return code.substring(code.indexOf('_') + 1);
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

const mapStateToProps = (state: any) => {
  return {
    dpState: state.dpState,
    switchName: state.socketState.socketNames,
  };
};

export default connect(mapStateToProps, null)(CountdownView);
