/* eslint-disable new-cap */
/* eslint-disable prefer-const */
import { Utils } from 'tuya-panel-kit';
import _ from 'lodash';
import { memorize, isNumber } from '../utils/functionUtil';
import Lz4 from '../utils/lz4Util';
import {
  hex2ahex,
  toFixed16,
  tuyaHidePath,
  transformPileXY,
  DECNumberToHex,
  hexToUTF8
} from '../utils/robotUtil';
import { dealPL } from '../utils';
import {
  shrinkValue,
  bitmapTypeMap,
  bitmapTypeMapReflection,
  MAX_ID_NUM,
  dealPointsColor,
  dealPointsColorV2,
  createHouseColorMap,
  bitmapTypeMapV2,
  bitmapTypeHexMap,
  unknownAreaId,
  unknownAreaIdV2,
} from '../constant';
import Store from '../../store';

const {
  StringUtils: { hexStringToNumber },
  NumberUtils: { highLowToInt },
} = Utils;

const mapHeaderLen = 48;
const isLz4 = true;
const formatPathPoint = tuyaHidePath;

/**
 * 将颜色统一为大写字符串
 * @param colorHex
 * @returns
 */
const hex2ahexUpcase = (colorHex: string) => {
  const color: string = hex2ahex(colorHex) || '#000000';
  return color.toUpperCase();
};
/**
 * 解析头部header
 * @param data
 */
function formatMapHeader(data: string) {
  const [version] = hexStringToNumber(data.slice(0, 2));
  const [id] = _.chunk(hexStringToNumber(data.slice(2, 6)), 2).map(([high, low]) =>
    highLowToInt(high, low)
  );
  const [type] = hexStringToNumber(data.slice(6, 8));
  const totalCount = parseInt(data.slice(36, 44), 16);
  const compressBeforeLength = totalCount;
  let [
    ,
    ,
    bgWidth,
    bgHeight,
    originX,
    originY,
    mapResolution,
    pileX,
    pileY,
    ,
    ,
    compressAfterLength,
  ] = _.chunk(hexStringToNumber(data), 2).map(([high, low]) => highLowToInt(high, low));
  [originX, originY, pileX, pileY] = [originX, originY, pileX, pileY].map(d => shrinkValue(d));

  return {
    id,
    version,
    roomEditable: !!type,
    type,
    bgWidth,
    bgHeight,
    originX,
    originY,
    pileX,
    pileY,
    mapResolution, // 地图分辨率，原始值*100上报
    totalCount,
    compressAfterLength,
    compressBeforeLength,
  };
}

const decode = memorize((data: string, mapConfig: any) => {
  const headerLength = mapHeaderLen;
  const mapHeader = formatMapHeader(data.slice(0, headerLength));
  const {
    id,
    version,
    type,
    bgWidth,
    bgHeight,
    originX,
    originY,
    pileX,
    pileY,
    totalCount,
    compressBeforeLength, // Lz4 压缩成功前的数据长度
    compressAfterLength, // Lz4 压缩成功时的数据长度 否则为0
  } = mapHeader;

  // 面板配置信息
  const {
    mapColor: {
      cleaningColor,
      obstacleColor,
      unknownColor,
      room60Color,
      room61Color,
      room62Color,
      room63Color,
    },
    originMapColor,
    grayMapColor,
  } = mapConfig;

  const houseColorMap = createHouseColorMap(
    version,
    MAX_ID_NUM,
    originMapColor,
    room60Color,
    room61Color,
    room62Color,
    room63Color
  );
  const houseGrayColorMap = createHouseColorMap(
    version,
    MAX_ID_NUM,
    grayMapColor,
    room60Color,
    room61Color,
    room62Color,
    room63Color
  );
  if (type > 255) {
    throw new Error(`mapData mapHeader typ: ${type} is not valid`);
  }
  const roomInfo: any = {};
  const mapArea = bgWidth * bgHeight;
  let mapDataStr = '';
  let decodeDataArray: any[] = [];
  const infoLength = headerLength + compressBeforeLength * 2; // 得到头部数据加被压缩的数据的字节长度
  let roomNum = 0; // 分区个数
  if (version === 0) {
    // 普通版本
    if (isLz4 && compressAfterLength) {
      const maxBufferLength = totalCount * 8;
      const encodeDataArray = Utils.StringUtils.hexStringToNumber(data.slice(headerLength));
      decodeDataArray = Lz4.uncompress(encodeDataArray, maxBufferLength);
    } else {
      const curData = data.slice(headerLength);
      const tmp = curData.match(/\w{2}/g);
      if (tmp) {
        decodeDataArray = tmp.map(d => parseInt(d, 16));
      }
    }
    mapDataStr = _(decodeDataArray)
      .map(d => {
        const byte = _.padStart(d.toString(2), 8, '0');
        return byte
          .match(/\w{2}/g)
          .map(d => bitmapTypeHexMap[d])
          .join('');
      })
      .value()
      .join('')
      .slice(0, mapArea * 2);

    const hexArr = Object.values(bitmapTypeHexMap);
    // 得到匹配类型的数据颜色
    hexArr.forEach(d => {
      const point_2 = _.padStart(parseInt(d, 16).toString(2), 8, '0');
      const pointInfo = point_2.slice(6);
      const color = dealPointsColor(pointInfo, cleaningColor, obstacleColor, unknownColor);
      roomInfo[d] = {
        normalColor: color,
        highlightColor: color,
        pixelType: bitmapTypeMapReflection[pointInfo],
      };
    });
  } else if (version === 1) {
    // 分区版本
    let mapRoomStr: string;
    if (isLz4 && compressAfterLength) {
      const maxBufferLength = totalCount * 4; // 解压缩，申请空间
      const encodeDataArray = Utils.StringUtils.hexStringToNumber(
        data.slice(headerLength, infoLength)
      );
      decodeDataArray = Lz4.uncompress(encodeDataArray, maxBufferLength);
      const mapDataArr = decodeDataArray.slice(0, mapArea);
      const mapRoomArr = decodeDataArray.slice(mapArea, decodeDataArray.length); // 除去地图数据，到第一次压缩结束的都认为是房间数据
      mapDataStr = _(mapDataArr)
        .map(d => _.padStart(d.toString(16), 2, '0'))
        .value()
        .join('');
      mapRoomStr = _(mapRoomArr)
        .map(d => _.padStart(d.toString(16), 2, '0'))
        .value()
        .join('');
    } else {
      mapDataStr = data.slice(headerLength, headerLength + mapArea * 2);
      mapRoomStr = data.slice(headerLength + mapArea * 2, data.length);
    }

    for (let idx = 0; idx <= MAX_ID_NUM; idx++) {
      const roomIdHex = toFixed16(`${idx}`);
      const point_2 = _.padStart(parseInt(roomIdHex, 16).toString(2), 8, '0');
      // 低两位数据
      const pointInfo = point_2.slice(6);
      const color = dealPointsColor(pointInfo, cleaningColor, obstacleColor, unknownColor);
      // 高六位数据
      const roomId = parseInt(point_2.slice(0, 6), 2);

      if (pointInfo === bitmapTypeMap.barrier || pointInfo === bitmapTypeMap.unknown) {
        roomInfo[roomIdHex] = {
          normalColor: color,
          highlightColor: color,
          pixelType: bitmapTypeMapReflection[pointInfo],
        };
      }
      if (pointInfo === bitmapTypeMap.sweep && unknownAreaId.includes(roomId)) {
        roomInfo[roomIdHex] = {
          normalColor: hex2ahexUpcase(houseGrayColorMap.get(roomId)),
          highlightColor: hex2ahexUpcase(houseColorMap.get(roomId)),
          pixelType: bitmapTypeMapReflection[pointInfo],
        };
      }
    }

    /** ------------房间等信息解析 start------------ * */
    // 智能分区信息
    // region_num两个bytes
    let name: string | null;
    let bytePos = 2 * 2; // region_num
    const [roomCount] = Utils.StringUtils.hexStringToNumber(mapRoomStr.slice(2, 4));
    roomNum = roomCount;
    const infoByteLen = 26; // Room properties
    const nameByteLen = 20; // Vertices_name
    // room_msg_len 就只存储这两个字节 所以是2
    for (let i = 0; i < roomCount; i++) {
      // vertices_num房间信息，28bytes
      const roomInfoStr = mapRoomStr.slice(bytePos, bytePos + (infoByteLen + nameByteLen + 1) * 2);
      const [roomId, order, sweep_count, mop_count] = _.chunk(
        Utils.StringUtils.hexStringToNumber(roomInfoStr.slice(0, 16)),
        2
      ).map(([high, low]) => Utils.NumberUtils.highLowToInt(high, low));

      const [colorOrder, sweep_forbiden, mop_forbidden, fan, water_level, y_mode] =
        Utils.StringUtils.hexStringToNumber(roomInfoStr.slice(16, 28));
      // Vertices_name房间名称信息，20bytes
      const [nameLen] = Utils.StringUtils.hexStringToNumber(roomInfoStr.slice(52, 54));
      const verticesNameStr = roomInfoStr.slice(
        infoByteLen * 2 + 1 * 2,
        infoByteLen * 2 + 1 * 2 + nameLen * 2
      );
      name = nameLen ? hexToUTF8(verticesNameStr) : '';
      const [vertexNum] = Utils.StringUtils.hexStringToNumber(roomInfoStr.slice(92, 94));
      const vertexStr = mapRoomStr.slice(
        bytePos + (infoByteLen + nameByteLen + 1) * 2,
        bytePos + (infoByteLen + nameByteLen + 1) * 2 + vertexNum * 2 * 2 * 2
      );
      bytePos = bytePos + (infoByteLen + nameByteLen + 1) * 2 + vertexNum * 2 * 2 * 2;

      let vertexData: Array<{ x: number; y: number }> = [];
      if (vertexStr) {
        const dataArr = Utils.StringUtils.hexStringToNumber(vertexStr);
        vertexData = _.chunk(dataArr, 4).reduce((pre, cur) => {
          const [x, y] = _.chunk(cur, 2).map(([high, low]) =>
            dealPL(Utils.NumberUtils.highLowToInt(high, low))
          );
          if (isNumber(x) && isNumber(y)) {
            const realPoint = formatPathPoint({ x, y });
            if (isNumber(realPoint.x) && isNumber(realPoint.y)) {
              pre.push({
                x: realPoint.x,
                y: realPoint.y,
              });
            }
          }
          return _.uniqWith(pre, _.isEqual);
        }, []);
      }

      if (roomId || roomId === 0) {
        const roomIdHex = DECNumberToHex(roomId, bitmapTypeMap.sweep) || '00';
        roomInfo[roomIdHex] = {
          roomId,
          normalColor: hex2ahexUpcase(houseGrayColorMap.get(roomId)),
          highlightColor: hex2ahexUpcase(houseColorMap.get(roomId)),
          pixelType: bitmapTypeMapReflection[bitmapTypeMap.sweep],
          name,
          fan: String(fan),
          order: String(order),
          water_level: String(water_level),
          sweep_count: String(sweep_count),
          mop_count: String(mop_count),
          sweep_forbiden: String(sweep_forbiden),
          mop_forbidden: String(mop_forbidden),
          y_mode: String(y_mode),
          vertexData,
        };
      }
    }
    /** ------------房间等信息解析 end------------ * */
  } else if (version === 2) {
    // 地板材质版本
    let mapRoomStr: string;
    if (isLz4 && compressAfterLength) {
      const maxBufferLength = totalCount * 4; // 解压缩，申请空间
      const encodeDataArray = Utils.StringUtils.hexStringToNumber(
        data.slice(headerLength, infoLength)
      );
      decodeDataArray = Lz4.uncompress(encodeDataArray, maxBufferLength);
      const mapDataArr = decodeDataArray.slice(0, mapArea);
      const mapRoomArr = decodeDataArray.slice(mapArea, decodeDataArray.length); // 除去地图数据，到第一次压缩结束的都认为是房间数据
      // 地图数据转换为16进制字符串
      mapDataStr = _(mapDataArr)
        .map(d => _.padStart(d.toString(16), 2, '0'))
        .value()
        .join('');
      // 房间数据转换为16进制字符串
      mapRoomStr = _(mapRoomArr)
        .map(d => _.padStart(d.toString(16), 2, '0'))
        .value()
        .join('');
    } else {
      mapDataStr = data.slice(headerLength, headerLength + mapArea * 2);
      mapRoomStr = data.slice(headerLength + mapArea * 2, data.length);
    }
    for (let idx = 0; idx <= MAX_ID_NUM; idx++) {
      const roomIdHex = toFixed16(`${idx}`);
      const point_2 = _.padStart(parseInt(roomIdHex, 16).toString(2), 8, '0');
      // 低3位数据
      const pointInfo = point_2.slice(5);
      const color = dealPointsColorV2(pointInfo, cleaningColor, obstacleColor, unknownColor);
      // 高5位数据
      const roomId = parseInt(point_2.slice(0, 5), 2);
      if (pointInfo === bitmapTypeMapV2.barrier || pointInfo === bitmapTypeMapV2.unknown) {
        roomInfo[roomIdHex] = {
          normalColor: color,
          highlightColor: color,
          pixelType: bitmapTypeMapReflection[pointInfo],
        };
      }
      // 需要对地毯的数据呈现做兼容
      if (pointInfo === bitmapTypeMapV2.carpet) {
        const carpetHex = DECNumberToHex(roomId, bitmapTypeMapV2.carpet);
        roomInfo[carpetHex] = {
          normalColor: hex2ahexUpcase(houseGrayColorMap.get(roomId)),
          highlightColor: hex2ahexUpcase(houseColorMap.get(roomId)),
          pixelType: bitmapTypeMapReflection[pointInfo],
        };
      }
      if (pointInfo === bitmapTypeMapV2.sweep && unknownAreaIdV2.includes(roomId)) {
        roomInfo[roomIdHex] = {
          normalColor: hex2ahexUpcase(houseGrayColorMap.get(roomId)),
          highlightColor: hex2ahexUpcase(houseColorMap.get(roomId)),
          pixelType: bitmapTypeMapReflection[pointInfo],
        };
      }
    }

    /** ------------房间等信息解析 start------------ * */
    // 智能分区信息
    // region_num两个bytes
    let name: string | null;
    let bytePos = 2 * 2; // region_num
    // 地图分区ID（固定0x01，1bytes）+ 分区个数(1bytes)
    const [roomCount] = Utils.StringUtils.hexStringToNumber(mapRoomStr.slice(2, 4));
    roomNum = roomCount;
    const infoByteLen = 26; // Room properties
    const nameByteLen = 20; // Vertices_name
    // room_msg_len 就只存储这两个字节 所以是2
    for (let i = 0; i < roomCount; i++) {
      // vertices_num房间信息，28bytes
      const roomInfoStr = mapRoomStr.slice(bytePos, bytePos + (infoByteLen + nameByteLen + 1) * 2);
      // 解析每个房间的相关数据 //房间ID, 清扫顺序, 清扫次数, 拖地次数
      const [roomId, order, sweep_count, mop_count] = _.chunk(
        Utils.StringUtils.hexStringToNumber(roomInfoStr.slice(0, 16)),
        2
      ).map(([high, low]) => Utils.NumberUtils.highLowToInt(high, low));
      // 颜色序号，禁止清扫，禁止拖地, 风机档位，水箱档位，Y字形拖地
      const [colorOrder, sweep_forbiden, mop_forbidden, fan, water_level, y_mode] =
        Utils.StringUtils.hexStringToNumber(roomInfoStr.slice(16, 28));
      // Vertices_name房间名称信息，20bytes
      const [nameLen] = Utils.StringUtils.hexStringToNumber(roomInfoStr.slice(52, 54));
      const verticesNameStr = roomInfoStr.slice(
        infoByteLen * 2 + 1 * 2,
        infoByteLen * 2 + 1 * 2 + nameLen * 2
      );
      name = nameLen ? hexToUTF8(verticesNameStr) : '';
      const [vertexNum] = Utils.StringUtils.hexStringToNumber(roomInfoStr.slice(92, 94));
      const vertexStr = mapRoomStr.slice(
        bytePos + (infoByteLen + nameByteLen + 1) * 2,
        bytePos + (infoByteLen + nameByteLen + 1) * 2 + vertexNum * 2 * 2 * 2
      );
      bytePos = bytePos + (infoByteLen + nameByteLen + 1) * 2 + vertexNum * 2 * 2 * 2;

      let vertexData: Array<{ x: number; y: number }> = [];
      // 按照高低位代表xy数据进行解析
      if (vertexStr) {
        const dataArr = Utils.StringUtils.hexStringToNumber(vertexStr);
        vertexData = _.chunk(dataArr, 4).reduce((pre, cur) => {
          const [x, y] = _.chunk(cur, 2).map(([high, low]) =>
            dealPL(Utils.NumberUtils.highLowToInt(high, low))
          );
          if (isNumber(x) && isNumber(y)) {
            const realPoint = formatPathPoint({ x, y });
            if (isNumber(realPoint.x) && isNumber(realPoint.y)) {
              pre.push({
                x: realPoint.x,
                y: realPoint.y,
              });
            }
          }
          return _.uniqWith(pre, _.isEqual);
        }, []);
      }

      if (roomId || roomId === 0) {
        const realRoomIdHex = toFixed16(`${roomId}`);
        const hexBit = _.padStart(parseInt(realRoomIdHex, 16).toString(2), 8, '0');
        // 低3位数据
        const pointInfo = hexBit.slice(5);
        const roomIdHex = DECNumberToHex(roomId, bitmapTypeMapV2.sweep);
        roomInfo[roomIdHex] = {
          roomId,
          normalColor: hex2ahexUpcase(houseGrayColorMap.get(roomId)),
          highlightColor: hex2ahexUpcase(houseColorMap.get(roomId)),
          pixelType: bitmapTypeMapReflection[bitmapTypeMapV2.sweep],
          name,
          fan: String(fan),
          order: String(order),
          water_level: String(water_level),
          sweep_count: String(sweep_count),
          mop_count: String(mop_count),
          sweep_forbiden: String(sweep_forbiden),
          mop_forbidden: String(mop_forbidden),
          y_mode: String(y_mode),
          vertexData,
        };
      }
    }
  }

  const staticPrefix = Store.devInfo.getStaticPrefix;

  const mapData = {
    width: bgWidth,
    height: bgHeight,
    originMap: data,
    origin: {
      x: originX,
      y: originY,
    },
    ...(roomInfo ? { roomInfo: JSON.stringify(roomInfo) } : {}),
  };

  const nextState = {
    staticPrefix,
    dataMapId: id,
    mapData,
    pilePosition: transformPileXY({ pileX, pileY }, { originX, originY }),
    mapHeader: {
      ...mapHeader,
      originData: data.slice(0, headerLength),
    },
  };
  console.log('nextState', nextState);
  return nextState;
});

export default {
  decode,
};
