/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable import/no-unresolved */
import { Utils, TYSdk } from 'tuya-panel-kit';
import { ColorUtils } from '@tuya/tuya-panel-lamp-sdk/lib/utils';
import _ from 'lodash';
import { useSelector } from '@models';
import base64 from 'base64-js';
import { UiDataType } from '@types';
import Strings from '../i18n';

const { color: Color } = Utils.ColorUtils;

const { winWidth, convertX: cx } = Utils.RatioUtils;

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Record<string, any> ? DeepPartial<T[K]> : T[K];
};

export const ControlTabs = {
  dimmer: 'dimmer',
  lights: 'light',
  scene: 'scene',
  music: 'music',
  countdown: 'countdown',
  powerResponse: 'powerResponse',
  timer: 'timer',
};

const {
  NumberUtils: { numToHexString },
  TimeUtils: { parseTimer },
  CoreUtils,
} = Utils;
let is12Hour = false;
TYSdk.mobile.is24Hour().then((d: boolean) => {
  is12Hour = !d;
});

export const customParseHour12 = (second: number) => {
  const t = second % 86400;
  const originHour = parseInt(`${t / 3600}`, 10);
  const m = parseInt(`${t / 60 - originHour * 60}`, 10);
  let h = originHour % 12;
  if (h === 0) {
    h = 12;
  }
  return [
    `${originHour >= 12 ? 'PM' : 'AM'} ${CoreUtils.toFixed(h, 2)}`,
    `${CoreUtils.toFixed(m, 2)}`,
  ].join(':');
};
export function sort(arr: number[]) {
  return arr.sort((a, b) => a - b);
}
export const getIconColor = (color: any) => {
  let colorStr = color;
  if (typeof color !== 'string' && color.length >= 1) {
    [colorStr] = color;
  }
  const [h, s, v] = Color.hex2hsv(colorStr);
  let fontColor = 'white';
  if (s < 30) {
    fontColor = 'black';
  }
  return fontColor;
};

export const getColorStrByHsvbt = ({
  hue,
  saturation,
  value,
  brightness,
  temperature,
}: {
  hue: number;
  saturation: number;
  value: number;
  brightness: number;
  temperature: number;
}) => {
  const isColor = brightness === 0;
  const colorStr = isColor
    ? ColorUtils.hsv2rgba(hue, saturation, value)
    : ColorUtils.brightKelvin2rgba(brightness, temperature);
  return colorStr;
};

export const checkDpSupport = (code: string, schema: any[]) => {
  return schema.some(item => item.code === code);
};

export const parseJSON = (str: string) => {
  let rst;
  if (str && {}.toString.call(str) === '[object String]') {
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
};

export const formatRangeTime = (startTime: number, endTime: number, unit = 'minute') => {
  if (unit === 'minute') {
    // eslint-disable-next-line no-param-reassign
    startTime *= 60;
    // eslint-disable-next-line no-param-reassign
    endTime *= 60;
  }
  return is12Hour
    ? `${customParseHour12(startTime)} - ${customParseHour12(endTime)}`
    : `${parseTimer(startTime)} - ${parseTimer(endTime)}`;
};

export const formatSingleTime = (time: number, unit = 'minute') => {
  if (unit === 'minute') {
    time *= 60;
  }
  return is12Hour ? `${customParseHour12(time)}` : `${parseTimer(time)}`;
};

/**
 * @desc 将16进制的hhsssvvv转换成10进制的hsv
 * 范围为h(0-360) s(0-1000) v(0-1000)
 * @param {String} hsvStr - encoded hsvStr (hhhhssssvvvv)
 *
 * @return {Array} [h, s, v]
 *
 */
export const decodeColorData = (byte: string) => {
  if (!byte || byte.length !== 12) {
    return [0, 1000, 1000];
  }
  const b = byte.match(/[a-z\d]{4}/gi) || [];
  return b.reduce((curr, hex) => {
    // @ts-ignore
    curr.push(parseInt(hex, 16));
    return curr;
  }, []);
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

export const formatCountdown = (lampPower: boolean, countdown: number) => {
  const time = Math.ceil(countdown);
  let hours = 0;
  if (time >= 3600) {
    hours = parseInt((time / 3600).toString(), 10);
  }
  const minutes = parseInt(((time - hours * 3600) / 60).toString(), 10);
  const seconds = time - hours * 3600 - minutes * 60;
  const value = `${_.padStart(hours.toString(), 2, '0')}:${_.padStart(
    minutes.toString(),
    2,
    '0'
  )}:${_.padStart(seconds.toString(), 2, '0')}`;
  return Strings.formatValue(lampPower ? 'countdownOffTip' : 'countdownOnTip', value);
};
export const formatColorText = (hue: number) => {
  const degree = hue || 0;
  let text = Strings.getLang('color_red');
  if (degree >= 15 && degree < 45) {
    text = Strings.getLang('color_orange');
  } else if (degree >= 45 && degree < 75) {
    text = Strings.getLang('color_yellow');
  } else if (degree >= 75 && degree < 105) {
    text = Strings.getLang('color_yellow_green');
  } else if (degree >= 105 && degree < 135) {
    text = Strings.getLang('color_green');
  } else if (degree >= 135 && degree < 165) {
    text = Strings.getLang('color_cyan_green');
  } else if (degree >= 165 && degree < 195) {
    text = Strings.getLang('color_cyan');
  } else if (degree >= 195 && degree < 225) {
    text = Strings.getLang('color_indigo');
  } else if (degree >= 225 && degree < 255) {
    text = Strings.getLang('color_blue');
  } else if (degree >= 255 && degree < 285) {
    text = Strings.getLang('color_purple');
  } else if (degree >= 285 && degree < 315) {
    text = Strings.getLang('color_magenta');
  } else if (degree >= 315 && degree < 345) {
    text = Strings.getLang('color_purple_red');
  } else {
    text = Strings.getLang('color_red');
  }
  return text;
};

export const rawToBase64 = (value: string) => {
  if (value.length % 2 !== 0) {
    return '';
  }
  const bytes: number[] = [];
  for (let i = 0; i < value.length; i += 2) {
    bytes.push(parseInt(value.slice(i, i + 2), 16));
  }
  return base64.fromByteArray(new Uint8Array(bytes));
};

export const base64ToRaw = (value: string) => {
  const bytes = base64.toByteArray(value);
  return Array.prototype.map
    .call(bytes, (x: number) => {
      return _.padStart(x.toString(16), 2, '0');
    })
    .join('');
};
export function nToHS(value = 0, num = 2) {
  return numToHexString(value || 0, num);
}
export function sToN(str = '', base = 16) {
  return parseInt(str, base) || 0;
}
export function avgSplit(str = '', num = 1) {
  const reg = new RegExp(`.{1,${num}}`, 'g');
  return str.match(reg) || [];
}
export function toN(n: any) {
  return +n || 0;
}

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
/** 根据workMode获取barMode */
// export function getHomeTabFromWorkMode(workMode: WorkMode) {
//   return workModeMappingHomeTab[workMode];
// }
/** 获取最新的预览颜色数据 */
export function getPreviewColorDatas(
  circles: any[] = [],
  lightLength: number,
  convertRgba = false
) {
  const ratio = Math.max(1, Math.floor(lightLength / circles.length));
  const frontPart = circles.reduce((acc, cur) => acc.concat(Array(ratio).fill(cur)), []);
  const endPart = frontPart.slice(0, Math.max(0, lightLength - circles.length * ratio));
  const previewCircles = [...frontPart, ...endPart].slice(0, lightLength);
  return convertRgba ? previewCircles.map(colorDataToRgba) : previewCircles;
}
export function colorDataToRgba(colorData: any): string {
  const { isColor, hue, saturation, value, brightness, temperature } = colorData;
  return isColor
    ? ColorUtils.hsv2rgba(hue, saturation, value)
    : ColorUtils.brightKelvin2rgba(brightness, temperature);
}

export function subtract(minuend: any, ...args: any[]) {
  return args.reduce((acc, cur) => _.subtract(acc, cur), minuend);
}
export const formatUiData = (dataSource: UiDataType[]) => {
  const { viewHeight } = useSelector(({ uiState }) => {
    return {
      viewHeight: uiState.viewHeight,
      viewWidth: uiState.viewWidth,
    };
  });
  const heigthWidhtRatio = viewHeight / winWidth;
  if (heigthWidhtRatio < 1.75) {
    const newData = dataSource.map(item => {
      const { width, height, pos } = item;
      return {
        width: 0.8 * width,
        height: 0.8 * height,
        pos: pos.map(item => 0.8 * item),
      };
    });
    return newData;
  }
  const newData = dataSource.map(item => {
    const { width, height, pos } = item;
    return {
      width: cx(width),
      height: cx(height),
      pos: pos.map(item => cx(item)),
    };
  });
  return newData;
};
export const formatData = (num: number) => {
  const { viewHeight, viewWidth } = useSelector(({ uiState }) => {
    return {
      viewHeight: uiState.viewHeight,
      viewWidth: uiState.viewWidth,
    };
  });
  const heigthWidhtRatio = viewHeight / viewWidth;
  if (heigthWidhtRatio < 1.75) {
    return num * 0.8;
  }
  return cx(num);
};
