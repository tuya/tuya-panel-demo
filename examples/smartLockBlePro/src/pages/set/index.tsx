import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import _ from 'lodash';
import { Utils, TYFlatList, TYText, TYSdk, Popup, SwitchButton } from 'tuya-panel-kit';
import Strings from '@i18n';
import { useGetState } from '@hooks';
import { dpCodes } from '@config';
import { reConnectBle } from '@utils';
import { timeText, hourFormat, minuteFormat } from './utils';

const { convertX: cx } = Utils.RatioUtils;
const {
  unlockSwitch,
  automaticLock,
  autoLockTime,
  verifyLockSwitch,
  armingSwitch,
  specialFunction,
  specialControl,
  doorbellSong,
  beepVolume,
  doNotDisturb,
  muteModePeriod,
  language,
} = dpCodes;

const SettingView = () => {
  const { devInfo, existDps, dpState, themeColor } = useGetState();
  const { deviceOnline } = devInfo;
  const {
    dpUnlockSwitch,
    dpAutomaticLock,
    dpAutoLockTime,
    dpArmingSwitch,
    dpVerifyLockSwitch,
    dpSpecialFunction,
    dpDoNotDisturb,
    dpMuteModePeriod,
    dpSpecialControl,
    dpDoorbellSong,
    dpLanguage,
    dpBeepVolume,
  } = existDps;

  const changeList = (code: string, value: string | number) => {
    if (!deviceOnline) {
      return reConnectBle();
    }
    const { range } = TYSdk.device.getDpSchema(code);
    const _range = range || [];
    Popup.list({
      dataSource: _range.map(i => ({
        key: i,
        title: Strings.getDpLang(code, i),
        value: i,
      })),
      value,
      title: Strings.getDpLang(code),
      confirmText: Strings.getLang('confirm'),
      cancelText: Strings.getLang('cancel'),
      iconTintColor: themeColor,
      confirmTextStyle: { color: themeColor },
      onConfirm: val => {
        Popup.close();
        console.log('val', val);
        TYSdk.device.putDeviceData({ [code]: val.toString() });
      },
    });
  };

  const changeDp = (code: string, value: boolean) => {
    if (!deviceOnline) {
      return reConnectBle();
    }
    TYSdk.device.putDeviceData({
      [code]: value,
    });
  };

  const setAutomaticLockTime = () => {
    if (!deviceOnline) {
      return reConnectBle();
    }
    const { max, min, step } = TYSdk.device.getDpSchema(autoLockTime);
    Popup.countdown({
      min: min || 1,
      max: max || 1800,
      step,
      title: Strings.getDpLang('auto_lock_time'),
      confirmText: Strings.getLang('confirm'),
      cancelText: Strings.getLang('cancel'),
      value: dpState[autoLockTime] as number,
      hourText: Strings.getLang('set_min'),
      minuteText: Strings.getLang('set_sec'),
      confirmTextStyle: { color: themeColor },
      onConfirm: data => {
        TYSdk.device.putDeviceData({
          [autoLockTime]: data.value,
        });
        Popup.close();
      },
    });
  };

  const repeatEdit = () => {
    if (!deviceOnline) {
      return reConnectBle();
    }
    const _muteModePeriod = dpState[muteModePeriod] as string;

    Popup.timerPicker({
      title: Strings.getLang('set_timePeriodChoose'),
      cancelText: Strings.getLang('cancel'),
      confirmText: Strings.getLang('confirm'),
      startTime:
        _muteModePeriod === ''
          ? 0
          : parseInt((+`0x${_muteModePeriod.slice(0, 2)}`).toString(), 10) * 60 +
            parseInt((+`0x${_muteModePeriod.slice(2, 4)}`).toString(), 10),
      endTime:
        _muteModePeriod === ''
          ? 1439
          : parseInt((+`0x${_muteModePeriod.slice(4, 6)}`).toString(), 10) * 60 +
            parseInt((+`0x${_muteModePeriod.slice(6, 8)}`).toString(), 10),
      is12Hours: false,
      symbol: '~',
      confirmTextStyle: { color: themeColor },
      onConfirm: ({ startTime, endTime }) => {
        const startHour = hourFormat(startTime);
        const startMinute = minuteFormat(startTime);
        const endHour = hourFormat(endTime);
        const endMinute = minuteFormat(endTime);
        TYSdk.device.putDeviceData({
          [muteModePeriod]: startHour + startMinute + endHour + endMinute,
        });
        Popup.close();
      },
    });
  };

  const renderActionText = (text: string) => {
    return <TYText style={{ color: '#999' }}>{text}</TYText>;
  };

  const renderSwitchButton = (code: string) => {
    return (
      <SwitchButton
        value={dpState[code] as boolean}
        onValueChange={value => changeDp(code, value)}
        onTintColor={themeColor}
      />
    );
  };

  const renderData1 = () => {
    const data = [
      {
        key: unlockSwitch,
        show: dpUnlockSwitch,
        title: Strings.getDpLang(unlockSwitch),
        subTitle: Strings.getLang('set_unlockSwitchTip'),
        Action: () => (
          <SwitchButton
            value={dpState[unlockSwitch] !== 'single_unlock'}
            onValueChange={() => changeList(unlockSwitch, dpState[unlockSwitch] as string)}
            onTintColor={themeColor}
          />
        ),
      },
      {
        key: `${unlockSwitch}_select`,
        show: dpUnlockSwitch && dpState[unlockSwitch] !== 'single_unlock',
        title: Strings.getLang('set_selectUnlockSwitch'),
        Action: () => renderActionText(Strings.getDpLang(unlockSwitch, dpState[unlockSwitch])),
        onPress: () => changeList(unlockSwitch, dpState[unlockSwitch] as string),
        arrow: true,
      },
      {
        key: automaticLock,
        show: dpAutomaticLock,
        title: Strings.getDpLang(automaticLock),
        Action: () => renderSwitchButton(automaticLock),
      },
      {
        key: autoLockTime,
        show: dpAutomaticLock && dpState[automaticLock] && dpAutoLockTime,
        title: Strings.getDpLang(autoLockTime),
        Action: () => renderActionText(`${dpState[autoLockTime]}s`),
        onPress: () => setAutomaticLockTime(),
        arrow: true,
      },
      {
        key: verifyLockSwitch,
        show: dpVerifyLockSwitch,
        title: Strings.getDpLang(verifyLockSwitch),
        subTitle: Strings.getLang('set_switchVerifyLockTip'),
        Action: () => renderSwitchButton(verifyLockSwitch),
      },
      {
        key: armingSwitch,
        show: dpArmingSwitch,
        title: Strings.getDpLang(armingSwitch),
        subTitle: Strings.getLang('set_armingModeTip'),
        Action: () => renderSwitchButton(armingSwitch),
      },
    ].filter(_data => _data.show);
    return data;
  };

  const renderData2 = () => {
    const data = [
      {
        key: specialControl,
        show: dpSpecialControl,
        title: Strings.getDpLang(specialControl),
        Action: () => renderSwitchButton(specialControl),
      },
      {
        key: specialFunction,
        show: dpSpecialFunction,
        title: Strings.getDpLang(specialFunction),
        Action: () =>
          renderActionText(Strings.getDpLang(specialFunction, dpState[specialFunction])),
        onPress: () => changeList(specialFunction, dpState[specialFunction] as string),
        arrow: true,
      },
    ].filter(_data => _data.show);
    return data;
  };

  const renderData3 = () => {
    const data = [
      {
        key: doorbellSong,
        show: dpDoorbellSong,
        title: Strings.getDpLang('doorbell_song'),
        Action: () => renderActionText(Strings.getDpLang(doorbellSong, dpState[doorbellSong])),
        onPress: () => changeList(doorbellSong, dpState[doorbellSong] as string),
        arrow: true,
      },
      {
        key: beepVolume,
        show: dpBeepVolume,
        title: Strings.getDpLang(beepVolume),
        Action: () => renderActionText(Strings.getDpLang(beepVolume, dpState[beepVolume])),
        onPress: () => changeList(beepVolume, dpState[beepVolume] as string),
        arrow: true,
      },
    ].filter(_data => _data.show);
    return data;
  };

  const renderData4 = () => {
    const data = [
      {
        key: doNotDisturb,
        show: dpDoNotDisturb,
        title: Strings.getDpLang(doNotDisturb),
        subTitle: Strings.getLang('set_muteModeTip'),
        Action: () => renderSwitchButton(doNotDisturb),
      },
      {
        key: muteModePeriod,
        show: dpMuteModePeriod && (dpState[doNotDisturb] as boolean),
        title: Strings.getDpLang(muteModePeriod),
        Action: () => renderActionText(timeText(dpState[muteModePeriod] as string)),
        onPress: () => repeatEdit(),
        arrow: true,
      },
    ].filter(_data => _data.show);
    return data;
  };

  const renderData5 = () => {
    const data = [
      {
        key: language,
        show: dpLanguage,
        title: Strings.getDpLang('language'),
        Action: () => renderActionText(Strings.getDpLang(language, dpState[language])),
        onPress: () => changeList(language, dpState[language] as string),
        arrow: true,
      },
    ].filter(_data => _data.show);
    return data;
  };

  const dataList = () => [
    renderData1(),
    renderData2(),
    renderData3(),
    renderData4(),
    renderData5(),
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.wrap}>
          {dataList().map((_data, i) => (
            <View style={styles.content} key={`more_${i.toString()}`}>
              <TYFlatList data={_data} />
            </View>
          ))}
        </View>
        <View style={styles.empty} />
      </ScrollView>
    </View>
  );
};
export default SettingView;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  wrap: {
    flex: 1,
  },
  content: {
    flex: 1,
    marginTop: cx(10),
  },
  empty: {
    backgroundColor: 'transparent',
    height: 56,
  },
});
