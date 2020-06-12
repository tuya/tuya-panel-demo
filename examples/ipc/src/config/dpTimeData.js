/* eslint-disable max-len */
/* eslint-disable import/prefer-default-export */
import { TYSdk } from 'tuya-panel-kit';
import _ from 'lodash';
import CameraManager from '../components/nativeComponents/cameraManager';
import { enterRnPage } from '../config/click';
import Strings from '../i18n';
import { store } from '../main';

const TYMobile = TYSdk.mobile;
const TYDevice = TYSdk.device;

const pirDpTimeData = [
  { value: '0', name: Strings.getLang('dp_pir_switch_close') },
  { value: '1', name: Strings.getLang('dp_pir_switch_low') },
  { value: '2', name: Strings.getLang('dp_pir_switch_middle') },
  { value: '3', name: Strings.getLang('dp_pir_switch_high') },
  { value: '5', name: Strings.getLang('dp_pir_switch_high') },
];
export const localTimeExample = () => {
  TYMobile.is24Hour(false).then(d => {
    const is12Hour = !d;
    // 对Value型的dp点通过schema 获取它的最大最小值以及step;
    const state = store.getState();
    const { schema } = state.devInfo;
    const cruiseStayTimeSchema = schema.sensor_humidity;
    const pirSchema = schema.pir_switch;
    const { range: pirRange } = pirSchema;
    const pirSelectValue = _.remove(pirDpTimeData, item => {
      return pirRange.indexOf(item.value) !== -1;
    });
    const {
      type: cruiseStayType,
      min: cruiseStayMin,
      max: cruiseStayMax,
      unit: cruiseStayUnit,
      step: cruiseStayStep,
    } = cruiseStayTimeSchema;
    if (cruiseStayType !== 'value') {
      CameraManager.showTip(Strings.getLang('ipc_dptime_init_dptype_judge'));
      return false;
    }
    const sendNavigatorData = {
      dpTimeCode: 'cruise_schedule',
      // isTimeZone true 与 timeZoneType: 'timerPicker'表示分段定时
      // isTimeZone: true,
      // timeZoneType: 'timerPicker',
      is12Hours: is12Hour,
      // 需要控制展示下发的dp点
      dpsArrData: [
        {
          dpName: Strings.getDpLang('lightSwitch'),
          dp: 'lightSwitch',
          type: 'bool',
          selected: 1,
          selectedValue: [
            {
              name: Strings.getLang('dp_lightSwitch_true'),
              value: true,
            },
            {
              name: Strings.getLang('dp_lightSwitch_false'),
              value: false,
            },
          ],
        },
        {
          dpName: Strings.getDpLang('lightSwitch'),
          dp: 'cruise_stay_time',
          type: 'value',
          defaultValue: cruiseStayMin || 10,
          defaultLabel: cruiseStayMin || 10,
          min: cruiseStayMin || 10,
          max: cruiseStayMax || 100,
          step: cruiseStayStep || 1,
          unit: cruiseStayUnit || '',
        },
        {
          dpName: Strings.getDpLang('pir'),
          dp: 'pir1',
          type: 'enum',
          selected: 0,
          selectedValue: pirSelectValue,
        },
      ],
    };
    enterRnPage('dpTimer', sendNavigatorData);
  });
};

// 极简巡航本地定时的数据配置
export const cruiseScheduleTime = () => {
  TYMobile.is24Hour().then(d => {
    const is12Hour = !d;
    const state = store.getState();
    const { schema } = state.devInfo;
    // 对Value型的dp点通过schema 获取它的最大最小值以及step;
    const cruiseStayTimeSchema = schema.cruise_stay_time;
    const {
      type: cruiseStayType,
      min: cruiseStayMin,
      max: cruiseStayMax,
      step: cruiseStayStep,
    } = cruiseStayTimeSchema;

    if (cruiseStayType !== 'value') {
      CameraManager.showTip(Strings.getLang('ipc_dptime_init_dptype_judge'));
      return false;
    }
    const sendNavigatorData = {
      dpTimeCode: 'cruise_schedule',
      // isTimeZone true 与 timeZoneType: 'timerPicker'表示分段定时
      // isTimeZone: true,
      // timeZoneType: 'timerPicker',
      is12Hours: is12Hour,
      // 需要控制展示下发的dp点
      dpsArrData: [
        {
          dpName: Strings.getDpLang('cruise_stay_time'),
          dpId: TYDevice.getDpIdByCode('cruise_stay_time'),
          type: 'value',
          defaultValue: cruiseStayMin || 10,
          defaultLabel: cruiseStayMin || 10,
          min: cruiseStayMin || 10,
          max: cruiseStayMax || 100,
          step: cruiseStayStep || 1,
          unit: Strings.getLang('ipc_cruise_stay_time_schedule_unit'),
        },
      ],
    };
    enterRnPage('dpTimer', sendNavigatorData);
  });
};

// 宠物喂食机本地定时配置
export const feedNumScheduleTime = () => {
  TYMobile.is24Hour().then(d => {
    const is12Hour = !d;
    // 对Value型的dp点通过schema 获取它的最大最小值以及step;
    const state = store.getState();
    const { schema } = state.devInfo;
    const feedNumTimeSchema = schema.feed_num;
    const { type: feedNumTimeType, max: feedNumTimeMax, step: feedNumTimeStep } = feedNumTimeSchema;
    const feedNumTimeMin = 1;

    if (feedNumTimeType !== 'value') {
      CameraManager.showTip(Strings.getLang('ipc_dptime_init_dptype_judge'));
      return false;
    }
    const sendNavigatorData = {
      dpTimeCode: 'ipc_feed_plan',
      // isTimeZone true 与 timeZoneType: 'timerPicker'表示分段定时
      // isTimeZone: true,
      // timeZoneType: 'timerPicker',
      is12Hours: is12Hour,
      backLivePlay: true,
      // 需要控制展示下发的dp点
      dpsArrData: [
        {
          dpName: Strings.getLang('ipc_pet_feed'),
          dpId: TYDevice.getDpIdByCode('feed_num'),
          type: 'value',
          defaultValue: feedNumTimeMin,
          defaultLabel: feedNumTimeMin,
          min: feedNumTimeMin,
          max: feedNumTimeMax || 20,
          step: feedNumTimeStep || 1,
          unit: Strings.getLang('ipc_pet_num'),
        },
      ],
    };
    enterRnPage('dpTimer', sendNavigatorData);
  });
};
