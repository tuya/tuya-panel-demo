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
  realTimeFirstPath,
  realTimeMap,
  realTimePlanPath,
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

// 多楼层地图管理
const multiFloorTask = {
  updateAuthentication,
  multiFloor,
};

export { realTimeAutoTask, splitEditMapTask, historyTask, multiFloorTask, config };
