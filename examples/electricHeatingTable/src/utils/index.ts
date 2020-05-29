import { Animated, Easing } from 'react-native';
import { CurvData } from '../config/interface';
import Strings from '../i18n';
import moment from 'moment';
import { Utils } from 'tuya-panel-kit';
import { TYNative, TYDevice } from '../api';

export function handleError(error: Error) {
  console.warn(error.message || error);
}

export const createAnimation = (value: any, toValue: number, duration?: number, delay?: number) => {
  return Animated.timing(value, {
    toValue,
    duration: duration || 400,
    easing: Easing.linear,
    delay: delay || 0,
  });
};

export const mapData = (data: { [key: string]: string }, __: string, scale: number) => {
  let curvData: CurvData[] = [];
  const result = data.result;
  const today = `${moment().format('YYYYMMDD')}`;
  if (Object.keys(result).length === 0) return { curvData, total: 0 };
  let keys = Object.keys(result);
  keys = keys.slice(0, keys.indexOf(today) + 1);
  let values = Object.values(result);
  values = values.slice(0, keys.indexOf(today) + 1);
  if (values.every(x => +x === 0)) return { curvData, total: 0 };
  let total = 0;
  curvData = keys.map((__, index) => {
    const value = +[(+values[index]).toFixed(2)];
    total = total + value;
    return {
      date: _renderDate(keys[index]),
      value: 0 || toFixedData(value / Math.pow(10, scale), 1),
    };
  });
  return { curvData, total };
};

const _renderDate = (date: string) => {
  return `${date.slice(date.length - 4, date.length - 2)}/${date.slice(date.length - 2)}`;
};

export const i18n = (name: string) => Strings.getLang(name);
export const difference = (a: string[], b: string[]) => {
  return a.concat(b).filter(v => !a.includes(v) || !b.includes(v));
};

export const toFixedData = (data: number, fixed: number) => {
  return +(data % 1 === 0 && `${data}`.indexOf('.') === -1 ? data : data.toFixed(fixed));
};
const openSprt = (data: number) => {
  for (let i = 0; i < 20; i++) {
    if (Math.pow(2, i) === data) {
      return i;
    }
  }
  return 0;
};
export const getFaultName = (fault: number, label: { [key: string]: any }) => {
  return label[openSprt(fault)];
};
export const leftValue = (data: number) => {
  return data > 0 ? Math.round(data) : Math.ceil(data);
};
export const average = (arr: number[]) =>
  Math.ceil(arr.reduce((acc, val) => acc + val, 0) / arr.length);
export const { convertX: cx, convertY: cy } = Utils.RatioUtils;

export const goToDpAlarm = (dp: string) => {
  TYNative.gotoDpAlarm({
    category: 'schedule', // 定时分类名
    repeat: 0, // 是否显示周循环，0：显示，1：不显示
    data: [
      // 定时DP点配置（要针对多少个DP点做定时，数组长度就多长）
      {
        dpId: TYDevice.getDpIdByCode(dp), // 要做定时的dp id
        dpName: Strings.getDpLang(dp), // dp点显示的名字
        selected: 0, // dp点值默认选中的索引
        rangeKeys: [true, false], // dp点的值范围（即最终云端定时下发的值）
        rangeValues: [true, false].map(v => Strings.getDpLang(dp, v)), // dp点的值对应的显示值
      },
    ],
  });
};
