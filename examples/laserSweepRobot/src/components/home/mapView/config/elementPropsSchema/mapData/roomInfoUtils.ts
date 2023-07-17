/* eslint-disable camelcase */
/* eslint-disable radix */
import _ from 'lodash';
import { bitmapTypeMapV2 } from 'protocol/constant';

// roomInfo配置
export const getRoomProperty = (
  params: {
    name?: string;
    water_level?: string;
    fan?: string;
    sweep_count?: string;
  },
  UIConfig: { isCustomizeMode: boolean },
  mapConfig: any,
  staticPrefix: string,
) => {
  const { nameConfig, attributesConfig } = mapConfig;
  const { isCustomizeMode } = UIConfig;

  // 后台配置信息，可控制名称和配置信息的显示
  const { partitionNameShow } = nameConfig;
  const { attributesFan, attributesTimes, attributesWater } = attributesConfig;
  const { attributesFanShow, attributesFanIconEnum = [] } = attributesFan;
  const { attributesTimesShow } = attributesTimes;
  const { attributesWaterShow, attributesWaterIconEnum = [] } = attributesWater;
  const roomProperty = [];
  // 名称text
  if (params.name && partitionNameShow) {
    roomProperty.push({
      propertyType: 'text',
      value: params.name,
    });
  }
  if (!isCustomizeMode && !_.isUndefined(isCustomizeMode)) return roomProperty;
  // 水量和吸力image
  const iconPro = [];
  const { water_level, fan, sweep_count } = params;

  if (attributesWaterShow) {
    const icon =
      !!water_level && attributesWaterIconEnum[+water_level]
        ? attributesWaterIconEnum[+water_level]
        : null;
    iconPro.push({ value: water_level, icon: staticPrefix + icon });
  }

  if (attributesFanShow) {
    const icon = !!fan && attributesFanIconEnum[+fan] ? attributesFanIconEnum[+fan] : null;
    iconPro.push({ value: fan, icon: staticPrefix + icon });
  }
  const iconRes = iconPro
    .filter(({ value, icon }) => !!icon || (!_.isUndefined(value) && +value < 5))
    .map(({ value, icon }) => {
      return {
        propertyType: 'uri',
        value: icon,
      };
    });

  if (iconRes.length > 0) {
    roomProperty.push(...iconRes);
  }
  if (
    attributesTimesShow &&
    sweep_count &&
    !!parseInt(sweep_count) &&
    parseInt(sweep_count) < 255
  ) {
    roomProperty.push({
      propertyType: 'text',
      value: ` ×${sweep_count}`,
    });
  }
  return roomProperty;
};

export const getCurData = (
  pre: { [x: string]: string },
  custom: { [x: string]: string },
  cur: { [x: string]: string },
  key: string
) => {
  let res: number | string;
  if (pre && pre[key]) {
    res = pre[key];
  } else if (custom && custom[key]) {
    res = custom[key];
  } else {
    res = cur[key];
  }
  return res;
};

/**
 * 获取当前的房间清扫顺序
 * @param selectRoomData
 */
export const getCurOrder = (room: any, selectRoomData: string[]) => {
  let posIndex = 0;
  for (let i = 0; i < selectRoomData.length; i++) {
    const hexBit = _.padStart(parseInt(selectRoomData[i], 16).toString(2), 8, '0');
    const tempRoomId = parseInt(hexBit.slice(0, 5), 2);
    if (room.roomId === tempRoomId) {
      posIndex = i;
      break;
    }
  }
  return posIndex;
};

/**
 * 过滤具有相同房间ID的信息
 */
export const filterCorrectRoomInfo = (selectRoomData: string[]) => {
  if (!selectRoomData) return [];
  const temp = [...selectRoomData];
  const result: string[] = [];
  temp.forEach(item => {
    let flag = false;
    const hexbit1 = _.padStart(parseInt(item, 16).toString(2), 8, '0');
    const roomId1 = parseInt(hexbit1.slice(0, 5), 2);
    result.forEach(value => {
      const hexbit2 = _.padStart(parseInt(value, 16).toString(2), 8, '0');
      const roomId2 = parseInt(hexbit2.slice(0, 5), 2);
      if (roomId1 === roomId2) {
        flag = true;
      }
    });
    if (!flag) {
      result.push(item);
    }
  });
  return result;
};

/**
 * 添加相同房间roomId的信息
 * @param formatRoomInfo
 * @param selectRoomData
 * @returns
 */
export const addCorrectRoomInfo = (formatRoomInfo: any, selectRoomData: string[]) => {
  if (!selectRoomData) return [];
  const tempArr: string[] = [];
  selectRoomData.forEach((item: string) => {
    const selectHexBit = _.padStart(parseInt(item, 16).toString(2), 8, '0');
    const selectRoomId = parseInt(selectHexBit.slice(0, 5), 2);
    formatRoomInfo &&
      Object.keys(formatRoomInfo).forEach((key: string) => {
        const hexBit = _.padStart(parseInt(key, 16).toString(2), 8, '0');
        const pointInfo = hexBit.slice(5);
        const formatRoomId = parseInt(hexBit.slice(0, 5), 2);
        if (
          formatRoomId === selectRoomId &&
          (pointInfo === bitmapTypeMapV2.sweep || pointInfo === bitmapTypeMapV2.carpet)
        ) {
          tempArr.push(key);
        }
      });
  });
  return tempArr;
};


export const sortRoomInfo = (roomInfo: any) => {
  const sortedRoomInfo: any = {};

  roomInfo &&
    Object.keys(roomInfo).forEach((key: string) => {
      if (_.has(roomInfo[key], 'roomId')) {
        sortedRoomInfo[`0A@@${key}`] = roomInfo[key];
      }
    });
  roomInfo &&
    Object.keys(roomInfo).forEach((key: string) => {
      if (!_.has(roomInfo[key], 'roomId')) {
        sortedRoomInfo[`${key}`] = roomInfo[key];
      }
    });
  return sortedRoomInfo;
};
