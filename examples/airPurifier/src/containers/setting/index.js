import camelCase from 'camelcase';
import _map from 'lodash/map';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { Utils, Popup } from 'tuya-panel-kit';
import shallowCompare from 'react-addons-shallow-compare';
import SettingsView from '../../components/SettingsView';
import TYSdk from '../../api';
import dpCodes from '../../config/dpCodes';
import { arrayToObject } from '../../utils';
import Strings from '../../i18n';
import { store } from '../../main';

const { convertY: cy } = Utils.RatioUtils;

const TYEvent = TYSdk.event;
const TYDevice = TYSdk.device;
const TYNative = TYSdk.native;

const {
  power: powerCode,
  filterReset: filterResetCode,
  anion: anionCode,
  childLock: childLockCode,
  light: lightCode,
  uv: uvCode,
  wet: wetCode,
  countdownSet: countdownSetCode,
} = dpCodes;

class SettingScene extends Component {
  static propTypes = {
    showDpFun: PropTypes.bool.isRequired,
    dps: PropTypes.arrayOf(
      PropTypes.shape({
        code: PropTypes.string.isRequired,
      })
    ).isRequired,
  };

  constructor(props) {
    super(props);
    this._dps = props.dps;
    this.state = arrayToObject(
      this._dps.map(({ code }) => ({
        [code]: store.getState().dpState[code],
      }))
    );
  }

  componentWillReceiveProps(nextProps) {
    nextProps.dps.map(({ code }) => {
      this.setState({
        [code]: store.getState().dpState[code],
      });
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }

  componentWillUnmount() {
    TYEvent.off('dpDataChange', this._handleDpDataChange);
  }

  getDpFunData() {
    const { showDpFun } = this.props;
    if (!showDpFun) {
      return [];
    }
    return _map(this.state, (value, code) => {
      const accessibilityLabel = `SettingScene_Row_${camelCase(code, {
        pascalCase: true,
      })}`;
      const title = Strings.getDpLang(code);
      const hint = typeof value === 'string' ? Strings.getDpLang(code, value) : value;
      if (code === filterResetCode) {
        return {
          accessibilityLabel,
          title,
          onPress: this._handleResetFilter,
        };
      }
      return {
        accessibilityLabel,
        value,
        title,
        hint,
        onPress: () => this._handleItemPress(value, code),
      };
    });
  }

  getCloudFunData() {
    const { showDpFun } = this.props;
    return [
      {
        style: showDpFun && { marginTop: cy(16) },
        title: Strings.getLang('schedule'),
        onPress: () => this._handleCloudFuncPress(),
      },
    ];
  }

  _handleDpDataChange = data => {
    const cmd = {};
    const codes = Object.keys(data);

    codes.forEach(code => {
      if (typeof this.state[code] !== 'undefined') {
        cmd[code] = data[code];
      }
    });

    if (Object.keys(cmd).length > 0) {
      this.setState(cmd);
    }
  };

  _handleItemPress(value, code) {
    if (typeof value === 'boolean') {
      TYDevice.putDeviceData({ [code]: !value });
    } else if (typeof value === 'string') {
      const { devInfo = {} } = store.getState();
      const { range } = devInfo.schema[code];
      const rangeStrings = range.map(v => ({
        key: v,
        title: Strings.getDpLang(code, v),
        value: v,
      }));

      Popup.list({
        title: Strings.getDpLang(code),
        footerType: 'singleCancel',
        cancelText: Strings.getLang('cancel'),
        value,
        dataSource: rangeStrings,
        onSelect: v => {
          TYDevice.putDeviceData({
            [code]: v,
          });
          Popup.close();
        },
      });
    }
  }

  _handleResetFilter = () => {
    TYNative.simpleConfirmDialog(
      Strings.getDpLang(filterResetCode),
      Strings.getLang('filterResetTip'),
      () => {
        TYDevice.putDeviceData({
          [filterResetCode]: true,
        });
      },
      () => {}
    );
  };

  _handleCloudFuncPress = () => {
    const data = [
      {
        dpId: TYDevice.getDpIdByCode(powerCode),
        dpName: Strings.getLang('power'),
        selected: 0,
        rangeKeys: [true, false],
        rangeValues: [Strings.getLang('switchOn'), Strings.getLang('switchOff')],
      },
    ];
    TYNative.gotoDpAlarm({
      category: 'category__switch',
      repeat: 0,
      data,
    });
  };

  render() {
    return (
      <View style={styles.container}>
        <SettingsView
          style={styles.settingsView}
          data={[...this.getDpFunData(), ...this.getCloudFunData()]}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },

  settingsView: {
    paddingVertical: cy(16),
    backgroundColor: '#f8f8f8',
  },
});

export default connect(({ dpState }) => ({
  anion: dpState[anionCode],
  childLock: dpState[childLockCode],
  light: dpState[lightCode],
  uv: dpState[uvCode],
  wet: dpState[wetCode],
  filterReset: dpState[filterResetCode],
  countdownSet: dpState[countdownSetCode],
}))(SettingScene);
