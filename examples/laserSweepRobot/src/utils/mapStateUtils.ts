import { TYSdk, Utils as NativeUtils } from 'tuya-panel-kit';
import _isUndefined from 'lodash/isUndefined';
import Strings from '@i18n';
import { DPCodes } from '../config';
import { atHexToString, stringToAtHex } from '.';
import RobotStatus from './robotStatus';
import LaserUIApi from '../api/laserUIApi';
import Utils from '../protocol/utils';

const ALL_ZONE_MUN_MAX = 100;
const { nativeMapStatus } = DPCodes;
const {
  PressCoordinateUtils: { circleIntersectRect, getRCTAreaStructure, getRCTLineStructure },
} = Utils;

/**
 * 检查地图中的清扫框、虚拟墙、禁区框数量
 * @param {number} num 数量
 */
async function checkMapPointNumber(num, extendZoneLength = 0) {
  try {
    const { data = [] } = await LaserUIApi.getLaserMapPoints();
    const zoneNum = data.length + extendZoneLength + 1;
    if (zoneNum > num) {
      TYSdk.mobile.simpleTipDialog(Strings.getLang('areaNumLimit'), () => { });
      return Promise.reject();
    }
    return true;
  } catch (error) {
    console.warn(error);
    return Promise.reject(error);
  }
}

/**
 * 设置地图清扫区域
 * 区域清扫  type=2  最大限制10个  文案:最大清扫区域数为10个
 */
function setMapCleanZone(
  {
    extendAreaNum = 0,
    mapId = '',
    areaId = 0,
    origin = {},
    curPos = {},
    tempAreaList = [],
    mapHeight = 0,
    mapWidth = 0,
    bgColor,
    borderColor,
  },
  opts = {}
) {
  const { init = false } = opts;
  return new Promise((resolve, reject) => {
    checkMapPointNumber(ALL_ZONE_MUN_MAX, extendAreaNum)
      .then(() => {
        const area = {
          id: `${areaId}`,
          type: nativeMapStatus.areaSet,
        };
        if (tempAreaList.length) {
          const lastTempArea = tempAreaList[tempAreaList.length - 1];
          const [p1, p2, p3, p4] = lastTempArea.points;
          area.points = [
            { x: p1.x - 10, y: p1.y + 10 },
            { x: p2.x - 10, y: p2.y + 10 },
            { x: p3.x - 10, y: p3.y + 10 },
            { x: p4.x - 10, y: p4.y + 10 },
          ];
        } else {
          const { x: ox, y: oy } = origin;
          const { x: px, y: py } = curPos;

          const cx = Math.round(mapWidth / 2) - ox;
          const cy = Math.round(mapHeight / 2) - oy;

          const originX = px || cx || ox || 0;
          const originY = py || cy || oy || 0;

          area.points = [
            { x: originX - 30, y: originY - 30 },
            { x: originX + 30, y: originY - 30 },
            { x: originX + 30, y: originY + 30 },
            { x: originX - 30, y: originY + 30 },
          ];
        }
        LaserUIApi.addLaserMapArea({
          mapId,
          area: getRCTAreaStructure({
            ...area,
            bgColor,
            borderColor,
            text: '',
            // text: `${Strings.getLang('roomName')}${areaId}`,
            canRename: false,
          }),
        }).then(() => resolve({ area: { ...area, type: nativeMapStatus.areaSet } }));
      })
      .catch(() => {
        reject();
      });
  });
}

/**
 * 设置地图禁区
 * 禁区type=3 最大限制8个  文案:最大禁区数为8个
 */
function setMapForbiddenZone({
  extendAreaNum = 0,
  mapId = '',
  areaId = 0,
  origin = {},
  curPos = {},
  tempAreaList = [],
  mode = 'all',
  mapHeight = 0,
  mapWidth = 0,
  bgColor,
  borderColor,
  textColor,
  areaWidth = 30,
}) {
  return new Promise((resolve, reject) => {
    let points: { x: number; y: number }[] = [];
    checkMapPointNumber(ALL_ZONE_MUN_MAX, extendAreaNum)
      .then(() => {
        if (tempAreaList.length) {
          // 如果有临时区域，以上一个为准来偏移
          const lastTempArea = tempAreaList[tempAreaList.length - 1];
          const [p1, p2, p3, p4] = lastTempArea.points;
          points = [
            { x: p1.x - 10, y: p1.y + 10 },
            { x: p2.x - 10, y: p2.y + 10 },
            { x: p3.x - 10, y: p3.y + 10 },
            { x: p4.x - 10, y: p4.y + 10 },
          ];
        } else if (mapHeight && mapWidth) {
          // 如果有高度和宽度
          const { x: ox, y: oy } = origin;
          const originX = Math.round(mapWidth / 2 - ox);
          const originY = Math.round(mapHeight / 2 - oy);

          points = [
            { x: originX - areaWidth, y: originY - areaWidth },
            { x: originX + areaWidth, y: originY - areaWidth },
            { x: originX + areaWidth, y: originY + areaWidth },
            { x: originX - areaWidth, y: originY + areaWidth },
          ];
        } else {
          const { x: ox, y: oy } = origin;
          const { x: px, y: py } = curPos;
          const originX = px || ox || 0;
          const originY = py || oy || 0;
          points = [
            { x: originX - areaWidth, y: originY - areaWidth },
            { x: originX + areaWidth, y: originY - areaWidth },
            { x: originX + areaWidth, y: originY + areaWidth },
            { x: originX - areaWidth, y: originY + areaWidth },
          ];
        }
        const areaTemp = {
          id: `${areaId}`,
          points,
        };
        const areaZone = getRCTAreaStructure({
          id: `${areaId}`,
          type: nativeMapStatus.virtualArea,
          points,
          bgColor,
          borderColor,
          textColor,
          text: '',
          extend: {
            forbidType: mode,
          },
          canRename: false,
        });

        LaserUIApi.addLaserMapArea({
          mapId,
          area: areaZone,
        }).then(() => resolve({ area: { ...areaTemp, mode, type: nativeMapStatus.virtualArea } }));
      })
      .catch(() => {
        reject();
      });
  });
}

/**
 * 设置地图虚拟墙
 * 虚拟墙   type=4
 */
function setMapVirtualWall({
  extendAreaNum = 0,
  mapId = '',
  areaId = 0,
  origin = {},
  curPos = {},
  tempAreaList = [],
  mode = 'all',
  mapHeight = 0,
  mapWidth = 0,
  bgColor,
  lineWidth = 0.5,
}) {
  // 废弃
  return new Promise((resolve, reject) => {
    let points: { x: number; y: number }[] = [];

    checkMapPointNumber(ALL_ZONE_MUN_MAX, extendAreaNum)
      .then(() => {
        if (tempAreaList.length) {
          // 如果有临时区域，以上一个为准来偏移
          const lastTempArea = tempAreaList[tempAreaList.length - 1];
          const [p1, p2] = lastTempArea.points;
          points = [
            { x: p1.x - 10, y: p1.y + 10 },
            { x: p2.x - 10, y: p2.y + 10 },
          ];
        } else if (mapHeight && mapWidth) {
          // 如果有高度和宽度
          const { x: ox, y: oy } = origin;
          const originX = Math.round(mapWidth / 2 - ox);
          const originY = Math.round(mapHeight / 2 - oy);

          points = [
            { x: originX - 30, y: originY - 30 },
            { x: originX + 30, y: originY - 30 },
          ];
        } else {
          const { x: ox, y: oy } = origin;
          const { x: px, y: py } = curPos;

          const originX = px || ox || 0;
          const originY = py || oy || 0;

          points = [
            { x: originX - 30, y: originY - 30 },
            { x: originX + 30, y: originY - 30 },
          ];
        }
        const areaTemp = {
          id: `${areaId}`,
          points,
        };

        const areaZone = getRCTLineStructure({
          id: `${areaId}`,
          type: nativeMapStatus.virtualWall,
          points, // 只取前两位
          bgColor,
          lineWidth,
          extend: {
            forbidType: mode,
          },
        });

        LaserUIApi.addLaserMapArea({
          mapId,
          area: areaZone,
        }).then(() => resolve({ area: { ...areaTemp, type: nativeMapStatus.virtualWall } }));
      })
      .catch(() => {
        reject();
      });
  });
}

function getNewAreaId(params = {}) {
  // 在原基础上做id自增
  const { RCTAreaList, tempAreaList, type } = params;
  const finalList = [...RCTAreaList, ...tempAreaList];
  const finalIdList = finalList
    .map(area => Number(area.id))
    .sort((pre: number, cur: number) => pre - cur);
  const len = finalIdList.length;
  return len === 0 ? 0 : finalIdList[len - 1] + 1;
  // 临时的框id直接 + 1
  // const tempAreaId =
  //   (tempAreaList.length &&
  //     Number(tempAreaList[tempAreaList.length - 1].id) + 1) ||
  //   null;
  // const areaIds = RCTAreaList.filter(area => {
  //   const { id } = area;
  //   if (!id) return false;
  //   return true;
  // })
  //   .map(area => Number(area.id))
  //   .sort((pre, cur) => pre - cur);
  // let areaId = areaIds[areaIds.length - 1] + 1 || 0;
  // if (areaId === 100) areaId = 101;

  // return tempAreaId || areaId;
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
  if (_isUndefined(posX) || _isUndefined(posY) || _isUndefined(originX) || _isUndefined(originY))
    return false;

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
 * 获取划区清扫框、禁区框
 */
async function getZoneData() {
  const commData = {
    data: {
      sn: TYSdk.devInfo.devId,
      userId: '0',
    },
    infoType: 21004,
    dInfo: { userId: '0', ts: `${new Date().getTime()}` },
  };

  TYSdk.device.putDeviceData({
    [DPCodes.commraw]: stringToAtHex(JSON.stringify(commData)),
    option: 0,
  });

  const expectValue = [
    {
      dpCode: DPCodes.commraw,
      comparator: (value = '') => {
        const { infoType } = NativeUtils.JsonUtils.parseJSON(atHexToString(value)) || {};
        if (infoType === 21004) return true;
        return false;
      },
    },
  ];

  await Utils.FunctionUtils.awaitExpectDpsState(expectValue);
}

/**
 * 禁区框移动时的回调, 检测禁区框是否在充电桩2米内
 *
 * @param {*} pointData
 * @param {*} [opts={ resolution: 1, pilePosition, mapId }]
 * @returns {boolean}
 */
async function isForbiddenZonePointsInPile(
  pointData,
  opts = { resolution: 1, pilePosition: [], mapId: '', origin: [0, 0] }
) {
  if (!pointData || !RobotStatus.mapStatusIsVirtualArea(pointData.type)) return false;

  const { compatible: data = [], origin: originData = [] } = await getMapPointsCompatibleWiltV1({
    mapId: opts.mapId,
  });

  const {
    pilePosition: [px, py],
    resolution,
    origin: [ox, oy],
  } = opts;

  return checkForbidInPos({
    posX: px,
    posY: py,
    originX: ox,
    originY: oy,
    resolution,
    ringRadiusRealMeter: 1,
    curAreaData: data,
  });

  // if (pilePosition.length) {
  //   // 如果有充电桩的时候才检查是否和充电桩重叠
  //   const [px, py] = pilePosition;

  //   const isInCircle = data.some(item => {
  //     return circleIntersectRect(
  //       {
  //         x: px + ox,
  //         y: py + oy,
  //         radius: 1 / resolution, // 半径=真实米数/比例尺
  //       },
  //       item
  //     );
  //   });
  //   return isInCircle;
  // }
  // return false;
}

/**
 * 禁区框移动时，检测是否覆盖当前点
 */
async function isForbiddenZonePointsInCurPos(
  pointData,
  opts = { resolution: 0.05, curPos: {}, origin: [0, 0], mapId: '' }
) {
  const {
    curPos: { x: px, y: py },
    resolution,
    origin: [ox, oy],
  } = opts;

  if (
    px === undefined ||
    py === undefined ||
    !pointData ||
    !RobotStatus.mapStatusIsVirtualArea(pointData.type)
  )
    return false;

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

  // if (isInCircle) return true;
  // return false;
}

/**
  获取坐标点数据（兼容老接口数据结构）
 */
async function getMapPointsCompatibleWiltV1(opts = {}) {
  const { mapId } = opts;
  const { data = [] } = await LaserUIApi.getLaserMapPointsInfo({ mapId });

  if (mapId) {
    const points = data.map(item => item.points);
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

export default {
  setMapCleanZone,
  setMapForbiddenZone,
  setMapVirtualWall,

  getNewAreaId,
  getZoneData,

  isForbiddenZonePointsInPile,
  isForbiddenZonePointsInCurPos,
};
