import { TYSdk, Utils } from 'tuya-panel-kit';
import _ from 'lodash';
import dpCodes from 'config/default/dpCodes';
import Strings from 'i18n/index';
import icons from 'icons/index';

const {
  pm25SetCode,
  eco2SetCode,
  temSetCode,
  humSetCode,
  tvocSetCode,
  pm10SetCode,
  hochSetCode,

  countdownLeftCode,
  countdownSetCode,

  supplyAirVolCode,
  supplyTempCode,
  supplyFanSpeedCode,

  exhaustTempCode,
  exhaustAirVolCode,
  exhaustFanSpeedCode,
  modeCode,
  loopModeCode,
} = dpCodes;

const paramCodes = [
  pm25SetCode,
  eco2SetCode,
  temSetCode,
  humSetCode,
  tvocSetCode,
  pm10SetCode,
  hochSetCode,
];

export enum ControllBarTab {
  Home,
  Data,
  Setting,
}

export const isSupportDp = (code: string): boolean => {
  return !!TYSdk.device.getDpSchema(code);
};

/**
 * 是否支持参数配置
 */
export const isSupportParam = () => {
  return paramCodes.some(code => isSupportDp(code));
};

/**
 * 是否支持倒计时
 */
export const isSupportCountdown = () => {
  return isSupportDp(countdownSetCode) || isSupportDp(countdownLeftCode);
};

/**
 *
 * @param value 剩余倒计时
 */
export const formatCoundown = (value: number) => {
  const hour = Math.floor(value / 60);
  const minute = value % 60;
  if (hour > 0) {
    return Strings.formatValue(
      'countdownHour',
      hour < 10 ? `0${hour}` : hour,
      minute < 10 ? `0${minute}` : minute
    );
  }
  return Strings.formatValue('countdownMinute', minute < 10 ? `0${minute}` : minute);
};

/**
 * 是否支持排风
 */
export const isSupportExhaust = () => {
  return (
    isSupportDp(exhaustAirVolCode) ||
    isSupportDp(exhaustFanSpeedCode) ||
    isSupportDp(exhaustTempCode)
  );
};
/**
 * 格式化显示排风
 */
export const formatExhaust = (speed: string, air: number, temp: number) => {
  return Strings.formatValue(
    'exhaustValue',
    Strings.getDpLang(exhaustFanSpeedCode, speed),
    temp,
    air
  );
};

/**
 * 是否支持送风
 */
export const isSupportSupply = () => {
  return (
    isSupportDp(supplyAirVolCode) || isSupportDp(supplyFanSpeedCode) || isSupportDp(supplyTempCode)
  );
};

/**
 * 格式化显示送风
 */
export const formatSupply = (speed: string, air: number, temp: number) => {
  return Strings.formatValue(
    'supplyValue',
    Strings.getDpLang(supplyFanSpeedCode, speed),
    temp,
    air
  );
};

const iconsMap = {
  [modeCode]: {
    auto: icons.auto,
    sleep: icons.sleep,
    manual: icons.hand,
    custom: icons.custom,
  },
  [loopModeCode]: {
    auto: icons.auto,
    indoor_loop: icons.loop,
    outdoor_loop: icons.out,
  },
};

/**
 * ui 配置
 * @param code
 */
export function fetchUIData(code: string) {
  const schema = TYSdk.device.getDpSchema(code);
  const res = (schema.range || []).map((d: string) => {
    return {
      value: d,
      label: Strings.getDpLang(code, d),
      icon: iconsMap[code] ? iconsMap[code][d] || icons.custom : icons.custom,
    };
  });
  return res;
}

let devInfo: any;

export const setDevInfo = (d: any) => {
  devInfo = d;
};

/**
 * 获取自定义dp
 */
export function fetchCustomDps() {
  const codes = Object.values(dpCodes);
  const allCodes = Object.keys(devInfo.schema);

  return allCodes.filter(code => !codes.includes(code));
}

export const getFaultStrings = (faultCode: string, faultValue: number, onlyPrior = true) => {
  if (!faultValue) return '';
  const { label = '' } = TYSdk.device.getDpSchema(faultCode);
  const labels: string[] = [];
  for (let i = 0; i < label.length; i++) {
    const value = label[i];
    const isExist = Utils.NumberUtils.getBitValue(faultValue, i);
    if (isExist) {
      labels.push(Strings.getDpLang(faultCode, value));
      if (onlyPrior) break;
    }
  }
  return onlyPrior ? labels[0] : labels.join(', ');
};

export default {};
