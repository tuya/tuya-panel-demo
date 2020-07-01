import { handleActions, createAction } from 'redux-actions';
import { TYSdk } from 'tuya-panel-kit';

const TYDevice = TYSdk.device;

// ActionTypes
const DEVINFO_CHANGE = '_DEVINFOCHANGE_';
const DEVICE_CHANGED = '_DEVICECHANGED_';
const INIT_DP = 'INIT_DP';
const UPDATE_DP = 'UPDATE_DP';
const CONSOLE_CHNAGE = 'CONSOLE_CHNAGE';
const CLEAR_CONSOLE = 'CLEAR_CONSOLE';

// actions
export const devInfoChange = createAction(DEVINFO_CHANGE);
export const deviceChange = createAction(DEVICE_CHANGED);
export const initDp = createAction(INIT_DP);
export const updateDp = createAction(UPDATE_DP);
export const consoleChange = createAction(CONSOLE_CHNAGE);
export const clearConsole = createAction(CLEAR_CONSOLE);

// reducer
const dpState = handleActions(
  {
    [INIT_DP]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [UPDATE_DP]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
  },
  {}
);

const devInfo = handleActions(
  {
    [DEVINFO_CHANGE]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [DEVICE_CHANGED]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
  },
  {}
);

let isSend = false;

interface MockAction {
  payload: any;
}

const formatLogs = (state: any, action: MockAction, send: boolean) => {
  const ret = Object.keys(action.payload).reduce((obj, p) => {
    const id = TYDevice.getDpIdByCode(p);
    return { ...obj, [id]: action.payload[p] };
  }, {});
  const strIds = JSON.stringify(ret, null, 2);
  const strCodes = JSON.stringify(action.payload, null, 2);
  const date = new Date();
  const time = `[${[
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds(),
  ].join(':')}]`;
  const s = [{ strCodes, strIds, time, isSend: send }, ...state];
  return s.slice(0, 30);
};

const logs = handleActions(
  {
    [CONSOLE_CHNAGE]: state => {
      isSend = true;
      return state;
    },

    [UPDATE_DP]: (state, action) => {
      isSend = true;
      return formatLogs(state, action, isSend);
    },

    [INIT_DP]: (state, action) => {
      isSend = false;
      return formatLogs(state, action, isSend);
    },

    [CLEAR_CONSOLE]: () => [],
  },
  []
);

export const reducers = {
  dpState,
  devInfo,
  logs,
};
