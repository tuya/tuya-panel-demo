/* eslint-disable no-lone-blocks */
import { Utils } from 'tuya-panel-kit';
import _ from 'lodash';
import { scaleNumber } from '../utils';
import { convertColorToArgbDEC } from '../utils/pressCoordinateUtil';

const {
  ColorUtils: { color: ColorUtils },
} = Utils;

export function shrinkValue(value: any) {
  return scaleNumber(1, value);
}

export const bitmapTypeMap = {
  sweep: '00', // 清扫点
  barrier: '01', // 障碍点
  battery: '10', // 充电桩
  unknown: '11', // 未知区域
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

function createHouseColorMap(count: number, colors: string[]) {
  function getColor(step: number, color: string) {
    const [h, s, v] = ColorUtils.hex2hsv(color);
    return ColorUtils.hsv2hex(h, s, v - step);
  }
  const map = new Map();
  let step = 0; // 第几圈
  const counts = colors.length; // 一圈有多少数量
  for (let index = 0; index < count; index++) {
    const hex = getColor(step, colors[index % counts]);
    const id = index;
    map.set(id, hex);
    if (index % counts === 0) step += 1;
  }
  {
    map.set(60, '#D0D0D0');
    map.set(61, '#D0D0D1');
    map.set(62, '#D0D0D2');
    map.set(63, '#D0D0D3');
  }
  return map;
}

export const unknownAreaId = [60, 61, 62, 63];

export const houseColorMap = createHouseColorMap(MAX_ID_NUM, colorOriginMap);
export const houseHighlightColorMap = createHouseColorMap(MAX_ID_NUM, colorHighlightMap);
export const houseGrayColorMap = createHouseColorMap(MAX_ID_NUM, colorGrayMap);

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

export function dealPointsColor(type: string) {
  const [sweep, barrier, unknown, battery] = pointsColor;
  const mapColor = {
    [bitmapTypeMap.sweep]: sweep,
    [bitmapTypeMap.barrier]: barrier,
    [bitmapTypeMap.battery]: battery,
    [bitmapTypeMap.unknown]: unknown,
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
