import { Utils } from 'tuya-panel-kit';
import _isUndefined from 'lodash/isUndefined';
import _floor from 'lodash/floor';
import _round from 'lodash/round';
import _padStart from 'lodash/padStart';

import circleIntersectRect from './circleIntersectRect';
import { decodeColor } from '../robotUtil';

const {
  NumberUtils: { highLowToInt },
  ColorUtils: { color },
} = Utils;

const max = 16 ** 4;
const min = max / 2;

function scaleNumber(scale: number, value: number) {
  return Number((value / 10 ** scale).toFixed(scale));
}

// 兼容负数 byte 最大值平分给正负两端
function dealPL(point: number) {
  return point > min ? point - max : point;
}

// 放大x，y轴几倍
function transformXY(mapScale: number, x: number, y: number) {
  return scaleNumber(mapScale, dealPL(highLowToInt(x, y)));
}

/** 通过比例尺，计算app x，y轴 */
function transformXYByResolution(x: number, y: number, resolution: number) {
  // 乐动在用
  // 0.001—原数据是毫米，标准化到米；0.05—地图的分辨率；（-0.93）—"x_min"；（-9.63）—"y_min"
  const nx = _round((x * 0.001) / resolution, 2);
  const ny = -_round((y * 0.001) / resolution, 2);

  return { x: nx, y: ny };
}

function transformXYToRobotByResolution(params: {
  x: number;
  y: number;
  resolution: number;
  height: number;
  minX: number;
  minY: number;
}) {
  const { x, y, resolution, minX, minY, height } = params;
  const nx = _round((x * resolution + minX) / 0.001);
  const ny = _round(((height - y) * resolution + minY) / 0.001);

  return { x: nx, y: ny };
}

// 转换充电桩，充电桩小于0时视为无效充电桩
function transformPileXY(pileX: number, pileY: number, originX: number, originY: number) {
  if (pileX <= 0 && pileY <= 0) return {};
  const finalX = pileX - originX;
  const finalY = pileY - originY;
  return {
    x: finalX,
    y: finalY,
  };
}

/**
 * 计算hex的10机制值
 * #FFFFFF40 => 184549375
 * @export
 * @param {string} [originColor] rgba(255, 0, 0, 1); rgb(0, 255, 0); #FF00FF; #FF00FFFF
 * @returns 对应的10机制结果
 */
export const convertColorToArgbDEC = function (color: string) {
  const [r, g, b, a = 255] = decodeColor(color);
  return (a << 24) | (r << 16) | (g << 8) | b;
};

// 任意颜色转16进制#argb
//
// 输入：可能的值：70A5EEFF（rgba）、常规格式的颜色 输出： #FF001122
function convertColorToArgbHex(originColor?: string) {
  if (!originColor) return '';
  let tmp = originColor;
  let tmpAlpha = 255;

  if (!originColor.match(/^#/) && originColor.length === 8) {
    // 原来地图的颜色格式，需要兼容
    const [rgb, a] = originColor.replace(/(\w{6})(\w{2})/, '#$1_$2').split('_');
    tmp = rgb;
    tmpAlpha = parseInt(a, 16);
  }
  const [r, g, b, a] = color.decode(tmp);
  if (!_isUndefined(a)) {
    tmpAlpha = _floor(Number(a) * 255);
  }

  const [hexr, hexg, hexb, hexa] = [r, g, b, tmpAlpha].map((value: number) =>
    _padStart(value.toString(16), 2, '0')
  );

  return `#${hexa}${hexr}${hexg}${hexb}`;
}

function convertColorToRgbaHex(originColor?: string) {
  if (!originColor) return '';
  const tmp = originColor;
  let tmpAlpha = 255;

  const [r, g, b, a] = color.decode(tmp);
  if (!_isUndefined(a)) {
    tmpAlpha = _floor(Number(a) * 255);
  }

  const [hexr, hexg, hexb, hexa] = [r, g, b, tmpAlpha].map((value: number) =>
    _padStart(value.toString(16), 2, '0')
  );

  return `#${hexr}${hexg}${hexb}${hexa}`;
}

export function getRCTAreaStructure(opts: {
  id?: string;
  bgColor?: string;
  borderColor?: string;
  text?: string;
  textColor?: string;
  textSize?: number;
  type?: number;
  viewType?: string;
  extend?: {
    forbidType: string;
  };
  canRename?: boolean;
  points:
    | [
        { x: number; y: number },
        { x: number; y: number },
        { x: number; y: number },
        { x: number; y: number }
      ]
    | { x: number; y: number };
}) {
  const {
    id = '',
    bgColor = '#ffffff',
    borderColor = '#ffffff',
    text = '',
    textColor = '#ffffff',
    textSize = 10,
    type = 0,
    viewType = '',
    extend = {},
    points = [],
    canRename = false,
  } = opts;
  const data = {
    id,
    box: {
      bgColor: convertColorToArgbHex(bgColor),
      borderColor: convertColorToArgbHex(borderColor),
    },
    content: {
      text,
      textColor: convertColorToArgbHex(textColor),
      textSize,
      renameEnable: canRename,
    },
    type,
    viewType,
    points,
    extend: JSON.stringify(extend) || '',
  };
  return data;
}

function getRCTPointStructure(opts: {
  id: string;
  type: number;
  points: { x: number; y: number };
}) {
  const { id = '', type = 0, points = {} } = opts;
  const data = {
    id,
    type,
    points: [points],
  };
  return data;
}

export function getRCTLineStructure(opts: {
  id?: string;
  bgColor?: string;
  // borderColor?: string;
  // text?: string;
  // textColor?: string;
  // textSize?: number;
  type?: number;
  viewType?: string;
  lineWidth?: number;
  extend?: {
    forbidType: string;
  };
  // canRename?: boolean;
  points:
    | [
        { x: number; y: number },
        { x: number; y: number },
        { x: number; y: number },
        { x: number; y: number }
      ]
    | { x: number; y: number };
}) {
  const {
    id = '',
    bgColor = '#ffffff',
    // borderColor = '#ffffff',
    // text = '',
    // textColor = '#ffffff',
    // textSize = 10,
    lineWidth = 1,
    type = 0,
    viewType = '',
    extend = {},
    points = [],
    // canRename = false,
  } = opts;
  const data = {
    id,
    line: {
      bgColor: convertColorToArgbHex(bgColor),
      lineWidth,
    },
    type,
    viewType,
    points,
    extend: JSON.stringify(extend) || '',
  };
  return data;
}

export default {
  scaleNumber,
  dealPL,
  transformXY,
  transformXYByResolution,
  transformXYToRobotByResolution,
  circleIntersectRect,
  transformPileXY,
  convertColorToArgbDEC,
  convertColorToArgbHex,
  convertColorToRgbaHex,
  getRCTAreaStructure,
  getRCTPointStructure,
  getRCTLineStructure,
};
