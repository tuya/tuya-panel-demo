/* eslint-disable no-case-declarations */
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { TYText, TYSdk } from 'tuya-panel-kit';
import { lightControl, getLightControArr } from './lightDataStore';
import { enterRnPage } from '../../../../config/click';
import Config from '../../../../config';
import Res from '../../../../res';
import Strings from '../../../../i18n';

const { cx, isIphoneX } = Config;
const TYDevice = TYSdk.device;
const TYEvent = TYSdk.event;
const TYMobile = TYSdk.mobile;

const is24Hour = TYMobile.is24Hour();
let is12Hour = true;
is24Hour.then(d => {
  is12Hour = !d;
});

class LightControl extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      controlArr: [],
    };
  }
  componentDidMount() {
    const { lightData, needFilterDp } = lightControl;
    const newControlArr = getLightControArr(lightData, needFilterDp);
    this.setState({
      controlArr: newControlArr,
    });
    TYEvent.on('deviceDataChange', this.dpChange);
  }
  componentWillUnmount() {
    TYEvent.off('deviceDataChange', this.dpChange);
  }
  onPressBar = item => {
    switch (item.key) {
      case 'floodlight_switch':
        TYDevice.putDeviceData({
          [item.key]: !item.dpValue,
        });
        break;
      case 'floodlight_mode':
        const currentMode = item.dpValue;
        const sendMode = currentMode === '0' ? '1' : '0';
        TYDevice.putDeviceData({
          [item.key]: sendMode,
        });
        break;
      case 'floodlight_schedule':
        this.jumpToTimer();
        break;
      default:
        return false;
    }
  };
  jumpToTimer = () => {
    const paramData = [
      {
        dpId: TYDevice.getDpIdByCode('floodlight_switch'),
        dpName: Strings.getDpLang('floodlight_switch'),
        selected: 0,
        rangeKeys: [true, false],
        rangeValues: [
          { dpValue: Strings.getLang('floodlight_switch_open') },
          { dpValue: Strings.getLang('floodlight_switch_close') },
        ],
      },
    ];
    const timerConfig = {
      addTimerRouter: 'addTimer',
      category: 'floodLight',
      repeat: 0,
      data: paramData,
      isTimeZone: true,
      timeZoneType: 'timerPicker',
    };
    const sendData = {
      timerConfig,
      is12Hours: is12Hour,
      // 表示定时是需要直接返回预览界面的
      backLivePlay: true,
    };
    enterRnPage('timer', sendData);
  };
  dpChange = data => {
    const changedp = data.payload;
    const { controlArr } = this.state;
    controlArr.forEach(item => {
      if (changedp[item.key] !== undefined) {
        this.changeControlArr(changedp[item.key], item.key);
      }
    });
  };
  changeControlArr = (value, dpCode) => {
    const oldControlArr = this.state.controlArr;
    oldControlArr.forEach((item, index) => {
      if (item.key === dpCode) {
        if (dpCode === 'floodlight_switch') {
          oldControlArr[index].iconImage = value
            ? Res.floodLight.lightSwitchOn
            : Res.floodLight.lightSwitchOff;
        } else if (dpCode === 'floodlight_mode') {
          oldControlArr[index].iconImage =
            value === '0' ? Res.floodLight.lightWhiteMode : Res.floodLight.lightColorMode;
        }
      }
      if (item.key === dpCode) {
        oldControlArr[index].dpValue = value;
      }
    });
    this.setState({
      controlArr: oldControlArr,
    });
  };
  render() {
    const { controlArr } = this.state;
    return (
      <View style={styles.lightControlPage}>
        {controlArr.map(item => (
          <TouchableOpacity
            style={styles.switchItemBox}
            activeOpacity={0.7}
            key={item.key}
            onPress={() => this.onPressBar(item)}
          >
            <View style={styles.itemBtnBox}>
              <Image source={item.iconImage} style={styles.itemImg} />
              <TYText numberOfLines={1} style={styles.itemText}>
                {item.imgageTitle}
              </TYText>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  }
}
const styles = StyleSheet.create({
  lightControlPage: {
    paddingBottom: isIphoneX ? 20 : 0,
    paddingHorizontal: cx(15),
    flexDirection: 'row',
    marginVertical: cx(15),
  },
  switchItemBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemBtnBox: {
    justifyContent: 'center',
    alignItems: 'center',
    width: cx(52),
  },
  itemImg: {
    width: '100%',
    resizeMode: 'contain',
  },
  itemText: {
    marginTop: cx(5),
  },
});

export default LightControl;
