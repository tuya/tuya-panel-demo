/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable prettier/prettier */
/* eslint-disable import/prefer-default-export */
import { Utils, TYSdk } from 'tuya-panel-kit';
import _ from 'lodash';
import Color from 'color';
import { HomeTab, WorkMode } from '@types';
import DpCodes from '@config/dpCodes';
import { workModeMappingHomeTab } from '@config/default';
import Strings from '@i18n';

const { device: TYDevice } = TYSdk;
const {
  CoreUtils,
  NumberUtils: { numToHexString },
  ColorUtils: { color },
  TimeUtils: { parseHour12, parseTimer, stringToSecond },
} = Utils;

const { colourCode, brightCode, temperatureCode } = DpCodes;

let is24H = false;
TYSdk.mobile.is24Hour().then((r: boolean) => {
  is24H = r;
});
export const is24Hour = () => is24H;

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Record<string, any> ? DeepPartial<T[K]> : T[K];
};

export function nToHS(value = 0, num = 2) {
  return numToHexString(value || 0, num);
}

export function avgSplit(str = '', num = 1) {
  const reg = new RegExp(`.{1,${num}}`, 'g');
  return str.match(reg) || [];
}

export function sToN(str = '', base = 16) {
  return parseInt(str, base) || 0;
}

/** hex 转 hsv */
export function hex2hsv(hex: string) {
  return color.hex2hsv(hex).map((v, i) => (i > 0 ? Math.round(v * 10) : Math.round(v)));
}

/** hsv 转 hex */
export function hsv2hex(hue = 0, saturation = 0, value = 1000) {
  return color.hsv2hex(hue, saturation / 10, value / 10);
}

// FIXME:
export function hsv2rgba(hue = 0, saturation = 0, bright = 1000) {
  const c = color.hsb2hex(hue, Math.round(saturation / 10), 100);
  return new Color(c).alpha(bright2Opacity(bright)).rgbString();
}

// FIXME:
export function brightKelvin2rgba(bright = 0, kelvin = 0) {
  const c = color.brightKelvin2rgb(1000, kelvin);
  return new Color(c).alpha(bright2Opacity(bright)).rgbString();
}

export function colorDataToRgba(colorData: CommonColorData): string {
  const { isColor, hue, saturation, value, brightness, temperature } = colorData;
  return isColor ? hsv2rgba(hue, saturation, value) : brightKelvin2rgba(brightness, temperature);
}

/** 转化为number */
export function toN(n: any) {
  return +n || 0;
}

/** JSON浅比较，目前层级只适配了一级，ColourData[] 适用 */
export function jsonShallowEqual(arr1: any[], arr2: any[]) {
  return (
    arr1 === arr2 ||
    (arr1.length === arr2.length &&
      arr1.every(item1 => {
        const keys1 = Object.keys(item1);
        return arr2.some(item2 => {
          const keys2 = Object.keys(item2);
          return keys1.length === keys2.length && keys1.every(key => item1[key] === item2[key]);
        });
      }))
  );
}

export function objectShallowEqual(obj1: any, obj2: any, keys?: string[]): boolean {
  if (obj1 === obj2) return true;
  const keys1 = Object.keys(obj1).filter(key => (keys ? keys.includes(key) : true));
  const keys2 = Object.keys(obj2).filter(key => (keys ? keys.includes(key) : true));
  return keys1.length === keys2.length && keys1.every(key => obj1[key] === obj2[key]);
}

// TODO: 返回值优化，始终返回 string
export function* formatterTransform(value: string) {
  let start = 0;
  let result: number | string = '';
  let length;
  while (true) {
    // @ts-ignore wtf
    length = yield result;
    const newStart: number = length > 0 ? start + length : value.length + (length || 0);
    result = length > 0 ? sToN(value.slice(start, newStart)) : value.slice(start, newStart);
    if (newStart >= value.length) break;
    start = newStart;
  }
  return result;
}

export function checkDp() {
  const isColorfulExist = !!TYDevice.checkDpExist(colourCode);
  const isWhiteExist = !!TYDevice.checkDpExist(brightCode);
  const isTempExist = !!TYDevice.checkDpExist(temperatureCode);
  return { isColorfulExist, isWhiteExist, isTempExist };
}

/** 校正workMode（上报的workMode可能不支持，比如三路上报了白光） */
export function getCorrectWorkMode(workMode: WorkMode) {
  if ([WorkMode.colour, WorkMode.white].includes(workMode)) {
    const { isColorfulExist, isWhiteExist } = checkDp();
    if (workMode === WorkMode.colour && !isColorfulExist) return WorkMode.white;
    if (workMode === WorkMode.white && !isWhiteExist) return WorkMode.colour;
  }
  return workMode;
}

/** 根据workMode获取barMode */
export function getHomeTabFromWorkMode(workMode: WorkMode) {
  return workModeMappingHomeTab[workMode];
}

export function checkArray(data: any) {
  return !!data && Array.isArray(data) && data.length > 0;
}

export function bright2Opacity(
  brightness: number,
  option: { min: number; max: number } = { min: 0.2, max: 1 }
) {
  const { min = 0.1, max = 1 } = option;
  return Math.round((min + ((brightness - 10) / (1000 - 10)) * (max - min)) * 100) / 100;
}

// FIXME: 优化
export function getStops(colors: string[]) {
  if (colors.length === 1) {
    colors = colors.concat(colors);
  }
  const result: any = {};
  const length = colors.length - 1;
  colors.forEach((item, index) => {
    const percent = Math.floor((index / length) * 100);
    result[`${percent}%`] = item;
  });
  return result;
}

export function sort(arr: number[]) {
  return arr.sort((a, b) => a - b);
}

/** 获取最新的预览颜色数据 */
export function getPreviewColorDatas(
  circles: CommonColorData[] = [],
  lightLength: number,
  convertRgba = false
) {
  const ratio = Math.max(1, Math.floor(lightLength / circles.length));
  const frontPart = circles.reduce((acc, cur) => acc.concat(Array(ratio).fill(cur)), []);
  const endPart = frontPart.slice(0, Math.max(0, lightLength - circles.length * ratio));
  const previewCircles = [...frontPart, ...endPart].slice(0, lightLength);
  return convertRgba ? previewCircles.map(colorDataToRgba) : previewCircles;
}

export const getCircleColor = (colorData: any) => {
  let c = 'transparent';
  if (colorData !== 'plus' && colorData !== 'delete') {
    const { isColor, hue, saturation, value, brightness, temperature = 0 } = colorData;
    c = isColor ? hsv2rgba(hue, saturation, value) : brightKelvin2rgba(brightness, temperature);
  }
  return c;
};

export function parseJSON(str: string) {
  let rst;
  if (str && _.isString(str)) {
    // 当JSON字符串解析
    try {
      rst = JSON.parse(str);
    } catch (e) {
      // 出错，用eval继续解析JSON字符串
      try {
        // eslint-disable-next-line
        rst = eval(`(${str})`);
      } catch (e2) {
        // 当成普通字符串
        rst = str;
      }
    }
  } else {
    rst = typeof str === 'undefined' ? {} : str;
  }

  return rst;
}

export function repeatArrtoStr(source: number[]) {
  if (!source) return '';
  const days: string[] = [];
  let repeat = '';
  let workDay = true;
  let weekend = true;
  source.forEach((item, index) => {
    if (index > 0 && index < 6) {
      if (item === 0) {
        workDay = false;
      }
    }
    if (index === 0 || index === 6) {
      if (item === 0) {
        weekend = false;
      }
    }
    if (item === 1) {
      days.push(Strings.getLang(`week${index}`));
    }
  });
  if (workDay && weekend) {
    repeat = Strings.getLang('everyday');
  } else if (workDay && days.length === 5) {
    return Strings.getLang('workday');
  } else if (weekend && days.length === 2) {
    return Strings.getLang('weekend');
  } else if (days.length === 0) {
    repeat = Strings.getLang('once');
  } else {
    repeat = days.join(' ');
  }
  return repeat;
}

export const customParseHour12 = (second: number) => {
  const t = second % 86400;
  const originHour = parseInt(t / 3600, 10);
  const m = parseInt(t / 60 - originHour * 60, 10);
  let h = originHour % 12;
  if (h === 0) {
    h = 12;
  }
  return [
    `${
      originHour >= 12 ? Strings.getLang('timing_AM') : Strings.getLang('timing_PM')
    } ${CoreUtils.toFixed(h, 2)}`,
    `${CoreUtils.toFixed(m, 2)}`,
  ].join(':');
};

export const calLastTimePoint = (hour: number, minute: number, last: number, is24Hour: boolean) => {
  if (last === 0) return '';
  let endTimeSecond = 0;
  let lastTimePointText = '';
  const seconds = stringToSecond(`${hour}:${minute}:00`);

  endTimeSecond = seconds + last * 5 * 60;
  lastTimePointText = is24Hour ? parseTimer(endTimeSecond) : customParseHour12(endTimeSecond);

  return lastTimePointText;
};

export const calSleepWakeupDelayTimePoint = (
  mode: string,
  hour: number,
  minute: number,
  delay: number,
  last: number,
  is24Hour: boolean
) => {
  let startTimeSecond = 0;
  let endTimeSecond = 0;
  let delayTimePointText = '';

  // if (mode === 'wakeup') {
  //   const seconds = stringToSecond(`${hour}:${minute}:00`);
  //   const newSeconds = seconds - delay * 5 * 60;
  //   startTimeSecond = newSeconds < 0 ? newSeconds + 86400 : newSeconds;
  //   delayTimePointText = is24Hour
  //     ? parseTimer(startTimeSecond)
  //     : customParseHour12(startTimeSecond);
  // } else {
  //   startTimeSecond = stringToSecond(`${hour}:${minute}:00`);
  //   endTimeSecond = startTimeSecond + delay * 5 * 60;
  //   delayTimePointText = is24Hour ? parseTimer(endTimeSecond) : customParseHour12(endTimeSecond);
  // }
  startTimeSecond = stringToSecond(`${hour}:${minute}:00`);
  endTimeSecond = startTimeSecond + delay * 5 * 60;
  delayTimePointText = is24Hour ? parseTimer(endTimeSecond) : customParseHour12(endTimeSecond);

  const label = Strings.getLang(`${mode}_delay`);
  let lastStr = '';
  if (typeof last !== 'undefined' && last > 0) {
    lastStr = calLastTimePoint(hour, minute, delay + last, !is12Hour);
  }

  if (lastStr) {
    return `${label}: ${delayTimePointText} | ${Strings.getLang('lastTime')}: ${lastStr}`;
  }
  return `${label}: ${delayTimePointText}`;
};

export const parseHour12Data = (second: number) => {
  const t = second % 86400;
  const originHour = parseInt(`${t / 3600}`, 10);
  const m = parseInt(`${t / 60 - originHour * 60}`, 10);
  let h = originHour % 12;
  if (h === 0) {
    h = 12;
  }
  return {
    timeStr: `${CoreUtils.toFixed(h, 2)}:${CoreUtils.toFixed(m, 2)}`,
    isPM: originHour >= 12,
  };
};

export function subtract(minuend: any, ...args: any[]) {
  return args.reduce((acc, cur) => _.subtract(acc, cur), minuend);
}

export const formatRangeTime = (startTime: number, endTime: number, unit = 'minute') => {
  if (unit === 'minute') {
    // eslint-disable-next-line no-param-reassign
    startTime *= 60;
    // eslint-disable-next-line no-param-reassign
    endTime *= 60;
  }
  const isEqual = startTime === endTime;
  if (is24Hour()) {
    return isEqual
      ? `${parseTimer(startTime)}`
      : `${parseTimer(startTime)} - ${parseTimer(endTime)}`;
  }
  return isEqual
    ? `${customParseHour12(startTime)}`
    : `${customParseHour12(startTime)} - ${customParseHour12(endTime)}`;
};
