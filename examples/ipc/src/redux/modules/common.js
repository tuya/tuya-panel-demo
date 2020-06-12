import { handleActions, createAction } from 'redux-actions';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/merge';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/partition';

import { TYSdk } from 'tuya-panel-kit';

const TYDevice = TYSdk.device;

// actions
export const devInfoChange = createAction('_DEVINFOCHANGE_');
export const deviceChange = createAction('_DEVICECHANGED_');
export const responseUpdateDp = createAction('RESPONSE_UPDATE_DP');
export const updateDp = createAction('CHANGE_DP');
export const consoleChange = createAction('CONSOLECHNAGE');
export const clearConsole = createAction('CLEARCONSOLE');

// reducer
const dpState = handleActions(
  {
    [devInfoChange.toString()]: (state, action) => ({
      ...state,
      ...action.payload.state,
    }),

    [responseUpdateDp.toString()]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
  },
  {}
);

const devInfo = handleActions(
  {
    [devInfoChange.toString()]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [deviceChange.toString()]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
  },
  {}
);

let isSend = false;

const formatLogs = (state, action, send) => {
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
    [consoleChange.toString()]: state => {
      isSend = true;
      return state;
    },

    [updateDp.toString()]: (state, action) => {
      isSend = true;
      return formatLogs(state, action, isSend);
    },

    [devInfoChange.toString()]: (state, action) => {
      const formatAction = { payload: action.payload.state };
      return formatLogs(state, formatAction, isSend);
    },

    [responseUpdateDp.toString()]: (state, action) => {
      isSend = false;
      return formatLogs(state, action, isSend);
    },

    [clearConsole.toString()]: () => [],
  },
  []
);

export const reducers = {
  dpState,
  devInfo,
  logs,
};

// epics
const dpUpdateEpic$ = action$ =>
  action$.ofType(updateDp).mergeMap(action => {
    const { payload } = action;
    const [success, error] = Observable.fromPromise(TYDevice.putDData(payload))
      .catch(err => Observable.of(responseUpdateDp({})))
      .partition(x => x.success);

    return Observable.merge(
      success.map(() => responseUpdateDp(payload)),
      error.map(() => responseUpdateDp({}))
    );
  });

export const epics = [dpUpdateEpic$];
