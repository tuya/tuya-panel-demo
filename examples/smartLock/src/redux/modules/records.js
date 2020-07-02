import _ from 'lodash';
import { TYSdk } from 'tuya-panel-kit';
import { AsyncStorage } from 'react-native';
import { createAction, handleActions } from 'redux-actions';
import TYNative from '../../api';
import { store } from '../../main';

const TYDevice = TYSdk.device;

// ActionTypes
const LAST_OPEN_RECORD = 'LAST_OPEN_RECORD';
const SAVE_LAST_ALARM_VIEW_TIME = 'SAVE_LAST_ALARM_VIEW_TIME';
const GET_LAST_ALARM_VIEW_TIME = 'GET_LAST_ALARM_VIEW_TIME';
const GET_SAVE_TIME = 'GET_SAVE_TIME';
const LAST_ALARM_RECORD = 'LAST_ALARM_RECORD';
const GET_ALARM_COUNT = 'GET_ALARM_COUNT';
// // Actions

export const getLastAlarmRecord = createAction(LAST_ALARM_RECORD);
export const getLastOpenRecord = createAction(LAST_OPEN_RECORD);
export const saveAlarmViewTime = createAction(SAVE_LAST_ALARM_VIEW_TIME);
export const getAlarmViewTime = createAction(GET_LAST_ALARM_VIEW_TIME);

export const getItem = async key => {
  try {
    const val = await AsyncStorage.getItem(key);
    return JSON.parse(val);
  } catch (e) {
    return null;
  }
};
export const setItem = (key, value) => AsyncStorage.setItem(key, JSON.stringify(value));

export const _getLastAlarmRecord = dpCodes => async dispatch => {
  const { devInfo = {} } = store.getState();
  const { schema } = devInfo;
  const alarmDpIds = _.map(schema, d => {
    if (dpCodes.indexOf(d.code) > -1) {
      return +TYDevice.getDpIdByCode(d.code);
    }
  }).filter(i => !!i);
  const records = (await TYNative.getDpHistory(alarmDpIds, 1, 0)) || {};
  const { datas = [] } = records;
  const result = datas.length > 0 ? datas[0] : {};
  dispatch(getLastAlarmRecord(result));
};

export const _getLastOpenRecord = dpCodes => async dispatch => {
  const { devInfo = {} } = store.getState();
  const { schema } = devInfo;
  const openDoorDpIds = _.map(schema, d => {
    if (dpCodes.indexOf(d.code) > -1) {
      return +TYDevice.getDpIdByCode(d.code);
    }
  }).filter(i => !!i);
  const params = {
    dpIds: openDoorDpIds,
    limit: 1,
    offset: 0,
  };
  const records = (await TYNative.getRecordLits(params)) || {};
  const { datas = [] } = records;
  const result = datas.length > 0 ? datas[0] : {};
  dispatch(getLastOpenRecord(result));
};

export const getAlarmCount = () => async dispatch => {
  const alarmCount = await TYNative.getAlarmCount();
  dispatch({
    type: GET_ALARM_COUNT,
    alarmCount,
  });
};

export const getSaveTime = () => async dispatch => {
  const saveTime = await TYNative.getSaveDay();
  dispatch({
    type: GET_SAVE_TIME,
    saveTime,
  });
};

// Reducers

const lastAlarm = handleActions(
  {
    [LAST_ALARM_RECORD]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
  },
  {}
);

const lastUnLock = handleActions(
  {
    [LAST_OPEN_RECORD]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
  },
  {}
);

const alarmUnReadCount = handleActions(
  {
    [GET_ALARM_COUNT]: (state, action) => {
      return state || action.alarmCount;
    },
  },
  0
);
const saveTime = handleActions(
  {
    [GET_SAVE_TIME]: (state, action) => {
      return state || action.saveTime;
    },
  },
  0
);

export const reducers = {
  lastUnLock,
  saveTime,
  alarmUnReadCount,
  lastAlarm,
};
