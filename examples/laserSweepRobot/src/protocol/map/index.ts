/* eslint-disable new-cap */
/* eslint-disable prefer-const */
import { Utils } from 'tuya-panel-kit';
import _ from 'lodash';
import { memorize, isNumber } from '../utils/functionUtil';
import lz4 from '../utils/lz4Util';
import {
  hex2ahex,
  toFixed16,
  strBytes2Name,
  tuyaHidePath,
  transformPileXY,
  DECNumberToHex,
} from '../utils/robotUtil';
import { dealPL } from '../utils';
import {
  shrinkValue,
  bitmapTypeMap,
  pointsColor,
  MAX_ID_NUM,
  houseColorMap,
  houseHighlightColorMap,
  dealPointsColor,
  getBitMapByType,
} from '../constant';

const {
  StringUtils: { hexStringToNumber },
  NumberUtils: { highLowToInt, toFixedString },
} = Utils;

const mapHeaderLen = 48;
const isLz4 = true;
const formatPathPoint = tuyaHidePath;
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
  };
}

// function dealPointsColor(type: string, houseId?: number) {
//   const [sweep, barrier, unknown, battery] = pointsColor;
//   // if (houseId > -1 && type === bitmapTypeMap.sweep) {
//   //   let houseColor = houseColorMap.get(houseId);
//   //   if (houseColor) return houseColor;
//   // }
//   const mapColor = {
//     [bitmapTypeMap.sweep]: sweep,
//     [bitmapTypeMap.barrier]: barrier,
//     [bitmapTypeMap.battery]: battery,
//     [bitmapTypeMap.unknown]: unknown,
//   };
//   return mapColor[type] || sweep;
// }

const decode = memorize((data: string, headerLength = mapHeaderLen) => {
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
    compressAfterLength,
  } = mapHeader;
  if (type > 255) {
    throw new Error(`mapData mapHeader typ: ${type} is not valid`);
  }
  let bitmapBytes: number[] = [];
  const idColorMap: any = {};
  const roomInfo: any = {};
  const mapArea = bgWidth * bgHeight;
  let mapDataStr: string;
  if (!version) {
    if (isLz4 && compressAfterLength) {
      const maxBufferLength = totalCount * 4;
      const encodeDataArray = hexStringToNumber(data.slice(headerLength));
      const decodeDataArray = lz4.uncompress(encodeDataArray, maxBufferLength);
      mapDataStr = _(decodeDataArray)
        .map(d => _.padStart(d.toString(16), 2, '0'))
        .value()
        .join('');
    } else {
      mapDataStr = data.slice(headerLength);
    }
    const dataArray = mapDataStr.split('');
    const isRepeat = dataArray.length * 4 === mapArea;
    bitmapBytes = dataArray.reduce((pre: any[], cur: string) => {
      const data = toFixedString(parseInt(cur, 16).toString(2), 4);
      const [one, two] = data.match(/\w{2}/g).map((d: any) => getBitMapByType(d));
      const double = [one, two];
      const finalData = isRepeat ? double.concat(double) : double;
      pre.push(...finalData);
      return pre.slice(0);
    }, []);

    if (bgWidth * bgHeight < bitmapBytes.length) {
      bitmapBytes.splice(bgWidth * bgHeight, bitmapBytes.length - bgWidth * bgHeight);
    }
    if (bgHeight && bgHeight * bgWidth !== bitmapBytes.length) {
      throw new Error(
        `bgHeight * bgWidth !== bitmapBytes.length ===>bgWidth=${bgWidth};bgHeight=${bgHeight}; length=${bitmapBytes.length}`
      );
    }
  } else {
    // debugger;
    let mapRoomStr: string;
    if (isLz4 && compressAfterLength) {
      const maxBufferLength = totalCount * 4; // 解压缩，申请空间
      const encodeDataArray = hexStringToNumber(data.slice(headerLength));
      const decodeDataArray = lz4.uncompress(encodeDataArray, maxBufferLength);
      const mapDataArr = decodeDataArray.slice(0, mapArea);
      const mapRoomArr = decodeDataArray.slice(mapArea, decodeDataArray.length); // 除去地图数据，都认为是房间数据
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
      const roomIdHex = toFixed16(idx);
      const point_2 = _.padStart(parseInt(roomIdHex, 16).toString(2), 8, '0');
      const pointInfo = point_2.slice(6);
      const color = dealPointsColor(pointInfo);
      const roomId = parseInt(point_2.slice(0, 6), 2);

      if (bitmapTypeMap.sweep !== pointInfo) {
        idColorMap[roomIdHex] =
          bitmapTypeMap.sweep === pointInfo ? hex2ahex(houseColorMap.get(roomId)) : color;
        roomInfo[roomIdHex] = {
          normalColor:
            bitmapTypeMap.sweep === pointInfo ? hex2ahex(houseColorMap.get(roomId)) : color,
          highlightColor:
            bitmapTypeMap.sweep === pointInfo
              ? hex2ahex(houseHighlightColorMap.get(roomId))
              : color,
        };
      } else {
        idColorMap[roomIdHex] = hex2ahex(houseColorMap.get(roomId));
        roomInfo[roomIdHex] = {
          normalColor: hex2ahex(houseColorMap.get(roomId)),
          highlightColor: hex2ahex(houseHighlightColorMap.get(roomId)),
        };
      }
    }

    /** ------------房间等信息解析 start------------ **/
    // 智能分区信息
    // region_num两个bytes
    let name: string | null;
    const [roomCount] = hexStringToNumber(mapRoomStr.slice(2, 4));
    let bytePos = 2 * 2;
    const infoByteLen = 26;
    const nameByteLen = 20;
    // room_msg_len 就只存储这两个字节 所以是2
    for (let i = 0; i < roomCount; i++) {
      // vertices_num房间信息，28bytes
      const roomInfoStr = mapRoomStr.slice(bytePos, bytePos + (infoByteLen + nameByteLen + 1) * 2);

      const [roomId, order, sweep_count, mop_count] = _.chunk(
        hexStringToNumber(roomInfoStr.slice(0, 16)),
        2
      ).map(([high, low]) => highLowToInt(high, low));
      const [
        colorOrder,
        sweep_forbiden,
        mop_forbidden,
        fan,
        water_level,
        y_mode,
      ] = hexStringToNumber(roomInfoStr.slice(16, 28));
      // Vertices_name房间名称信息，20bytes
      const [nameLen] = hexStringToNumber(roomInfoStr.slice(52, 54));
      const verticesNameStr = roomInfoStr.slice(
        infoByteLen * 2 + 1 * 2,
        infoByteLen * 2 + 1 * 2 + nameLen * 2
      );
      name = nameLen ? strBytes2Name(verticesNameStr) : '';
      const [vertexNum] = hexStringToNumber(roomInfoStr.slice(92, 94));
      const vertexStr = mapRoomStr.slice(
        bytePos + (infoByteLen + nameByteLen + 1) * 2,
        bytePos + (infoByteLen + nameByteLen + 1) * 2 + vertexNum * 2 * 2 * 2
      );
      bytePos = bytePos + (infoByteLen + nameByteLen + 1) * 2 + vertexNum * 2 * 2 * 2;

      let vertexData: Array<{ x: number; y: number }> = [];
      if (vertexStr) {
        const dataArr = hexStringToNumber(vertexStr);
        vertexData = _.chunk(dataArr, 4).reduce((pre: Array<{ x: number; y: number }>, cur) => {
          const [x, y] = _.chunk(cur, 2).map(([high, low]) => dealPL(highLowToInt(high, low)));
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
        const roomIdHex = DECNumberToHex(roomId) || '00';
        idColorMap[roomIdHex] = hex2ahex(houseColorMap.get(roomId));
        roomInfo[roomIdHex] = {
          roomId,
          normalColor: hex2ahex(houseColorMap.get(roomId)),
          highlightColor: hex2ahex(houseHighlightColorMap.get(roomId)),
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
    /** ------------房间等信息解析 end------------ **/
  }

  const mapData = {
    width: bgWidth,
    height: bgHeight,
    map: mapDataStr,
    data: JSON.stringify(bitmapBytes),
    origin: {
      x: originX,
      y: originY,
    },
    ...(idColorMap ? { roomIdColorMap: JSON.stringify(idColorMap) } : {}),
    ...(roomInfo ? { roomInfo: JSON.stringify(roomInfo) } : {}),
  };

  const nextState = {
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
