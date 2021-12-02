import { Utils } from 'tuya-panel-kit';
import _ from 'lodash';
import { memorize, isNumber, createJsonError } from '../utils/functionUtil';
import lz4 from '../utils/lz4Util';
import { tuyaHidePath } from '../utils/robotUtil';
import { dealPL, handleError } from '../utils';
import { fileTypeMap } from '../constant';

const {
  StringUtils: { hexStringToNumber },
  NumberUtils: { highLowToInt },
} = Utils;

const pathHeaderByteLen = 26;
const isLz4 = true;
const formatPathPoint = tuyaHidePath;

/**
 * 路径数据header解析
 * @param data
 */
const formatPathHeader = (data: string) => {
  const dataArr = hexStringToNumber(data);
  const [version, , , forceUpdate, type] = dataArr;
  const [pathId] = _.chunk(dataArr.slice(1, 3), 2).map(([high, low]) => {
    const num = highLowToInt(high, low);
    if (_.isNaN(num)) {
      throw createJsonError('formatPathHeaderException： NaN', data);
    }
    return num;
  });
  const totalCount = parseInt(data.slice(10, 18), 16);
  const [theta, compressAfterLength] = _.chunk(dataArr.slice(9, 13), 2).map(([high, low]) => {
    const num = highLowToInt(high, low);
    if (_.isNaN(num)) {
      throw createJsonError('formatPathHeaderException： NaN', data);
    }
    return num;
  });
  // const [forceUpdate, type] = hexStringToNumber(data.slice(4, 8));
  return {
    version,
    pathId,
    forceUpdate,
    type,
    totalCount,
    theta,
    compressAfterLength,
  };
};

/**
 * 解析路径数据
 */
const decode = memorize((data: string, byteHeaderLength: number = pathHeaderByteLen) => {
  const headerLength = byteHeaderLength / 2;
  const dataArr = hexStringToNumber(data);
  const { version, pathId, type, totalCount, forceUpdate, compressAfterLength } = formatPathHeader(
    data.slice(0, byteHeaderLength)
  );
  if (_.isNaN(type)) {
    throw new Error('path type is NaN');
  }
  if (_.isEqual(NaN, pathId)) {
    handleError(new Error('parsePathFile exception id'));
    throw new Error('path id is NaN');
  }
  let pathDataArr;

  // 压缩后长度为0，代表压缩失败，走原来逻辑
  if (isLz4 && compressAfterLength !== 0) {
    const maxBufferLength = totalCount * 4;
    const encodeDataArray = hexStringToNumber(data.slice(byteHeaderLength));
    const decodeDataArray = lz4.uncompress(encodeDataArray, maxBufferLength);
    pathDataArr = _.chunk(decodeDataArray, 4);
  } else {
    pathDataArr = _.chunk(dataArr.slice(headerLength), 4);
  }

  const pathData = pathDataArr.reduce((pre, cur) => {
    const [x, y] = _.chunk(cur, 2).map(([high, low]) => dealPL(highLowToInt(high, low)));
    const realPoint = formatPathPoint({ x, y });
    if (isNumber(realPoint.x) && isNumber(realPoint.y)) {
      pre.push(realPoint);
    }
    return pre;
  }, []);

  return {
    pathData,
    pathId,
    type,
    totalCount,
    startCount: pathData.length,
    currentCount: pathData.length,
    isFull: true,
    forceUpdate,
    header: {
      version,
      pathId,
      type,
      totalCount,
      forceUpdate,
      originData: dataArr.slice(0, headerLength),
    },
  };
});

/**
 * 对比当前路径数据
 * @param pre
 * @param cur
 */
const accumulatePath = (pre, cur) => {
  // 当前数据
  const {
    pathId: curId,
    totalCount: curTotalCount,
    pathData: curPoint,
    forceUpdate: curForceUpdate,
    type: curType,
    startCount: curStartCount,
    isFull: curIsFull,
  } = cur;
  if (curId === 0 && curType === 0 && curTotalCount === 0) {
    return cur;
  }
  // 前一组数据
  const {
    pathId: preId,
    totalCount: preTotalCount,
    type: preType,
    startCount,
    pathData: prePoint,
  } = pre;

  // 当前数据为全量数据
  if (curIsFull) {
    // App长时间息屏，增量数据量较大，无法传输，采用全量数据传输，id不变的时候，比较数据长度。
    if (preId === curId && curTotalCount > preTotalCount) {
      return cur;
    }
    // 全量id较大,
    if (curId > preId) {
      return cur;
    }
    // 强制更新地图标示
    if (curForceUpdate) {
      return cur;
    }
    return pre;
  }
  // 增量路径下， 1.id不同，不累加；2.起始点不匹配，不叠加。
  if (
    curType === fileTypeMap.increPath &&
    (preId !== curId || prePoint.length !== curStartCount)
    // (prePoint.length !== curStartCount)
  ) {
    return pre;
  }
  prePoint.push(...curPoint);
  return {
    pathId: curId,
    type: preType,
    totalCount: curTotalCount,
    currentCount: prePoint.length,
    startCount,
    pathData: [...prePoint],
  };
};

export default {
  decode,
  accumulatePath,
};
