import { Interface } from '../../../resourceManager';
import { IStore, IProps } from '../../interface';
import { unCompressFuncStr } from '../../../resourceManager/utils/uncompress-min-str';
import {
  shrinkValueFuncStr,
  padStartFuncStr,
  dealPLFuncStr,
  chunkFuncStr,
  highLowToIntFuncStr,
  hexStringToNumberFuncStr,
  isNumberFuncStr,
  colorDecodeFuncStr,
  convertColorToArgbHexFuncStr,
} from '../../../resourceManager/utils/utils-min-str';
import { Base64Str } from '../../../resourceManager/utils/base64-min-str';

// pathData Props生成规则
const format = (store: IStore, configs: IProps) => {
  const { originPathData } = store;
  const { ringConfig, pathConfig } = configs.laserMapPanelConfig;
  const { isShowCurPosRing } = configs.uiInterFace || {};
  const fnStr = `
  ${Base64Str}
  ${unCompressFuncStr}
  ${padStartFuncStr}
  ${chunkFuncStr}
  ${isNumberFuncStr}
  ${hexStringToNumberFuncStr}
  ${highLowToIntFuncStr}
  ${dealPLFuncStr}
  ${shrinkValueFuncStr}
  ${colorDecodeFuncStr}
  ${convertColorToArgbHexFuncStr}

  function formatPathHeader(data) {
    const dataArr = hexStringToNumber(data);
    const [version, , , forceUpdate, type] = dataArr;
    const [pathId] = chunk(dataArr.slice(1, 3), 2).map(([high, low]) => {
      const num = highLowToInt(high, low);
      if (isNaN(num)) {
        throw new Error('formatPathHeaderException 1: NaN');
      }
      return num;
    });
    const totalCount = parseInt(data.slice(10, 18), 16);
    const [theta, compressAfterLength] = chunk(dataArr.slice(9, 13), 2).map(([high, low]) => {
      const num = highLowToInt(high, low);
      if (isNaN(num)) {
        throw new Error('formatPathHeaderException 2: NaN');
      }
      return num;
    });
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
  
  function formatPathPoint(originPoint, type) {
    const { x, y } = originPoint;
    if (!isNumber(x) || !isNumber(y)) {
      throw new Error('path point x or y is not number');
    }
    const realPoint = { x: shrinkValue(x), y: -shrinkValue(y) };
    const completeX = binary.complement(x);
    const completeY = binary.complement(y);
    const lastX = completeX.slice(-1);
    const lastY = completeY.slice(-1);
    const lastPoint = lastX + lastY;
    let pathType = 'common';
    if (type === 1 || lastPoint === '00') {
      pathType = 'common';
    }
    if (lastPoint === '10') {
      pathType = 'charge';
    }
    if (lastPoint === '01') {
      pathType = 'transitions';
    }
    return Object.assign({ type: pathType }, realPoint);
  };
  
  function pathDecode(data, byteHeaderLength = 26) {
    const headerLength = byteHeaderLength / 2;
    const dataArr = hexStringToNumber(data);
    const {
      version,
      pathId,
      type,
      totalCount,
      forceUpdate,
      theta,
      compressAfterLength,
    } = formatPathHeader(data.slice(0, byteHeaderLength));
    if (isNaN(type)) {
      throw new Error('path type is NaN');
    }
    if (isNaN(pathId)) {
      throw new Error('path id is NaN');
    }
    let pathDataArr;

    if (compressAfterLength !== 0) {
      const maxBufferLength = totalCount * 4;
      const encodeDataArray = hexStringToNumber(data.slice(byteHeaderLength));
      let decodeDataArray = uncompress(encodeDataArray, maxBufferLength);
      decodeDataArray = Array.from(decodeDataArray);
      pathDataArr = chunk(decodeDataArray, 4);
    } else {
      pathDataArr = chunk(dataArr.slice(headerLength), 4);
    }
    const pathData = pathDataArr.reduce((pre, cur) => {
      const [x, y] = chunk(cur, 2).map(([high, low]) => dealPL(highLowToInt(high, low)));
      const realPoint = formatPathPoint({ x, y }, type);
      if (isNumber(realPoint.x) && isNumber(realPoint.y)) {
        pre.push(realPoint);
      }
      return pre;
    }, []);
    return {
      pathData,
      pathId,
      type,
      theta,
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
        theta,
        forceUpdate,
        originData: dataArr.slice(0, headerLength),
      },
    };
  };

  let pathData = [];
  let theta = 0;

  try {
    const pathObject = pathDecode('${originPathData}');
    pathData = pathObject.pathData || [];
    theta = pathObject.theta;
  } catch(e) {
    console.log('ooops ==>', e);
  }
  if (!pathData.length) return [];
  const commonColor = convertColorToArgbHex('${pathConfig.pathColor.common}');
  const chargeColor = convertColorToArgbHex('${pathConfig.pathColor.backCharge}');
  const transitionsColor = convertColorToArgbHex('${pathConfig.pathColor.transitions}');
  
  let tmp = pathData.concat();
  tmp[tmp.length - 1] = Object.assign(tmp[tmp.length - 1], {
    hidden: ${!(ringConfig.ringAvailable && isShowCurPosRing)},
    rate: ${ringConfig.ringMaxRate},
    bgColor: convertColorToArgbHex('${ringConfig.ringBgColor}'),
    duration: ${ringConfig.ringDuration},
    borderWidth: ${ringConfig.ringBorderWidth || 1},
    animationType: 'normal',
    theta: theta,
    dataColors: {
      common: commonColor,
      charge: chargeColor,
      transitions: transitionsColor,
    }
  });
  return tmp;  
`;
  return fnStr;
};

const validate = (value: any) => {
  return !!value;
};

const decodePathFn: Interface.IElementProps = {
  format,
  validate,
};

export default decodePathFn;
