/* eslint-disable prettier/prettier */
import camelCase from 'camelcase';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, StyleSheet } from 'react-native';
import { Popup, Utils } from 'tuya-panel-kit';
import TYSdk from '../../api';
import Button from '../../components/Button';
import GridLayout from '../../components/GridLayout';
import dpCodes from '../../config/dpCodes';
import Strings from '../../i18n';
import icons from '../../res/iconfont.json';
import { store } from '../../main';

const { isIphoneX, convertX: cx, convertY: cy } = Utils.RatioUtils;

const TYDevice = TYSdk.device;
const TYNative = TYSdk.native;

const {
  power: powerCode,
  mode: modeCode,
  anion: anionCode,
  childLock: childLockCode,
  light: lightCode,
  uv: uvCode,
  wet: wetCode,
  filterReset: filterResetCode,
  countdownSet: countdownSetCode,
} = dpCodes;

class HomeBottomView extends Component {
  static propTypes = {
    dpState: PropTypes.object,
    power: PropTypes.bool,
    dps: PropTypes.arrayOf(
      PropTypes.shape({
        code: PropTypes.string.isRequired,
      })
    ).isRequired,
  };

  static defaultProps = {
    dpState: {},
    power: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      dps: props.dps,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      dps: nextProps.dps,
    });
  }

  getData() {
    const { power } = this.props;
    const { dps } = this.state;
    // 下面这俩是必须有的
    const head = {
      key: 'power',
      label: Strings.getLang('power'),
      icon: icons.power,
      onPress: this._handleTogglePower,
    };
    const tail = {
      key: 'setting',
      label: Strings.getLang(!power ? 'schedule' : 'setting'),
      icon: !power ? icons.time : icons.setting,
      onPress: this._handleSettingPress,
    };
    const data = dps.map(dpInfo => {
      const disabled = !power;
      return {
        key: dpInfo.code,
        label: Strings.getDpLang(dpInfo.code),
        icon:
          dpInfo.code === 'Timer' // 兼容老DP...
            ? icons.countdown
            : icons[camelCase(dpInfo.code)],
        disabled,
        onPress: () => this._handleDpItemPress(dpInfo),
      };
    });
    data.unshift(head);

    data.push(tail);

    return data;
  }

  _handleTogglePower = () => {
    const { power } = this.props;
    TYDevice.putDeviceData({
      [powerCode]: !power,
    });
  };

  _handleDpItemPress(dpInfo) {
    const { code, type, range } = dpInfo;
    const value = store.getState().dpState[code];
    if (type === 'bool') {
      TYDevice.putDeviceData({
        [code]: !value,
      });
    } else if (type === 'enum') {
      if (code === modeCode && range.length === 1) {
        TYDevice.putDeviceData({
          [code]: range[0],
        });
        return;
      }
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

  _handleSettingPress = () => {
    const { power } = this.props;
    const { devInfo = {} } = store.getState();
    const dps = [
      devInfo.schema[anionCode],
      devInfo.schema[childLockCode],
      devInfo.schema[lightCode],
      devInfo.schema[uvCode],
      devInfo.schema[wetCode],
      devInfo.schema[wetCode],
      devInfo.schema[filterResetCode],
      devInfo.schema[countdownSetCode],
    ];
    if (!power) {
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
    } else {
      TYSdk.Navigator.push({
        id: 'setting',
        title: Strings.getLang('setting'),
        showDpFun: power,
        dps,
      });
    }
  };

  render() {
    const tabBgColor = 'rgba(255,255,255,.08)';
    const activeFontColor = 'rgba(255,255,255,1)';
    const inActiveIconBgColor = 'rgba(255, 255, 255, 0.1)';
    const activeIconBgColor = 'rgba(255,255,255,.2)';
    return (
      <View style={[styles.container, { backgroundColor: tabBgColor }]}>
        <GridLayout style={styles.gridLayout} rowNum={1} data={this.getData()}>
          {({ disabled, ...props }) => {
            const iconColor = disabled ? activeIconBgColor : activeFontColor;
            const iconBgColor = disabled ? inActiveIconBgColor : activeIconBgColor;
            return (
              <Button
                {...props}
                accessibilityLabel={`HomeScene_BottomView_${camelCase(props.key, {
                  pascalCase: true,
                })}`}
                style={styles.btn}
                disabled={disabled}
                size={24}
                iconColor={iconColor}
                iconStyle={[styles.icon, { backgroundColor: iconBgColor }]}
                labelStyle={[styles.label, { color: iconColor }]}
              />
            );
          }}
        </GridLayout>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
  },

  gridLayout: {
    height: isIphoneX ? 110 : cy(80),
    paddingBottom: isIphoneX ? 20 : 0,
  },

  btn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  label: {
    marginTop: cy(6),
    fontSize: Math.max(10, cx(10)),
    color: '#fff',
  },

  icon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: cx(40),
    height: cx(40),
    borderRadius: cx(20),
  },
});

export default connect(({ dpState }) => ({
  dpState,
  power: dpState[powerCode],
  anion: dpState[anionCode],
  childLock: dpState[childLockCode],
  light: dpState[lightCode],
  uv: dpState[uvCode],
  wet: dpState[wetCode],
  filterReset: dpState[filterResetCode],
  countdownSet: dpState[countdownSetCode],
}))(HomeBottomView);
