/* eslint-disable import/no-unresolved */
import React, { useEffect, FC } from 'react';
import { GlobalToast, Utils } from 'tuya-panel-kit';
import { CountdownSubPage } from '@tuya/tuya-panel-lamp-sdk';
import Strings from '@i18n';
import { StatusBar } from 'react-native';
import { useSelector, actions } from '@models';
import { dpCodes } from '@config';
import { countdownDo } from 'composeLayout';
import * as TaskManager from '@utils/taskManager';
import { lampApi } from '@tuya/tuya-panel-api';
import dragon from '@tuya/tuya-panel-dragon-sdk';
import useTheme from '@hooks/useTheme';
import CustomTopBar from '@components/CustomTopBar';
import { StackNavigationProp } from '@react-navigation/stack';
import { store } from '../../main';

const { saveCloudConfig } = lampApi.generalApi;
const { winWidth, convertX, isIphoneX } = Utils.RatioUtils;
const cx = (value: number) => {
  return Math.floor(convertX(value));
};
interface IProps {
  navigation: StackNavigationProp<any>;
}

const { powerCode, countdownCode } = dpCodes;

const Countdown: FC<IProps> = ({ navigation }) => {
  const {
    global: { isDefaultTheme, fontColor, themeColor },
  } = useTheme();

  const { power, countdown, totalCountDown } = useSelector(({ dpState, cloudState }: any) => ({
    power: dpState[powerCode],
    countdown: dpState[countdownCode],
    totalCountDown: cloudState.totalCountDown,
  }));

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
  }, []);

  const handleSave = (time: number) => {
    // 互斥校验
    const taskType = TaskManager.TaskType.COUNTDOWN;
    const [isCheck, checkData] = TaskManager.check(time, taskType, 'second');
    if (isCheck) {
      TaskManager.showTip(checkData);
      return;
    }
    dragon.putDpData(
      {
        [countdownCode]: time,
      },
      {
        checkCurrent: false,
      }
    );
    countdownDo(time);
    // 更新云端记录
    saveCloudConfig!('totalCountDown', time);
    store.dispatch(actions.common.updateCloud({ totalCountDown: time }));
    GlobalToast.show({
      text: Strings.getLang('countdown_set_success_tip'),
      onFinish: () => {
        GlobalToast.hide();
      },
    });
  };

  const handleClose = () => {
    dragon.putDpData(
      {
        [countdownCode]: 0,
      },
      {
        checkCurrent: false,
      }
    );
    countdownDo(0);
  };

  const params: any = {
    renderHeader: () => (
      <CustomTopBar
        title={Strings.getLang(`${power ? 'row_countdown_off' : 'row_countdown_on'}`)}
        backText={Strings.getLang('cancel')}
        onBack={() => navigation.goBack()}
      />
    ),
    background: isDefaultTheme ? 'rgba(255,255,255,0.07)' : '#fff',
    countdown,
    minuteLabel: Strings.getLang('countdown_minute'),
    secondLabel: Strings.getLang('countdown_second'),
    hourLabel: Strings.getLang('countdown_hour'),
    onSave: handleSave,
    onCountdownText: Strings.getLang('countdown_on_decs'),
    offCountdownText: Strings.getLang('countdown_off_decs'),
    confirmText: Strings.getLang('confirm'),
    confirmButtonStyle: {
      backgroundColor: themeColor,
      height: 48,
      width: winWidth - cx(32),
      paddingHorizontal: cx(16),
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: isIphoneX ? cx(40) : cx(16),
      marginHorizontal: cx(16),
    },
    confirmTextStyle: {
      color: '#fff',
      fontSize: 16,
    },
    cancelButtonStyle: {
      marginHorizontal: cx(16),
      height: 48,
      width: winWidth - cx(32),
      borderRadius: 24,
      backgroundColor: themeColor,
      marginBottom: isIphoneX ? cx(40) : cx(16),
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelText: Strings.getLang('cancel_countdown_label'),
    cancelTextStyle: {
      color: '#fff',
      fontSize: 16,
    },
    picker: {
      isShowSecond: true,
      unitTextStyle: { fontSize: 14, color: 'rgba(255,255,255,0.5)' },
      timeTextColor: fontColor,
      timeTextSize: 40,
      minuteLabel: Strings.getLang('countdown_minute'),
      secondLabel: Strings.getLang('countdown_second'),
      hourLabel: Strings.getLang('countdown_hour'),
    },
    clock: {
      totalCountDown,
      minuteLabel: Strings.getLang('countdown_minute'),
      secondLabel: Strings.getLang('countdown_second'),
      hourLabel: Strings.getLang('countdown_hour'),
      timeTextStyle: { fontSize: 40, color: fontColor },
      unitTextStyle: { fontSize: 14, opacity: 0.5 },
      subTitleStyle: { color: fontColor, fontSize: cx(10), opacity: 0.5 },
      lineColor: '#e3e3e3',
      activeColor: '#87cefa',
      innerBackgroundColor: isDefaultTheme ? 'transparent' : 'rgba(0,0,0,0.02)',
      isShowHour: true,
      size: 280,
      lineHeight: 5,
      lineWidth: 1,
      lineNum: 100,
      resetStyle: {},
      resetText: Strings.getLang('reset_countdown_label'),
      resetTextStyle: {
        marginTop: cx(17),
        color: isDefaultTheme ? '#999999' : 'rgba(0,0,0,0.45)',
      },
      onCancel: handleClose,
    },
  };
  return (
    <CountdownSubPage
      route={{
        params,
      }}
      navigation={navigation}
    />
  );
};
export default Countdown;
