import _ from 'lodash';
import { areaTypeMap, ForbidTypeEnum, nativeMapStatus } from '../constant';
import { transformXY } from '../utils';
import CustomError from '../utils/customErrorUtil';
import PressCoordinateUtils from '../utils/pressCoordinateUtil';

interface IAreaData {
  appointData?: any[];
  sweepRegionData?: any[];
  virtualAreaData?: any[];
  virtualWallData?: any[];
  sweepRegionDataV2?: any[];
  virtualAreaDataV2?: any[];
  virtualMopAreaData?: any[];
  materialObjData?: any[];
}

function toFixed(d: string) {
  return parseInt(d, 16);
}

/**
 * 拆解指令码
 * @param {string} str 指令码
 * @returns {object} 具有含义的指令码键值对
 */
function splitCommonData(str: string): IAreaData {
  const commonArr = str.match(/\w{2}/g);
  if (!commonArr) return {};

  const dataSource = commonArr.map(d => parseInt(d, 16));
  const { length: dataLength } = dataSource;
  let header, version, length, cmd, data, check, one, endIdx, startIdx;
  const datas = {};
  const nameToCmdMap = {
    appointData: toFixed('17'),
    sweepRegionData: toFixed('11'),
    virtualAreaData: toFixed('19'),
    virtualWallData: toFixed('13'),

    sweepRegionDataV2: toFixed('29'), // V1.1.0新协议划区清扫
    virtualAreaDataV2: toFixed('1b'), // V1.1.0新协议禁区
    materialObjData: toFixed('37'), // AI物体
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

const parseDataOfType = (
  type: string,
  dataArr: _.List<unknown> | null | undefined,
  mapScale: number
) => {
  const data: any[] = [];
  if (type === areaTypeMap.appoint) {
    _.chunk(dataArr, 4).forEach((d: Array<number>) => {
      const x = transformXY(mapScale, d[0], d[1]);
      const y = -transformXY(mapScale, d[2], d[3]);
      data.push({ x, y });
    });
  } else if (type === areaTypeMap.virtualWall) {
    _.chunk(dataArr, 8).forEach(d => {
      const itemData: { x: number; y: number }[] = [];
      _.chunk(d, 4).forEach((k: Array<number>) => {
        const x = transformXY(mapScale, k[0], k[1]);
        const y = -transformXY(mapScale, k[2], k[3]);
        itemData.push({ x, y });
      });
      data.push(itemData);
    });
  } else {
    _.chunk(dataArr, 16).forEach(d => {
      const itemData: { x: number; y: number }[] = [];
      _.chunk(d, 4).forEach((k: Array<number>) => {
        const x = transformXY(mapScale, k[0], k[1]);
        const y = -transformXY(mapScale, k[2], k[3]);
        itemData.push({ x, y });
      });
      data.push(itemData);
    });
  }
  return data;
};

/**
 * 划区清扫V1.1.0
 * @param type
 * @param dataArr
 * @param mapScale
 */
const parseDataOfTypeV2 = (type: string, dataArr: [], mapScale: number) => {
  const data: any[][] = [];
  if (type === areaTypeMap.sweepRegion) {
    if (dataArr.length % 17 !== 0) {
      return [];
    }

    _.chunk(dataArr, 17).forEach(d => {
      const itemData: { x: number; y: number }[] = [];
      _.chunk(d.splice(1, 16), 4).forEach(k => {
        const x = transformXY(mapScale, k[0], k[1]);
        const y = -transformXY(mapScale, k[2], k[3]);
        itemData.push({ x, y });
      });
      data.push(itemData);
    });
  }
  return data;
};

const parseDataOfTypeV3 = (dataArr: [], mapScale: number) => {
  if (dataArr.length % 18 !== 0) {
    return [];
  }

  const mopData: any[][] = [];
  const sweepData: any[][] = [];
  _.chunk(dataArr, 18).forEach(d => {
    if (d[0] === 0 || d[0] === 1) {
      const itemData: { x: number; y: number }[] = [];
      _.chunk(d.splice(2, 16), 4).forEach((k: Array<number>) => {
        const x = transformXY(mapScale, k[0], k[1]);
        const y = -transformXY(mapScale, k[2], k[3]);
        itemData.push({ x, y });
      });
      sweepData.push(itemData);
    } else {
      const itemData: { x: number; y: number }[] = [];
      _.chunk(d.splice(2, 16), 4).forEach((k: Array<number>) => {
        const x = transformXY(mapScale, k[0], k[1]);
        const y = -transformXY(mapScale, k[2], k[3]);
        itemData.push({ x, y });
      });
      mopData.push(itemData);
    }
  });
  return {
    mopData,
    sweepData,
  };
};

/**
 * 解析AI物体
 * @param dataArr
 * @param mapScale
 */
const parseMaterialObj = (dataArr: Array<number>, mapScale: number) => {
  if (dataArr.length % 5 !== 0) {
    return [];
  }

  const data: { x: number; y: number; type: number }[] = [];
  _.chunk(dataArr, 5).forEach(d => {
    const x = transformXY(mapScale, d[0], d[1]);
    const y = -transformXY(mapScale, d[2], d[3]);
    const type = d[4];
    data.push({ x, y, type });
  });
  return data;
};

// 地图控制相关数据解析
function decode(str: string, mapScale = 1) {
  const {
    appointData: hexDataAppoint,
    sweepRegionData: hexDataSweepRegion,
    virtualAreaData: hexDataVrArea,
    virtualWallData: hexDataVrWall,
    sweepRegionDataV2: hexDataSweepRegionV2, // V1.1.0新协议划区清扫
    virtualAreaDataV2: hexDataVrAreaV2,
    materialObjData: hexMaterialObj,
  } = splitCommonData(str);
  const result = {};
  if (hexDataAppoint) {
    const appointData = parseDataOfType(
      areaTypeMap.appoint,
      hexDataAppoint.splice(4, hexDataAppoint.length - 5),
      mapScale
    );
    Object.assign(result, { appointData });
  }
  if (!hexDataAppoint) {
    Object.assign(result, { appointData: [] });
  }
  if (hexDataSweepRegion) {
    const sweepRegionData = parseDataOfType(
      areaTypeMap.sweepRegion,
      hexDataSweepRegion.splice(5, hexDataSweepRegion.length - 6),
      mapScale
    );
    Object.assign(result, { sweepRegionData });
  }
  if (hexDataVrArea) {
    const virtualAreaData = parseDataOfType(
      areaTypeMap.virtualArea,
      hexDataVrArea.splice(5, hexDataVrArea.length - 6),
      mapScale
    );
    Object.assign(result, { virtualAreaData });
  }
  if (hexDataVrWall) {
    const virtualWallData = parseDataOfType(
      areaTypeMap.virtualWall,
      hexDataVrWall.splice(5, hexDataVrWall.length - 6),
      mapScale
    );
    Object.assign(result, { virtualWallData });
  }

  // V1.1.0新协议划区清扫
  if (hexDataSweepRegionV2) {
    const sweepRegionData = parseDataOfTypeV2(
      areaTypeMap.sweepRegion,
      hexDataSweepRegionV2.splice(6, hexDataSweepRegionV2.length - 7),
      mapScale
    );
    Object.assign(result, { sweepRegionData });
  }
  // V1.1.0新协议禁区
  if (hexDataVrAreaV2) {
    const res: any = parseDataOfTypeV3(
      hexDataVrAreaV2.splice(5, hexDataVrAreaV2.length - 6),
      mapScale
    );
    const { mopData, sweepData } = res;
    Object.assign(result, { virtualAreaData: sweepData, virtualMopAreaData: mopData });
  }
  if (hexMaterialObj) {
    const materialObjData = parseMaterialObj(
      hexMaterialObj.splice(5, hexMaterialObj.length - 6),
      mapScale
    );
    Object.assign(result, { materialObjData });
  }

  return result;
}

// 获取禁区id
function getNewAreaId(params: any = {}) {
  // 在原基础上做id自增
  const { preList, curList, index } = params;
  const list = preList.concat(curList);
  const idList = list.map(item => +item.id);
  const sortList = idList.sort((a: number, b: number) => a - b);

  if (sortList.length) {
    return String(sortList[sortList.length - 1] + index + 1);
  }

  return String(index + 1);
}

/** 解析为APP使用的绘图2.0数据结构 */
export function decodeToRCTArea(
  area: any[],
  preList: [],
  curList: [],
  opt: {
    forbidType: ForbidTypeEnum;
    bgColor?: string;
    borderColor?: string;
    textColor?: string;
    textSize?: number;
  } = { forbidType: ForbidTypeEnum.sweep }
) {
  const ZoneData: any = [];
  if (!area.length) return [];
  const { forbidType, bgColor, borderColor, textColor = '#fffff', textSize = 12 } = opt;
  try {
    area.forEach((item, index) => {
      const exit = preList.find(
        (i: { points: any }) => JSON.stringify(i.points) === JSON.stringify(item)
      );
      if (exit) {
        ZoneData.push(exit);
      } else {
        const areaId = getNewAreaId({
          preList,
          curList,
          index,
        });
        ZoneData.push(
          PressCoordinateUtils.getRCTAreaStructure({
            id: areaId,
            bgColor,
            borderColor,
            textColor,
            textSize,
            type: nativeMapStatus.virtualArea,
            points: item,
            canRename: false, // 暂时不支持显示名称
            text: '', // 暂时不支持显示名称
            extend: {
              forbidType,
            },
          })
        );
      }
    });
  } catch (error) {
    new CustomError(error, 'system');
  }
  return ZoneData;
}

/** 解析为APP使用的绘图2.0数据结构,虚拟墙 */
export function decodeToRCTWall(
  area: any[],
  preList: [],
  curList: [],
  opt: {
    forbidType: ForbidTypeEnum;
    bgColor?: string;
    lineWidth?: number;
    textColor?: string;
    textSize?: number;
  } = { forbidType: ForbidTypeEnum.sweep }
) {
  const WallData: any = [];
  if (!area.length) return [];
  const { forbidType, bgColor, lineWidth, textColor = '#ffffff', textSize = 12 } = opt;
  area.forEach((item: any, index: number) => {
    try {
      const exit = preList.find(
        (i: { points: any }) => JSON.stringify(i.points) === JSON.stringify(item)
      );
      if (exit) {
        WallData.push(exit);
      } else {
        const areaId = getNewAreaId({
          preList,
          curList,
          index,
        });
        WallData.push(
          PressCoordinateUtils.getRCTLineStructure({
            id: areaId,
            bgColor,
            // textColor,
            // textSize,
            type: nativeMapStatus.virtualWall,
            points: item,
            lineWidth,
            // canRename: false,
            extend: {
              forbidType,
            },
          })
        );
      }
    } catch (error) {
      new CustomError(error, 'system');
    }
  });
  return WallData;
}
/**
 * 解析为APP使用的绘图2.0数据结构，定点清扫
 * @param area
 * @param opt
 */
export function decodeToRCTPoint(
  area: { x?: number; y?: number },
  preList: Array<{ points: any }>,
  curList: []
) {
  if (!area) return [];
  const firstPoint: { x: number; y: number } = area[0];
  const exit = preList.find(i => JSON.stringify(i.points) === JSON.stringify(firstPoint));
  if (exit) {
    return exit;
  }

  const areaId = getNewAreaId({
    preList,
    curList,
    index: 0,
  });
  const point = PressCoordinateUtils.getRCTPointStructure({
    id: areaId,
    type: nativeMapStatus.pressToRun,
    points: firstPoint,
  });
  return point;
}

// 解析为APP使用的绘图2.0数据结构，划区清扫
export function decodeToRCTCleanArea(
  area: any[],
  preList: [],
  curList: [],
  opt: {
    bgColor?: string;
    borderColor?: string;
    textColor?: string;
    textSize?: number;
  } = {}
) {
  const ZoneData: any = [];
  if (!area.length) return [];
  area.forEach((item, index) => {
    try {
      const { bgColor, borderColor, textColor = '#ffffff', textSize = 12 } = opt;
      const exit = preList.find(
        (i: { points: any }) => JSON.stringify(i.points) === JSON.stringify(item)
      );
      if (exit) {
        ZoneData.push(exit);
      } else {
        const areaId = getNewAreaId({
          preList,
          curList,
          index,
        });
        ZoneData.push(
          PressCoordinateUtils.getRCTAreaStructure({
            id: areaId,
            bgColor,
            borderColor,
            text: '',
            textColor,
            textSize,
            type: nativeMapStatus.areaSet,
            points: item,
            canRename: false,
          })
        );
      }
    } catch (error) {
      new CustomError(error, 'system');
    }
  });
  return ZoneData;
}

export default {
  decode,
};
