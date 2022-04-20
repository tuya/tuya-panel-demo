import { Interface } from '../resourceManager';

import store from './store';
import * as autoTask from './autoTask';
import elementConfigs from './elementConfigs';
import * as elementPropsSchema from './elementPropsSchema';
import * as elementEvent from './elementEvents';

const {
  realTimeArea,
  realTimeFirstMap,
  realTimeFullPath,
  realTimeFullPathWithP2p,
  realTimeFirstPath,
  realTimeMap,
  realTimeMapWithP2p,
  realTimePlanPath,
  realTimePlanPathWithP2p,
  updateAuthentication,
  historyMap,
  multiFloor,
  requestMap,
} = autoTask;

const config: Interface.IConfig = {
  store,
  autoTask: {},
  elementConfigs,
  elementPropsSchema,
  elementEvent,
};

const realTimeAutoTask = {
  updateAuthentication,
  realTimeFirstMap,
  realTimeFirstPath,
  realTimeArea,
  realTimeMap,
  // requestPath,
  realTimeFullPath,
  // realTimePath,
  requestMap,
  realTimePlanPath,
};

/**
 * P2p 自动化任务
 */
const realTimeAutoTaskWithP2p = {
  realTimeArea,
  realTimeMapWithP2p,
  realTimeFullPathWithP2p,
  realTimePlanPathWithP2p,
};

// 房间分区
const splitEditMapTask = {
  updateAuthentication,
  realTimeFirstMap,
  realTimeMap,
};

// 历史记录
const historyTask = {
  updateAuthentication,
  historyMap,
};

/**
 * P2p房间分区
 */
const splitEditMapTaskWithP2p = {
  updateAuthentication,
  realTimeMapWithP2p,
  realTimeArea,
};

// 多楼层地图管理
const multiFloorTask = {
  updateAuthentication,
  multiFloor,
};

export {
  realTimeAutoTask,
  realTimeAutoTaskWithP2p,
  splitEditMapTaskWithP2p,
  splitEditMapTask,
  historyTask,
  multiFloorTask,
  config,
};
