import { Utils } from 'tuya-panel-kit';
import _ from 'lodash';

const {
  JsonUtils: { parseJSON },
} = Utils;

export const stringToAtHex = (str: string) => {
  let val = '';
  for (let i = 0; i < str.length; i++) {
    if (val === '') {
      val = str.charCodeAt(i).toString(16);
    } else {
      val += `${str.charCodeAt(i).toString(16)}`;
    }
  }
  return val;
};

export const atHexToString = (str: string) => {
  const trimedStr = str.trim();
  const rawStr = trimedStr.substr(0, 2).toLowerCase() === '0x' ? trimedStr.substr(2) : trimedStr;
  const len = rawStr.length;
  if (len % 2 !== 0) {
    return '';
  }
  let curCharCode;
  const resultStr = [];
  for (let i = 0; i < len; i += 2) {
    curCharCode = parseInt(rawStr.substr(i, 2), 16); // ASCII Code Value
    resultStr.push(String.fromCharCode(curCharCode));
  }
  return resultStr.join('');
};

/**
 * 36进制极致压缩文字，返回utf-16的36进制
 * @param str
 */
export const stringToBase36Arr = (str: string) => {
  const val = [];
  if (!str) return val;
  for (let i = 0; i < str.length; i++) {
    val.push(`${str.charCodeAt(i).toString(36)}`);
  }
  return val;
};

/**
 * 解压stringToBase36Arr方法
 * @param strArr
 */
export const base36ArrToString = (strArr: string[]) => {
  const resultStr: string[] = [];
  strArr.forEach(val => {
    resultStr.push(String.fromCharCode(parseInt(val, 36)));
  });
  return resultStr.join('');
};
export function ASCIIToJson(str: string) {
  return parseJSON(atHexToString(str));
}

export function toJsonSafe(str: string) {
  return Utils.JsonUtils.parseJSON(str.replace(/(\{.*\}).*/, '$1'));
}

/**
 * 十进制转十六进制小写
 * @param dec 十进制数字
 * @param padNum 向前补几位
 * @param lower 是否小写
 */
export function DECToHex(dec: number, padNum = 2, lower = true) {
  if (dec === undefined || dec === null) return '';
  if (lower) {
    return _.toLower(_.padStart(Number(dec).toString(16), padNum, '0'));
  }
  if (!lower) {
    return _.toUpper(_.padStart(Number(dec).toString(16), padNum, '0'));
  }
}

export default {
  stringToAtHex,
  atHexToString,
  ASCIIToJson,
  toJsonSafe,
};
