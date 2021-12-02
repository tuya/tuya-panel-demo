/* eslint-disable radix */
import _ from 'lodash';
import { Interface } from '../../../resourceManager';

import { IStore, IProps } from '../../interface';
import { getCurData, getRoomProperty } from './roomInfoUtils';
import { hex2ahex } from '../../../../../../utils';
import {
  houseGrayColorMap,
  bitmapTypeMap,
  dealPointsColor,
  unknownAreaId,
  materialObjMap,
} from '../../../../../../protocol/constant';

// mapData Props生成规则
const format = (store: IStore, configs: IProps) => {
  const { mapData, mapHeader, materialObjData } = store;
  const {
    uiInterFace = { isCustomizeMode: false, isSelectRoom: false },
    laserMapPanelConfig,
    // 房间属性定制信息
    preCustomConfig,
    customConfig,
    selectRoomData,
    foldableRoomIds = [],
  } = configs;

  // 地图配置
  const {
    materialObjConfig,
    mapPartitionConfig: {
      partitionColorShow, // 是否展示分区颜色
    },
  } = laserMapPanelConfig;

  const { isSelectRoom } = uiInterFace;
  // const getMapData = (data: ImapData) => {
  if (!mapData) {
    return {};
  }
  const { roomInfo, map, roomIdColorMap } = mapData;

  // 如果是字符串，转化为对象
  let formatRoomInfo = {};
  let formatIdColorMap = {};
  if (typeof roomInfo === 'string') {
    formatRoomInfo = JSON.parse(roomInfo);
    formatIdColorMap = JSON.parse(roomIdColorMap);
  }
  const curRoomInfo = {};
  const curIdColorMap = {};
  formatRoomInfo &&
    Object.keys(formatRoomInfo).forEach(key => {
      const customRoom = customConfig ? customConfig[key] : null;
      const room = formatRoomInfo[key];
      const preRoom = preCustomConfig ? preCustomConfig[key] : null;
      const curName: string = getCurData(preRoom, customRoom, room, 'name');
      const curWater: string = getCurData(preRoom, customRoom, room, 'water_level');
      const curFan: string = getCurData(preRoom, customRoom, room, 'fan');
      const curSweepCount: string = getCurData(preRoom, customRoom, room, 'sweep_count');
      const curOrder: string = getCurData(preRoom, customRoom, room, 'order');
      const roomProperty = getRoomProperty(
        {
          name: curName,
          water_level: curWater,
          fan: curFan,
          sweep_count: curSweepCount,
        },
        uiInterFace,
        laserMapPanelConfig
      );

      let isSelected = false;
      let norColor: string = room.normalColor;

      /**
       * 通过key(十六进制)解析出roomId，过滤，只保留有效数据
       */
      const point_2 = _.padStart(parseInt(key, 16).toString(2), 8, '0');
      const pointInfo = point_2.slice(6);
      const color = dealPointsColor(pointInfo);
      const roomId = parseInt(point_2.slice(0, 6), 2);

      if (isSelectRoom) {
        isSelected = selectRoomData.includes(key);
        if (pointInfo === bitmapTypeMap.sweep) {
          norColor = isSelected ? room.normalColor : hex2ahex(houseGrayColorMap.get(roomId));
        } else {
          norColor = color;
        }
      }
      // 如果地图配置不显示颜色，则所有房间置灰
      if (!partitionColorShow) {
        norColor = hex2ahex(houseGrayColorMap.get(roomId));
      }

      if (unknownAreaId.includes(roomId) || roomId <= 32) {
        curIdColorMap[key] = norColor;
        curRoomInfo[key] = {
          defaultOrder: parseInt(curOrder) > 31 ? 0 : curOrder,
          normalColor: norColor,
          highlightColor: room.highlightColor,
          roomProperty,
          extend: JSON.stringify(room),
        };
      }
    });

  // AI物体识别
  const {
    materialObjAvaiable,
    materialObjWidth,
    materialObjHeight,
    materialObjEnum,
  } = materialObjConfig;

  let materialObject = {};
  if (materialObjAvaiable && materialObjData) {
    const materialMaps = {};
    Object.entries(materialObjMap).forEach(([key, value]) => {
      materialMaps[value] = {
        uri: materialObjEnum[Number(key)],
        width: materialObjWidth,
        height: materialObjHeight,
      };
    });
    const materials = materialObjData.map(
      (itm: { x: number; y: number; type: number }, index: number) => ({
        id: `materialObjData${index}`,
        type: materialObjMap[itm.type],
        x: itm.x,
        y: itm.y,
        extends: JSON.stringify(itm),
      })
    );
    materialObject = {
      materialMaps,
      materials,
    };
  }

  const { version } = mapHeader;
  const { data, width, height, origin } = mapData;
  if (version) {
    return {
      width,
      height,
      map,
      origin,
      roomIdColorMap: JSON.stringify(curIdColorMap),
      roomInfo: JSON.stringify(curRoomInfo),
      pointCount: map.length / 2,
      flipOrientation: 0,
      materialObject: JSON.stringify(materialObject),
    };
  }

  return {
    data,
    width,
    height,
    origin,
  };
};

const validate = (value: any) => {
  return !!value;
};

const mapData: Interface.IElementProps = {
  format,
  validate,
};

export default mapData;
