/* eslint-disable no-lone-blocks */
import _ from 'lodash';
import tinycolor from 'tinycolor2';
import { scaleNumber } from '../utils';
import { convertColorToArgbDEC } from '../utils/pressCoordinateUtil';
import { toFixed16 } from '../utils/robotUtil';

export function shrinkValue(value: any) {
  return scaleNumber(1, value);
}

export const bitmapTypeMap = {
  sweep: '00', // 清扫点
  barrier: '01', // 障碍点
  battery: '10', // 充电桩
  unknown: '11', // 未知区域
};
export const bitmapTypeMapReflection = {
  '00': 'sweep',
  '01': 'barrier',
  '10': 'battery',
  '11': 'unknown',
  '111': 'sweep',
  '001': 'barrier',
  '000': 'unknown',
  '010': 'carpet',
};

/**
 * 高五位 低三位的数据
 */
export const bitmapTypeMapV2 = {
  sweep: '111', // 清扫点
  barrier: '001', // 障碍点
  carpet: '010', // 地毯
  unknown: '000', // 未知区域
};

/**
 * 地图数据对应的类型点Hex
 */
export const bitmapTypeHexMap = {
  '00': '00', // 清扫点
  '01': 'f1', // 障碍点
  '10': 'f2', // 充电桩
  '11': 'ff', // 未知区域
};

export const bitmapTypeFloorMaterial = {
  carpet: '00', // 地毯
  tile: '01', // 瓷砖
  wooden: '02', // 木质
};

export const fileTypeMap = {
  map: 0,
  path: 1,
  increPath: 2,
  planPath: 3,
};

export const pointsColor = [
  '#ABD6FFFF', // 清扫点(地图背景颜色)
  '#818181', //  障碍点(地图描边边框)
  '#00FFFF00', // 未知区域（看不见的点）
  '#7ED321FF', // 充电桩
];

export const MAX_ID_NUM = 255;

export const colorOriginMap = [
  '#F9424F',
  '#FDD02B',
  '#46A890',
  '#208CFF',
  '#FA7A80',
  '#A8E772',
  '#49F9CA',
  '#7CF8FF',
  '#F3A0A4',
  '#79E420',
  '#65EAF3',
  '#A188F8',
  '#F8C6A1',
  '#BCFF83',
  '#5CDBFA',
  '#EEBAFC',
];

export const colorHighlightMap = [
  '#FF0012',
  '#FFC800',
  '#00A57C',
  '#007BFF',
  '#FF2832',
  '#9AFF44',
  '#00FFBA',
  '#00F1FF',
  '#D85258',
  '#75FF00',
  '#37F2FF',
  '#7B56FF',
  '#F9964E',
  '#93FF39',
  '#00CDFF',
  '#C900FF',
];

export const colorGrayMap = [
  '#E8E8E8',
  '#D2D2D2',
  '#B4B4B4',
  '#A8A8A8',
  '#818181',
  '#787878',
  '#676767',
  '#4E4E4E',
  '#CEB7B7',
  '#A08989',
  '#886E6E',
  '#5E4B4B',
  '#5A4242',
  '#7B5454',
  '#4B2F2F',
  '#3E2323',
];

export const createHouseColorMap = (
  version: number,
  count: number,
  colors: string[],
  room1Color?: string,
  room2Color?: string,
  room3Color?: string,
  room4Color?: string
) => {
  let room1 = '#D0D0D0';
  if (tinycolor(room1Color).isValid()) {
    room1 = tinycolor(room1Color).toHexString();
  }
  let room2 = '#D0D0D1';
  if (tinycolor(room2Color).isValid()) {
    room2 = tinycolor(room2Color).toHexString();
  }
  let room3 = '#D0D0D2';
  if (tinycolor(room3Color).isValid()) {
    room3 = tinycolor(room3Color).toHexString();
  }
  let room4 = '#D0D0D3';
  if (tinycolor(room4Color).isValid()) {
    room4 = tinycolor(room4Color).toHexString();
  }
  const map = new Map();
  const counts = colors.length; // 一共有多少种颜色(默认16)
  for (let index = 0; index < count; index++) {
    const hex = colors[index % counts];
    const id = index;
    map.set(id, hex);
  }
  if (version !== 2) {
    map.set(60, room1);
    map.set(61, room2);
    map.set(62, room3);
    map.set(63, room4);
  } else {
    map.set(28, room1);
    map.set(29, room2);
    map.set(30, room3);
    map.set(31, room4);
  }
  return map;
};

export const unknownAreaId = [60, 61, 62, 63];
export const unknownAreaIdV2 = [28, 29, 30, 31];

// 解析地图框数据的type
export const areaTypeMap = {
  sweepRegion: '11',
  virtualWall: '13',
  appoint: '17',
  virtualArea: '19',
};

// 和native交互用户地图状态
export const nativeMapStatus = {
  normal: 0,
  pressToRun: 1,
  areaSet: 2,
  virtualArea: 3,
  virtualWall: 4,
  selectRoom: 6,
};

export enum ForbidTypeEnum {
  all = 'all',
  sweep = 'sweep',
  mop = 'mop',
}

/**
 * 转化为#00000000形式的颜色数据
 * @param color
 * @returns
 */
export const toCMYKColor = (color: string) => {
  if (tinycolor(color).isValid()) {
    const rgb = tinycolor(color).toHex8().slice(0, 6);
    const alpha = toFixed16(Math.round(tinycolor(color).getAlpha() * 255));
    const colorHex = `#${alpha}${rgb}`;
    return colorHex.toUpperCase();
  }
  return false;
};

export function dealPointsColor(
  type: string,
  sweepColor?: string,
  barrierColor?: string,
  unknownColor?: string
) {
  const [sweep, barrier, unknown] = pointsColor;
  const mapColor = {
    [bitmapTypeMap.sweep]: toCMYKColor(sweepColor) || sweep,
    [bitmapTypeMap.barrier]: toCMYKColor(barrierColor) || barrier,
    [bitmapTypeMap.unknown]: toCMYKColor(unknownColor) || unknown,
  };
  return mapColor[type] || sweep;
}

export function dealPointsColorV2(
  type: string,
  sweepColor?: string,
  barrierColor?: string,
  unknownColor?: string
) {
  const [sweep, barrier, unknown] = pointsColor;
  const mapColor = {
    [bitmapTypeMapV2.sweep]: toCMYKColor(sweepColor) || sweep,
    [bitmapTypeMapV2.barrier]: toCMYKColor(barrierColor) || barrier,
    [bitmapTypeMapV2.unknown]: toCMYKColor(unknownColor) || unknown,
    [bitmapTypeMapV2.carpet]: toCMYKColor(sweepColor) || sweep,
  };
  return mapColor[type] || sweep;
}

export const materialObjMap = {
  0: 'wire',
  1: 'shoe',
  2: 'sock',
  3: 'toy',
  4: 'chair',
  5: 'table',
  6: 'ashcan',
  7: 'plants',
};

/**
 * 不分区地图
 */
export const getBitMapByType = _.memoize(
  (type: string, houseId?: number) => {
    const color = dealPointsColor(type);
    return convertColorToArgbDEC(color);
  },
  function key(type: string, houseId: number) {
    return type + houseId;
  }
);

export default {
  materialObjMap,
  dealPointsColor,
  ForbidTypeEnum,
  nativeMapStatus,
  areaTypeMap,
  unknownAreaId,
  fileTypeMap,
  bitmapTypeMap,
  shrinkValue,
  createHouseColorMap,
  colorOriginMap,
  colorGrayMap,
  MAX_ID_NUM,
};
