import _ from 'lodash';
import Binary from '../binary';
import { shrinkValue } from '../../constant';

const rgbReg = /^rgb/;
const colorReg = /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*([\.\d]+))?\)/;
const hashReg = /^#/;

export function toFixed16(v: string, length = 2) {
  let d = parseInt(v, 10).toString(16);
  if (d.length < length) {
    d = '0'.repeat(length - d.length) + d;
  } else {
    d = d.slice(0, length);
  }
  return d;
}

function getRgb(color: string) {
  const { length } = color;
  const rgb = [];
  for (let index = 0; index < length / 2; index++) {
    const idx = index * 2;
    const start = color[idx];
    const next = color[idx + 1];
    rgb[index] = start + next;
  }
  return rgb;
}

function decodeMemorizeKey(data: string) {
  return data;
}

/**
 *
 *
 * @export
 * @param {string} color
 * @returns rgba 0-255 {number[]}
 */
export const decodeColor = function (color: string): number[] {
  let rgb;
  if (rgbReg.test(color)) {
    const matcher = color.match(colorReg) || [];
    rgb = [matcher[1], matcher[2], matcher[3]].map(item => parseInt(item));
    let alpha = matcher[4] as any;
    if (alpha !== undefined) {
      alpha = alpha > 1 ? 1 : alpha < 0 ? 0 : alpha;
      alpha = Math.floor(alpha * 255);
      rgb.push(alpha);
    }
    return rgb;
  }

  color = color.replace(hashReg, '');
  const len = color.length;
  if (len !== 6 && len !== 3 && len !== 8) {
    color = '000000';
  }
  if (len === 3) {
    rgb = color.split('').map(item => `${item}${item}`);
  } else {
    rgb = getRgb(color);
  }
  rgb = rgb.map(i => {
    let v = parseInt(i, 16);
    if (v < 0) v = 0;
    if (v > 255) v = 255;
    return v;
  });
  if (rgb.length === 3) {
    rgb.push(255);
  }
  return rgb;
};

/**
 * hex2rgba
 *
 * @param {String} hex '#FF0000'
 * @param {Number} alpha 0-1
 * @returns 'ff0000ff'
 */
export function hex2rgba(hex: string, alpha = 1) {
  const alpha16 = toFixed16(Math.round(alpha * 255).toString());
  const color = hex.replace(hashReg, '');
  return `${color}${alpha16}`;
}

/**
 * hex2ahex
 *
 * @param {String} hex '#FFFFFF'
 * @param {Number} alpha 0-1
 */
export function hex2ahex(hex: string, alpha = 1) {
  const alpha16 = toFixed16(Math.round(alpha * 255).toString());
  const color = hex.replace(hashReg, '');
  return `#${alpha16}${color}`;
}

export function isRobotQuiet(status: string) {
  const quietStatuses = ['standby', 'paused', 'charging', 'charge_done', 'sleep', 'fault'];
  const isQuiet = quietStatuses.includes(status);
  return isQuiet;
}

/**
 * 切割字符串并转换
 * @param data
 * @param start
 * @param end
 */
export function sliceStr2Int(data: string, start: number, end: number) {
  return parseInt(data.slice(2 * start, 2 * end), 16);
}

/**
 * 十六进制转字符串
 * @param str
 */
export function strBytes2Name(str: string) {
  try {
    let pos = 0;
    let len = str.length;
    if (len % 2 != 0) {
      return null;
    }
    len /= 2;
    const hexA = [];
    for (let i = 0; i < len; i++) {
      const s = str.substr(pos, 2);
      const v = parseInt(s, 16);
      hexA.push(v);
      pos += 2;
    }
    const res = byteToString(hexA);
    return res;
  } catch (error) {
    return '';
  }
}

export function byteToString(arr: Array<number> | string) {
  if (typeof arr === 'string') {
    return arr;
  }
  let str = '',
    _arr = arr;
  for (let i = 0; i < _arr.length; i++) {
    const one = _arr[i].toString(2),
      v = one.match(/^1+?(?=0)/);
    if (v && one.length == 8) {
      const bytesLength = v[0].length;
      let store = _arr[i].toString(2).slice(7 - bytesLength);
      for (let st = 1; st < bytesLength; st++) {
        store += _arr[st + i].toString(2).slice(2);
      }
      str += String.fromCharCode(parseInt(store, 2));
      i += bytesLength - 1;
    } else {
      str += String.fromCharCode(_arr[i]);
    }
  }
  return str;
}
function createFormatPath({ reverseY, hidePath }: { reverseY?: boolean; hidePath?: boolean } = {}) {
  return originPoint => {
    const { x, y } = originPoint;
    if (!_.isNumber(x) || !_.isNumber(y)) {
      throw new Error(`path point x or y is not number: x = ${x}, y = ${y}`);
    }
    let realPoint;
    if (reverseY) {
      realPoint = { x: shrinkValue(x), y: -shrinkValue(y) };
    } else {
      realPoint = { x: shrinkValue(x), y: shrinkValue(y) };
    }
    if (!hidePath) {
      return realPoint;
    }

    const completeX = Binary.complement(x);
    const completeY = Binary.complement(y);
    const lastX = completeX.slice(-1);
    const lastY = completeY.slice(-1);
    const lastPoint = lastX + lastY;
    const visible = lastPoint === '00';
    return {
      ...realPoint,
      type: visible ? 'common' : 'charge',
    };
  };
}

export const tuyaHidePath = createFormatPath({ reverseY: true, hidePath: true });

// 充电桩小于0时视为无效充电桩
export function transformPileXY({ pileX, pileY }: any, { originX, originY }: any) {
  if (pileX <= 0 && pileY <= 0) return {};
  const finalX = pileX - originX;
  const finalY = pileY - originY;
  if (_.isNaN(finalX) || _.isNaN(finalY)) {
    return {};
  }
  return {
    x: finalX,
    y: finalY,
  };
}

/**
 * roomId转换到roomIdHex
 * 十进制转十六进制小写
 * @param dec 十进制数字
 * @param padNum 向前补几位
 */
export function DECNumberToHex(dec: number) {
  if (dec === undefined || dec === null) return '';
  const bits = Number(dec).toString(2);
  const pad = `${bits}00`;
  const decc = parseInt(pad, 2);
  return toFixed16(decc);
}
