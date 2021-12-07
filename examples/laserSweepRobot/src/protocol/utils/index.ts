import { Observable } from 'rxjs';
import FunctionUtils from './functionUtil';
import PressCoordinateUtils from './pressCoordinateUtil';
import LoggerUtils from './loggerUtil';
import RxUtils from './rxUtil';
import * as StringsUtils from './stringsUtil';
import Lz4 from './lz4Util';

import * as RobotUtils from './robotUtil';

const { createDpValue$ } = RxUtils,
  { handleError } = FunctionUtils,
  { sequencePromise } = FunctionUtils,
  { scaleNumber } = PressCoordinateUtils,
  { dealPL } = PressCoordinateUtils,
  { transformXY } = PressCoordinateUtils,
  logger = LoggerUtils;

export function isNotError(value: any) {
  if (value instanceof Error) {
    handleError(value);
    return false;
  }
  return true;
}

export function extractError(error: Error) {
  return Observable.of(error);
}

export default {
  FunctionUtils,
  PressCoordinateUtils,
  LoggerUtils,
  RxUtils,
  StringsUtils,
  Lz4,
  RobotUtils,

  // ---- 向下兼容，废弃 ----
  createDpValue$: RxUtils.createDpValue$,
  handleError: FunctionUtils.handleError,
  sequencePromise: FunctionUtils.sequencePromise,
  scaleNumber: PressCoordinateUtils.scaleNumber,
  dealPL: PressCoordinateUtils.dealPL,
  transformXY: PressCoordinateUtils.transformXY,
  logger: LoggerUtils,
};

//  ---- 向下兼容，废弃 ----
export {
  createDpValue$,
  handleError,
  sequencePromise,
  scaleNumber,
  dealPL,
  transformXY,
  logger,
  RobotUtils,
};
