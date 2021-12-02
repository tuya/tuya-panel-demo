import { NativeModules } from 'react-native';
import { Utils } from 'tuya-panel-kit';
import _ from 'lodash';

const TYLaserManager = NativeModules.TYRCTLaserManager;
const { TYRCTTypeMapManager } = NativeModules; // 激光地图区域框新接口

const isHasTYRCTTypeMapManager = () => {
  return !_.isUndefined(TYRCTTypeMapManager);
};
/** 激光UI组件接口 */

export interface ILaserMapOpts {
  mapId: string;
}
export enum mapSplitStateEnum {
  normal = 0,
  rest = 1,
  merge = 2,
  split = 3,
  click = 4, // 点击
}

export enum nativeMapStatusEnum {
  normal = 0, // 正常
  pressToRun = 1, // 指拿扫哪
  areaSet = 2, // 划区清扫
  virtualArea = 3, // 虚拟框
  virtualWall = 4, // 虚拟墙
  mapSplit = 5, // 地图分区
  mapSelect = 6, // 地图区块选择
}

enum viewTypeEnum {
  edit = 'edit',
  active = 'active',
}

export interface ILaserMapArea {
  id: string;
  line: {
    bgColor: string;
    lineWidth: number;
  };
  box: {
    bgColor: string;
    borderColor: string;
  };
  content: {
    text: string;
    textColor: string;
    textSize: number;
  };
  type: number;
  viewType: viewTypeEnum;
  points:
  | [
    { x: number; y: number },
    { x: number; y: number },
    { x: number; y: number },
    { x: number; y: number }
  ]
  | { x: number; y: number };
  extend: string;
}

export interface ILaserMapStateAndEditOpts extends ILaserMapOpts {
  state: number;
  edit: boolean;
}

export interface ILaserMapAddAreaOpts extends ILaserMapOpts {
  area: ILaserMapArea;
}

export interface ILaserMapRemoveAreaOpts extends ILaserMapOpts {
  areaIds: string[];
}

export interface ISetLaserMapSplitOpts extends ILaserMapOpts {
  state: mapSplitStateEnum;
}

async function refreshLaserMapStateView(opts: ILaserMapOpts) {
  if (!!opts.mapId && isHasTYRCTTypeMapManager)
    return TYRCTTypeMapManager.refreshStateViewWithMapId(opts.mapId);
  return TYLaserManager.refreshStateView();
}

/**
 * 设置当前地图状态
 */
function setLaserMapStateAndEdit(opts: ILaserMapStateAndEditOpts) {
  const { mapId, state, edit } = opts;
  return new Promise<void>((resolve, reject) => {
    const success = () => {
      resolve();
    };
    if (!!mapId && isHasTYRCTTypeMapManager) {
      TYRCTTypeMapManager.setMapStateAndEdit(mapId, state, edit, success);
    } else {
      TYLaserManager.setLaserMapState(state, success);
    }
  });
}

function addLaserMapArea(opts: ILaserMapAddAreaOpts) {
  const { mapId, area } = opts;
  return new Promise<void>((resolve, reject) => {
    if (_.isArray(area)) {
      // addAreaList接口已废弃，也不需要向下兼容
      resolve();
    }
    if (!!mapId && isHasTYRCTTypeMapManager) {
      const areaJson = JSON.stringify(area);
      TYRCTTypeMapManager.addArea(mapId, areaJson, resolve, reject);
    } else {
      TYLaserManager.addLaserMapRectWithType(area.type);
      resolve();
    }
  });
}

export interface IPonitsRes {
  type: number;
  data:
  | ILaserMapArea[]
  | [
    { x: number; y: number },
    { x: number; y: number },
    { x: number; y: number },
    { x: number; y: number } | { x: number; y: number }
  ][];
}
function getLaserMapPointsInfo(opts: ILaserMapOpts): Promise<any> {
  const { mapId } = opts;
  return new Promise((resolve, reject) => {
    if (!!mapId && isHasTYRCTTypeMapManager) {
      TYRCTTypeMapManager.getMapPointsInfo(mapId, (value: { data?: IPonitsRes; type: number }) => {
        if (_.isArray(value.data)) {
          const newValue = value.data.map(item => {
            // 把extend字符串统一处理为对象
            const extend = Utils.JsonUtils.parseJSON(item.extend);
            if (_.isString(extend))
              return {
                ...item,
                extend: {},
              };
            return {
              ...item,
              extend,
            };
          });
          resolve({ data: newValue, type: value.type });
          return;
        }
        if (_.isUndefined(value.data)) {
          // 在安卓下如果没有区域，没有data这个字段返回
          resolve({ data: [], type: value.type });
          return;
        }
        resolve(value);
      });
    } else {
      TYLaserManager.getLaserMapPoints(resolve);
    }
  });
}

function removeLaserMapPoints(opts: ILaserMapRemoveAreaOpts) {
  const { mapId, areaIds = [] } = opts;
  return new Promise((resolve, reject) => {
    if (!!mapId && isHasTYRCTTypeMapManager) {
      const areaIdsJson = JSON.stringify(areaIds);
      TYRCTTypeMapManager.removeAreaList(mapId, areaIdsJson, resolve, reject);
    } else {
      reject();
    }
  });
}

function updateLaserMapAreaInfo(opts: ILaserMapAddAreaOpts) {
  const { mapId, area } = opts;
  return new Promise((resolve, reject) => {
    if (!!mapId && isHasTYRCTTypeMapManager) {
      if (_.isArray(area)) {
        // 目前不支持多框update
        reject();
      }
      const areaJson = JSON.stringify(area);
      TYRCTTypeMapManager.updateAreaInfo(mapId, areaJson, resolve, reject);
    } else {
      reject();
    }
  });
}

function getLaserMapSplitPoint(opts: ILaserMapOpts) {
  return new Promise((resolve, reject) => {
    const { mapId } = opts;
    TYRCTTypeMapManager.getMapSplitPointWithMapId(mapId, resolve);
  });
}

function setLaserMapSplitType(opts: ISetLaserMapSplitOpts) {
  return new Promise((resolve, reject) => {
    const { mapId, state } = opts;
    TYRCTTypeMapManager.setMapSplitTypeWithMapId(mapId, state, resolve, reject);
  });
}

// ------1.0接口

/**
 * 刷新编辑的数据
 */
async function clearArea() {
  return TYLaserManager.refreshStateView();
}

/**
 * 设置当前地图状态
 */

function setLaserMapState(status: number, callback) {
  TYLaserManager.setLaserMapState(status, callback);
}

/**
 * 在地图上添加组件
 */
function addLaserMapRectWithType(type: number) {
  TYLaserManager.addLaserMapRectWithType(type);
}

/**
 * 获取坐标点
 */
function getLaserMapPoints() {
  return new Promise(resolve => TYLaserManager.getLaserMapPoints(resolve));
}

export default {
  mapSplitStateEnum,
  getLaserMapSplitPoint,
  setLaserMapSplitType,
  refreshLaserMapStateView,
  setLaserMapStateAndEdit,
  addLaserMapArea,
  getLaserMapPointsInfo,
  updateLaserMapAreaInfo,
  removeLaserMapPoints,

  clearArea,
  setLaserMapState,
  addLaserMapRectWithType,
  getLaserMapPoints,
};
