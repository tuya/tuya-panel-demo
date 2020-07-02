import React, { Component } from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import gateway from 'gateway';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Utils, TYSdk, Popup, Button } from 'tuya-panel-kit';
import TimeNumCountdown from '../../components/TimeNumCountdown';
import Strings from '../../i18n';
import icons from 'icons/index';
import { getDpCodesByType, isSupportFun, isSupportTimer } from '../../utils';

const { isIphoneX, convertX: cx } = Utils.RatioUtils;
const { withTheme } = Utils.ThemeUtils;

const TYDevice = TYSdk.device;

interface IProps {
  controllType: number;
  dpState: any;
  dimmerName: string;
  theme: any;
  navigator: any;
  devInfo: any;
}

interface IState {
  power: boolean;
  countdown: number;
}

class MyControllerBar extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = this.initData(this.props);
  }

  componentWillReceiveProps(nextProps: IProps) {
    this.setState(this.initData(nextProps));
  }

  getData() {
    const { controllType, devInfo, theme } = this.props;
    const { fontColor } = theme.standard;
    const commonProps = {
      activeOpacity: 0.8,
      textStyle: { color: fontColor },
      iconColor: fontColor,
      iconSize: cx(24),
    };

    const data: any[] = [
      {
        key: 'power',
        text: Strings.getLang('power_label'),
        iconPath: icons.power,
        onPress: this.handlePower,
      },
    ];
    if (isSupportTimer()) {
      data.push({
        key: 'schedule',
        text: Strings.getLang('schedule_label'),
        iconPath: icons.schedule,
        onPress: this.handleSchedule,
      });
    }

    const { countdownCode, ledTypeCode, minBrightCode, maxBrightCode } = getDpCodesByType(
      controllType,
      devInfo.schema
    );

    if (isSupportFun(countdownCode)) {
      data.push({
        key: 'timer',
        text: Strings.getLang('timer_label'),
        iconPath: icons.timer,
        onPress: this.handleTimer,
      });
    }

    if (isSupportFun(ledTypeCode) || isSupportFun(minBrightCode) || isSupportFun(maxBrightCode)) {
      data.push({
        key: 'setting',
        text: Strings.getLang('setting_label'),
        iconPath: icons.setting,
        disabled: !this.state.power,
        onPress: this.handleNavToSetting,
      });
    }

    return data.map(d => ({
      ...commonProps,
      ...d,
    }));
  }

  initData(props: IProps) {
    const { controllType, dpState, devInfo } = props;
    const { powerCode, countdownCode } = getDpCodesByType(controllType, devInfo.schema);

    return {
      power: dpState[powerCode],
      countdown: dpState[countdownCode] || 0,
    };
  }

  handlePower = () => {
    const { controllType, devInfo } = this.props;
    const { powerCode } = getDpCodesByType(controllType, devInfo.schema);
    const { power } = this.state;
    gateway.putDpData({
      [powerCode]: !power,
    });
  };

  handleSchedule = () => {
    const { controllType, navigator, devInfo } = this.props;
    const { powerCode } = getDpCodesByType(controllType, devInfo.schema);
    TYSdk.native.gotoDpAlarm({
      category: powerCode,
      repeat: 0,
      data: [
        {
          dpId: TYSdk.device.getDpIdByCode(powerCode),
          dpName: Strings.getDpLang(powerCode),
          selected: 0,
          rangeKeys: [true, false],
          rangeValues: [Strings.getDpLang(powerCode, true), Strings.getDpLang(powerCode, false)],
        },
      ],
    });
  };
  handleTimer = () => {
    const { controllType, dpState, devInfo } = this.props;
    const { countdownCode } = getDpCodesByType(controllType, devInfo.schema);
    Popup.countdown({
      title: Strings.getDpLang(countdownCode),
      switchValue: true,
      cancelText: Strings.getLang('cancel'),
      confirmText: Strings.getLang('confirm'),
      max: Math.floor(_.get(devInfo, `schema.${countdownCode}.max`, 86400) / 60),
      hourText: Strings.getLang('hour'),
      minuteText: Strings.getLang('minute'),
      value: Math.ceil(dpState[countdownCode] / 60),
      onConfirm: ({ value }: any) => {
        gateway.putDpData({ [countdownCode]: (value || 0) * 60 });
        Popup.close();
      },
    });
  };

  handleNavToSetting = () => {
    const { controllType, dimmerName, navigator } = this.props;
    navigator.push({ id: 'setting', title: dimmerName, controllType });
  };

  render() {
    const data = this.getData().filter(({ key }) => !!key);
    const { countdown, power } = this.state;
    return (
      <View
        style={[styles.container, { backgroundColor: this.props.theme.standard.buttonBarBgColor }]}
      >
        {data.map(item => {
          if (item.key === 'timer' && countdown > 0) {
            const label = Strings.getLang(power ? 'countdown_off_label' : 'countdown_on_label');
            return (
              <TouchableOpacity
                key={item.key}
                style={{ justifyContent: 'center' }}
                activeOpacity={0.7}
                disabled={!!item.disabled}
                onPress={item.onPress}
              >
                <TimeNumCountdown
                  textColor={item.iconColor}
                  label={label}
                  time={Math.ceil(countdown / 60)}
                  style={[styles.btn, { marginTop: cx(4) }]}
                />
              </TouchableOpacity>
            );
          }
          return (
            <View style={styles.btn} key={item.key}>
              <Button size={cx(40)} {...item} />
            </View>
          );
        })}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8,
    paddingBottom: isIphoneX ? 20 : 0,
  },
  btn: {
    width: cx(78),
  },
});

export default connect(({ dpState, cloudState, devInfo }: any, { controllType }: any) => ({
  dpState,
  devInfo,
  dimmerName:
    cloudState[`dimmerName${controllType}`] || Strings.formatValue('dimmer_name', controllType),
}))(withTheme(MyControllerBar));
