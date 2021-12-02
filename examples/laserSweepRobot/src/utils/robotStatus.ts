/* eslint-disable space-before-function-paren */
import { DPCodes, getEnum } from '../config';

const {
  nativeMapStatus: { pressToRun, areaSet, virtualArea, virtualWall, selectRoom },
  robotStatusEnum: {
    pointing,
    pause,
    areaing,
    totaling,
    totalingStandard,
    idle,
    charging,
    fullCharge,
    toCharge,
  },
  workModeEnum: { pose, smart, zone },
  workMode: workModeCode,
  robotStatus: robotStatusCode,
  workModeEnum,
} = DPCodes;

function equal(a, b) {
  return a === b;
}

function judgeRobotModeStatusByKey(workModeKey, robotStatusKey = workModeKey) {
  return function (workMode, robotStatus) {
    return (
      equal(workMode, getEnum(workModeCode, workModeKey)) &&
      equal(robotStatus, getEnum(robotStatusCode, robotStatusKey))
    );
  };
}

function judgeRobotIsModePauseByKey(workModeKey) {
  return function (workMode, robotStatus) {
    return (
      equal(workMode, getEnum(workModeCode, workModeKey)) &&
      equal(robotStatus, getEnum(robotStatusCode, 'paused'))
    );
  };
}

// robotStatus
function robotIsPointing(workMode, robotStatus) {
  return judgeRobotModeStatusByKey('pose', 'pointing')(workMode, robotStatus);
}

function robotIsPointArrived(workMode, robotStatus) {
  return judgeRobotModeStatusByKey('pose', 'pointArrived')(workMode, robotStatus);
}

function robotIsPointUnarrived(workMode, robotStatus) {
  return judgeRobotModeStatusByKey('pose', 'pointUnarrived')(workMode, robotStatus);
}

function robotIsParting(workMode, robotStatus) {
  return judgeRobotModeStatusByKey('part', 'parting')(workMode, robotStatus);
}

function robotIsAreaing(workMode, robotStatus) {
  return workMode === zone && robotStatus === areaing;
}

function robotIsAutoRun(workMode, robotStatus) {
  return workMode === smart && (robotStatus === totaling || robotStatus === totalingStandard);
}

function robotIsIdle(robotStatus) {
  return robotStatus === idle;
}

// charge
function robotIsToCharing(workMode, robotStatus) {
  return robotStatus === toCharge && workMode === workModeEnum.backCharge;
}

function robotIsToCharingPause(workMode, robotStatus) {
  return robotIsPause(robotStatus) && workMode === workModeEnum.backCharge;
}

function robotIsCharing(workMode, robotStatus) {
  return robotStatus === charging && workMode === workModeEnum.backCharge;
}

function robotIsFullCharge(workMode, robotStatus) {
  return robotStatus === fullCharge && workMode === workModeEnum.backCharge;
}

// robotPause
function robotIsPause(robotStatus) {
  return robotStatus === getEnum(robotStatusCode, 'paused');
}

function robotIsAutoRunPause(workMode, robotStatus) {
  return workMode === smart && robotStatus === pause;
}

function robotIsPointPause(workMode, robotStatus) {
  return judgeRobotIsModePauseByKey('pose')(workMode, robotStatus);
}

function robotIsPartPause(workMode, robotStatus) {
  return judgeRobotIsModePauseByKey('part')(workMode, robotStatus);
}
function robotIsAreaPause(workMode, robotStatus) {
  return judgeRobotIsModePauseByKey('zone')(workMode, robotStatus);
}

function robotIsSelectRoomPaused(workMode, robotStatus) {
  return judgeRobotIsModePauseByKey('selectRoom')(workMode, robotStatus);
}

function robotIsSelectRoom(workMode, robotStatus) {
  return judgeRobotModeStatusByKey('selectRoom')(workMode, robotStatus);
}

export function isRobotChargeDirect(status: string) {
  const quietStatuses = ['standby', 'sleep', 'paused'];
  const isQuiet = quietStatuses.includes(status);
  return isQuiet;
}

// mapStatus
function mapStatusIsPoint(mapStatus) {
  return mapStatus === pressToRun;
}

function mapStatusIsArea(mapStatus) {
  return mapStatus === areaSet;
}

function mapStatusIsSelectroom(mapStatus) {
  return mapStatus === selectRoom;
}

function mapStatusIsVirtualArea(mapStatus) {
  return mapStatus === virtualArea;
}

function mapStatusIsVirtualWall(mapStatus) {
  return mapStatus === virtualWall;
}

function isRobotQuiet(status: string) {
  const quietStatuses = [
    'standby',
    'charging',
    'charge_done',
    'sleep',
    'paused',
    // 'fault',
  ];
  const isQuiet = quietStatuses.includes(status);
  return isQuiet;
}

function isRobotSlience(status: string) {
  const quietStatuses = ['standby', 'charging', 'charge_done', 'sleep'];
  const isQuiet = quietStatuses.includes(status);
  return isQuiet;
}

function isRobotStand(status: string) {
  const quietStatuses = ['standby', 'charging', 'charge_done', 'paused'];
  const isQuiet = quietStatuses.includes(status);
  return isQuiet;
}

export default {
  // 机器状态
  robotIsPause, // 暂停
  robotIsIdle, // 待机
  // 指哪扫哪
  robotIsPointing,
  robotIsPointArrived,
  robotIsPointUnarrived,
  robotIsPointPause,
  // 局部清扫
  robotIsParting,
  robotIsPartPause,
  // 局部清扫
  robotIsAreaing,
  robotIsAreaPause,
  // 自动清扫
  robotIsAutoRun,
  robotIsAutoRunPause,
  // 回充
  robotIsCharing,
  robotIsToCharing,
  robotIsToCharingPause,
  robotIsFullCharge,
  // native状态
  mapStatusIsPoint,
  mapStatusIsArea,
  mapStatusIsSelectroom,
  mapStatusIsVirtualArea,
  mapStatusIsVirtualWall,

  // 选区清扫
  robotIsSelectRoomPaused,
  robotIsSelectRoom,
};

export {
  // 机器状态
  isRobotQuiet,
  isRobotSlience, // 闲置
  isRobotStand, // 闲置，但没睡
  robotIsPause, // 暂停
  robotIsIdle, // 待机
  // 指哪扫哪
  robotIsPointing,
  robotIsPointArrived,
  robotIsPointUnarrived,
  robotIsPointPause,
  // 局部清扫
  robotIsParting,
  robotIsPartPause,
  // 局部清扫
  robotIsAreaing,
  robotIsAreaPause,
  // 自动清扫
  robotIsAutoRun,
  robotIsAutoRunPause,
  // 回充
  robotIsCharing,
  robotIsToCharing,
  robotIsToCharingPause,
  robotIsFullCharge,
  // native状态
  mapStatusIsPoint,
  mapStatusIsArea,
  mapStatusIsSelectroom,
  mapStatusIsVirtualArea,
  mapStatusIsVirtualWall,
  // 选区清扫
  robotIsSelectRoomPaused,
  robotIsSelectRoom,
};
