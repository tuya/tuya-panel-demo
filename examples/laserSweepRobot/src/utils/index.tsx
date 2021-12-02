/* eslint-disable prefer-const */
/* eslint-disable no-prototype-builtins */
/* eslint-disable no-restricted-syntax */
import { TYSdk, Modal, Utils as NativeUtils } from 'tuya-panel-kit';
import React from 'react';
import _ from 'lodash';
import Utils from '../protocol/utils';
import LaserUIApi from '../api/laserUIApi';
import ListModalView from '../components/listModalView';
import { DPCodes } from '../config';

const { toFixed16 } = Utils.RobotUtils;

const { numToHexString } = NativeUtils.NumberUtils;
const { hexStringToNumber } = NativeUtils.StringUtils;
const {
  PressCoordinateUtils: { circleIntersectRect },
  RobotUtils: { DECNumberToHex },
} = Utils;

function toFixed(d) {
  return parseInt(d, 16);
}

export function showSelectDialog(name, lists, selected, func) {
  const data = {
    name,
    values: lists,
    value: selected,
    onValueChange: d => {
      func(d);
    },
  };
  Modal.render(
    <ListModalView
      {...data}
      onCancel={() => Modal.close()}
      onValueChange={d => {
        data.onValueChange(d);
        Modal.close();
      }}
    />
  );
}

const areaSetType = '10'; // 划区清扫, cmd:10
const areaSetTypeV2 = '28'; // 划区清扫1.1.0, cmd: 28
const pressToRunType = '16'; // 指哪扫哪, cmd: 16
const vrWallType = '12'; // 虚拟墙, cmd: 12
const vrAreaType = '18'; // 禁区设置, cmd: 18
const vrAreaTypeV2 = '1a'; // 禁区设置1.1.0, cmd: 1A
const version = '00';

// 数据拼接校验 aa121001fd8a02aaffe202aaffe20052fd8a0052dd
export const getCommonData = (params: {
  status: number;
  data: Array<any>;
  origin: { x: number; y: number };
  mapScale: number;
  newVersion?: boolean;
  count?: number;
}) => {
  const { status, data, origin, mapScale, newVersion = false, count = 1 } = params;
  //eslint-disable-line
  const header = 'aa';
  let setData = '';
  let checkNum = 0;
  switch (status) {
    case DPCodes.nativeMapStatus.areaSet:
      if (newVersion && count) {
        setData = `${areaSetTypeV2}${toFixed16(count)}${numToHexString(data.length)}`;
        checkNum = parseInt(areaSetTypeV2, 16) + count + data.length;
      } else {
        setData = `${areaSetType}${numToHexString(data.length)}`;
        checkNum = parseInt(areaSetType, 16) + data.length;
      }
      break;
    case DPCodes.nativeMapStatus.virtualWall:
      setData = `${vrWallType}${numToHexString(data.length)}`;
      checkNum = parseInt(vrWallType, 16) + data.length;
      break;
    case DPCodes.nativeMapStatus.pressToRun:
      setData = `${pressToRunType}`;
      checkNum = parseInt(pressToRunType, 16);
      break;
    case DPCodes.nativeMapStatus.virtualArea:
      if (newVersion) {
        setData = `${vrAreaTypeV2}${numToHexString(data.length)}`;
        checkNum = parseInt(vrAreaTypeV2, 16) + data.length;
      } else {
        setData = `${vrAreaType}${numToHexString(data.length)}`;
        checkNum = parseInt(vrAreaType, 16) + data.length;
      }
      break;
    default:
      break;
  }
  // debugger
  const ox = origin.x * Math.pow(10, mapScale);
  const oy = origin.y * Math.pow(10, mapScale);

  if (newVersion) {
    // V1.1.0新增点个数
    if (status === DPCodes.nativeMapStatus.areaSet) {
      data.forEach(d => {
        setData = `${setData}${toFixed16(d.length)}`;
        checkNum += d.length;
        d.forEach(k => {
          const hexX = numToHexString((65535 + dealScale(k.x, mapScale) - ox) % 65535, 4); // 处理负数坐标
          const hexY = numToHexString((65535 + oy - dealScale(k.y, mapScale)) % 65535, 4);
          setData = `${setData}${hexX}${hexY}`;
          checkNum = checkNum + addHex(hexX) + addHex(hexY);
        });
      });
    }
    if (status === DPCodes.nativeMapStatus.virtualArea) {
      data.forEach(d => {
        let poiData = '';
        let poiCheck = 0;
        d.points.forEach(k => {
          const hexX = numToHexString((65535 + dealScale(k.x, mapScale) - ox) % 65535, 4); // 处理负数坐标
          const hexY = numToHexString((65535 + oy - dealScale(k.y, mapScale)) % 65535, 4);
          poiData = `${poiData}${hexX}${hexY}`;
          poiCheck = poiCheck + addHex(hexX) + addHex(hexY);
        });
        const mode = d.extend.forbidType === 'sweep' ? '00' : '02';
        setData = `${setData}${mode}${numToHexString(d.points.length)}${poiData}`;
        checkNum = checkNum + parseInt(mode) + d.points.length + poiCheck;
      });
    }
  } else if (status === DPCodes.nativeMapStatus.pressToRun) {
    data.forEach(d => {
      const hexX = numToHexString((65535 + dealScale(d.x, mapScale) - ox) % 65535, 4); // 处理负数坐标
      const hexY = numToHexString((65535 + oy - dealScale(d.y, mapScale)) % 65535, 4);
      setData = `${setData}${hexX}${hexY}`;
      checkNum = checkNum + addHex(hexX) + addHex(hexY);
      console.log(
        '=====chuli',
        data,
        mapScale,
        dealScale(d.x, mapScale) - ox,
        oy - dealScale(d.y, mapScale)
      );
      console.log(
        'chulihou===111',
        setData,
        (65535 + dealScale(d.x, mapScale) - ox) % 65535,
        (65535 + oy - dealScale(d.y, mapScale)) % 65535
      );
    });
  } else {
    data.forEach(d => {
      d.forEach(k => {
        const hexX = numToHexString((65535 + dealScale(k.x, mapScale) - ox) % 65535, 4); // 处理负数坐标
        const hexY = numToHexString((65535 + oy - dealScale(k.y, mapScale)) % 65535, 4);
        setData = `${setData}${hexX}${hexY}`;
        checkNum = checkNum + addHex(hexX) + addHex(hexY);
      });
    });
  }
  const setLength = numToHexString(setData.length / 2);
  checkNum = numToHexString(checkNum % 256);
  // 头部 + 类型和数据的总字节数 + 类型 + 坐标数据个数 + 坐标数据 + 校验值
  const commonData = `${header}${version}${setLength}${setData}${checkNum}`;
  return commonData;
};

export const atHexToString = str => {
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

// 小数放大
const dealScale = (data, scale) => {
  if (typeof data === 'string') {
    data = parseFloat(data);
  }
  return Number(data.toFixed(scale)) * Math.pow(10, scale);
};

const addHex = str => {
  const array = hexStringToNumber(str);
  return array[0] + array[1];
};

export const stringToAtHex = str => {
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

/**
 * 截取最后几位数的字符
 * @param {} v
 * @param {*} length
 */
function lastChar(v: string | number, length = 2) {
  let d = parseInt(v, 10).toString(16);
  if (d.length < length) {
    d = '0'.repeat(length - d.length) + d;
  } else {
    d = d.slice(d.length - length, d.length);
  }
  return d;
}

/**
 * hex2argb
 * @param {String} hex '#FFFFFF'
 * @param {Number} alpha 0-1
 */
function hex2ahex(hex, alpha = 1) {
  const alpha16 = toFixed16(Math.round(alpha * 255));
  const color = hex.replace(/^#/, '');
  return `#${alpha16}${color}`;
}

/**
 * hex2argb
 * @param {String} hex '#FFFFFF'
 * @param {Number} alpha 0-1
 */
function hex2rgba(hex, alpha = 1) {
  const alpha16 = toFixed16(Math.round(alpha * 255));
  const color = hex.replace(/^#/, '');
  return `${color}${alpha16}`;
}

export { hex2ahex, hex2rgba };

export function encodeCmd(cmd, origin, { pointsData, roomIdData }, mapScale = 1) {
  const header = 'aa';
  let cmdData = cmd;
  let checkSum = parseInt(cmd, 16);
  let length = 1;
  if (roomIdData) {
    for (let index = 0; index < roomIdData.length; index++) {
      const roomId = parseInt(roomIdData[index], 10);
      const roomHex = numToHexString(roomId, 2);
      cmdData += roomHex;
      checkSum += roomId;
    }
    length += roomIdData.length;
  }
  if (pointsData) {
    const ox = origin.x * Math.pow(10, mapScale);
    const oy = origin.y * Math.pow(10, mapScale);
    for (let index = 0; index < pointsData.length; index++) {
      const { x, y } = pointsData[index];
      const realX = (65535 + dealScale(x, mapScale) - ox) % 65535;
      const realY = (65535 + oy - dealScale(y, mapScale)) % 65535;
      const xHex = numToHexString(realX, 4);
      const yHex = numToHexString(realY, 4);
      // const hexX = numToHexString((65535 + dealScale(d.x, mapScale) - ox) % 65535, 4); // 处理负数坐标
      // const hexY = numToHexString((65535 + oy - dealScale(d.y, mapScale)) % 65535, 4);
      console.warn('分区 xHex, yHex', { realX, realY, x, y, ox, oy });
      cmdData += xHex + yHex;
      checkSum += addHex(xHex) + addHex(yHex);
    }
    length += pointsData.length * 4;
  }

  length = numToHexString(length);
  checkSum = numToHexString(checkSum);
  return `${header}${version}${length}${cmdData}${checkSum}`;
}

/**
 * 多地图管理-保存地图
 * header+version+length+cmd+data+check
 */
export function encodeSaveMap() {
  return 'ab00000000022a012b';
}

/**
 * 多地图管理-删除地图
 * @param id
 */
export function encodeDeleteMap(id: number) {
  const header = 'ab';
  const length = '05';
  const cmd = '2c';
  const idHex = toFixed16(id, 8);
  const commonArr = idHex.match(/\w{2}/g);
  if (!commonArr) return '';
  const checkSum = parseInt(cmd, 16) + commonArr.reduce((sum, id) => sum + parseInt(id, 16), 0);
  const check = lastChar(checkSum);
  const data = [
    parseInt(header, 16),
    parseInt(version, 16),
    0,
    0,
    0,
    parseInt(length, 16),
    parseInt(cmd, 16),
    ...commonArr.map(d => parseInt(d, 16)),
    parseInt(check, 16),
  ];
  return data.reduce((pre, cur) => pre + toFixed16(cur, 2), '');
}

/**
 * 多地图管理-使用当前地图
 * @param mapId
 * @param url
 */
export function encodeUseMap(mapId: number, url: string) {
  const urlByteArr = stringToByte(url);
  const urlByteLen = urlByteArr.length;
  const hex = stringToAtHex(url);
  const header = 'ab';
  const length = toFixed16(urlByteLen + 5 + 4, 8);
  const urlLen = toFixed16(urlByteLen, 8);
  const cmd = '2e';
  const idHex = toFixed16(mapId, 8);
  const commonArr = idHex.match(/\w{2}/g);
  if (!commonArr) return '';
  const common = commonArr.map(i => parseInt(i, 16));
  const byteLenArr = urlLen.match(/\w{2}/g);
  if (!byteLenArr) return '';
  const byteLens = byteLenArr.map(i => parseInt(i, 16));
  const curCheck =
    parseInt(cmd, 16) +
    eval(common.join('+')) +
    eval(byteLens.join('+')) +
    eval(urlByteArr.join('+'));
  const check = lastChar(curCheck);
  return `${header}${version}${length}${cmd}${idHex}${urlLen}${hex}${check}`;
}

// 分割房间
export function encodeRoomSplit(roomId: string | number, pointsData: any, origin: any) {
  return encodeCmd('1c', origin, { pointsData, roomIdData: [roomId] });
}

// 合并房间
export function encodeRoomMerge(roomIdData: Array<string>) {
  return encodeCmd('1e', {}, { roomIdData });
}

// 恢复房间
export function encodeRoomReset() {
  return 'aa00012020';
}

/**
 * 解析上报
 * 如果是分割or合并房间
 * 需要提示是否成功
 * exemple: aa02160117
 * @param str
 */
export function roomToastInfo(str: string) {
  const commonArr = str.match(/\w{2}/g);
  if (!commonArr || commonArr[0].toLowerCase() !== 'aa') {
    return '';
  }
  const cmd = commonArr[3] ? commonArr[3].toLowerCase() : '';
  const ret = commonArr[4];
  const res = cmd + ret;
  switch (res) {
    case '1d01':
      return 'splitSuccess';
    case '1d00':
      return 'splitFailed';
    case '1f00':
      return 'mergeFailed';
    case '1f01':
      return 'mergeSuccess';
    case '1f02':
      return 'cannotBeMerged';
    case '2100':
      return 'resetFailed';
    case '2101':
      return 'resetSuccess';
    default:
      return '';
  }
}

export function encodeRoomClean(roomHexIds: string[], cleanCount: number) {
  const roomIds = roomHexIds.map(id => parseRoomId(id));

  const header = 'aa';
  const cmd = '14';
  const idCount = roomIds.length;
  const check =
    parseInt(cmd, 16) +
    cleanCount +
    idCount +
    roomIds.reduce((sum, id) => sum + parseInt(id, 10), 0);
  const length = 1 + 2 + idCount; // Cmd+Data
  const data = [
    parseInt(header, 16),
    parseInt(version, 16),
    length,
    parseInt(cmd, 16),
    cleanCount,
    idCount,
    ...roomIds.map(d => parseInt(d, 10)),
    check,
  ];
  return data.reduce((pre, cur) => pre + toFixed16(cur, 2), '');
}

/**
 * 获取选区清扫的房间id
 */
export function getRoomClean() {
  return 'aa00011515';
}

export function getRoomSuccess(str: string) {
  const commonArr = str.match(/\w{2}/g);
  if (!commonArr || commonArr[3] !== '15') {
    return false;
  }
  try {
    const arr = commonArr.map(d => parseInt(d, 16));
    const count = arr[4];
    const number = arr[5];
    const roomIds = arr.splice(6, number).map(id => DECNumberToHex(id));
    return {
      count,
      roomIds,
    };
  } catch (error) {
    return false;
  }
}

/**
 * 设置房间名称
 * @param params
 * header + version + length + cmd + data + check
 */
export function encodeRoomName(params: any) {
  const roomIdHexs = Object.keys(params);
  const header = 'aa';
  const cmd = '24';
  const count = roomIdHexs.length;
  const checkArr = [cmd, toFixed16(count)];
  let len = 2;
  const roomData = [];
  for (let i = 0; i < count; i++) {
    const roomIdHex = roomIdHexs[i];
    const roomId = parseRoomId(roomIdHex);
    checkArr.push(toFixed16(roomId));
    roomData.push(toFixed16(roomId));
    const nameByteArr = stringToByte(params[roomIdHex].name);
    const utfNameLen = nameByteArr.length;
    const utfName = bytes2Str(nameByteArr);
    if (utfNameLen > 19) return; // 最长不能超过19个字节
    checkArr.push(toFixed16(utfNameLen));
    checkArr.push(...nameByteArr.map(n => toFixed16(n)));
    roomData.push(toFixed16(utfNameLen));
    roomData.push(hexPlusLen(utfName, 19));
    len += 21;
  }
  const curCheck = checkArr.reduce((pre, cur) => pre + parseInt(cur, 16), 0);
  const check = lastChar(curCheck);
  const data = [header, version, toFixed16(len), cmd, toFixed16(count), ...roomData, check];
  const res = data.reduce((pre, cur) => pre + cur, '');
  return res;
}

function hexPlusLen(str: string, len: number) {
  const source = '0000000000000000000000000000000000000000';
  const strLen = str.length;
  const resLen = len * 2 - strLen;
  const res = str + source.slice(0, resLen);
  return res;
}

/**
 * 房间命名是否成功
 * 收到上报就可认为修改成功
 * exemple: aa0b9001010106e58da7e5aea479
 * @param code
 */
export function renameSuccess(str: string) {
  const commonArr = str.match(/\w{2}/g);
  if (!commonArr || commonArr[0].toLowerCase() !== 'aa') {
    return false;
  }
  const cmd = commonArr[3];
  if (cmd === '25') {
    return true;
  }
  return false;
}

/**
 * 定制房间
 * @param roomId
 * @param name
 * cmd 38
 * N|id|sweep_count|sweep_forbiden|fan|mop_count|mop_forbidden|water_level
 * N为房间个数，id为房间标识，sweep_count为扫地清扫次数，sweep_fobidden 清扫禁区，
 * fan为风机档位，mop_count 拖地清
 * 扫次数，拖地禁区，water_level水箱档位
 */
export function encodeRoomCustom(params: any) {
  const roomIdHexs = Object.keys(params);
  const header = 'aa';
  const cmd = '22';
  const count = roomIdHexs.length;
  const checkArr = [cmd, toFixed16(count)];
  let len = 2;
  const roomData = [];
  for (let i = 0; i < count; i++) {
    const roomIdHex = roomIdHexs[i];
    const { fan, water_level, y_mode, sweep_count } = params[roomIdHex];
    const roomId = parseRoomId(roomIdHex);
    const arr = [roomId, fan, water_level, y_mode, sweep_count].map(itm => toFixed16(itm));
    checkArr.push(...arr);
    roomData.push(...arr);
    len += 5;
  }
  const curCheck = checkArr.reduce((pre, cur) => pre + parseInt(cur, 16), 0);
  const check = lastChar(curCheck);
  const data = [header, version, toFixed16(len), cmd, toFixed16(count), ...roomData, check];
  const res = data.reduce((pre, cur) => pre + cur, '');
  return res;
}

/**
 * 房间清扫顺序
 * @param roomIds
 */
export function encodeRoomOrder(roomIdHexs: Array<string>) {
  const roomIds = roomIdHexs.map(id => parseRoomId(id));
  const header = 'aa';
  const len = 1 + 1 + roomIds.length;
  const cmd = '26';
  const check =
    parseInt(cmd, 16) + roomIds.length + roomIds.reduce((sum, id) => sum + parseInt(id, 10), 0);
  const data = [
    parseInt(header, 16),
    parseInt(version, 16),
    len,
    parseInt(cmd, 16),
    roomIds.length,
    ...roomIds.map(d => parseRoomId(d)),
    check,
  ];
  return data.reduce((pre, cur) => pre + toFixed16(cur, 2), '');
}

/**
 * 设置清扫顺序成功
 */
export function orderSuccess(str: string) {
  const commonArr = str.match(/\w{2}/g);
  if (!commonArr || commonArr[0].toLowerCase() !== 'aa') {
    return false;
  }
  const cmd = commonArr[3];
  if (cmd === '27') {
    const hexArr = commonArr.splice(5, commonArr.length - 6);
    return hexArr.map(i => parseInt(i, 16));
  }
  return false;
}

/**
 * 房间属性是否成功
 * 收到上报就可认为修改成功
 * @param code
 */
export function customSuccess(str: string) {
  const commonArr = str.match(/\w{2}/g);
  if (!commonArr || commonArr[0].toLowerCase() !== 'aa') {
    return false;
  }
  const cmd = commonArr[3];
  if (cmd === '23') {
    return true;
  }
  return false;
}

/**
 * 中文转十六进制
 * @param str
 */
export function stringToByte(str: string) {
  const bytes = [];
  let c;
  const len = str.length;
  for (let i = 0; i < len; i++) {
    c = str.charCodeAt(i);
    if (c >= 0x010000 && c <= 0x10ffff) {
      bytes.push(((c >> 18) & 0x07) | 0xf0);
      bytes.push(((c >> 12) & 0x3f) | 0x80);
      bytes.push(((c >> 6) & 0x3f) | 0x80);
      bytes.push((c & 0x3f) | 0x80);
    } else if (c >= 0x000800 && c <= 0x00ffff) {
      bytes.push(((c >> 12) & 0x0f) | 0xe0);
      bytes.push(((c >> 6) & 0x3f) | 0x80);
      bytes.push((c & 0x3f) | 0x80);
    } else if (c >= 0x000080 && c <= 0x0007ff) {
      bytes.push(((c >> 6) & 0x1f) | 0xc0);
      bytes.push((c & 0x3f) | 0x80);
    } else {
      bytes.push(c & 0xff);
    }
  }
  return bytes;
}

/**
 * bytes数组转16进制字符串
 * @param arr
 */
function bytes2Str(arr: Array<number | string>): string {
  let str = '';
  for (let i = 0; i < arr.length; i++) {
    let tmp = arr[i].toString(16);
    if (tmp.length === 1) {
      tmp = `0${tmp}`;
    }
    str += tmp;
  }
  return str;
}

export function getFuncField(key, defaultValue) {
  return _.get(TYSdk, ['devInfo', 'panelConfig', 'fun', key], defaultValue);
}

/**
 * 禁区框移动时，检测是否覆盖当前点
 */
export async function isForbiddenZonePointsInCurPos(
  pointData: { type: number },
  opts = { resolution: 0.05, curPos: {}, origin: { x: 0, y: 0 }, mapId: '' }
) {
  const {
    curPos: { x: px, y: py },
    resolution,
    origin: { x: ox, y: oy },
  } = opts;
  if (
    px === undefined ||
    py === undefined ||
    !pointData ||
    !(pointData.type === DPCodes.nativeMapStatus.virtualArea)
  ) {
    return false;
  }
  const { compatible: data = [], origin: originData = [] } = await getMapPointsCompatibleWiltV1({
    mapId: opts.mapId,
  });
  return checkForbidInPos({
    posX: px,
    posY: py,
    originX: ox,
    originY: oy,
    resolution,
    ringRadiusRealMeter: 0.1,
    curAreaData: data,
  });
}

/**
 * 禁区框移动时的回调, 检测禁区框是否在充电桩2米内
 * @param {*} pointData
 * @param {*} [opts={ resolution: 1, pilePosition, mapId }]
 * @returns {boolean}
 */
export async function isForbiddenZonePointsInPile(
  pointData: { type: number },
  opts = { resolution: 1, pilePosition: { x: 0, y: 0 }, mapId: '', origin: { x: 0, y: 0 } }
) {
  if (!pointData || !(pointData.type === DPCodes.nativeMapStatus.virtualArea)) return false;
  const { compatible: data = [], origin: originData = [] } = await getMapPointsCompatibleWiltV1({
    mapId: opts.mapId,
  });
  const {
    pilePosition,
    resolution,
    origin: { x: ox, y: oy },
  } = opts;

  return checkForbidInPos({
    posX: pilePosition.x,
    posY: pilePosition.y,
    originX: ox,
    originY: oy,
    resolution,
    ringRadiusRealMeter: 1,
    curAreaData: data,
  });
}

/**
 * 获取坐标点数据（兼容老接口数据结构）
 */
async function getMapPointsCompatibleWiltV1(opts = {}) {
  const { mapId } = opts;
  const { data = [] } = await LaserUIApi.getLaserMapPointsInfo({ mapId });

  if (mapId) {
    const points = data.map((item: any) => item.points);
    return {
      origin: data,
      compatible: points,
    };
  }
  return {
    origin: data,
    compatible: data,
  };
}

/**
 *  检查区域是否在点内
 */
function checkForbidInPos(opts) {
  const {
    posX,
    posY,
    originX,
    originY,
    resolution,
    ringRadiusRealMeter = 1,
    curAreaData = [],
  } = opts;
  // 如果有充电桩的时候才检查是否和充电桩重叠
  if (
    _.isUndefined(posX) ||
    _.isUndefined(posY) ||
    _.isUndefined(originX) ||
    _.isUndefined(originY)
  ) {
    return false;
  }
  return curAreaData.some(item => {
    return circleIntersectRect(
      {
        x: posX + originX,
        y: posY + originY,
        radius: ringRadiusRealMeter / resolution, // 半径=真实米数/比例尺
      },
      item
    );
  });
}

/**
 * 禁区相关数据解析
 * @param str
 */
export function encodeVRSuccess(str: string) {
  const { virtualAreaData, virtualWallData, virtualAreaDataV2 } = splitCommonData(str);
  return virtualAreaData || virtualWallData || virtualAreaDataV2;
}

/**
 * 拆解指令码
 * @param {string} str 指令码
 * @returns {object} 具有含义的指令码键值对
 */
function splitCommonData(str: string) {
  const commonArr = str.match(/\w{2}/g);
  if (!commonArr) return {};

  const dataSource = commonArr.map(d => parseInt(d, 16));
  const { length: dataLength } = dataSource;
  let header, version, length, cmd, data, check, one, endIdx, startIdx;
  const datas = {};
  const nameToCmdMap = {
    virtualAreaData: toFixed('19'),
    virtualWallData: toFixed('13'),
    virtualAreaDataV2: toFixed('1b'), // V1.1.0新协议禁区
  };

  const cmdToNameMap: { [x: string]: any } = Object.entries(nameToCmdMap).reduce(
    (pre, [name, cmd]) => Object.assign(pre, { [cmd]: name }),
    {}
  );

  for (let index = 0; index < dataLength; index++) {
    const cur = dataSource[index];
    if (index === 0 && cur !== toFixed('aa')) return {};
    if (cur === toFixed('aa')) {
      header = cur;
      startIdx = index;
      version = dataSource[index + 1];
      length = dataSource[index + 2];
      cmd = dataSource[index + 3];
      endIdx = startIdx + length + 3;
      index = endIdx;
      const name = cmdToNameMap[cmd];
      if (name) {
        datas[name] = dataSource.slice(startIdx, endIdx + 1);
      }
    }
  }
  return datas;
}

/**
 * 下发语音包
 * @param data
 */
export function encodeVoiceData(data: {
  extendData: { extendId: number };
  officialUrl: string;
  desc: string;
}) {
  const {
    extendData: { extendId: id },
    officialUrl,
    desc,
  } = data;
  if (!officialUrl) return '';
  const header = 'ab';
  const cmd = '34';
  const idHex = toFixed16(id, 8);
  const descByteArr = stringToByte(desc);
  const descByteLen = descByteArr.length;

  const hexDesc = descByteArr.map(i => toFixed16(i)).join('');
  const hexDescLen = toFixed16(descByteLen, 2);
  const urlByteArr = stringToByte(officialUrl);
  const urlByteLen = urlByteArr.length;

  const hexUrl = stringToAtHex(officialUrl);
  const hexUrlLen = toFixed16(urlByteLen, 8);
  const len = toFixed16(urlByteLen + descByteLen + 10, 8);

  const commonArr = idHex.match(/\w{2}/g);
  if (!commonArr) return '';
  const common = commonArr.map(i => parseInt(i, 16));

  const hexUrlLenArr = hexUrlLen.match(/\w{2}/g);
  if (!hexUrlLenArr) return '';
  const hexUrlLenArr2 = hexUrlLenArr.map(i => parseInt(i, 16));

  const curCheck =
    parseInt(cmd, 16) +
    eval(common.join('+')) +
    descByteLen +
    eval(descByteArr.join('+')) +
    eval(hexUrlLenArr2.join('+')) +
    eval(urlByteArr.join('+'));
  const check = lastChar(curCheck);
  return `${header}${version}${len}${cmd}${idHex}${hexDescLen}${hexDesc}${hexUrlLen}${hexUrl}${check}`;
}

/**
 * 上报语音包
 */
export function encodeVoiceSuccess(str: string): object | boolean {
  if (!str) return false;
  const commonArr = str.match(/\w{2}/g);
  if (!commonArr || commonArr[0].toLowerCase() !== 'ab') {
    return false;
  }
  const cmd = commonArr[6];

  if (cmd === '35') {
    const status = parseInt(commonArr[11], 16);
    const schedule = parseInt(commonArr[12], 16);
    const extendId = parseInt(str.slice(14, 22), 16);

    return {
      extendId,
      status,
      schedule,
    };
  }
  return false;
}

/**
 * 判断两个区域是否相邻
 * @param list1
 * @param list2
 * @return
 */
export function isAdjacent(
  list1: Array<{ x: number; y: number }>,
  list2: Array<{ x: number; y: number }>
) {
  const maxDistance = 5;
  let count = 0;
  const len1 = list1.length;
  const len2 = list2.length;
  if (len1 >= 3 && len2 >= 3) {
    for (let i = 0; i < len1; i++) {
      for (let j = 0; j < len2; j++) {
        const xx = Math.round(list1[i].x - list2[j].x);
        const yy = Math.round(list1[i].y - list2[j].y);
        if (xx <= maxDistance && yy <= maxDistance) {
          count++;
        }
      }
    }
  }
  return count >= 2;
}

/**
 * 判断两个区域是否接壤
 * @param points1
 * @param points2
 * @return
 */
export function isBorder(
  points1: Array<{ x: number; y: number }>,
  points2: Array<{ x: number; y: number }>
) {
  if (!Array.isArray(points1) || !Array.isArray(points2) || !points1.length || !points2.length) {
    return true;
  }
  const mapScale = 1;
  const maxDistance = 10;
  let count = 0;
  let dis;
  const len1 = points1.length;
  const len2 = points2.length;

  if (len1 > 0 && len2 > 0) {
    for (let j = 1; j < len1; j++) {
      for (let i = 0; i < len2; i++) {
        if (j === len1 - 1) {
          dis = pointToLine(
            points1[0].x * mapScale,
            points1[0].y * mapScale,
            points1[j].x * mapScale,
            points1[j].y * mapScale,
            points2[i].x * mapScale,
            points2[i].y * mapScale
          );
        } else {
          dis = pointToLine(
            points1[j - 1].x * mapScale,
            points1[j - 1].y * mapScale,
            points1[j].x * mapScale,
            points1[j].y * mapScale,
            points2[i].x * mapScale,
            points2[i].y * mapScale
          );
        }
        if (dis <= maxDistance) {
          count++;
          break;
        }
      }
    }
  }
  return count > 0;
}

/**
 * 点到直线的最短距离的判断 点（x0,y0） 到由两点组成的线段（x1,y1） ,( x2,y2 )
 */
function pointToLine(x1, y1, x2, y2, x0, y0) {
  let space = 0;
  let a, b, c;
  a = lineSpace(x1, y1, x2, y2); // 线段的长度
  b = lineSpace(x1, y1, x0, y0); // (x1,y1)到点的距离
  c = lineSpace(x2, y2, x0, y0); // (x2,y2)到点的距离
  if (c <= 0.000001 || b <= 0.000001) {
    space = 0;
    return space;
  }
  if (a <= 0.000001) {
    space = b;
    return space;
  }
  if (c * c >= a * a + b * b) {
    space = b;
    return space;
  }
  if (b * b >= a * a + c * c) {
    space = c;
    return space;
  }
  const p = (a + b + c) / 2; // 半周长
  const s = Math.sqrt(p * (p - a) * (p - b) * (p - c)); // 海伦公式求面积
  space = (2 * s) / a; // 返回点到线的距离（利用三角形面积公式求高）
  return space;
}

// 计算两点之间的距离
function lineSpace(x1: number, y1: number, x2: number, y2: number) {
  let lineLength = 0;
  lineLength = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
  return lineLength;
}

/**
 * 判断深度相等
 * @param x
 * @param y
 */
export const deepEqual = function (x: any, y: any) {
  // 指向同一内存时
  if (x === y) {
    return true;
  }
  if (typeof x === 'object' && x != null && typeof y === 'object' && y != null) {
    if (Object.keys(x).length !== Object.keys(y).length) return false;
    for (const prop in x) {
      if (y.hasOwnProperty(prop)) {
        if (!deepEqual(x[prop], y[prop])) return false;
      } else return false;
    }
    return true;
  }
  return false;
};

/**
 * 转换字节到整型roomId
 * @param pixel
 */
export const parseRoomId = (pixel: string | number): number => {
  const point_2 = _.padStart(parseInt(pixel, 16).toString(2), 8, '0');
  const roomId = parseInt(point_2.slice(0, 6), 2);
  return roomId;
};
