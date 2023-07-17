/* eslint-disable radix */
import _ from 'lodash';
import { hex2ahex } from 'protocol/utils/robotUtil';
import { Interface } from '../../../resourceManager';

import { IStore, IProps } from '../../interface';
import {
  addCorrectRoomInfo,
  filterCorrectRoomInfo,
  getCurData,
  getCurOrder,
  getRoomProperty,
} from './roomInfoUtils';
import {
  bitmapTypeMap,
  unknownAreaId,
  materialObjMap,
  unknownAreaIdV2,
  bitmapTypeMapV2,
  dealPointsColorV2,
  dealPointsColor,
} from '../../../../../../protocol/constant';
import Strings from '../../../../../../i18n';
import { Base64Str } from '../../../resourceManager/utils/base64-min-str';
import { unCompressFuncStr } from '../../../resourceManager/utils/uncompress-min-str';
import {
  hexStringToNumberFuncStr,
  padStartFuncStr,
} from '../../../resourceManager/utils/utils-min-str';

// mapData Props生成规则
const format = (store: IStore, configs: IProps) => {
  const { dataMapId, mapData, mapHeader, materialObjData, staticPrefix } = store;

  const {
    uiInterFace = { isCustomizeMode: true, isSelectRoom: false, isFoldable: false },
    laserMapPanelConfig,
    // 房间属性定制信息
    preCustomConfig,
    customConfig,
    selectRoomData,
    foldableRoomIds = [],
    fontColor = '#000000',
  } = configs;
  // 地图配置
  const {
    materialObjConfig,
    mapConfig: {
      mapColor: { cleaningColor, obstacleColor, unknownColor },
    },
  } = laserMapPanelConfig;

  const { isSelectRoom, isFoldable } = uiInterFace;
  if (!mapData) {
    return {};
  }
  const { roomInfo, map } = mapData;
  const { version } = mapHeader;

  // 如果是字符串，转化为对象
  let formatRoomInfo = {};
  if (typeof roomInfo === 'string') {
    formatRoomInfo = JSON.parse(roomInfo);
  }
  const curRoomInfo = {};
  formatRoomInfo &&
    Object.keys(formatRoomInfo).forEach(key => {
      const customRoom = customConfig ? customConfig[key] : null;
      const room = formatRoomInfo[key];
      const preRoom = preCustomConfig ? preCustomConfig[key] : null;
      const curName: string = getCurData(preRoom, customRoom, room, 'name');
      const curWater: string = getCurData(preRoom, customRoom, room, 'water_level');
      const curFan: string = getCurData(preRoom, customRoom, room, 'fan');
      const curSweepCount: string = getCurData(preRoom, customRoom, room, 'sweep_count');
      let curOrder: string = getCurData(preRoom, customRoom, room, 'order') || 0;

      const curProperties = {
        // name: curName,
        water_level: curWater,
        fan: curFan,
        sweep_count: curSweepCount,
      };
      const roomProperty = getRoomProperty(
        curProperties,
        uiInterFace,
        laserMapPanelConfig,
        staticPrefix
      );

      let isSelected = false;

      let point_2 = '';
      let pointInfo = '';
      let color = '';
      let roomId = 0;

      if (version !== 2) {
        /**
         * 通过key(十六进制)解析出roomId，过滤，只保留有效数据
         */
        point_2 = _.padStart(parseInt(key, 16).toString(2), 8, '0');
        pointInfo = point_2.slice(6);
        color = dealPointsColor(pointInfo, cleaningColor, obstacleColor, unknownColor);
        roomId = parseInt(point_2.slice(0, 6), 2);

        if (isSelectRoom) {
          isSelected = selectRoomData.includes(key);
          if (pointInfo === bitmapTypeMap.sweep) {
            curOrder = isSelected ? selectRoomData.indexOf(key) + 1 : 0;
          }
        }

        if (unknownAreaId.includes(roomId) || roomId <= 32) {
          curRoomInfo[key] = {
            defaultOrder: parseInt(curOrder) > 31 ? 0 : curOrder,
            normalColor: room.normalColor,
            highlightColor: room.highlightColor,
            roomProperty,
            isFoldable:
              isFoldable ||
              foldableRoomIds.includes(key) ||
              (isSelectRoom && selectRoomData.includes(key)), // 设置为true时 展示属性图层
            name:
              pointInfo === bitmapTypeMap.sweep && roomId <= 32
                ? curName || Strings.getLang('defaultRoomName')
                : '',
            pixelType: room.pixelType,
            extend: JSON.stringify({ ...room, ...curProperties }),
            roomPropertyStyle: isFoldable ? 'foldable' : '',
            roomPropertyTextColor: hex2ahex('#ffffff'),
            roomPropertyBgColor: hex2ahex('#225344', 0.5),
            roomNameTextColor: hex2ahex(fontColor),
          };
        }
      } else {
        const correctRoomInfo = addCorrectRoomInfo(formatRoomInfo, selectRoomData);
        const selectedCorrectRoom = filterCorrectRoomInfo(correctRoomInfo);
        const correctfoldableRoomIds = addCorrectRoomInfo(formatRoomInfo, foldableRoomIds);
        const selectFoldableRoomIds = filterCorrectRoomInfo(correctfoldableRoomIds);
        point_2 = _.padStart(parseInt(key, 16).toString(2), 8, '0');
        pointInfo = point_2.slice(5);
        color = dealPointsColorV2(pointInfo, cleaningColor, obstacleColor, unknownColor);
        roomId = parseInt(point_2.slice(0, 5), 2);

        if (isSelectRoom) {
          isSelected = selectedCorrectRoom.includes(key);
          const posIndex = getCurOrder(room, selectRoomData);
          if (pointInfo === bitmapTypeMapV2.sweep || pointInfo === bitmapTypeMapV2.carpet) {
            curOrder = isSelected ? posIndex + 1 : 0;
          }
        }

        if (unknownAreaIdV2.includes(roomId) || roomId <= 27) {
          curRoomInfo[key] = {
            defaultOrder: parseInt(curOrder, 10) <= 26 ? curOrder : 0,
            normalColor: room.normalColor,
            highlightColor: room.highlightColor,
            pixelType: room.pixelType,
            roomProperty,
            name:
              pointInfo === bitmapTypeMapV2.sweep && roomId <= 27
                ? curName || Strings.getLang('defaultRoomName')
                : '',
            isFoldable:
              isFoldable ||
              selectFoldableRoomIds.includes(key) ||
              (isSelectRoom && selectedCorrectRoom.includes(key)),
            extend: JSON.stringify({ ...room, ...curProperties }),
            roomPropertyStyle: isFoldable ? 'foldable' : '',
            roomPropertyTextColor: hex2ahex('#FFFFFF'),
            roomPropertyBgColor: hex2ahex('#225344', 0.5),
            roomNameTextColor: hex2ahex(fontColor),
          };
        }
      }
    });

  // AI物体识别
  const { materialObjAvaiable, materialObjWidth, materialObjHeight, materialObjEnum } =
    materialObjConfig;

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

  const { width, height, origin, originMap } = mapData;
  const { totalCount, bgWidth, bgHeight, compressBeforeLength, compressAfterLength } = mapHeader;
  const mapArea = bgWidth * bgHeight;

  const decodeMapDataFn = `
  ${Base64Str}
  ${unCompressFuncStr}
  ${hexStringToNumberFuncStr}
  ${padStartFuncStr}
  
  const bitmapTypeHexMap = {
    '00': '00',
    '01': 'f1',
    '10': 'f2',
    '11': 'ff'
  };

  const bitmapTypeMapV2 = {
    'sweep': '111',
    'barrier': '001',
    'carpet': '010',
    'unknown': '000'
  };

  function decodeMapCarpet(mapDataStr, bgWidth, bgHeight) {
    const mapArrVec2 = [];
    const carpetInfoArr = [];
    const mapDataArr = mapDataStr.match(/(\\w{2})/g) || [];
    const hexMapDataArr = mapDataArr.map(d => {
      return padStart(parseInt(d, 16).toString(2), 8, '0');
    });
    for (let i = 0; i < bgHeight; i++) {
      const rowArr = [];
      for (let j = 0; j < bgWidth; j++) {
        const n = i * bgWidth + j;
        const pointInfo = hexMapDataArr[n].slice(5);
        const roomIdInfo = hexMapDataArr[n].slice(0, 5);
        const points = { x: j, y: i };
        const rowItem = {
          roomIdInfo,
          pointInfo,
          points
        };
        if (pointInfo === bitmapTypeMapV2.carpet) {
          carpetInfoArr.push(points);
        }
        rowArr.push(rowItem);
      }
      mapArrVec2.push(rowArr);
    }
    return carpetInfoArr;
  }

  let mapDataStr = '';
  const originMapHex = '${originMap}';
  const headerLength = 48;
  let decodeDataArray = [];
  const infoLength = headerLength + ${compressBeforeLength} * 2;
  if (${version} === 0) {
    if (${compressAfterLength}) {
      const maxBufferLength = ${totalCount} * 8;
      const encodeDataArray = hexStringToNumber(originMapHex.slice(headerLength));
      decodeDataArray = uncompress(encodeDataArray, maxBufferLength);
      decodeDataArray = Array.from(decodeDataArray);
    } else {
      const curData = originMapHex.slice(headerLength);
      const tmp = curData.match(/\\w{2}/g);
      if (tmp) {
        decodeDataArray = tmp.map(d => parseInt(d, 16));
      }
    }
    mapDataStr = decodeDataArray
      .map(d => {
        const byte = padStart(d.toString(2), 8, '0');
        return byte
          .match(/\\w{2}/g)
          .map(d => bitmapTypeHexMap[d])
          .join('');
      })
      .join('')
      .slice(0, ${mapArea} * 2);
  } else if (${version} === 1 || ${version} === 2) {
    if (${compressAfterLength}) {
      const maxBufferLength = ${totalCount} * 4;
      const encodeDataArray = hexStringToNumber(originMapHex.slice(headerLength, infoLength));
      decodeDataArray = uncompress(encodeDataArray, maxBufferLength);
      decodeDataArray = Array.from(decodeDataArray);
      const mapDataArr = decodeDataArray.slice(0, ${mapArea});
      mapDataStr = mapDataArr.map(d => padStart(d.toString(16), 2, '0')).join('');
    } else {
      mapDataStr = originMapHex.slice(headerLength, headerLength + ${mapArea} * 2);
    }
  }

  let pointList = [];
  if (${version} === 2) {
    pointList = decodeMapCarpet(mapDataStr, ${width}, ${height});
  }
  const textureObject = [
    {
      url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAEqADAAQAAAABAAAAEgAAAACaqbJVAAAAkUlEQVQ4EWNgGLaAEZ/PLB0cVH79+t8PUsPGxlh4/MCBO7jUM+GSIFV88BnEguwFUJgg83/9/i8L44PYQHkYF0wjhxmKQbCARVEN4/xnKALKw3gw2hfGoFoYobgIFMUwG0A02GtAl4DYjEyMvawsDE9AbGwAxSBkP4MUg8IE5h2QIejyyAZSzWuDzyBkbw4zNgA1SiyLi2V24wAAAABJRU5ErkJggg==',
      pointList,
      width: ${width},
      height: ${height}
    }
  ];

  let resMap = mapDataStr.toLowerCase();
  if (${width} * ${height} * 2 > mapDataStr.length) {
    resMap = padStart(mapDataStr, ${width} * ${height} * 2, 'f');
  } else {
    resMap = mapDataStr.slice(mapDataStr.length - ${width} * ${height} * 2);
  }
  return { mapStateMap: resMap, textureObject };
  `;
  const formatInfo = {
    dataMapId,
    staticPrefix,
    width,
    height,
    decodeMapDataFn,
    origin,
    roomInfo: curRoomInfo,
    materialObject: JSON.stringify(materialObject),
  };

  console.log('formatInfo ==>', formatInfo);

  return formatInfo;
};

const validate = (value: any) => {
  return !!value;
};

const mapData: Interface.IElementProps = {
  format,
  validate,
};

export default mapData;
