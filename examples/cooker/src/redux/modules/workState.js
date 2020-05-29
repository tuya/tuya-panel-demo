import { createAction, handleActions } from 'redux-actions';
import { weekDeepClone, isEmptyObj, getCountDownType, timeType } from '../../utils';
import Config from '../../config';

export const keys = {
  power: 'power',
  fault: 'fault',
  status: 'status',
  countdown: 'countdown',
};

export const defaultStatus = {
  standby: 'standby',
  cooking: 'cooking',
  appointment: 'appointment',
  done: 'done',
};

export const SCHEMA = {
  [keys.power]: true,
  [keys.fault]: 0,
  [keys.status]: '',
  [keys.countdown]: 0,
  logo: null,
  tab: 0,
};

export const keysNeedMergeToState = [];

// ActionTypes
export const UPDATE_STATE = 'UPDATE_STATE';

// Actions
export const updateState = createAction(UPDATE_STATE);

export const getWorkStateFromDpState = dispatch => (dpState = {}) => {
  const {
    power: oldPowerCode,
    switch: newPowerCode,
    fault: faultCode,
    status: statusCode,
    remainTime: rTimeCode,
  } = Config.codes;
  const powerCode = newPowerCode || oldPowerCode;
  const ret = {};
  const stack = [
    { key: keys.power, code: powerCode },
    { key: keys.fault, code: faultCode },
    { key: keys.status, code: statusCode },
    { key: keys.countdown, code: rTimeCode },
  ];
  stack.forEach(({ key, code }) => {
    if (code in dpState) {
      ret[key] = dpState[code];
      if (key === keys.countdown) {
        const t = getCountDownType(rTimeCode) === timeType.sec ? dpState[code] : dpState[code] * 60;
        ret[key] = t;
      }
    }
  });
  !isEmptyObj(ret) && dispatch(updateState(ret));
};

export const setPowerState = power => dispatch =>
  dispatch(
    updateState({
      [keys.power]: power,
    })
  );

export const setLogoState = logo => dispatch =>
  dispatch(
    updateState({
      logo,
    })
  );

export const setTab = tab => dispatch =>
  dispatch(
    updateState({
      tab,
    })
  );

export const workState = handleActions(
  {
    [UPDATE_STATE]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
  },
  weekDeepClone(SCHEMA)
);

export const reducers = {
  workState,
  actions: {
    updateState,
  },
  constant: {},
};
