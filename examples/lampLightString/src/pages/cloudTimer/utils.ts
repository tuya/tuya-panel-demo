/* eslint-disable import/no-unresolved */
import DpCodes from '@config/dpCodes';
import { SupportUtils, WORK_MODE, repeatArrStr } from '@tuya/tuya-panel-lamp-sdk/lib/utils';
import { Dialog, TYSdk } from 'tuya-panel-kit';
import Strings from '@i18n';
import ColourFormatter from '@tuya/tuya-panel-lamp-sdk/lib/formatter/colourData';

const { colourCode, powerCode, temperatureCode, brightCode, workModeCode } = DpCodes;

const colourFormater = new ColourFormatter();

export interface TimerData {
  key: string;
  name?: string;
  power: boolean;
  weeks: number[];
  startTime: number;
  endTime: number;
  type: string;
  index: number;
  isCustomColor?: boolean;
  hour?: number;
  minute?: number;
  delay?: number;
  last?: number;
  id?: number;
  openTime?: number;
  closeTime?: number;
  dpPowerValue?: number;
}
export interface TimerConfig {
  id: string;
  index: number;
  hour: number;
  minute: number;
  dpPowerValue: boolean;
  workMode: string;
  deviceMode: string;
  weeks: number[];
  hue: number;
  saturation: number;
  value: number;
  brightness: number;
  temperature: number;
}
const handleModes = (
  deviceMode: string,
  dpPowerValue: boolean,
  workMode: string,
  brightness: number,
  hue: number,
  saturation: number,
  value: number,
  temperature: number
) => {
  const dps: any = {};
  const powerDpId = TYSdk.device.getDpIdByCode(powerCode);
  const workModeDpId = TYSdk.device.getDpIdByCode(workModeCode);
  const brightDpId = TYSdk.device.getDpIdByCode(brightCode);
  const temperatureDpId = TYSdk.device.getDpIdByCode(temperatureCode);
  const colourDpId = TYSdk.device.getDpIdByCode(colourCode);
  if (deviceMode === DEVICE_MODE.MANUAL) {
    // 手动模式不需要配置deviceMode
    dps[powerDpId] = dpPowerValue;
    if (dpPowerValue) {
      dps[workModeDpId] = workMode;
      if (workMode === 'white' && SupportUtils.isSupportWhite()) {
        dps[brightDpId] = brightness;
        if (SupportUtils.isSupportTemp()) {
          dps[temperatureDpId] = temperature;
        }
      } else if (SupportUtils.isSupportColour()) {
        dps[colourDpId] = colourFormater.format({ hue, saturation, value });
      }
    }
  }
  return dps;
};

export const handleParams = (
  CloudTimerCategory: string,
  loopStr: string,
  hour: number,
  minute: number,
  deviceMode: string,
  dpPowerValue: boolean,
  workMode: string,
  brightness: number,
  hue: number,
  saturation: number,
  value: number,
  temperature: number
) => {
  let temp;
  if (minute < 10) {
    temp = `${hour}:${0}${minute}`;
  } else {
    temp = `${hour}:${minute}`;
  }
  const params = {
    category: CloudTimerCategory,
    loops: loopStr,
    instruct: [
      {
        dps: handleModes(
          deviceMode,
          dpPowerValue,
          workMode,
          brightness,
          hue,
          saturation,
          value,
          temperature
        ),
        time: temp,
      },
    ],
    aliasName: '',
    isAppPush: false,
    options: {
      checkConflict: 1,
    },
  };
  return params;
};

export const handleTimeListLength = (isAdd: boolean, timerList: TimerData[]) => {
  if (isAdd && timerList.length >= 30) {
    Dialog.alert({
      title: Strings.getLang('maxCloudTimerNumber'),
      confirmText: Strings.getLang('confirm'),
    });
    TYSdk.mobile.hideLoading();
    return false;
  }
  return true;
};

export const handleBasicData = () => {
  const stateObj: any = {
    workMode: SupportUtils.isSupportColour() ? WORK_MODE.COLOUR : WORK_MODE.WHITE,
    hue: 0,
    saturation: 1000,
    value: 1000,
    brightness: 1000,
    temperature: 500,
  };
  if (SupportUtils.isSupportWhite()) {
    stateObj.workMode = WORK_MODE.WHITE;
    stateObj.brightness = 1000;
    if (SupportUtils.isSupportTemp()) {
      stateObj.temperature = 500;
    }
  } else {
    stateObj.workMode = WORK_MODE.COLOUR;
    stateObj.hue = 0;
    stateObj.saturation = 1000;
    stateObj.value = 1000;
  }
  return stateObj;
};

export const handleExecuteCycleValue = (executeCycleValue: number, weeks: number[]) => {
  let value = '';
  if (executeCycleValue === 0) {
    value = repeatArrStr([0, 0, 0, 0, 0, 0, 0]);
  } else if (executeCycleValue === 1) {
    value = repeatArrStr([1, 1, 1, 1, 1, 1, 1]);
  } else {
    value = repeatArrStr(weeks);
  }
  return value;
};

export const weeksIsAllTheSameNumber = (weeks: number[], num: number) => {
  return weeks.every((item: number) => item === num);
};
